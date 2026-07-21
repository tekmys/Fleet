import type { Request, Response, NextFunction } from 'express'
import { Role } from '../types/enums'
import { prisma } from '../lib/prisma'

export async function toggleResourceComplete(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id: studentId } = req.user!
    const { resourceId } = req.params

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    })

    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' })
      return
    }

    const existing = await prisma.resourceCompletion.findUnique({
      where: {
        studentId_resourceId: {
          studentId,
          resourceId,
        },
      },
    })

    if (existing) {
      await prisma.resourceCompletion.delete({
        where: { id: existing.id },
      })
      res.json({ success: true, data: { completed: false } })
    } else {
      await prisma.resourceCompletion.create({
        data: {
          studentId,
          resourceId,
        },
      })
      res.json({ success: true, data: { completed: true } })
    }
  } catch (err) {
    next(err)
  }
}

export async function getCourseProgressStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { role, id: userId } = req.user!
    const { courseId } = req.params

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            resources: {
              select: { id: true },
            },
          },
        },
        enrolments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                resourceCompletions: true,
              },
            },
          },
        },
      },
    })

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' })
      return
    }

    if (role === Role.LECTURER && course.lecturerId !== userId) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    // Tally all course resource IDs
    const courseResources: { id: string; moduleId: string }[] = []
    const moduleResourcesMap: Record<string, string[]> = {}

    course.modules.forEach((mod) => {
      moduleResourcesMap[mod.id] = []
      mod.resources.forEach((res) => {
        courseResources.push({ id: res.id, moduleId: mod.id })
        moduleResourcesMap[mod.id].push(res.id)
      })
    })

    const totalResources = courseResources.length

    // Compute progress stats per student
    const studentStats = course.enrolments.map((enrol) => {
      const student = enrol.student
      const completedIds = new Set(student.resourceCompletions.map((rc) => rc.resourceId))
      
      // Filter completions to only those belonging to this course
      const completedCourseResources = courseResources.filter((r) => completedIds.has(r.id))
      const completedCount = completedCourseResources.length
      const progressPercent = totalResources > 0 ? Math.round((completedCount / totalResources) * 100) : 0

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        completedCount,
        progressPercent,
      }
    })

    // Compute average progress stats per module
    const moduleStats = course.modules.map((mod) => {
      const resourceIds = moduleResourcesMap[mod.id] ?? []
      const moduleResCount = resourceIds.length

      let totalModuleCompletions = 0
      course.enrolments.forEach((enrol) => {
        const student = enrol.student
        const completedIds = new Set(student.resourceCompletions.map((rc) => rc.resourceId))
        const completedInModule = resourceIds.filter((id) => completedIds.has(id)).length
        totalModuleCompletions += completedInModule
      })

      const studentCount = course.enrolments.length
      const maxPossibleCompletions = moduleResCount * studentCount
      const averageCompletionPercent = maxPossibleCompletions > 0 
        ? Math.round((totalModuleCompletions / maxPossibleCompletions) * 100) 
        : 0

      return {
        id: mod.id,
        title: mod.title,
        totalResources: moduleResCount,
        averageCompletionPercent,
      }
    })

    res.json({
      success: true,
      data: {
        totalResources,
        studentsCount: course.enrolments.length,
        students: studentStats.sort((a, b) => b.progressPercent - a.progressPercent),
        modules: moduleStats,
      },
    })
  } catch (err) {
    next(err)
  }
}
