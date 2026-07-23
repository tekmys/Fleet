import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const SALT_ROUNDS = 12

async function main() {
  console.log('🌱 Starting database seed clean-up...')

  // Clean existing tables in correct dependency order
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
  console.log('🌱 Seeding database with full AI testing scenarios...')

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

  // ─── Course ───────────────────────────────────────────────────────────────
  const course = await prisma.course.create({
    data: {
      title: 'Introduction to Computer Science',
      code: 'CS101',
      description: 'A foundational course covering the basics of computer science, algorithms, relational databases, and application security.',
      status: 'PUBLISHED',
      lecturerId: lecturer.id,
    },
  })
  console.log(`  ✔ Course:   ${course.code} — ${course.title}`)

  // ─── Enrolments ────────────────────────────────────────────────────────────
  for (const s of [studentJohn, studentAlice, studentBob]) {
    await prisma.enrolment.create({
      data: {
        studentId: s.id,
        courseId: course.id,
      },
    })
  }
  console.log(`  ✔ Enrolled all 3 students in ${course.code}`)

  // ─── Modules & Resources (With Rich textContent for RAG Search) ───────────
  
  // Week 1 Module
  const mod1 = await prisma.module.create({
    data: {
      title: 'Week 1 — Algorithms & Problem Solving',
      order: 0,
      courseId: course.id,
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
      courseId: course.id,
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
      courseId: course.id,
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

  console.log('  ✔ Modules & Resources created with rich textContent.')

  // ─── Assignments ──────────────────────────────────────────────────────────
  const assignment1 = await prisma.assignment.create({
    data: {
      id: 'seed-assignment-1',
      title: 'Homework 1 — Concepts of Algorithms',
      description: 'Write a short essay explaining what an algorithm is, details of sorting/searching algorithms, and provide three real-world examples.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      maxScore: 100,
      courseId: course.id,
    },
  })

  const assignment2 = await prisma.assignment.create({
    data: {
      id: 'seed-assignment-2',
      title: 'Homework 2 — Database Schema Design',
      description: 'Design a relational database schema for an online bookstore. Describe the tables, relationships, foreign keys, and the use of indexes.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      maxScore: 100,
      courseId: course.id,
    },
  })
  console.log(`  ✔ Assignments: ${assignment1.title}, ${assignment2.title}`)

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

  // John Student: High-quality submission (Ungraded - Ready for auto-grading test)
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
  // John has completed 3/4 resources
  await prisma.resourceCompletion.create({ data: { studentId: studentJohn.id, resourceId: res1.id } })
  await prisma.resourceCompletion.create({ data: { studentId: studentJohn.id, resourceId: res2.id } })
  await prisma.resourceCompletion.create({ data: { studentId: studentJohn.id, resourceId: res3.id } })

  // Alice has completed 1/4 resources
  await prisma.resourceCompletion.create({ data: { studentId: studentAlice.id, resourceId: res1.id } })

  // Bob has completed 0/4 resources
  console.log('  ✔ Resource completions seeded.')

  // ─── Announcements ──────────────────────────────────────────────────────────
  await prisma.announcement.create({
    data: {
      title: 'Welcome to CS101!',
      content: 'Welcome to Introduction to Computer Science. Please review the course modules and get started on Week 1 materials. Homework 1 is due next week!',
      courseId: course.id,
      authorId: lecturer.id,
    },
  })
  console.log('  ✔ Announcements seeded.')

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
