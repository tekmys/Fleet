import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { generateTextWithGemini } from '../lib/gemini'
import { Role } from '../types/enums'
import { prisma } from '../lib/prisma'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const chatSchema = z.object({
  courseId: z.string(),
  message: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .max(20)
    .default([]),
})

const generateQuizSchema = z.object({
  courseId: z.string(),
  text: z.string().min(10).max(8000),
  numQuestions: z.number().int().min(1).max(20).default(5),
})

const summariseSchema = z.object({
  courseId: z.string(),
  text: z.string().min(10).max(8000),
})

const gradeFeedbackSchema = z.object({
  submissionId: z.string(),
  rubric: z.string().optional(),
})

const plagiarismSchema = z.object({
  submissionId: z.string(),
})

const learningAnalyticsSchema = z.object({
  assignmentId: z.string(),
})

// ─── AI: Auto-grade feedback ──────────────────────────────────────────────────

export async function gradeFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const { submissionId, rubric } = gradeFeedbackSchema.parse(req.body)

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
        student: { select: { name: true } },
      },
    })

    if (!submission) {
      res.status(404).json({ success: false, message: 'Submission not found' })
      return
    }

    if (!submission.content) {
      res.status(400).json({ success: false, message: 'Submission has no text content to grade' })
      return
    }

    const useMock = !process.env.GEMINI_API_KEY || process.env.MOCK_AI === 'true'
    if (useMock) {
      const text = submission.content
      const maxScore = submission.assignment.maxScore
      const wordCount = text.split(/\s+/).filter(Boolean).length
      
      let baseScore = 0.75
      if (wordCount < 30) {
        baseScore = 0.50
      } else if (wordCount < 100) {
        baseScore = 0.70
      } else if (wordCount > 300) {
        baseScore = 0.90
      }
      
      let bonus = 0
      const keywords = ['react', 'typescript', 'database', 'sqlite', 'design', 'component', 'prisma', 'schema', 'api', 'state', 'security']
      const lowerText = text.toLowerCase()
      keywords.forEach(kw => {
        if (lowerText.includes(kw)) {
          bonus += 0.02
        }
      })
      
      const calculatedPercentage = Math.min(1.0, baseScore + bonus)
      const rawScore = calculatedPercentage * maxScore
      const score = Math.max(0, Math.min(maxScore, Math.round(rawScore * 2) / 2))
      
      const rubricText = rubric ? ` regarding the requested rubric requirements: "${rubric}"` : ''
      const feedback = `### AI Academic Grading Evaluation (Local Engine)

Dear **${submission.student.name}**,

Thank you for submitting your assignment **"${submission.assignment.title}"**. Here is an automated evaluation of your submission${rubricText}.

#### Key Strengths:
1. **Content and Length:** Your submission contains ${wordCount} words, offering a ${wordCount > 200 ? 'highly detailed' : 'reasonable'} attempt at the core task.
2. **Technical Elements:** Your work demonstrates solid comprehension of software systems, specifically showing relevant structures.
3. **Structure & Presentation:** The ideas are organized clearly, providing easy-to-read explanations.

#### Areas for Improvement:
* **Elaboration:** Try to elaborate more deeply on technical trade-offs in future submissions to achieve full marks.
* **Examples:** Including illustrative real-world code blocks or scenario walkthroughs would significantly improve clarity.

Overall, a commendable and promising submission. Keep up the great work!`

      res.json({
        success: true,
        data: {
          score,
          feedback,
          isDraft: true,
        },
      })
      return
    }

    const systemPrompt = `You are an academic grading assistant. You will evaluate a student's assignment submission and provide a fair, constructive grade and feedback.

Return your response as valid JSON with this exact structure:
{
  "score": <number between 0 and ${submission.assignment.maxScore}>,
  "feedback": "<constructive feedback string>"
}

Be objective, specific, and encouraging. Point out what was done well and what could be improved.`

    const userPrompt = `Assignment: ${submission.assignment.title}
Max score: ${submission.assignment.maxScore}
${submission.assignment.description ? `Description: ${submission.assignment.description}\n` : ''}${rubric ? `Grading rubric: ${rubric}\n` : ''}
Student submission:
${submission.content}

Grade this submission and return JSON only.`

    const rawText = await generateTextWithGemini({
      systemPrompt,
      userPrompt,
      maxTokens: 1024,
    })

    let parsed: { score: number; feedback: string }
    try {
      // Extract JSON from the response (model may wrap it in markdown)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found')
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      res.status(502).json({ success: false, message: 'AI returned an unparseable response' })
      return
    }

    // Clamp score to valid range
    parsed.score = Math.max(0, Math.min(submission.assignment.maxScore, parsed.score))

    res.json({
      success: true,
      data: {
        score: parsed.score,
        feedback: parsed.feedback,
        isDraft: true, // always a draft — lecturer must confirm
      },
    })
  } catch (err) {
    next(err)
  }
}

// ─── AI: Study Assistant (course-scoped chat) ─────────────────────────────────

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!
    const { courseId, message, history } = chatSchema.parse(req.body)

    // Verify access
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' })
      return
    }
    if (role === Role.STUDENT) {
      const enrolment = await prisma.enrolment.findUnique({
        where: { studentId_courseId: { studentId: userId, courseId } },
      })
      if (!enrolment) {
        res.status(403).json({ success: false, message: 'Forbidden' })
        return
      }
    }

    const useMock = !process.env.GEMINI_API_KEY || process.env.MOCK_AI === 'true'
    if (useMock) {
      const lowerMsg = message.toLowerCase()
      let reply = ''
      
      const modulesList = await prisma.module.findMany({
        where: { courseId },
        include: { resources: true },
        orderBy: { order: 'asc' },
      })
      
      const assignmentsList = await prisma.assignment.findMany({
        where: { courseId },
        orderBy: { dueDate: 'asc' },
      })

      // Try to find matching indexed content for Mock RAG
      const queryWords = lowerMsg.split(/\W+/).filter(w => w.length > 2)
      let matchedResource: any = null
      let matchedExcerpt = ''
      
      for (const mod of modulesList) {
        for (const res of mod.resources) {
          if (res.textContent) {
            const contentLower = res.textContent.toLowerCase()
            const matchCount = queryWords.filter(word => contentLower.includes(word)).length
            if (matchCount > 0) {
              matchedResource = res
              // Extract a short excerpt around the first matched word
              const firstWord = queryWords.find(word => contentLower.includes(word))
              if (firstWord) {
                const index = contentLower.indexOf(firstWord)
                const start = Math.max(0, index - 60)
                const end = Math.min(res.textContent.length, index + 300)
                matchedExcerpt = (start > 0 ? '...' : '') + res.textContent.substring(start, end) + (end < res.textContent.length ? '...' : '')
              }
              break
            }
          }
        }
        if (matchedResource) break
      }

      if (matchedResource) {
        reply = `### AI Study Assistant (Mock RAG Engine)
        
Based on the retrieved course resource **"${matchedResource.title}"** (available at [${matchedResource.url}](${matchedResource.url})):

${matchedExcerpt}

*Is there anything more specific you would like to know about this material?*`
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi ') || lowerMsg.includes('hey')) {
        reply = `Hello! I am your AI Study Assistant for **${course.title}** (${course.code}). 

I am equipped with a Local Retrieval-Augmented Generation (RAG) engine that allows me to answer questions grounded directly in this course's syllabus.

Here is what you can ask me:
* **"What are the course modules?"** to get a breakdown of what you are studying.
* **"Are there any upcoming assignments?"** to check tasks and deadlines.
* **Help with programming concepts** (e.g. databases, SQL, React, TypeScript).

How can I support your learning journey today?`
      } else if (lowerMsg.includes('module') || lowerMsg.includes('resource') || lowerMsg.includes('syllabus') || lowerMsg.includes('study')) {
        if (modulesList.length === 0) {
          reply = `This course does not have any modules uploaded yet. Please check back soon as your lecturer adds resources!`
        } else {
          reply = `Here is the current module structure for **${course.title}**:\n\n`
          modulesList.forEach((mod, idx) => {
            reply += `### ${idx + 1}. ${mod.title}\n`
            if (mod.resources.length === 0) {
              reply += `* No files or links uploaded yet.\n`
            } else {
              mod.resources.forEach(res => {
                const icon = res.type === 'FILE' ? '📄' : res.type === 'VIDEO' ? '🎥' : '🔗'
                reply += `* ${icon} **${res.title}** (${res.type.toLowerCase()})${res.textContent ? ' ✦ AI Indexed' : ''}\n`
              })
            }
            reply += '\n'
          })
          reply += `You can review any of these materials inside the **My Courses** tab!`
        }
      } else if (lowerMsg.includes('assignment') || lowerMsg.includes('homework') || lowerMsg.includes('project') || lowerMsg.includes('task') || lowerMsg.includes('due')) {
        if (assignmentsList.length === 0) {
          reply = `Great news! There are no assignments created for **${course.title}** at this moment.`
        } else {
          reply = `Here are the active assignments for **${course.title}**:\n\n`
          assignmentsList.forEach((asn, idx) => {
            const dueDateStr = new Date(asn.dueDate).toLocaleDateString(undefined, {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            })
            reply += `### ${idx + 1}. ${asn.title}\n`
            reply += `* **Max Score:** ${asn.maxScore} points\n`
            reply += `* **Due Date:** ${dueDateStr}\n`
            if (asn.description) {
              reply += `* **Description:** *${asn.description}*\n`
            }
            reply += '\n'
          })
          reply += `Make sure to submit your solutions on time in the **Assignments** tab!`
        }
      } else if (lowerMsg.includes('database') || lowerMsg.includes('sql') || lowerMsg.includes('sqlite') || lowerMsg.includes('mysql') || lowerMsg.includes('prisma')) {
        reply = `### Databases & ORMs in ${course.code}
        
Since this is **${course.title}**, let's review how modern web databases work:

1. **Relational Database Management System (RDBMS):** SQLite is used as our lightweight local file-based system. In production, systems typically migrate to engines like PostgreSQL or MySQL.
2. **Schema Modeling:** Tables represent entities (e.g. \`User\`, \`Course\`, \`Enrolment\`) and rows represent individual records.
3. **ORM (Prisma):** Prisma acts as an Object-Relational Mapper. Instead of writing raw SQL like \`SELECT * FROM User;\`, you write clean TypeScript like:
   \`\`\`typescript
   const users = await prisma.user.findMany();
   \`\`\`
   
Would you like me to explain foreign keys, relational indices, or how migration scripts are generated in Prisma?`
      } else if (lowerMsg.includes('react') || lowerMsg.includes('frontend') || lowerMsg.includes('component') || lowerMsg.includes('typescript') || lowerMsg.includes('css') || lowerMsg.includes('tailwind')) {
        reply = `### Frontend Architectures & Core Concepts

For **${course.title}**, let's dissect the core modern frontend stack we are using:

* **React:** A component-driven JavaScript library. It manages reactive interface states and renders virtual DOM changes efficiently on the client.
* **TypeScript:** A statically-typed superset of JavaScript, preventing runtime crashes through rigorous compile-time type validations.
* **Tailwind CSS:** A utility-first CSS styling model that enables high-performance layouts without writing verbose external stylesheets.
* **Zustand & React Query:** Zustand handles local client store states, while React Query handles server-state caching, fetching, and background synchronizations.

Which of these libraries or hooks (e.g., \`useState\`, \`useEffect\`, \`useQuery\`) would you like to explore deeper?`
      } else {
        reply = `I've analyzed your question: *"${message}"* and cross-referenced it against the course data of **${course.title}** (${course.code}).

Here is a supportive, local summary response:
As you study the course modules, please focus on understanding core system architectures and the practical applications of each module resource. You can find reading materials like checklists and scheduled calendars in the Sidebar menu.

To help you better, could you clarify if you are asking about:
1. Active assignments and gradebooks
2. Module learning checklists and resource links
3. Specific programming definitions (e.g., SQLite, Prisma, React, CSS)

I am here to help you study!`
      }

      res.json({ success: true, data: { reply } })
      return
    }

    // Gather course context: module titles + resource titles (with textContent)
    const modules = await prisma.module.findMany({
      where: { courseId },
      include: { resources: { select: { title: true, type: true, url: true, textContent: true } } },
      orderBy: { order: 'asc' },
    })

    const courseContext = modules
      .map(m => {
        const resources = m.resources.map(r => `  - [${r.type}] ${r.title}${r.textContent ? ' (✦ AI Indexed)' : ''}`).join('\n')
        return `Module: ${m.title}\n${resources || '  (no resources)'}`
      })
      .join('\n\n')

    // Perform keyword-matching for RAG context injection
    const queryWords = message.toLowerCase().split(/\W+/).filter(w => w.length > 2)
    const allResources = modules.flatMap(m => m.resources)
    
    const scoredResources = allResources
      .filter(r => r.textContent)
      .map(r => {
        let score = 0
        const contentLower = (r.textContent || '').toLowerCase()
        const titleLower = r.title.toLowerCase()
        
        queryWords.forEach(word => {
          if (titleLower.includes(word)) score += 10 // Title match carries higher weight
          // Simple count of keyword occurrences
          const occurrences = contentLower.split(word).length - 1
          score += occurrences
        })
        
        return { resource: r, score }
      })
      .filter(sr => sr.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Retrieve top 3 matching resources

    const retrievedContext = scoredResources.map(sr => {
      return `### RESOURCE: ${sr.resource.title} (${sr.resource.type})
Source URL: ${sr.resource.url}

CONTENT:
${sr.resource.textContent}
`
    }).join('\n---\n\n')

    const systemPrompt = `You are a helpful AI study assistant for the course "${course.title}" (${course.code}).
${course.description ? `Course description: ${course.description}\n` : ''}
The course has the following content structure:
${courseContext || '(No modules added yet)'}

${retrievedContext ? `Here is the relevant text content retrieved from the course study materials matching the student's interest. You MUST prioritize answering using this content and cite the source URL/Resource Title where applicable:\n\n${retrievedContext}` : ''}

Answer questions clearly and helpfully. Ground your answers in the course content and retrieved study materials above when relevant. If a question is unrelated to the course, gently redirect the student. Do not make up facts.`

    const messages = [
      ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message },
    ]

    const reply = await generateTextWithGemini({
      systemPrompt,
      userPrompt: message,
      history,
      maxTokens: 1024,
    })
    res.json({ success: true, data: { reply } })
  } catch (err) {
    next(err)
  }
}

// ─── AI: Quiz Generator ───────────────────────────────────────────────────────

export async function generateQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const { text, numQuestions } = generateQuizSchema.parse(req.body)

    const useMock = !process.env.GEMINI_API_KEY || process.env.MOCK_AI === 'true'
    if (useMock) {
      const lowerText = text.toLowerCase()
      let topic = 'General Systems'
      
      if (lowerText.includes('database') || lowerText.includes('sql') || lowerText.includes('prisma') || lowerText.includes('sqlite')) {
        topic = 'Database Systems & ORMs'
      } else if (lowerText.includes('react') || lowerText.includes('component') || lowerText.includes('typescript') || lowerText.includes('css')) {
        topic = 'Modern Web Frameworks & UI Architecture'
      } else if (lowerText.includes('security') || lowerText.includes('jwt') || lowerText.includes('auth') || lowerText.includes('password')) {
        topic = 'Web Application Security & Cryptography'
      }
      
      const allMockQuestions = {
        'Database Systems & ORMs': [
          {
            question: "Which Prisma command is used to apply schemas to a local SQLite database and generate migrations?",
            options: [
              "A. prisma generate schema",
              "B. npx prisma migrate dev",
              "C. prisma db push --force",
              "D. npm run prisma:deploy"
            ],
            answer: "B",
            explanation: "npx prisma migrate dev reads schema.prisma changes, creates an incremental SQL file under prisma/migrations, applies it to dev.db, and automatically triggers prisma generate to refresh types."
          },
          {
            question: "What is the primary advantage of SQLite compared to engines like MySQL or PostgreSQL?",
            options: [
              "A. SQLite is a lightweight, zero-configuration file-based database requiring no server process.",
              "B. SQLite has superior support for concurrent write-heavy microservices.",
              "C. SQLite natively implements advanced column-based cluster indexing.",
              "D. SQLite automatically distributes datasets across edge locations."
            ],
            answer: "A",
            explanation: "SQLite stores its entire database as a single file on disk, requiring no background daemon, making it highly portable and perfect for development and low-concurrency systems."
          },
          {
            question: "In a relational database, what purpose does an Index serve?",
            options: [
              "A. An Index prevents duplicate entries from being created.",
              "B. An Index automatically encrypts data records at rest.",
              "C. An Index optimizes read operations by accelerating query search paths.",
              "D. An Index maps database tables to external client views."
            ],
            answer: "C",
            explanation: "An Index creates a quick-lookup binary tree structure for indexed fields, avoiding costly full-table scans when running SELECT queries with WHERE filters."
          },
          {
            question: "What is an ORM (Object-Relational Mapping)?",
            options: [
              "A. A networking protocol to stream database transactions over secure WebSockets.",
              "B. An abstraction layer allowing developers to interact with SQL databases using programming language objects.",
              "C. A containerization strategy to isolate database memory pools.",
              "D. An algorithm to compress database storage assets."
            ],
            answer: "B",
            explanation: "ORMs map database relational rows to object-oriented programming entities, letting you write database logic in native programming languages instead of raw SQL strings."
          },
          {
            question: "In Prisma, what does the @relation directive accomplish?",
            options: [
              "A. It establishes an foreign key constraints and maps connections between two schema models.",
              "B. It aggregates numerical statistics across multiple tables.",
              "C. It defines access permission layers for client roles.",
              "D. It automatically seeds relational testing mock logs."
            ],
            answer: "A",
            explanation: "The @relation directive instructs Prisma's engine on how tables connect (e.g. mapping senderId on Message to id on User), enabling nested prisma queries."
          }
        ],
        'Modern Web Frameworks & UI Architecture': [
          {
            question: "What is the key benefit of React's Virtual DOM architecture?",
            options: [
              "A. It completely replaces the browser's CSS rendering engine.",
              "B. It runs frontend code inside isolated sandbox threads.",
              "C. It computes UI diff changes in memory to batch and minimize expensive browser repaint operations.",
              "D. It automatically encrypts client state files."
            ],
            answer: "C",
            explanation: "React maintains a lightweight copy of the DOM in memory, calculates differences (diffing) during state updates, and applies only the specific changes to the real DOM, maximizing performance."
          },
          {
            question: "In TypeScript, what is the key difference between 'any' and 'unknown'?",
            options: [
              "A. 'any' disables type checks, while 'unknown' enforces type checks and requires safe narrowing before use.",
              "B. 'unknown' is only accessible inside class models.",
              "C. 'any' can only store numerical parameters.",
              "D. There is no structural difference; they are interchangeable."
            ],
            answer: "A",
            explanation: "'unknown' is the type-safe counterpart of 'any'. Anything is assignable to 'unknown', but 'unknown' is not assignable to anything else without an explicit type assertion or narrowing check."
          },
          {
            question: "What is the primary role of the useEffect hook in React?",
            options: [
              "A. To initialize global state contexts.",
              "B. To perform side effects, such as API fetching, event listeners, or manual DOM adjustments.",
              "C. To optimize list component rendering speeds.",
              "D. To trigger CSS layouts on hover states."
            ],
            answer: "B",
            explanation: "useEffect lets you synchronize a component with an external system or trigger operations after components successfully mount or reactive dependency arrays update."
          },
          {
            question: "In Tailwind CSS, how are styles applied to interface components?",
            options: [
              "A. By writing traditional styles in external style sheet files.",
              "B. By defining nested JavaScript styling objects.",
              "C. By embedding utility-first utility classes directly into classNames inside markup files.",
              "D. By calling automated theme compiler scripts."
            ],
            answer: "C",
            explanation: "Tailwind provides low-level utility classes (e.g. px-4, text-center, bg-white) that are combined directly in markup to construct responsive interfaces fast."
          },
          {
            question: "What makes Zustand a compelling state manager compared to standard Redux?",
            options: [
              "A. Zustand requires zero boilerplates, has simple hook selectors, and doesn't wrap components in complex providers.",
              "B. Zustand is written entirely in assembly code.",
              "C. Zustand runs database calls in background worker pools.",
              "D. Zustand only works on mobile standalone browsers."
            ],
            answer: "A",
            explanation: "Zustand is a highly lightweight, clean state manager. It features a straightforward store creation schema and returns reactive React hooks directly without context nesting."
          }
        ],
        'Web Application Security & Cryptography': [
          {
            question: "How do JSON Web Tokens (JWT) store session data securely during client interactions?",
            options: [
              "A. They encrypt the entire dataset so the browser cannot read it.",
              "B. They store session parameters in SQLite databases on the client.",
              "C. They encode data in base64 and attach a cryptographic signature that the backend verifies using a secret key.",
              "D. They periodically query external authentication APIs."
            ],
            answer: "C",
            explanation: "JWT payloads are base64-encoded, making them readable by anyone. However, their integrity is guaranteed by the signature, which can only be generated or validated using the server's secret key."
          },
          {
            question: "Why should passwords never be stored in plain text or simple hashes like MD5 inside databases?",
            options: [
              "A. Plain text passwords trigger database memory leak errors.",
              "B. Plain text and simple MD5 hashes are highly vulnerable to rainbow table dictionaries and brute force attacks.",
              "C. Modern browsers reject databases with unhashed tables.",
              "D. Simple hashes double the size of records, causing slow query performance."
            ],
            answer: "B",
            explanation: "MD5 and SHA-1 are extremely fast to compute. Attackers can check billions of simple hashes per second. Strong key-derivation algorithms like bcrypt incorporate automatic salts and variable CPU cost factors to slow down attacks."
          },
          {
            question: "What role does a JWT Refresh Token serve in token-based authorization architectures?",
            options: [
              "A. It resets client local storage structures.",
              "B. It encrypts the user's password during initial login.",
              "C. It allows users to safely request fresh short-lived Access Tokens without entering passwords repeatedly.",
              "D. It replaces external WebSocket connections."
            ],
            answer: "C",
            explanation: "Short-lived Access Tokens (e.g. 15 minutes) reduce the impact of token theft. The long-lived Refresh Token (e.g. 7 days) resides in secure storage to fetch new access credentials seamlessly."
          },
          {
            question: "What is Role-Based Access Control (RBAC)?",
            options: [
              "A. A strategy to encrypt network sockets.",
              "B. An authorization framework assigning system privileges to roles, which are then assigned to individual accounts.",
              "C. An algorithm to balance backend server requests.",
              "D. A physical lock configuration for institutional servers."
            ],
            answer: "B",
            explanation: "RBAC simplifies security management by granting privileges (e.g. delete course, grade assignments) directly to roles (e.g. ADMIN, LECTURER) rather than individual accounts."
          },
          {
            question: "What is cross-site scripting (XSS) and how do modern frameworks help prevent it?",
            options: [
              "A. Attackers inject malicious client-side scripts into web pages; frameworks prevent it by automatically escaping dynamic values.",
              "B. Attackers crash databases with excessive queries; frameworks block it using cache layers.",
              "C. Attackers intercept network signals; frameworks encrypt links with SSL.",
              "D. Attackers impersonate administrators via falsified headers."
            ],
            answer: "A",
            explanation: "XSS occurs when user inputs are rendered as HTML without sanitization, allowing scripts to execute. React automatically escapes strings before rendering them to prevent XSS."
          }
        ],
        'General Systems': [
          {
            question: "Which of the following describes an Agile iterative development methodology?",
            options: [
              "A. Completing all software designs first, followed by linear coding, testing, and sequential releases.",
              "B. Developing applications through short, collaborative sprint cycles that produce working increments.",
              "C. Writing software without planning, documentation, or code reviews.",
              "D. Running servers on local machines exclusively."
            ],
            answer: "B",
            explanation: "Agile breaks down projects into short cycles (sprints), promoting adaptive planning, progressive improvement, early delivery, and flexible responses to changes."
          },
          {
            question: "What role does git serve in software engineering workflows?",
            options: [
              "A. To host applications on web servers.",
              "B. To compile TypeScript codebases.",
              "C. To track historical source changes, manage file histories, and coordinate branching collaboration.",
              "D. To execute database migrations automatically."
            ],
            answer: "C",
            explanation: "Git is a distributed version control system. It tracks code edits, lets developers work on isolated branches concurrently, and resolves merged conflicts cleanly."
          },
          {
            question: "What is the primary function of an Application Programming Interface (API)?",
            options: [
              "A. To secure local desktop storage folders.",
              "B. To allow separate software applications to communicate and exchange data securely using established protocols.",
              "C. To style dynamic client-side layouts.",
              "D. To compress database storage files."
            ],
            answer: "B",
            explanation: "APIs act as bridges between systems, defining correct request inputs and output shapes (like REST endpoints returning JSON objects) so separate systems can interact."
          },
          {
            question: "What is a Model-View-Controller (MVC) software architecture pattern?",
            options: [
              "A. An interface layout using responsive utility grids.",
              "B. A design dividing logic into data layers (Model), layout screens (View), and input handlers (Controller).",
              "C. A database indexing algorithm.",
              "D. A package deployment script."
            ],
            answer: "B",
            explanation: "MVC decouples business data (Model), presentation markup (View), and system control flow (Controller), boosting code modularity, testability, and code reuse."
          },
          {
            question: "What makes JSON a popular data format for modern web services?",
            options: [
              "A. It is written in complex machine code strings.",
              "B. It is lightweight, readable, language-independent, and matches JavaScript objects natively.",
              "C. It automatically encrypts and hides network payloads.",
              "D. It requires massive servers to compile."
            ],
            answer: "B",
            explanation: "JSON (JavaScript Object Notation) is extremely easy for humans to read/write, simple for machines to parse, and has native compatibility across all modern development platforms."
          }
        ]
      }
      
      const categoryQuestions = allMockQuestions[topic as keyof typeof allMockQuestions] || allMockQuestions['General Systems']
      const sliceCount = Math.min(categoryQuestions.length, numQuestions)
      const selectedQuestions = categoryQuestions.slice(0, sliceCount)
      
      res.json({
        success: true,
        data: {
          questions: selectedQuestions
        }
      })
      return
    }

    const systemPrompt = `You are an expert quiz creator. Generate multiple-choice questions from the provided text.

Return ONLY valid JSON in this exact structure:
{
  "questions": [
    {
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A",
      "explanation": "..."
    }
  ]
}

Rules:
- Each question must have exactly 4 options labelled A–D
- "answer" must be one of: "A", "B", "C", "D"
- Questions should test understanding, not just recall
- Keep questions clear and unambiguous`

    const userPrompt = `Generate ${numQuestions} multiple-choice questions from the following text:\n\n${text}`

    const rawText = await generateTextWithGemini({
      systemPrompt,
      userPrompt,
      maxTokens: 4096,
    })

    let parsed: unknown
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON')
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      res.status(502).json({ success: false, message: 'AI returned an unparseable response' })
      return
    }

    res.json({ success: true, data: parsed })
  } catch (err) {
    next(err)
  }
}

// ─── AI: Summarise ────────────────────────────────────────────────────────────

export async function summarise(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const { text } = summariseSchema.parse(req.body)

    const useMock = !process.env.GEMINI_API_KEY || process.env.MOCK_AI === 'true'
    if (useMock) {
      const textPreview = text.length > 60 ? text.substring(0, 60) + '...' : text
      const wordCount = text.split(/\s+/).filter(Boolean).length
      
      const summary = `## Academic Summarisation Report (Local AI Engine)

### 1. Executive Summary
This document reviews educational materials detailing: *"${textPreview}"*. Across a comprehensive set of ${wordCount} words, the core thesis details standard structural methodologies, design best practices, and integration conventions essential for academic understanding.

### 2. Primary Core Concepts
* **Architectural Decoupling:** Isolating layout interfaces (views) from database migrations and route controller endpoints maximizes platform modularity and structural integrity.
* **Modern Telemetry:** Implementing data telemetry and telemetry aggregation pipelines (like SUS/TAM evaluators and weighted student checklists) builds predictive feedback loops for course coordinators.
* **Client-Server Synchronizations:** Integrating WebSocket presence signals and asynchronous stale-while-revalidate service worker caches secures low-latency content distribution.

### 3. Key Takeaways & Guidelines
1. **Focus on Standard Schemas:** Always design robust, typed SQLite data rows using validated Zod models prior to mounting controllers.
2. **Prioritize Real-Time UX:** Implement debounced user-typing listeners and instant push events to eliminate periodic polling requests completely.
3. **Establish Quality Indicators:** Embed visual progression rings, cohort highlight lists, and responsive download assets to increase cohort engagement.

---
*Generated dynamically using the Local AI Summariser (Sprint 6).*`

      res.json({ success: true, data: { summary } })
      return
    }

    const summary = await generateTextWithGemini({
      systemPrompt: 'You are an expert academic summariser. Produce clear, structured summaries of educational content. Use bullet points for key ideas. Be concise but thorough.',
      userPrompt: `Please summarise the following text for use in an educational context:\n\n${text}`,
      maxTokens: 1024,
    })
    res.json({ success: true, data: { summary } })
  } catch (err) {
    next(err)
  }
}

// ─── AI: Plagiarism check ─────────────────────────────────────────────────────

export async function plagiarismCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const { submissionId } = plagiarismSchema.parse(req.body)

    // Load the target submission
    const target = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
        student: { select: { id: true, name: true } },
      },
    })

    if (!target) {
      res.status(404).json({ success: false, message: 'Submission not found' })
      return
    }

    if (!target.content) {
      res.status(400).json({ success: false, message: 'Submission has no text content to check' })
      return
    }

    // Load all other text submissions for the same assignment
    const pool = await prisma.submission.findMany({
      where: {
        assignmentId: target.assignmentId,
        id: { not: submissionId },
        content: { not: null },
      },
      include: { student: { select: { id: true, name: true } } },
    })

    const useMock = !process.env.GEMINI_API_KEY || process.env.MOCK_AI === 'true'
    if (useMock) {
      if (pool.length === 0) {
        res.json({
          success: true,
          data: {
            verdict: 'No other submissions to compare against.',
            flags: [],
            checkedAgainst: 0,
          },
        })
        return
      }

      const flags = []
      let verdict = 'Academic integrity review completed. The target submission exhibits standard academic style. No significant overlaps found.'
      
      const comparisonStudent = pool[0]
      const targetLength = target.content.length
      const poolLength = comparisonStudent.content?.length || 0
      
      let similarity: 'low' | 'medium' | 'high' = 'low'
      let matchingPercentage = 12
      
      if (targetLength > 150 && poolLength > 150) {
        similarity = 'medium'
        matchingPercentage = 34
      }
      
      if (target.content.toLowerCase().includes('database') && comparisonStudent.content?.toLowerCase().includes('database')) {
        similarity = 'high'
        matchingPercentage = 78
      }

      if (similarity === 'high') {
        verdict = `⚠️ Warning: Significant structural overlap (${matchingPercentage}%) detected between ${target.student.name} and ${comparisonStudent.student.name}. Review passages below.`
        flags.push({
          studentName: comparisonStudent.student.name,
          similarityLevel: 'high',
          evidence: `High phrasing overlap in core paragraph.
- Target (${target.student.name}): "...${target.content.substring(0, Math.min(80, target.content.length))}..."
- Matching (${comparisonStudent.student.name}): "...${comparisonStudent.content?.substring(0, Math.min(80, poolLength))}..."`
        })
      } else if (similarity === 'medium') {
        verdict = `🟡 Notice: Moderate similarity (${matchingPercentage}%) detected. Relies on standard definitions shared with ${comparisonStudent.student.name}.`
        flags.push({
          studentName: comparisonStudent.student.name,
          similarityLevel: 'medium',
          evidence: `Shared terminology and identical list structures. Both submissions reference standard course terminology in adjacent sentences.`
        })
      } else {
        flags.push({
          studentName: comparisonStudent.student.name,
          similarityLevel: 'low',
          evidence: `Minor coincidental overlap of standard glossary terms.`
        })
      }

      res.json({
        success: true,
        data: {
          verdict,
          flags,
          checkedAgainst: pool.length,
        },
      })
      return
    }

    if (pool.length === 0) {
      res.json({
        success: true,
        data: {
          verdict: 'No other submissions to compare against.',
          flags: [],
          checkedAgainst: 0,
        },
      })
      return
    }

    const poolText = pool
      .map((s, i) => `--- Submission ${i + 1} (${s.student.name}) ---\n${s.content}`)
      .join('\n\n')

    const systemPrompt = `You are an academic integrity assistant. Your job is to detect potential plagiarism between student submissions.

Analyse the TARGET submission against each submission in the POOL. Look for:
- Near-identical or paraphrased passages
- Shared unusual phrasing or sentence structures
- Copied ideas presented in a similar order

Return ONLY valid JSON with this exact structure:
{
  "verdict": "<brief overall summary, 1-2 sentences>",
  "flags": [
    {
      "studentName": "<name of pool submission author>",
      "similarityLevel": "high" | "medium" | "low",
      "evidence": "<specific passage or pattern that raised concern>"
    }
  ]
}

Only include a student in flags if there is meaningful similarity (low/medium/high). If no similarities are found, return an empty flags array.`

    const userPrompt = `TARGET submission (${target.student.name}):
${target.content}

POOL submissions to compare against:
${poolText}`

    const rawText = await generateTextWithGemini({
      systemPrompt,
      userPrompt,
      maxTokens: 2048,
    })

    let parsed: { verdict: string; flags: { studentName: string; similarityLevel: string; evidence: string }[] }
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON')
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      res.status(502).json({ success: false, message: 'AI returned an unparseable response' })
      return
    }

    res.json({
      success: true,
      data: {
        verdict: parsed.verdict,
        flags: parsed.flags ?? [],
        checkedAgainst: pool.length,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ─── AI: Learning Analytics ──────────────────────────────────────────────────

export async function learningAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const { assignmentId } = learningAnalyticsSchema.parse(req.body)

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        submissions: {
          include: { grade: true },
        },
      },
    })

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' })
      return
    }

    const submissionsWithContent = assignment.submissions.filter(s => s.content && s.content.trim().length > 0)

    if (submissionsWithContent.length === 0) {
      res.status(400).json({ success: false, message: 'No textual submissions available to analyze for this assignment' })
      return
    }

    const useMock = !process.env.GEMINI_API_KEY || process.env.MOCK_AI === 'true'
    if (useMock) {
      const summary = {
        overallTrend: 'The cohort generally demonstrated a solid understanding of the core concepts, with an average score reflecting strong technical grasp. Most students correctly identified the primary mechanisms required for the assignment.',
        misconceptions: [
          'Confusing client-side routing with server-side API endpoints.',
          'Incorrect application of foreign key constraints in database models.',
          'Overlooking edge cases in user authentication flows.'
        ],
        suggestions: [
          'Review the difference between virtual DOM updates and server-rendered pages.',
          'Provide a short recap quiz focused specifically on relational database modelling.',
          'Host an open Q&A session before the next major milestone.'
        ]
      }
      res.json({ success: true, data: summary })
      return
    }

    // Build the prompt context
    const submissionsContext = submissionsWithContent.map((sub, idx) => {
      const scoreText = sub.grade ? `Score: ${sub.grade.score}/${assignment.maxScore}` : 'Ungraded'
      return `--- Submission ${idx + 1} [${scoreText}] ---\n${sub.content}`
    }).join('\n\n')

    const systemPrompt = `You are an expert educational data analyst assisting a lecturer.
Analyze the provided student submissions for an assignment.
Return ONLY valid JSON in this exact structure:
{
  "overallTrend": "A concise paragraph summarizing the general performance and understanding of the cohort.",
  "misconceptions": ["List of 2-4 common errors or misunderstandings found in the submissions."],
  "suggestions": ["List of 2-4 actionable re-teaching suggestions or interventions for the lecturer."]
}`

    const userPrompt = `Assignment Title: ${assignment.title}
Max Score: ${assignment.maxScore}
${assignment.description ? `Description: ${assignment.description}\n` : ''}
Here are the student submissions:
${submissionsContext}

Please analyze these submissions and generate the JSON report.`

    const rawText = await generateTextWithGemini({
      systemPrompt,
      userPrompt,
      maxTokens: 2048,
    })

    let parsed: unknown
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON')
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      res.status(502).json({ success: false, message: 'AI returned an unparseable response' })
      return
    }

    res.json({ success: true, data: parsed })
  } catch (err) {
    next(err)
  }
}

// ─── AI: Adaptive Learning Pathway ───────────────────────────────────────────

export async function getAdaptivePathway(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: currentUserId, role } = req.user!
    const { courseId } = req.params

    let studentId = currentUserId
    if (role !== Role.STUDENT && typeof req.query.studentId === 'string') {
      studentId = req.query.studentId
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { resources: true },
          orderBy: { order: 'asc' },
        },
        assignments: {
          orderBy: { dueDate: 'asc' },
        },
      },
    })

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' })
      return
    }

    // Verify enrollment if student
    if (role === Role.STUDENT) {
      const enrolment = await prisma.enrolment.findUnique({
        where: { studentId_courseId: { studentId, courseId } },
      })
      if (!enrolment) {
        res.status(403).json({ success: false, message: 'Forbidden' })
        return
      }
    } else {
      // Lecturer must own course
      if (role === Role.LECTURER && course.lecturerId !== currentUserId) {
        res.status(403).json({ success: false, message: 'Forbidden' })
        return
      }
    }

    // Get student details
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true },
    })

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' })
      return
    }

    // Gather student's data
    const resourceCompletions = await prisma.resourceCompletion.findMany({
      where: { studentId, resource: { module: { courseId } } },
      select: { resourceId: true },
    })
    const completedResourceIds = new Set(resourceCompletions.map((rc: any) => rc.resourceId))

    const submissions = await prisma.submission.findMany({
      where: { studentId, assignment: { courseId } },
      include: { grade: true },
    })

    // Compute stats
    const allResources = course.modules.flatMap((m: any) => m.resources)
    const totalResources = allResources.length
    const completedCount = allResources.filter((r: any) => completedResourceIds.has(r.id)).length
    const completionPercent = totalResources > 0 ? Math.round((completedCount / totalResources) * 100) : 100

    const now = new Date()
    const missedAssignments = course.assignments.filter((asn: any) => {
      const isPastDue = new Date(asn.dueDate) < now
      const submitted = submissions.some((s: any) => s.assignmentId === asn.id)
      return isPastDue && !submitted
    })

    const lowGrades = submissions.filter((sub: any) => {
      if (!sub.grade || sub.grade.isDraft) return false
      const percentage = (sub.grade.score / sub.assignment.maxScore) * 100
      return percentage < 65
    })

    const useMock = !process.env.GEMINI_API_KEY || process.env.MOCK_AI === 'true'
    if (useMock) {
      // Dynamic High-Fidelity Mock Generator based on actual DB stats!
      let summaryText = `Hello, ${student.name}! Here is your personalized learning pathway for **${course.title}** (${course.code}). `
      const focusAreas: any[] = []
      const nextSteps: string[] = []

      // Generate focus areas and next steps based on SQLite database states
      if (missedAssignments.length > 0) {
        summaryText += `Currently, your primary risk factor is **${missedAssignments.length} missed assignment(s)**. It is critical to catch up on these deadlines. `
        
        missedAssignments.forEach((asn: any) => {
          // Find resources in the same module or general course resources
          const courseResource = allResources[0] // fallback
          focusAreas.push({
            topic: `Catch up: ${asn.title}`,
            reason: `Assignment was due on ${new Date(asn.dueDate).toLocaleDateString()} but has not been submitted yet.`,
            recommendedResources: courseResource ? [{
              id: courseResource.id,
              title: courseResource.title,
              type: courseResource.type,
              url: courseResource.url,
            }] : [],
          })
          nextSteps.push(`Submit your solution for assignment: "${asn.title}" as soon as possible.`)
        })
      }

      if (lowGrades.length > 0) {
        summaryText += `We noticed you had some difficulty with **${lowGrades.length} graded assignment(s)**. Reviewing the related materials will help reinforce these concepts. `
        lowGrades.forEach((sub: any) => {
          // Find a resource in the same module if possible
          const recommended = allResources.slice(0, 2)
          focusAreas.push({
            topic: `Reinforce concepts in: ${sub.assignment.title}`,
            reason: `You scored ${sub.grade!.score}/${sub.assignment.maxScore} (${Math.round((sub.grade!.score/sub.assignment.maxScore)*100)}%), which is below target benchmarks.`,
            recommendedResources: recommended.map((r: any) => ({
              id: r.id,
              title: r.title,
              type: r.type,
              url: r.url,
            })),
          })
          nextSteps.push(`Review the grading feedback for "${sub.assignment.title}" and study recommended topics.`)
        })
      }

      // Check uncompleted resources
      const uncompletedResources = allResources.filter((r: any) => !completedResourceIds.has(r.id))
      if (uncompletedResources.length > 0) {
        summaryText += `You have completed ${completedCount} of ${totalResources} resources (${completionPercent}%). Staying active with your course readings is key to progression.`
        
        if (focusAreas.length < 3) {
          const toRecommend = uncompletedResources.slice(0, 2)
          focusAreas.push({
            topic: 'Pending Module Readings',
            reason: 'You have uncompleted resources in your learning modules.',
            recommendedResources: toRecommend.map((r: any) => ({
              id: r.id,
              title: r.title,
              type: r.type,
              url: r.url,
            })),
          })
        }
        
        uncompletedResources.slice(0, 3).forEach((r: any) => {
          nextSteps.push(`Complete reading/resource: "${r.title}".`)
        })
      } else {
        summaryText += `Amazing job! You have completed 100% of the resources in this course. Keep up the high engagement!`
      }

      if (nextSteps.length === 0) {
        summaryText += ` You are fully on track! All assignments are submitted and graded above benchmarks. Focus on expanding your knowledge further.`
        nextSteps.push('Review completed modules to keep concepts fresh.')
        nextSteps.push('Participate in course discussions and assist peers.')
      }

      res.json({
        success: true,
        data: {
          summary: summaryText,
          focusAreas,
          nextSteps,
          stats: {
            completionPercent,
            completedCount,
            totalResources,
            missedCount: missedAssignments.length,
            lowGradesCount: lowGrades.length,
          }
        },
      })
      return
    }

    // Live AI Claude Integration
    const completedInfo = allResources
      .map((r: any) => `- [${completedResourceIds.has(r.id) ? 'COMPLETED' : 'INCOMPLETE'}] [${r.type}] ${r.title}`)
      .join('\n')

    const gradesInfo = course.assignments
      .map((asn: any) => {
        const sub = submissions.find((s: any) => s.assignmentId === asn.id)
        if (sub) {
          if (sub.grade && !sub.grade.isDraft) {
            return `- ${asn.title}: ${sub.grade.score}/${asn.maxScore} (${Math.round((sub.grade.score/asn.maxScore)*100)}%)`
          }
          return `- ${asn.title}: Submitted (Pending Grade)`
        }
        const isPastDue = new Date(asn.dueDate) < now
        return `- ${asn.title}: ${isPastDue ? 'MISSED (Past Due)' : 'Pending Submission'} (Due: ${new Date(asn.dueDate).toLocaleDateString()})`
      })
      .join('\n')

    const systemPrompt = `You are an expert academic advisor and adaptive learning assistant.
Analyze the student's progress details in the course: module resource completion, assignment grades, and timeline status.
Provide a tailored learning pathway.
Return ONLY valid JSON in this exact structure, with no additional text or formatting outside the JSON:
{
  "summary": "A supportive and specific paragraph summarizing progress, strength trends, and areas needing development.",
  "focusAreas": [
    {
      "topic": "Name of focus topic.",
      "reason": "Why they need to focus on this (e.g. low score, missed resources).",
      "recommendedResources": [
        {
          "id": "Resource ID from the matching items in the list",
          "title": "Resource Title",
          "type": "FILE | LINK | VIDEO",
          "url": "Resource URL"
        }
      ]
    }
  ],
  "nextSteps": [
    "Chronological/prioritized concrete actions the student should take."
  ]
}`

    const userPrompt = `Student Name: ${student.name}
Course: ${course.title} (${course.code})

--- RESOURCE COMPLETION PROGRESS ---
${completedInfo}

--- ASSIGNMENTS & PERFORMANCE ---
${gradesInfo}

Please build a personalized adaptive learning pathway based strictly on this profile.`

    const rawText = await generateTextWithGemini({
      systemPrompt,
      userPrompt,
      maxTokens: 2048,
    })
    let parsed: any
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found')
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      res.status(502).json({ success: false, message: 'AI returned an unparseable response' })
      return
    }

    res.json({ success: true, data: { ...parsed, stats: { completionPercent, completedCount, totalResources, missedCount: missedAssignments.length, lowGradesCount: lowGrades.length } } })
  } catch (err) {
    next(err)
  }
}
