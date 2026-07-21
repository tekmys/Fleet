import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SALT_ROUNDS = 12

async function main() {
  console.log('🌱 Seeding database...')

  // ── Admin ──────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.dev' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@lms.dev',
      password: await bcrypt.hash('password123', SALT_ROUNDS),
      role: 'ADMIN',
    },
  })
  console.log(`  ✔ Admin:    ${admin.email}`)

  // ── Lecturer ───────────────────────────────────────────────────────
  const lecturer = await prisma.user.upsert({
    where: { email: 'lecturer@lms.dev' },
    update: {},
    create: {
      name: 'Jane Lecturer',
      email: 'lecturer@lms.dev',
      password: await bcrypt.hash('password123', SALT_ROUNDS),
      role: 'LECTURER',
    },
  })
  console.log(`  ✔ Lecturer: ${lecturer.email}`)

  // ── Student ────────────────────────────────────────────────────────
  const student = await prisma.user.upsert({
    where: { email: 'student@lms.dev' },
    update: {},
    create: {
      name: 'John Student',
      email: 'student@lms.dev',
      password: await bcrypt.hash('password123', SALT_ROUNDS),
      role: 'STUDENT',
    },
  })
  console.log(`  ✔ Student:  ${student.email}`)

  // ── Course ─────────────────────────────────────────────────────────
  const course = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      title: 'Introduction to Computer Science',
      code: 'CS101',
      description: 'A foundational course covering the basics of computer science, algorithms, and programming.',
      status: 'PUBLISHED',
      lecturerId: lecturer.id,
    },
  })
  console.log(`  ✔ Course:   ${course.code} — ${course.title}`)

  // ── Enrolment ──────────────────────────────────────────────────────
  await prisma.enrolment.upsert({
    where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
    update: {},
    create: {
      studentId: student.id,
      courseId: course.id,
    },
  })
  console.log(`  ✔ Enrolled ${student.name} in ${course.code}`)

  // ── Module + Resource ──────────────────────────────────────────────
  const mod = await prisma.module.upsert({
    where: { id: 'seed-module-1' },
    update: {},
    create: {
      id: 'seed-module-1',
      title: 'Week 1 — What is Computer Science?',
      order: 0,
      courseId: course.id,
    },
  })

  await prisma.resource.upsert({
    where: { id: 'seed-resource-1' },
    update: {},
    create: {
      id: 'seed-resource-1',
      title: 'Intro to CS — Lecture Slides',
      type: 'LINK',
      url: 'https://example.com/cs101-week1-slides.pdf',
      moduleId: mod.id,
    },
  })
  console.log(`  ✔ Module:   ${mod.title} (with 1 resource)`)

  // ── Assignment ─────────────────────────────────────────────────────
  const assignment = await prisma.assignment.upsert({
    where: { id: 'seed-assignment-1' },
    update: {},
    create: {
      id: 'seed-assignment-1',
      title: 'Homework 1 — Algorithms',
      description: 'Write a short essay explaining what an algorithm is and provide three real-world examples.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      maxScore: 100,
      courseId: course.id,
    },
  })
  console.log(`  ✔ Assignment: ${assignment.title}`)

  // ── Announcement ───────────────────────────────────────────────────
  await prisma.announcement.upsert({
    where: { id: 'seed-announcement-1' },
    update: {},
    create: {
      id: 'seed-announcement-1',
      title: 'Welcome to CS101!',
      content: 'Welcome to Introduction to Computer Science. Please review the course modules and get started on Week 1 materials.',
      courseId: course.id,
      authorId: lecturer.id,
    },
  })
  console.log(`  ✔ Announcement created`)

  console.log('\n✅ Seed complete!\n')
  console.log('  Login credentials (all passwords: password123):')
  console.log('  ┌─────────────┬──────────────────────┐')
  console.log('  │ Role        │ Email                │')
  console.log('  ├─────────────┼──────────────────────┤')
  console.log('  │ Admin       │ admin@lms.dev        │')
  console.log('  │ Lecturer    │ lecturer@lms.dev     │')
  console.log('  │ Student     │ student@lms.dev      │')
  console.log('  └─────────────┴──────────────────────┘')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
