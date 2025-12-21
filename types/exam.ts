export interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface Exam {
  id: string
  title: string
  description: string
  duration: number
  questions: Question[]
}

export interface ExamProgress {
  currentQuestionIndex: number
  answers: Record<number, number | null>
  skipped: Set<number>
}

export interface ExamResult {
  totalQuestions: number
  correctAnswers: number
  percentage: number
  answers: Record<number, number | null>
}
