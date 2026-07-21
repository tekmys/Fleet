import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { generateTextWithOpenRouter } from '../lib/openrouter'
import { Role } from '../types/enums'
import { prisma } from '../lib/prisma'

export async function getCourseEarlyWarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, id: userId } = req.user!
    const { courseId } = req.params

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrolments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                resourceCompletions: true,
                submissions: {
                  where: { assignment: { courseId } },
                  include: { grade: true, assignment: true },
                },
              },
            },
          },
        },
        assignments: true,
        modules: {
          include: {
            resources: {
              select: { id: true },
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

    // Tally all course resources
    const courseResourceIds = new Set<string>()
    course.modules.forEach(mod => {
      mod.resources.forEach(res => courseResourceIds.add(res.id))
    })
    const totalResources = courseResourceIds.size

    const now = new Date()

    const studentsStats = course.enrolments.map(enrol => {
      const student = enrol.student

      // Resource Completion
      const completedCourseResources = student.resourceCompletions.filter(rc => courseResourceIds.has(rc.resourceId))
      const completionPercent = totalResources > 0 ? Math.round((completedCourseResources.length / totalResources) * 100) : 100

      // Grades
      let totalMaxScore = 0
      let totalEarnedScore = 0
      
      const gradedSubmissions = student.submissions.filter(s => s.grade && !s.grade.isDraft)
      gradedSubmissions.forEach(sub => {
        totalMaxScore += sub.assignment.maxScore
        totalEarnedScore += sub.grade!.score
      })
      const averageGrade = totalMaxScore > 0 ? Math.round((totalEarnedScore / totalMaxScore) * 100) : null

      // Missed Assignments
      let missedAssignments = 0
      course.assignments.forEach(assignment => {
        const isPastDue = new Date(assignment.dueDate) < now
        const hasSubmitted = student.submissions.some(s => s.assignmentId === assignment.id)
        if (isPastDue && !hasSubmitted) {
          missedAssignments++
        }
      })

      // Heuristic Risk Calculation
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
      let riskFactors = 0

      if (completionPercent < 40) riskFactors += 2
      else if (completionPercent < 60) riskFactors += 1

      if (averageGrade !== null) {
        if (averageGrade < 50) riskFactors += 2
        else if (averageGrade < 65) riskFactors += 1
      }

      if (missedAssignments > 2) riskFactors += 2
      else if (missedAssignments > 0) riskFactors += 1

      if (riskFactors >= 3) riskLevel = 'HIGH'
      else if (riskFactors >= 1) riskLevel = 'MEDIUM'

      return {
        studentId: student.id,
        name: student.name,
        email: student.email,
        completionPercent,
        averageGrade,
        missedAssignments,
        riskLevel,
      }
    })

    // Sort by risk descending
    const sortedStats = studentsStats.sort((a, b) => {
      const riskWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      return riskWeight[b.riskLevel] - riskWeight[a.riskLevel] || a.name.localeCompare(b.name)
    })

    res.json({ success: true, data: sortedStats })
  } catch (err) {
    next(err)
  }
}

export async function getStudentAiRiskInsight(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, id: userId } = req.user!
    const { courseId, studentId } = req.params

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        assignments: {
          orderBy: { dueDate: 'asc' }
        },
        modules: {
          include: { resources: { select: { id: true, title: true } } }
        }
      }
    })

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' })
      return
    }

    if (role === Role.LECTURER && course.lecturerId !== userId) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        resourceCompletions: true,
        submissions: {
          where: { assignment: { courseId } },
          include: { grade: true, assignment: true },
          orderBy: { submittedAt: 'asc' }
        }
      }
    })

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' })
      return
    }

    // Build context string
    const courseResourceIds = new Set<string>()
    course.modules.forEach(mod => mod.resources.forEach(res => courseResourceIds.add(res.id)))
    const completedResourceIds = new Set(student.resourceCompletions.map(rc => rc.resourceId))
    
    let completionContext = `Resources Completed: ${Array.from(completedResourceIds).filter(id => courseResourceIds.has(id)).length} out of ${courseResourceIds.size}\n`
    
    let gradesContext = 'Assignments & Grades:\n'
    course.assignments.forEach(assign => {
      const sub = student.submissions.find(s => s.assignmentId === assign.id)
      if (sub) {
        if (sub.grade && !sub.grade.isDraft) {
          gradesContext += `- [SUBMITTED] ${assign.title}: ${sub.grade.score}/${assign.maxScore}\n`
        } else {
          gradesContext += `- [SUBMITTED] ${assign.title}: Pending Grade\n`
        }
      } else {
        const isPastDue = new Date(assign.dueDate) < new Date()
        gradesContext += `- [${isPastDue ? 'MISSED' : 'PENDING'}] ${assign.title} (Due: ${new Date(assign.dueDate).toLocaleDateString()})\n`
      }
    })

    const useMock = !process.env.OPENROUTER_API_KEY || process.env.MOCK_AI === 'true'
    if (useMock) {
      const insight = `### AI Early-Warning Insight (Local Engine)
      
Based on the trajectory for **${student.name}**, the student is currently showing warning signs of disengagement. 
They have missed recent assignments and their resource completion rate is below the expected threshold for this stage of the course.

**Recommended Intervention:**
I suggest reaching out via direct message to check if they are facing technical difficulties or require an extension on the missed assignment. Encourage them to review the earlier modules to catch up on foundational concepts.`

      res.json({ success: true, data: { insight } })
      return
    }

    const systemPrompt = `You are an expert academic advisor and predictive analytics AI for a Learning Management System. 
Analyze the provided student trajectory data and provide a concise, 2-paragraph insight.
The first paragraph should summarize their risk profile and trajectory (e.g., dropping grades, missing work).
The second paragraph should provide a specific, actionable intervention recommendation for the lecturer.
Format the output in Markdown.`

    const userPrompt = `Student: ${student.name}
Course: ${course.title}

${completionContext}
${gradesContext}

Please provide an early-warning risk insight.`

    const insight = await generateTextWithOpenRouter({
      systemPrompt,
      userPrompt,
      maxTokens: 512,
    })

    res.json({ success: true, data: { insight } })
  } catch (err) {
    next(err)
  }
}
