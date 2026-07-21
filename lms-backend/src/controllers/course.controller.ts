import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { CourseStatus, Role } from '../types/enums'
import { prisma } from '../lib/prisma'

const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  code: z.string().min(1).max(20),
  description: z.string().optional(),
  status: z.nativeEnum(CourseStatus).optional(),
  lecturerId: z.string().optional(),
})

const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(20).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(CourseStatus).optional(),
  lecturerId: z.string().optional(),
})

const courseInclude = {
  lecturer: {
    select: { id: true, name: true, email: true },
  },
  _count: {
    select: { enrolments: true, modules: true, assignments: true },
  },
} as const

export async function listCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, id: userId } = req.user!
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>
    const skip = (parseInt(page) - 1) * parseInt(limit)

    let where: Record<string, unknown> = {}

    if (role === Role.LECTURER) {
      where = { lecturerId: userId }
    } else if (role === Role.STUDENT) {
      where = { enrolments: { some: { studentId: userId } } }
    }

    if (status) where.status = status

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: courseInclude,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ])

    res.json({ success: true, data: { courses, total, page: parseInt(page), limit: parseInt(limit) } })
  } catch (err) {
    next(err)
  }
}

export async function createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, id: userId } = req.user!
    const body = createCourseSchema.parse(req.body)

    // Lecturer can only create for themselves
    const lecturerId = role === Role.LECTURER ? userId : (body.lecturerId ?? userId)

    const existing = await prisma.course.findUnique({ where: { code: body.code } })
    if (existing) {
      res.status(409).json({ success: false, message: 'Course code already in use' })
      return
    }

    const course = await prisma.course.create({
      data: { ...body, lecturerId },
      include: courseInclude,
    })

    res.status(201).json({ success: true, data: course })
  } catch (err) {
    next(err)
  }
}

export async function getCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, id: userId } = req.user!
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: courseInclude,
    })

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' })
      return
    }

    // Students can only view courses they are enrolled in
    if (role === Role.STUDENT) {
      const enrolled = await prisma.enrolment.findUnique({
        where: { studentId_courseId: { studentId: userId, courseId: course.id } },
      })
      if (!enrolled) {
        res.status(403).json({ success: false, message: 'Forbidden' })
        return
      }
    }

    // Lecturers can only view their own courses
    if (role === Role.LECTURER && course.lecturerId !== userId) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    res.json({ success: true, data: course })
  } catch (err) {
    next(err)
  }
}

export async function updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, id: userId } = req.user!
    const body = updateCourseSchema.parse(req.body)

    const course = await prisma.course.findUnique({ where: { id: req.params.id } })
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' })
      return
    }

    if (role === Role.LECTURER && course.lecturerId !== userId) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    if (body.code && body.code !== course.code) {
      const codeTaken = await prisma.course.findUnique({ where: { code: body.code } })
      if (codeTaken) {
        res.status(409).json({ success: false, message: 'Course code already in use' })
        return
      }
    }

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: body,
      include: courseInclude,
    })

    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
}

export async function deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } })
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' })
      return
    }

    await prisma.course.delete({ where: { id: req.params.id } })
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}

export async function enrolStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { studentId } = z.object({ studentId: z.string() }).parse(req.body)

    const [course, student] = await Promise.all([
      prisma.course.findUnique({ where: { id: req.params.id } }),
      prisma.user.findUnique({ where: { id: studentId } }),
    ])

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' })
      return
    }

    if (!student || student.role !== Role.STUDENT || !student.isActive) {
      res.status(400).json({ success: false, message: 'Invalid student' })
      return
    }

    const existing = await prisma.enrolment.findUnique({
      where: { studentId_courseId: { studentId, courseId: req.params.id } },
    })

    if (existing) {
      res.status(409).json({ success: false, message: 'Student already enrolled' })
      return
    }

    const enrolment = await prisma.enrolment.create({
      data: { studentId, courseId: req.params.id },
    })

    res.status(201).json({ success: true, data: enrolment })
  } catch (err) {
    next(err)
  }
}

export async function getCourseStudents(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { role, id: userId } = req.user!

    const course = await prisma.course.findUnique({ where: { id: req.params.id } })
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' })
      return
    }

    if (role === Role.LECTURER && course.lecturerId !== userId) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const enrolments = await prisma.enrolment.findMany({
      where: { courseId: req.params.id },
      include: {
        student: { select: { id: true, name: true, email: true, isActive: true } },
      },
      orderBy: { enrolledAt: 'asc' },
    })

    res.json({ success: true, data: enrolments })
  } catch (err) {
    next(err)
  }
}

export async function getAtRiskStudents(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { role, id: userId } = req.user!
    const { id: courseId } = req.params

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' })
      return
    }

    if (role === Role.LECTURER && course.lecturerId !== userId) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    // 1. Fetch course materials, assessments, and modules/resources
    const now = new Date()
    const [assignments, enrolments, modules] = await Promise.all([
      prisma.assignment.findMany({
        where: { courseId },
        include: { submissions: { include: { grade: true } } },
      }),
      prisma.enrolment.findMany({
        where: { courseId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              updatedAt: true,
              refreshTokens: { orderBy: { createdAt: 'desc' }, take: 1 },
              resourceCompletions: true,
            },
          },
        },
      }),
      prisma.module.findMany({
        where: { courseId },
        include: { resources: { select: { id: true } } },
      }),
    ])

    // Compile all course resource IDs
    const courseResourceIds = new Set<string>()
    modules.forEach((mod) => {
      mod.resources.forEach((res) => {
        courseResourceIds.add(res.id)
      })
    })
    const totalCourseResources = courseResourceIds.size

    const overdueAssignments = assignments.filter((a) => a.dueDate < now)

    const riskList = enrolments.map((enrol) => {
      const student = enrol.student
      const riskReasons: string[] = []

      // ── Factor 1: Missed Deadlines (Weight: 35%) ──
      let missedCount = 0
      for (const assign of overdueAssignments) {
        const submission = assign.submissions.find((s) => s.studentId === student.id)
        if (!submission || submission.status !== 'SUBMITTED') {
          missedCount++
        }
      }

      const overdueCount = overdueAssignments.length
      const missedScore = overdueCount > 0 ? (missedCount / overdueCount) * 100 : 0
      if (missedCount > 0) {
        riskReasons.push(`Missed ${missedCount} of ${overdueCount} assignments`)
      }

      // ── Factor 2: Grade Performance (Weight: 35%) ──
      let totalGradesPercentage = 0
      let gradedCount = 0
      for (const assign of assignments) {
        const submission = assign.submissions.find((s) => s.studentId === student.id)
        const grade = submission?.grade
        if (grade && !grade.isDraft) {
          totalGradesPercentage += (grade.score / assign.maxScore) * 100
          gradedCount++
        }
      }

      const averageGrade = gradedCount > 0 ? totalGradesPercentage / gradedCount : null
      let gradeRiskScore = 0
      if (averageGrade !== null) {
        gradeRiskScore = Math.max(0, 100 - averageGrade)
        if (averageGrade < 55) {
          riskReasons.push(`Failing grade average (${averageGrade.toFixed(1)}%)`)
        }
      }

      // ── Factor 3: Inactivity (Weight: 15%) ──
      const lastActiveDate = student.refreshTokens[0]?.createdAt ?? student.updatedAt
      const diffMs = now.getTime() - lastActiveDate.getTime()
      const daysInactive = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

      let inactivityScore = 0
      if (daysInactive >= 10) {
        inactivityScore = 100
        riskReasons.push(`No portal activity in over 10 days (${daysInactive} days inactive)`)
      } else if (daysInactive >= 5) {
        inactivityScore = 50
        riskReasons.push(`Inactive for ${daysInactive} days`)
      }

      // ── Factor 4: Content Progression (Weight: 15%) ──
      const studentCompletions = student.resourceCompletions.filter((rc) =>
        courseResourceIds.has(rc.resourceId),
      )
      const completedCount = studentCompletions.length
      const progressPercent =
        totalCourseResources > 0 ? Math.round((completedCount / totalCourseResources) * 100) : 100

      let progressionRiskScore = 0
      if (totalCourseResources > 0) {
        progressionRiskScore = Math.max(0, 100 - progressPercent)
        if (progressPercent < 45) {
          riskReasons.push(`Low course content progression (${progressPercent}% completed)`)
        }
      }

      // ── Overall Risk Calculation (Unified 35/35/15/15) ──
      const overallScore = Math.round(
        missedScore * 0.35 +
        gradeRiskScore * 0.35 +
        inactivityScore * 0.15 +
        progressionRiskScore * 0.15
      )

      let level: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
      if (
        overallScore >= 50 ||
        missedCount >= 2 ||
        (averageGrade !== null && averageGrade < 45) ||
        (totalCourseResources > 0 && progressPercent < 25)
      ) {
        level = 'HIGH'
      } else if (
        overallScore >= 25 ||
        missedCount > 0 ||
        (averageGrade !== null && averageGrade < 60) ||
        daysInactive >= 5 ||
        (totalCourseResources > 0 && progressPercent < 45)
      ) {
        level = 'MEDIUM'
      }

      return {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
        },
        riskScore: overallScore,
        riskLevel: level,
        daysInactive,
        missedAssignmentsCount: missedCount,
        overdueAssignmentsCount: overdueCount,
        averageGrade: averageGrade !== null ? Math.round(averageGrade) : null,
        progressPercent,
        completedCount,
        totalResources: totalCourseResources,
        riskReasons,
      }
    })

    // Sort by riskScore descending, then by high risk level
    const sortedList = riskList.sort((a, b) => {
      if (a.riskLevel === 'HIGH' && b.riskLevel !== 'HIGH') return -1
      if (a.riskLevel !== 'HIGH' && b.riskLevel === 'HIGH') return 1
      if (a.riskLevel === 'MEDIUM' && b.riskLevel === 'LOW') return -1
      if (a.riskLevel === 'LOW' && b.riskLevel === 'MEDIUM') return 1
      return b.riskScore - a.riskScore
    })

    res.json({ success: true, data: sortedList })
  } catch (err) {
    next(err)
  }
}
