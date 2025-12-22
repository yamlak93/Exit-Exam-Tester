"use client"

import { useState } from "react"
import ExamSelection from "@/components/exam-selection"
import ExamInterface from "@/components/exam-interface"
import AnswerModeSelection from "@/components/answer-mode-selection"
import CustomExamSetup from "@/components/custom-exam-setup"

export default function HomePage() {
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [answerMode, setAnswerMode] = useState<"immediate" | "after" | null>(null)
  const [showCustomExamSetup, setShowCustomExamSetup] = useState(false)
  const [isCustomExam, setIsCustomExam] = useState(false)
  const [customQuestionCount, setCustomQuestionCount] = useState<number>(0)

  const handleExamSelect = (exam: any) => {
    setSelectedExam(exam)
    setIsCustomExam(false)
    setCustomQuestionCount(0)
  }

  const handleCreateCustomExam = () => {
    setShowCustomExamSetup(true)
  }

  const handleStartCustomExam = (exam: any, questionCount: number) => {
    // Fisher-Yates shuffle algorithm
    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    // Create a new exam object with randomly selected questions
    const shuffledQuestions = shuffleArray(exam.questions)
    const selectedQuestions = shuffledQuestions.slice(0, questionCount)

    const customExam = {
      ...exam,
      questions: selectedQuestions,
    }

    setSelectedExam(customExam)
    setIsCustomExam(true)
    setCustomQuestionCount(questionCount)
    setShowCustomExamSetup(false)
  }

  const handleAnswerModeSelect = (mode: "immediate" | "after") => {
    setAnswerMode(mode)
  }

  const handleBackToList = () => {
    setSelectedExam(null)
    setAnswerMode(null)
    setShowCustomExamSetup(false)
    setIsCustomExam(false)
    setCustomQuestionCount(0)
  }

  return (
    <main className="min-h-screen">
      {showCustomExamSetup ? (
        <CustomExamSetup onStartExam={handleStartCustomExam} onBack={() => setShowCustomExamSetup(false)} />
      ) : !selectedExam ? (
        <ExamSelection onExamSelect={handleExamSelect} onCreateCustomExam={handleCreateCustomExam} />
      ) : !answerMode ? (
        <AnswerModeSelection onModeSelect={handleAnswerModeSelect} />
      ) : (
        <ExamInterface
          exam={selectedExam}
          answerMode={answerMode}
          onRestart={handleBackToList}
          onBackToList={handleBackToList}
          isCustomExam={isCustomExam}
          customQuestionCount={customQuestionCount}
        />
      )}
    </main>
  )
}
