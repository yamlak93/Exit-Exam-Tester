"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Play, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomExamSetupProps {
  onStartExam: (exam: any, questionCount: number) => void
  onBack: () => void
}

export default function CustomExamSetup({ onStartExam, onBack }: CustomExamSetupProps) {
  const [exams, setExams] = useState<any[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string>("")
  const [questionCount, setQuestionCount] = useState<string>("")
  const [error, setError] = useState<string>("")
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

  const selectedExam = exams.find((exam) => exam.id === selectedExamId)

  const handleStartExam = () => {
    setError("")

    if (!selectedExamId) {
      setError("Please select an exam")
      return
    }

    const count = Number.parseInt(questionCount)
    if (isNaN(count) || count <= 0) {
      setError("Please enter a valid number of questions (greater than 0)")
      return
    }

    if (!selectedExam) {
      setError("Selected exam not found")
      return
    }

    if (count > selectedExam.questions.length) {
      setError(`Number of questions cannot exceed ${selectedExam.questions.length}`)
      return
    }

    onStartExam(selectedExam, count)
  }

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
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="mb-6 h-10 sm:h-11">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </Button>

          <Card className="p-6 sm:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-balance">Create Your Exam</h1>
              <p className="text-sm sm:text-base text-muted-foreground text-pretty">
                Choose an exam and specify how many questions you want to take
              </p>
            </div>

            <div className="space-y-6">
              {/* Select Exam */}
              <div className="space-y-2">
                <Label htmlFor="exam-select" className="text-base font-medium">
                  Select Exam
                </Label>
                <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                  <SelectTrigger id="exam-select" className="h-12">
                    <SelectValue placeholder="Choose an exam..." />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.examName} ({exam.questions.length} questions)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Questions */}
              <div className="space-y-2">
                <Label htmlFor="question-count" className="text-base font-medium">
                  Number of Questions to Take
                </Label>
                <Input
                  id="question-count"
                  type="number"
                  min="1"
                  max={selectedExam?.questions.length || 100}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  placeholder="Enter number of questions"
                  className="h-12 text-base"
                />
                {selectedExam && (
                  <p className="text-sm text-muted-foreground">
                    Maximum: {selectedExam.questions.length} questions available
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive text-pretty">{error}</p>
                </div>
              )}

              {/* Start Button */}
              <Button size="lg" className="w-full h-12 sm:h-13 text-base" onClick={handleStartExam}>
                <Play className="mr-2 w-5 h-5" />
                Start Custom Exam
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
