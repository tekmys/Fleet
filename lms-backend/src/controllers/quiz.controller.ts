import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export async function createQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, timeLimit, maxAttempts, courseId, questions } = req.body

    // Verify course exists and user is the lecturer
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found' })
      return
    }
    if (course.lecturerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Not authorized to add quizzes to this course' })
      return
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : 1,
        courseId,
        questions: {
          create: questions.map((q: any) => ({
            questionText: q.questionText,
            type: q.type || 'MULTIPLE_CHOICE',
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
        },
      },
      include: {
        questions: true,
      },
    })

    res.status(201).json({ success: true, data: quiz })
  } catch (err) {
    next(err)
  }
}

export async function getQuizzesByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { courseId } = req.params
    const userId = req.user!.id

    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
      include: {
        attempts: {
          where: { studentId: userId },
          orderBy: { startedAt: 'desc' },
        },
      },
    })

    res.json({
      success: true,
      data: quizzes.map(q => {
        const attemptCount = q.attempts.length
        const maxScore = q.attempts.reduce((max, a) => Math.max(max, a.score), 0)
        return {
          id: q.id,
          title: q.title,
          description: q.description,
          timeLimit: q.timeLimit,
          maxAttempts: q.maxAttempts,
          courseId: q.courseId,
          attemptCount,
          completed: attemptCount >= q.maxAttempts,
          highScore: attemptCount > 0 ? maxScore : null,
        }
      }),
    })
  } catch (err) {
    next(err)
  }
}

export async function getQuizDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const role = req.user!.role
    const userId = req.user!.id

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
        attempts: {
          where: { studentId: userId },
        },
      },
    })

    if (!quiz) {
      res.status(404).json({ success: false, error: 'Quiz not found' })
      return
    }

    // Security: If user is a student, filter out correctAnswer and explanation fields to prevent inspecting network payload!
    const isStudent = role === 'STUDENT'
    const safeQuestions = quiz.questions.map(q => {
      if (isStudent) {
        return {
          id: q.id,
          questionText: q.questionText,
          type: q.type,
          options: q.options,
        }
      }
      return q
    })

    res.json({
      success: true,
      data: {
        ...quiz,
        questions: safeQuestions,
        attemptsCount: quiz.attempts.length,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function submitQuizAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { quizId, answers } = req.body // answers: { [questionId: string]: string }
    const studentId = req.user!.id

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        attempts: {
          where: { studentId },
        },
      },
    })

    if (!quiz) {
      res.status(404).json({ success: false, error: 'Quiz not found' })
      return
    }

    if (quiz.attempts.length >= quiz.maxAttempts) {
      res.status(400).json({ success: false, error: 'Maximum attempts reached for this quiz' })
      return
    }

    // Auto-grade calculation
    const totalQuestions = quiz.questions.length
    let correctCount = 0

    const gradedQuestionsResult = quiz.questions.map(q => {
      const studentAns = answers[q.id] || ''
      const isCorrect = studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()
      if (isCorrect) {
        correctCount++
      }
      return {
        id: q.id,
        questionText: q.questionText,
        options: q.options,
        studentAnswer: studentAns,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      }
    })

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId,
        answers,
        score,
        completedAt: new Date(),
      },
    })

    res.status(201).json({
      success: true,
      data: {
        id: attempt.id,
        score: attempt.score,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        questions: gradedQuestionsResult,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getStudentQuizAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { quizId } = req.params
    const studentId = req.user!.id

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId, studentId },
      orderBy: { startedAt: 'desc' },
    })

    res.json({ success: true, data: attempts })
  } catch (err) {
    next(err)
  }
}
