"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronRight } from "lucide-react"

interface ExamSelectionProps {
  onExamSelect: (exam: any) => void
}

export default function ExamSelection({ onExamSelect }: ExamSelectionProps) {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/ExamList.json")
      .then((res) => res.json())
      .then((data) => {
        setExams(data.exams)
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error loading exams:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">Loading exams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 text-primary mb-4 sm:mb-6">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-balance px-2">Exam System</h1>
            <p className="text-base sm:text-lg text-muted-foreground text-balance px-4">
              Select an exam to test your knowledge
            </p>
          </div>

          <div className="grid gap-3 sm:gap-4 md:gap-6">
            {exams.map((exam) => (
              <Card
                key={exam.id}
                className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group active:scale-[0.98]"
                onClick={() => onExamSelect(exam)}
              >
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0 w-full xs:w-auto">
                    <h2 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2 group-hover:text-primary transition-colors text-balance">
                      {exam.examName}
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground">{exam.questions.length} Questions</p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full xs:w-auto h-12 sm:h-11"
                    onClick={(e) => {
                      e.stopPropagation()
                      onExamSelect(exam)
                    }}
                  >
                    Start Exam
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
