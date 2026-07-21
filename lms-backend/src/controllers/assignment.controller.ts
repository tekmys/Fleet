import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Role } from '../types/enums'
import { prisma } from '../lib/prisma'
import { createNotification } from '../utils/notifications'

// ─── helpers ─────────────────────────────────────────────────────────────────

async function assertCourseAccess(
  courseId: string,
  userId: string,
  role: Role,
  res: Response,
): Promise<boolean> {
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) {
    res.status(404).json({ success: false, message: 'Course not found' })
    return false
  }
  if (role === Role.LECTURER && course.lecturerId !== userId) {
    res.status(403).json({ success: false, message: 'Forbidden' })
    return false
  }
  if (role === Role.STUDENT) {
    const enrolment = await prisma.enrolment.findUnique({
      where: { studentId_courseId: { studentId: userId, courseId } },
    })
    if (!enrolment) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return false
    }
  }
  return true
}

async function getAssignmentWithAccess(
  assignmentId: string,
  userId: string,
  role: Role,
  res: Response,
): Promise<{ assignment: NonNullable<Awaited<ReturnType<typeof prisma.assignment.findUnique>>> } | null> {
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } })
  if (!assignment) {
    res.status(404).json({ success: false, message: 'Assignment not found' })
    return null
  }
  const ok = await assertCourseAccess(assignment.courseId, userId, role, res)
  if (!ok) return null
  return { assignment }
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const createAssignmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.string().datetime(),
  maxScore: z.number().positive().default(100),
})

const updateAssignmentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  maxScore: z.number().positive().optional(),
})

const submitAssignmentSchema = z.object({
  content: z.string().optional(),
  fileUrl: z.string().url().optional(),
}).refine(d => d.content !== undefined || d.fileUrl !== undefined, {
  message: 'Either content or fileUrl is required',
})

const gradeSubmissionSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().optional(),
  isDraft: z.boolean().default(false),
})

// ─── Assignment CRUD ──────────────────────────────────────────────────────────

export async function listAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!
    const { id: courseId } = req.params

    const ok = await assertCourseAccess(courseId, userId, role, res)
    if (!ok) return

    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      orderBy: { dueDate: 'asc' },
      include: {
        _count: { select: { submissions: true } },
      },
    })

    // For students, attach their own submission status
    if (role === Role.STUDENT) {
      const submissions = await prisma.submission.findMany({
        where: { studentId: userId, assignmentId: { in: assignments.map(a => a.id) } },
        include: { grade: true },
      })
      const subMap = new Map(submissions.map(s => [s.assignmentId, s]))
      const withSubmission = assignments.map(a => ({ ...a, mySubmission: subMap.get(a.id) ?? null }))
      res.json({ success: true, data: withSubmission })
      return
    }

    res.json({ success: true, data: assignments })
  } catch (err) {
    next(err)
  }
}

export async function getAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!
    const access = await getAssignmentWithAccess(req.params.id, userId, role, res)
    if (!access) return

    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { submissions: true } } },
    })

    res.json({ success: true, data: assignment })
  } catch (err) {
    next(err)
  }
}

export async function createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!
    const { id: courseId } = req.params
    const body = createAssignmentSchema.parse(req.body)

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const ok = await assertCourseAccess(courseId, userId, role, res)
    if (!ok) return

    const assignment = await prisma.assignment.create({
      data: { ...body, courseId, dueDate: new Date(body.dueDate) },
      include: { _count: { select: { submissions: true } } },
    })

    res.status(201).json({ success: true, data: assignment })
  } catch (err) {
    next(err)
  }
}

export async function updateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const access = await getAssignmentWithAccess(req.params.id, userId, role, res)
    if (!access) return

    const body = updateAssignmentSchema.parse(req.body)
    const assignment = await prisma.assignment.update({
      where: { id: req.params.id },
      data: { ...body, ...(body.dueDate ? { dueDate: new Date(body.dueDate) } : {}) },
      include: { _count: { select: { submissions: true } } },
    })

    res.json({ success: true, data: assignment })
  } catch (err) {
    next(err)
  }
}

export async function deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const access = await getAssignmentWithAccess(req.params.id, userId, role, res)
    if (!access) return

    await prisma.assignment.delete({ where: { id: req.params.id } })
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export async function submitAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!

    if (role !== Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Only students can submit assignments' })
      return
    }

    const access = await getAssignmentWithAccess(req.params.id, userId, role, res)
    if (!access) return

    const body = submitAssignmentSchema.parse(req.body)

    // Upsert — allow resubmission before due date
    const submission = await prisma.submission.upsert({
      where: { studentId_assignmentId: { studentId: userId, assignmentId: req.params.id } },
      create: { studentId: userId, assignmentId: req.params.id, ...body },
      update: { ...body, submittedAt: new Date() },
      include: { grade: true },
    })

    res.status(201).json({ success: true, data: submission })
  } catch (err) {
    next(err)
  }
}

export async function listSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const access = await getAssignmentWithAccess(req.params.id, userId, role, res)
    if (!access) return

    const submissions = await prisma.submission.findMany({
      where: { assignmentId: req.params.id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        grade: true,
      },
      orderBy: { submittedAt: 'asc' },
    })

    res.json({ success: true, data: submissions })
  } catch (err) {
    next(err)
  }
}

export async function gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { assignment: true },
    })
    if (!submission) {
      res.status(404).json({ success: false, message: 'Submission not found' })
      return
    }

    const ok = await assertCourseAccess(submission.assignment.courseId, userId, role, res)
    if (!ok) return

    const body = gradeSubmissionSchema.parse(req.body)

    if (body.score > submission.assignment.maxScore) {
      res.status(400).json({ success: false, message: `Score cannot exceed maxScore (${submission.assignment.maxScore})` })
      return
    }

    const grade = await prisma.grade.upsert({
      where: { submissionId: req.params.id },
      create: { submissionId: req.params.id, gradedById: userId, ...body },
      update: { ...body, gradedById: userId },
    })

    // Update submission status to GRADED only when not a draft
    if (!body.isDraft) {
      await prisma.submission.update({
        where: { id: req.params.id },
        data: { status: 'GRADED' },
      })

      await createNotification({
        userId: submission.studentId,
        type: 'GRADE_PUBLISHED',
        title: `Your grade is ready: ${submission.assignment.title}`,
        body: `Score: ${body.score} / ${submission.assignment.maxScore}${body.feedback ? ` — ${body.feedback.slice(0, 80)}` : ''}`,
        link: `/student/courses/${submission.assignment.courseId}/assignments`,
      })
    }

    res.json({ success: true, data: grade })
  } catch (err) {
    next(err)
  }
}

// ─── Gradebook ────────────────────────────────────────────────────────────────

export async function getGradebook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!
    const { id: courseId } = req.params

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const ok = await assertCourseAccess(courseId, userId, role, res)
    if (!ok) return

    const [assignments, enrolments] = await Promise.all([
      prisma.assignment.findMany({
        where: { courseId },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.enrolment.findMany({
        where: { courseId },
        include: { student: { select: { id: true, name: true, email: true } } },
        orderBy: { student: { name: 'asc' } },
      }),
    ])

    const submissions = await prisma.submission.findMany({
      where: { assignmentId: { in: assignments.map(a => a.id) } },
      include: { grade: true },
    })

    // Build a lookup: studentId → assignmentId → submission
    const subLookup = new Map<string, Map<string, typeof submissions[number]>>()
    for (const sub of submissions) {
      if (!subLookup.has(sub.studentId)) subLookup.set(sub.studentId, new Map())
      subLookup.get(sub.studentId)!.set(sub.assignmentId, sub)
    }

    const rows = enrolments.map(e => ({
      student: e.student,
      grades: assignments.map(a => {
        const sub = subLookup.get(e.studentId)?.get(a.id)
        return {
          assignmentId: a.id,
          assignmentTitle: a.title,
          maxScore: a.maxScore,
          submission: sub ?? null,
          score: sub?.grade?.score ?? null,
          isDraft: sub?.grade?.isDraft ?? null,
        }
      }),
    }))

    res.json({ success: true, data: { assignments, rows } })
  } catch (err) {
    next(err)
  }
}
