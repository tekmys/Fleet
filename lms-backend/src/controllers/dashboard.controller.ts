import type { Request, Response, NextFunction } from 'express'
import { Role } from '../types/enums'
import { prisma } from '../lib/prisma'

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!

    if (role === Role.ADMIN) {
      const [totalUsers, totalCourses, totalEnrolments, recentUsers, coursesByStatus] =
        await Promise.all([
          prisma.user.count({ where: { isActive: true } }),
          prisma.course.count(),
          prisma.enrolment.count(),
          prisma.user.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { id: true, name: true, email: true, role: true, createdAt: true },
          }),
          prisma.course.groupBy({
            by: ['status'],
            _count: { id: true },
          }),
        ])

      const statusMap = Object.fromEntries(coursesByStatus.map(r => [r.status, r._count.id]))

      res.json({
        success: true,
        data: {
          totalUsers,
          totalCourses,
          totalEnrolments,
          coursesByStatus: {
            DRAFT: statusMap['DRAFT'] ?? 0,
            PUBLISHED: statusMap['PUBLISHED'] ?? 0,
            ARCHIVED: statusMap['ARCHIVED'] ?? 0,
          },
          recentUsers,
        },
      })
      return
    }

    if (role === Role.LECTURER) {
      const courses = await prisma.course.findMany({
        where: { lecturerId: userId },
        select: { id: true },
      })
      const courseIds = courses.map(c => c.id)

      const assignmentIds = await prisma.assignment
        .findMany({ where: { courseId: { in: courseIds } }, select: { id: true } })
        .then(a => a.map(x => x.id))

      const [totalStudents, totalAssignments, pendingSubmissions, totalSubmissions, gradedSubmissions, recentSubmissions] =
        await Promise.all([
          prisma.enrolment.count({ where: { courseId: { in: courseIds } } }),
          prisma.assignment.count({ where: { courseId: { in: courseIds } } }),
          prisma.submission.count({
            where: {
              assignmentId: { in: assignmentIds },
              OR: [
                { grade: null },
                { grade: { isDraft: true } }
              ]
            },
          }),
          prisma.submission.count({
            where: { assignmentId: { in: assignmentIds } }
          }),
          prisma.submission.count({
            where: {
              assignmentId: { in: assignmentIds },
              grade: { isDraft: false }
            }
          }),
          prisma.submission.findMany({
            where: { assignmentId: { in: assignmentIds } },
            orderBy: { submittedAt: 'desc' },
            take: 5,
            include: {
              student: { select: { id: true, name: true } },
              assignment: { select: { id: true, title: true, courseId: true } },
            },
          }),
        ])

      res.json({
        success: true,
        data: {
          totalCourses: courseIds.length,
          totalStudents,
          totalAssignments,
          pendingSubmissions,
          totalSubmissions,
          gradedSubmissions,
          recentSubmissions,
        },
      })
      return
    }

    // STUDENT
    const now = new Date()
    const enrolments = await prisma.enrolment.findMany({
      where: { studentId: userId },
      select: { courseId: true },
    })
    const courseIds = enrolments.map(e => e.courseId)

    // Fetch all course assignments to filter upcoming & overdue in JavaScript
    const allCourseAssignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: courseIds },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        course: { select: { id: true, title: true, code: true } },
        submissions: {
          where: { studentId: userId },
          select: { id: true, status: true },
        },
      },
    })

    const filteredAssignments = allCourseAssignments.filter(a => {
      const hasSubmitted = a.submissions.length > 0
      const isFuture = new Date(a.dueDate) >= now
      return isFuture || !hasSubmitted
    })

    const upcomingAssignments = filteredAssignments.slice(0, 5).map(a => ({
      ...a,
      submitted: a.submissions.length > 0,
      isOverdue: new Date(a.dueDate) < now && a.submissions.length === 0,
    }))

    const [recentGrades, totalSubmitted, gradesAggregation] = await Promise.all([
      prisma.grade.findMany({
        where: {
          isDraft: false,
          submission: { studentId: userId },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          submission: {
            include: {
              assignment: { select: { id: true, title: true, maxScore: true, courseId: true } },
            },
          },
        },
      }),
      prisma.submission.count({ where: { studentId: userId } }),
      prisma.grade.findMany({
        where: {
          isDraft: false,
          submission: { studentId: userId },
        },
        select: {
          score: true,
          submission: {
            select: {
              assignment: {
                select: {
                  maxScore: true,
                },
              },
            },
          },
        },
      }),
    ])

    let cumulativeAverage = null
    if (gradesAggregation.length > 0) {
      const totalPercentage = gradesAggregation.reduce((sum, g) => {
        const max = g.submission?.assignment?.maxScore ?? 100
        return sum + (g.score / max) * 100
      }, 0)
      cumulativeAverage = Math.round(totalPercentage / gradesAggregation.length)
    }

    res.json({
      success: true,
      data: {
        totalEnrolledCourses: courseIds.length,
        totalSubmitted,
        upcomingAssignments,
        recentGrades,
        cumulativeAverage,
      },
    })
  } catch (err) {
    next(err)
  }
}
