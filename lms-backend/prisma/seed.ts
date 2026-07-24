import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const SALT_ROUNDS = 12

async function main() {
  console.log('🌱 Starting database seed clean-up...')

  // Clean existing tables in correct dependency order
  await prisma.discussionPost.deleteMany()
  await prisma.discussionTopic.deleteMany()
  await prisma.quizAttempt.deleteMany()
  await prisma.quizQuestion.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.resourceCompletion.deleteMany()
  await prisma.grade.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.module.deleteMany()
  await prisma.enrolment.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.message.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleaned existing database records.')
  console.log('🌱 Seeding database with comprehensive test scenario datasets...')

  // ─── Users ────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@lms.dev',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log(`  ✔ Admin:    ${admin.email}`)

  const lecturer = await prisma.user.create({
    data: {
      name: 'Jane Lecturer',
      email: 'lecturer@lms.dev',
      password: hashedPassword,
      role: 'LECTURER',
    },
  })
  console.log(`  ✔ Lecturer: ${lecturer.email}`)

  // Create 3 students for plagiarism, analytics, and pathways testing
  const studentJohn = await prisma.user.create({
    data: {
      name: 'John Student',
      email: 'student@lms.dev',
      password: hashedPassword,
      role: 'STUDENT',
    },
  })

  const studentAlice = await prisma.user.create({
    data: {
      name: 'Alice Average',
      email: 'student2@lms.dev',
      password: hashedPassword,
      role: 'STUDENT',
    },
  })

  const studentBob = await prisma.user.create({
    data: {
      name: 'Bob Copycat',
      email: 'student3@lms.dev',
      password: hashedPassword,
      role: 'STUDENT',
    },
  })
  console.log(`  ✔ Students: ${studentJohn.email}, ${studentAlice.email}, ${studentBob.email}`)

  // ─── Course 1: Introduction to Computer Science (CS101) ─────────────────────
  const course1 = await prisma.course.create({
    data: {
      title: 'Introduction to Computer Science',
      code: 'CS101',
      description: 'A foundational course covering the basics of computer science, algorithms, relational databases, and application security.',
      status: 'PUBLISHED',
      lecturerId: lecturer.id,
    },
  })
  console.log(`  ✔ Course 1:   ${course1.code} — ${course1.title}`)

  // Enrol students in Course 1
  for (const s of [studentJohn, studentAlice, studentBob]) {
    await prisma.enrolment.create({
      data: {
        studentId: s.id,
        courseId: course1.id,
      },
    })
  }

  // ─── Course 2: Advanced Web Architectures (CS302) ──────────────────────────
  const course2 = await prisma.course.create({
    data: {
      title: 'Advanced Web Architectures',
      code: 'CS302',
      description: 'An advanced exploration of modern client-server models, server-side rendering (SSR), high-performance caching strategies, and global system scaling.',
      status: 'PUBLISHED',
      lecturerId: lecturer.id,
    },
  })
  console.log(`  ✔ Course 2:   ${course2.code} — ${course2.title}`)

  // Enrol John and Alice in Course 2
  for (const s of [studentJohn, studentAlice]) {
    await prisma.enrolment.create({
      data: {
        studentId: s.id,
        courseId: course2.id,
      },
    })
  }

  // ─── Course 1: Modules & Resources (With Rich textContent for RAG Search) ──
  
  // Week 1 Module
  const mod1 = await prisma.module.create({
    data: {
      title: 'Week 1 — Algorithms & Problem Solving',
      order: 0,
      courseId: course1.id,
    },
  })

  const res1 = await prisma.resource.create({
    data: {
      title: 'Understanding Core Algorithms',
      type: 'LINK',
      url: 'https://example.com/cs101-algorithms',
      moduleId: mod1.id,
      textContent: `An algorithm is a precise, step-by-step procedure for solving a problem or performing a computation. In computer science, algorithms form the bedrock of software engineering.
      Key properties of a valid algorithm include:
      1. Finiteness: It must terminate after a finite number of steps.
      2. Definiteness: Each step must be precisely defined and clear.
      3. Input and Output: It takes zero or more inputs and produces one or more outputs.
      4. Effectiveness: Steps must be sufficiently basic that they can be performed in practice.
      
      Common sorting algorithms include Quicksort (which uses a divide-and-conquer strategy to arrange items) and Mergesort.
      For graph operations, Dijkstra's algorithm is commonly used to find the shortest path between nodes in a network, such as in GPS routing.
      Computational complexity is measured using Big O notation, which defines the upper bound of execution time or memory requirements based on input size.`,
    },
  })

  const res2 = await prisma.resource.create({
    data: {
      title: 'Computer Systems Overview',
      type: 'FILE',
      url: 'https://example.com/cs101-systems.pdf',
      moduleId: mod1.id,
      textContent: `Computer systems are composed of hardware and software working in tandem. 
      The Central Processing Unit (CPU) is the brain of the computer, executing instructions stored in memory.
      Memory (RAM) is volatile and serves as temporary workspace, whereas disk storage (SSD/HDD) is non-volatile and persists data.
      To speed up CPU access, cache systems (L1, L2, L3) store frequently accessed memory words closer to the processor.
      Operating systems manage resources and provide an abstraction layer between hardware and user applications.`,
    },
  })

  // Week 2 Module
  const mod2 = await prisma.module.create({
    data: {
      title: 'Week 2 — Relational Databases & ORMs',
      order: 1,
      courseId: course1.id,
    },
  })

  const res3 = await prisma.resource.create({
    data: {
      title: 'Relational Database Design and Prisma',
      type: 'LINK',
      url: 'https://example.com/cs101-databases',
      moduleId: mod2.id,
      textContent: `A Relational Database Management System (RDBMS) stores data in structured tables composed of rows and columns.
      Primary keys uniquely identify a row in a table. Foreign keys establish relationships between different tables, maintaining referential integrity.
      SQLite is a serverless, file-based SQL database ideal for local development, whereas PostgreSQL and MySQL are server-based systems suited for production concurrency.
      
      An Object-Relational Mapper (ORM) like Prisma abstracts database operations. Instead of writing raw SQL strings, developers write code in their native language (e.g., TypeScript) which Prisma translates into optimized SQL queries.
      For example, 'prisma.user.findMany()' queries all records from the User table.
      Prisma Migrations track schema updates (schema.prisma) and apply incremental SQL changes to synchronize the database schema.`,
    },
  })

  // Week 3 Module
  const mod3 = await prisma.module.create({
    data: {
      title: 'Week 3 — Web Application Security',
      order: 2,
      courseId: course1.id,
    },
  })

  const res4 = await prisma.resource.create({
    data: {
      title: 'Authentication, Password Hashing & JWT',
      type: 'VIDEO',
      url: 'https://example.com/cs101-auth-jwt',
      moduleId: mod3.id,
      textContent: `Security is critical in modern web applications. Passwords must never be stored in plain text.
      Instead, cryptographic hashing algorithms like bcrypt are used. Bcrypt automatically applies a random 'salt' value to each password and runs multiple rounds of stretching to defend against brute force and rainbow table dictionary attacks.
      
      JSON Web Tokens (JWT) are widely used for stateless session management. A JWT consists of three parts:
      1. Header: Specifies the token type and cryptographic algorithm (e.g., HS256).
      2. Payload: Contains claims or metadata (e.g., userId, role, and expiration date).
      3. Signature: Created by hash-signing the header and payload with a server-side secret key to prevent client tampering.
      Access tokens are short-lived (e.g., 15 minutes) to limit vulnerability if stolen, while refresh tokens are long-lived (e.g., 7 days) and stored securely to request new access tokens.`,
    },
  })

  // ─── Course 2: Modules & Resources ──────────────────────────────────────────
  const course2mod1 = await prisma.module.create({
    data: {
      title: 'Week 1 — React Server Components & Hydration',
      order: 0,
      courseId: course2.id,
    },
  })

  const course2res1 = await prisma.resource.create({
    data: {
      title: 'React Server Components deep-dive',
      type: 'LINK',
      url: 'https://example.com/cs302-rsc-hydration',
      moduleId: course2mod1.id,
      textContent: `React Server Components (RSC) represent a paradigm shift in how React components are loaded and rendered.
      Traditional React rendering (Client-Side Rendering or CSR) forces the browser to download a large JavaScript bundle, boot up the React app, execute fetches, and render DOM nodes.
      RSCs render on the server, producing a lightweight serialized JSON metadata stream containing DOM elements. The browser reads this stream to paint pixels without downloading bundle logic for server components.
      Hydration is the process where client-side React takes over the static HTML sent by the server, attaching event listeners and hooks to create an interactive application store.`,
    },
  })

  console.log('  ✔ Modules & Resources created with rich textContent.')

  // ─── Course 1: Assignments ─────────────────────────────────────────────────
  const assignment1 = await prisma.assignment.create({
    data: {
      id: 'seed-assignment-1',
      title: 'Homework 1 — Concepts of Algorithms',
      description: 'Write a short essay explaining what an algorithm is, details of sorting/searching algorithms, and provide three real-world examples.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      maxScore: 100,
      courseId: course1.id,
    },
  })

  const assignment2 = await prisma.assignment.create({
    data: {
      id: 'seed-assignment-2',
      title: 'Homework 2 — Database Schema Design',
      description: 'Design a relational database schema for an online bookstore. Describe the tables, relationships, foreign keys, and the use of indexes.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      maxScore: 100,
      courseId: course1.id,
    },
  })
  console.log(`  ✔ Assignments: ${assignment1.title}, ${assignment2.title}`)

  // ─── Course 2: Assignments ─────────────────────────────────────────────────
  const assignment3 = await prisma.assignment.create({
    data: {
      id: 'seed-assignment-3',
      title: 'Lab 1 — Build a Server Component',
      description: 'Develop a React Server Component (RSC) that reads data directly from a relational SQLite/PostgreSQL store and displays it in a clean flexbox grid.',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      maxScore: 50,
      courseId: course2.id,
    },
  })

  // ─── Submissions & Grading ─────────────────────────────────────────────────
  
  // -- HW 1 Submissions --
  
  // 1. John Student: High-quality submission (Graded)
  const subJohnHw1 = await prisma.submission.create({
    data: {
      studentId: studentJohn.id,
      assignmentId: assignment1.id,
      content: `An algorithm is a precise, step-by-step procedure for solving a computational problem or performing a task. In software systems, algorithms define logic flow and data manipulation.
      For instance, sorting algorithms like Quicksort arrange lists in ascending order using a divide-and-conquer pivot model.
      In real-world networks, Dijkstra's algorithm computes the shortest path between nodes, which is widely utilized in GPS map applications and routing protocols.
      Another example is Google's PageRank algorithm, which ranks web pages by analysis of hyperlink connections.
      Analyzing algorithmic efficiency is crucial, and developers use Big O notation to evaluate time and space complexity as datasets scale.`,
      status: 'GRADED',
    },
  })

  await prisma.grade.create({
    data: {
      score: 95,
      feedback: 'Excellent submission, John! Your explanations are structurally sound, and the examples of Dijkstra\'s algorithm and PageRank are highly accurate and well-contextualized.',
      isDraft: false,
      submissionId: subJohnHw1.id,
      gradedById: lecturer.id,
    },
  })

  // 2. Alice Average: Moderate-quality submission (Graded)
  const subAliceHw1 = await prisma.submission.create({
    data: {
      studentId: studentAlice.id,
      assignmentId: assignment1.id,
      content: `An algorithm is just a list of steps to solve a problem. It is like a recipe for making food. You follow the steps one by one.
      We use algorithms in coding to sort things. For example, bubble sort is a simple sorting algorithm that checks adjacent items.
      Real world examples are:
      1. Finding the shortest direction on Google Maps.
      2. Recommending products to buy on retail websites.
      3. Searching for a term inside a document or dictionary.
      It is important to write clean code so that these steps run fast enough.`,
      status: 'GRADED',
    },
  })

  await prisma.grade.create({
    data: {
      score: 78,
      feedback: 'Good effort, Alice. While your examples are valid, you should expand on the technical details of the sorting algorithms and introduce efficiency concepts (like Big O) to achieve higher marks.',
      isDraft: false,
      submissionId: subAliceHw1.id,
      gradedById: lecturer.id,
    },
  })

  // 3. Bob Copycat: Copy of John's work to trigger plagiarism (Ungraded/Draft)
  const subBobHw1 = await prisma.submission.create({
    data: {
      studentId: studentBob.id,
      assignmentId: assignment1.id,
      content: `An algorithm is a precise step-by-step procedure for solving a computational problem or executing a task. In software architectures, algorithms define control flow and data transitions.
      For example, sorting algorithms like Quicksort organize list data in order using a pivot divide-and-conquer model.
      In practical routing, Dijkstra's algorithm finds the shortest path between network nodes, which is widely used in GPS mapping systems.
      Another example is Google's PageRank, which indexes pages by analyzing reference link connections.
      Understanding algorithmic speed is key, and we use Big O complexity notation to check how time increases with data size.`,
      status: 'SUBMITTED',
    },
  })

  // -- HW 2 Submissions --

  // John Student: High-quality submission (Ungraded)
  const subJohnHw2 = await prisma.submission.create({
    data: {
      studentId: studentJohn.id,
      assignmentId: assignment2.id,
      content: `To build an online bookstore, we need a relational schema with tables: User, Book, Order, and OrderLineItem.
      The relationships are structured as follows:
      1. User to Order: One-to-many relationship. An order belongs to one user, mapped via the foreign key 'userId' on the Order table referencing the User table.
      2. Order to OrderLineItem: One-to-many relationship. An order can contain multiple items.
      3. Book to OrderLineItem: One-to-many relationship. Each item points to a specific book.
      
      Foreign keys maintain referential integrity. For example, deleting a user can cascade-delete their orders, or be restricted to prevent data loss.
      Indexes are critical for database performance. We should create indexes on:
      - 'ISBN' on the Book table, since users search for books by ISBN frequently.
      - 'userId' on the Order table, to quickly fetch order histories for active customer accounts.`,
      status: 'SUBMITTED',
    },
  })

  // Alice Student: Medium-quality submission (Ungraded)
  const subAliceHw2 = await prisma.submission.create({
    data: {
      studentId: studentAlice.id,
      assignmentId: assignment2.id,
      content: `For the bookstore database, I will create tables for books, clients, and orders.
      - The books table will have title, author, price, and book ID.
      - The clients table will store names, email addresses, and phone numbers.
      - The orders table connects clients to books.
      We connect them with connections. The client ID will be stored in the orders table as a foreign key.
      Indexes help when searching the database. If we search for books by author name often, putting an index on author will make those search queries faster.`,
      status: 'SUBMITTED',
    },
  })

  console.log('  ✔ Submissions and grades seeded successfully.')

  // ─── Resource Completions (To calculate student progress) ─────────────────
  // John has completed 3/4 resources in CS101
  await prisma.resourceCompletion.create({ data: { studentId: studentJohn.id, resourceId: res1.id } })
  await prisma.resourceCompletion.create({ data: { studentId: studentJohn.id, resourceId: res2.id } })
  await prisma.resourceCompletion.create({ data: { studentId: studentJohn.id, resourceId: res3.id } })

  // Alice has completed 1/4 resources in CS101
  await prisma.resourceCompletion.create({ data: { studentId: studentAlice.id, resourceId: res1.id } })

  // John has completed 1/1 resources in CS302
  await prisma.resourceCompletion.create({ data: { studentId: studentJohn.id, resourceId: course2res1.id } })
  console.log('  ✔ Resource completions seeded.')

  // ─── Announcements ──────────────────────────────────────────────────────────
  await prisma.announcement.create({
    data: {
      title: 'Welcome to CS101!',
      content: 'Welcome to Introduction to Computer Science. Please review the course modules and get started on Week 1 materials. Homework 1 is due next week!',
      courseId: course1.id,
      authorId: lecturer.id,
    },
  })

  await prisma.announcement.create({
    data: {
      title: 'Blueprint Sync Success!',
      content: 'Welcome to CS302. Please review the React Server Component module guidelines in your study resources!',
      courseId: course2.id,
      authorId: lecturer.id,
    },
  })
  console.log('  ✔ Announcements seeded.')

  // ─── Quizzes (MCQ Modules) ──────────────────────────────────────────────────
  
  // CS101 Quiz 1
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Week 1 — Algorithms Review Quiz',
      description: 'Test your understanding of basic sorting algorithms, Dijkstra\'s algorithm, and computational complexity (Big O notation).',
      timeLimit: 15,
      maxAttempts: 2,
      courseId: course1.id,
    },
  })

  const q1q1 = await prisma.quizQuestion.create({
    data: {
      questionText: 'What is the worst-case time complexity of the Bubble Sort algorithm?',
      type: 'MULTIPLE_CHOICE',
      options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(1)'],
      correctAnswer: 'O(n²)',
      explanation: 'Bubble Sort has a nested loop structure. In the worst-case scenario (a reverse-sorted list), it requires comparing and swapping every adjacent element pair, resulting in quadratic n² operations.',
      quizId: quiz1.id,
    },
  })

  const q1q2 = await prisma.quizQuestion.create({
    data: {
      questionText: 'Dijkstra\'s algorithm is widely used to solve which category of problems?',
      type: 'MULTIPLE_CHOICE',
      options: [
        'Finding minimum spanning trees',
        'Finding the shortest path in a weighted graph',
        'Sorting alphabetical lists',
        'Hashing user passwords'
      ],
      correctAnswer: 'Finding the shortest path in a weighted graph',
      explanation: 'Dijkstra\'s algorithm calculates the shortest path from a starting node to all other reachable nodes in a graph with non-negative edge weights.',
      quizId: quiz1.id,
    },
  })

  const q1q3 = await prisma.quizQuestion.create({
    data: {
      questionText: 'Which property describes an algorithm that terminates after a specific number of steps?',
      type: 'MULTIPLE_CHOICE',
      options: ['Finiteness', 'Definiteness', 'Effectiveness', 'Concurrency'],
      correctAnswer: 'Finiteness',
      explanation: 'Finiteness means an algorithm must halt after executing a limited/finite number of steps, preventing infinite loops.',
      quizId: quiz1.id,
    },
  })

  // CS101 Quiz 2
  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Week 2 — Relational Database Basics',
      description: 'Check your understanding of primary keys, foreign keys, and indices.',
      timeLimit: 10,
      maxAttempts: 1,
      courseId: course1.id,
    },
  })

  await prisma.quizQuestion.create({
    data: {
      questionText: 'Which database keyword establishes a connection/relationship between two tables?',
      type: 'MULTIPLE_CHOICE',
      options: ['Primary Key', 'Foreign Key', 'Composite Index', 'Uniqueness Index'],
      correctAnswer: 'Foreign Key',
      explanation: 'A Foreign Key is a column or set of columns in one table that references the Primary Key of another table, modeling the database relationship.',
      quizId: quiz2.id,
    },
  })

  // CS302 Quiz 1
  const quiz3 = await prisma.quiz.create({
    data: {
      title: 'RSC & Hydration Essentials',
      description: 'Intermediate questions checking your understanding of React Server Component rendering streams and client hydration.',
      timeLimit: 10,
      maxAttempts: 3,
      courseId: course2.id,
    },
  })

  await prisma.quizQuestion.create({
    data: {
      questionText: 'Which of the following is true regarding React Server Components (RSC)?',
      type: 'MULTIPLE_CHOICE',
      options: [
        'They run in the browser and re-render on window resize events',
        'They execute entirely on the server and do not ship code bundles to the client',
        'They require full client-side Redux states to fetch database tables',
        'They bypass HTML serialization completely'
      ],
      correctAnswer: 'They execute entirely on the server and do not ship code bundles to the client',
      explanation: 'RSCs render on the server to output a lightweight payload stream, removing their execution logic and dependencies from the browser JavaScript bundles.',
      quizId: quiz3.id,
    },
  })

  console.log('  ✔ Quizzes and questions seeded.')

  // ─── Quiz Attempts ─────────────────────────────────────────────────────────
  
  // John's Attempt on CS101 Quiz 1 (Score: 3/3, 100%)
  await prisma.quizAttempt.create({
    data: {
      studentId: studentJohn.id,
      quizId: quiz1.id,
      answers: {
        [q1q1.id]: 'O(n²)',
        [q1q2.id]: 'Finding the shortest path in a weighted graph',
        [q1q3.id]: 'Finiteness'
      },
      score: 100,
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), // took 5 mins
    },
  })

  // Alice's Attempt on CS101 Quiz 1 (Score: 2/3, 66.7%)
  await prisma.quizAttempt.create({
    data: {
      studentId: studentAlice.id,
      quizId: quiz1.id,
      answers: {
        [q1q1.id]: 'O(n log n)', // wrong choice
        [q1q2.id]: 'Finding the shortest path in a weighted graph',
        [q1q3.id]: 'Finiteness'
      },
      score: 66.67,
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000), // took 12 mins
    },
  })

  console.log('  ✔ Pre-existing quiz attempts seeded.')

  // ─── Discussion Forums (Topics & Comments) ──────────────────────────────────
  
  // Topic 1 in CS101 (Created by John Student)
  const topic1 = await prisma.discussionTopic.create({
    data: {
      title: 'Clarification on Dijkstra\'s Time Complexity',
      content: 'Could someone clarify why Dijkstra\'s algorithm with a binary heap has a time complexity of O((V + E) log V) instead of O(V²)? I understand the adjacency list lookup but am confused about how edge relaxations affect the log V part.',
      courseId: course1.id,
      authorId: studentJohn.id,
    },
  })

  // Post 1 (Jane Lecturer replies)
  await prisma.discussionPost.create({
    data: {
      content: 'Great question, John! When we relax an edge (u, v), we may need to update the distance to vertex v inside our Priority Queue. In a Binary Heap, this decrease-key operation takes O(log V) time. Since we perform this operation up to E times (once for every edge) and extract the minimum vertex V times, the total complexity scales to O((V + E) log V). When graphs are dense, this is significantly faster than using an un-indexed array which performs O(V²) operations.',
      topicId: topic1.id,
      authorId: lecturer.id,
    },
  })

  // Post 2 (Alice replies)
  await prisma.discussionPost.create({
    data: {
      content: 'This explains it perfectly, thank you Jane! I was struggling to understand the log V term in our homework formulas.',
      topicId: topic1.id,
      authorId: studentAlice.id,
    },
  })

  // Topic 2 in CS101 (Created by Jane Lecturer)
  const topic2 = await prisma.discussionTopic.create({
    data: {
      title: 'SQL vs NoSQL: Choosing the Right Engine',
      content: 'In Week 2, we covered relational SQL databases. However, many systems use non-relational Document/NoSQL stores like MongoDB. Let\'s discuss: In what scenarios would you choose SQL (PostgreSQL/SQLite) over NoSQL, and when is NoSQL preferred?',
      courseId: course1.id,
      authorId: lecturer.id,
    },
  })

  // Post 1 (Bob replies)
  await prisma.discussionPost.create({
    data: {
      content: 'I think SQL is best when we have complex relationships and need strict ACID transactions (like in banking systems). NoSQL is better when the data structure changes frequently and we need high write scalability without strict relational lookups.',
      topicId: topic2.id,
      authorId: studentBob.id,
    },
  })

  // Post 2 (John replies)
  await prisma.discussionPost.create({
    data: {
      content: 'Fully agree with Bob. Furthermore, SQLite is fantastic for offline-first or embedded clients, whereas PostgreSQL is perfect for scaling relational systems. NoSQL excels when handling unstructured logs or caching JSON objects.',
      topicId: topic2.id,
      authorId: studentJohn.id,
    },
  })

  console.log('  ✔ Forum discussion boards and nested posts seeded.')

  console.log('\n✅ Database seed completed successfully!\n')
  console.log('  Testing Credentials (Password: "password123"):')
  console.log('  ┌──────────────────┬──────────────────────┬───────────┐')
  console.log('  │ User             │ Email                │ Role      │')
  console.log('  ├──────────────────┼──────────────────────┼───────────┤')
  console.log('  │ Lecturer         │ lecturer@lms.dev     │ LECTURER  │')
  console.log('  │ John (Excellent) │ student@lms.dev      │ STUDENT   │')
  console.log('  │ Alice (Average)  │ student2@lms.dev     │ STUDENT   │')
  console.log('  │ Bob (Copycat)    │ student3@lms.dev     │ STUDENT   │')
  console.log('  └──────────────────┴──────────────────────┴───────────┘')
}

main()
  .catch((e) => {
    console.error('❌ Database seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
