"use client"

import { useState } from "react"
import ExamSelection from "@/components/exam-selection"
import ExamInterface from "@/components/exam-interface"
import AnswerModeSelection from "@/components/answer-mode-selection"

export default function HomePage() {
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [answerMode, setAnswerMode] = useState<"immediate" | "after" | null>(null)

  const handleExamSelect = (exam: any) => {
    setSelectedExam(exam)
  }

  const handleAnswerModeSelect = (mode: "immediate" | "after") => {
    setAnswerMode(mode)
  }

  const handleBackToList = () => {
    setSelectedExam(null)
    setAnswerMode(null)
  }

  return (
    <main className="min-h-screen">
      {!selectedExam ? (
        <ExamSelection onExamSelect={handleExamSelect} />
      ) : !answerMode ? (
        <AnswerModeSelection onModeSelect={handleAnswerModeSelect} />
      ) : (
        <ExamInterface
          exam={selectedExam}
          answerMode={answerMode}
          onRestart={handleBackToList}
          onBackToList={handleBackToList}
        />
      )}
    </main>
  )
}
