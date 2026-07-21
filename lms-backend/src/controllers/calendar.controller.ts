import type { Request, Response, NextFunction } from 'express'
import { Role } from '../types/enums'
import { prisma } from '../lib/prisma'

export async function getCalendarEvents(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id: userId, role } = req.user!

    // 1. Resolve relevant course IDs
    let courseIds: string[] = []
    if (role === Role.ADMIN) {
      const courses = await prisma.course.findMany({ select: { id: true } })
      courseIds = courses.map((c) => c.id)
    } else if (role === Role.LECTURER) {
      const courses = await prisma.course.findMany({
        where: { lecturerId: userId },
        select: { id: true },
      })
      courseIds = courses.map((c) => c.id)
    } else {
      const enrolments = await prisma.enrolment.findMany({
        where: { studentId: userId },
        select: { courseId: true },
      })
      courseIds = enrolments.map((e) => e.courseId)
    }

    if (courseIds.length === 0) {
      res.json({ success: true, data: [] })
      return
    }

    // 2. Query all assignments, announcements, and modules
    const [assignments, announcements, modules] = await Promise.all([
      prisma.assignment.findMany({
        where: { courseId: { in: courseIds } },
        include: { course: { select: { title: true, code: true } } },
      }),
      prisma.announcement.findMany({
        where: { courseId: { in: courseIds } },
        include: { course: { select: { title: true, code: true } } },
      }),
      prisma.module.findMany({
        where: { courseId: { in: courseIds } },
        include: { course: { select: { title: true, code: true } } },
      }),
    ])

    const events: any[] = []

    const rolePath = role.toLowerCase()

    // 3. Map Assignments
    assignments.forEach((assign) => {
      events.push({
        id: assign.id,
        title: `[Deadline] ${assign.title}`,
        date: assign.dueDate,
        type: 'ASSIGNMENT',
        courseName: assign.course.title,
        courseCode: assign.course.code,
        link: `/${rolePath}/courses/${assign.courseId}/assignments`,
      })
    })

    // 4. Map Announcements
    announcements.forEach((ann) => {
      events.push({
        id: ann.id,
        title: `[Announcement] ${ann.title}`,
        date: ann.createdAt,
        type: 'ANNOUNCEMENT',
        courseName: ann.course.title,
        courseCode: ann.course.code,
        link: role === Role.STUDENT 
          ? `/student/courses/${ann.courseId}` 
          : `/${rolePath}/courses/${ann.courseId}/assignments`, // lecturer announcement dashboard is in assignments page
      })
    })

    // 5. Map Modules
    modules.forEach((mod) => {
      events.push({
        id: mod.id,
        title: `[Module Released] ${mod.title}`,
        date: mod.createdAt,
        type: 'MODULE',
        courseName: mod.course.title,
        courseCode: mod.course.code,
        link: role === Role.STUDENT 
          ? `/student/courses/${mod.courseId}` 
          : `/lecturer/courses/${mod.courseId}/modules`,
      })
    })

    // Sort events chronologically
    const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    res.json({ success: true, data: sortedEvents })
  } catch (err) {
    next(err)
  }
}
