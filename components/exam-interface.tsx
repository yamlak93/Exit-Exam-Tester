"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  AlertCircle,
  Sparkles,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Exam } from "@/types/exam" // Assuming Exam type is defined in this file

interface ExamInterfaceProps {
  exam: Exam
  answerMode: "immediate" | "after"
  onRestart: () => void
  onBackToList?: () => void
}

type QuestionStatus = "unanswered" | "answered" | "skipped" | "current"

export default function ExamInterface({ exam, answerMode, onRestart, onBackToList }: ExamInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [skipped, setSkipped] = useState<{ [key: number]: boolean }>({})
  const [showResults, setShowResults] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [aiExplanations, setAiExplanations] = useState<{ [key: number]: string }>({})
  const [loadingAiExplanation, setLoadingAiExplanation] = useState(false)
  const [aiError, setAiError] = useState<{ [key: number]: boolean }>({})

  const currentQuestion = exam.questions[currentQuestionIndex]
  const totalQuestions = exam.questions.length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const hasAnswer = answers[currentQuestionIndex] !== undefined

  const handleOptionSelect = (option: string) => {
    if (!hasAnswer) {
      setSelectedOption(option)
      setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: option }))
      setSkipped((prev) => {
        const newSkipped = { ...prev }
        delete newSkipped[currentQuestionIndex]
        return newSkipped
      })
      if (answerMode === "immediate") {
        fetchAiExplanation(currentQuestionIndex, option)
      }
    }
  }

  const handleSkip = () => {
    if (!hasAnswer) {
      setSkipped((prev) => ({ ...prev, [currentQuestionIndex]: true }))
    }
    handleNext()
  }

  const handleNext = () => {
    if (isLastQuestion) {
      const answeredCount = Object.keys(answers).length
      if (answeredCount === totalQuestions) {
        setShowResults(true)
      } else {
        const firstUnanswered = exam.questions.findIndex((_: any, index: number) => answers[index] === undefined)
        if (firstUnanswered !== -1) {
          setCurrentQuestionIndex(firstUnanswered)
          setSelectedOption(null)
        }
      }
    } else {
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1))
      setSelectedOption(answers[currentQuestionIndex + 1] || null)
    }
  }

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
    setSelectedOption(answers[currentQuestionIndex - 1] || null)
  }

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index)
    setSelectedOption(answers[index] || null)
  }

  const getQuestionStatus = (index: number): QuestionStatus => {
    if (index === currentQuestionIndex) return "current"
    if (answers[index] !== undefined) return "answered"
    if (skipped[index]) return "skipped"
    return "unanswered"
  }

  const fetchAiExplanation = async (questionIndex: number, userAnswer: string) => {
    if (aiExplanations[questionIndex]) {
      return
    }

    setLoadingAiExplanation(true)
    setAiError((prev) => ({ ...prev, [questionIndex]: false }))

    try {
      const question = exam.questions[questionIndex]
      const response = await fetch("/api/ai-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          userAnswer: userAnswer,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch AI explanation")
      }

      const data = await response.json()
      setAiExplanations((prev) => ({
        ...prev,
        [questionIndex]: data.explanation,
      }))
    } catch (error) {
      console.error("[v0] Error fetching AI explanation:", error)
      setAiError((prev) => ({ ...prev, [questionIndex]: true }))
    } finally {
      setLoadingAiExplanation(false)
    }
  }

  const calculateScore = () => {
    let correct = 0
    exam.questions.forEach((question: any, index: number) => {
      if (answers[index] === question.correctAnswer) {
        correct++
      }
    })
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100),
    }
  }

  useEffect(() => {
    setSelectedOption(answers[currentQuestionIndex] || null)
  }, [currentQuestionIndex, answers])

  if (showResults) {
    const score = calculateScore()
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
              <div className="text-center mb-6 sm:mb-8">
                <div
                  className={cn(
                    "inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 sm:mb-6",
                    score.percentage >= 70
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                  )}
                >
                  {score.percentage >= 70 ? (
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                  ) : (
                    <XCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Exam Complete!</h1>
                <div className="text-4xl sm:text-5xl font-bold mb-2">{score.percentage}%</div>
                <p className="text-muted-foreground text-base sm:text-lg">
                  Correct Answers: {score.correct} / {score.total}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button size="lg" variant="outline" className="w-full bg-transparent h-12 sm:h-11" onClick={onRestart}>
                  <Home className="mr-2 w-5 h-5" />
                  Back to Exam List
                </Button>
                <Button
                  size="lg"
                  className="w-full h-12 sm:h-11"
                  onClick={() => {
                    setAnswers({})
                    setSkipped({})
                    setShowResults(false)
                    setCurrentQuestionIndex(0)
                    setSelectedOption(null)
                    setAiExplanations({})
                    setAiError({})
                  }}
                >
                  <RotateCcw className="mr-2 w-5 h-5" />
                  Restart Exam
                </Button>
              </div>
            </Card>

            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold px-1">Review Your Answers</h2>
              {exam.questions.map((question: any, index: number) => {
                const userAnswer = answers[index]
                const isCorrect = userAnswer === question.correctAnswer
                return (
                  <Card key={index} className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div
                        className={cn(
                          "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 text-sm sm:text-base font-semibold",
                          isCorrect
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed text-pretty">
                          {question.questionText}
                        </h3>
                        <div className="space-y-2 mb-3 sm:mb-4">
                          {question.options.map((option: string) => {
                            const isUserAnswer = option === userAnswer
                            const isCorrectAnswer = option === question.correctAnswer
                            return (
                              <div
                                key={option}
                                className={cn(
                                  "p-3 sm:p-3.5 rounded-lg border-2 transition-colors",
                                  isCorrectAnswer &&
                                    "bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-500",
                                  isUserAnswer &&
                                    !isCorrectAnswer &&
                                    "bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-500",
                                  !isUserAnswer && !isCorrectAnswer && "border-border",
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="leading-relaxed text-sm sm:text-base text-pretty flex-1">
                                    {option}
                                  </span>
                                  <span className="flex-shrink-0">
                                    {isCorrectAnswer && (
                                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    )}
                                    {isUserAnswer && !isCorrectAnswer && (
                                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    )}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="bg-muted/50 p-3 sm:p-4 rounded-lg mb-3">
                          <p className="text-xs sm:text-sm font-semibold mb-1">Explanation:</p>
                          <p className="text-xs sm:text-sm leading-relaxed text-pretty">{question.explanation}</p>
                        </div>
                        {aiExplanations[index] && (
                          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 sm:p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <p className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-100">
                                AI Detailed Explanation
                              </p>
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed text-pretty text-purple-900/80 dark:text-purple-100/80 whitespace-pre-wrap">
                              {aiExplanations[index]}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <Button variant="ghost" onClick={onBackToList || onRestart} className="gap-2 hover:bg-muted">
              <ArrowLeft className="h-4 w-4" />
              Back to Exam List
            </Button>
          </div>

          <div className="mb-4 sm:mb-6 px-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-balance">{exam.examName}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 md:p-8">
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Question {currentQuestion.questionNumber}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold leading-relaxed text-pretty">
                  {currentQuestion.questionText}
                </h2>
              </div>

              <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
                {currentQuestion.options.map((option: string) => {
                  const isSelected = selectedOption === option
                  const isAnswered = hasAnswer
                  const isCorrect = option === currentQuestion.correctAnswer
                  const showFeedback = isAnswered && answerMode === "immediate"

                  return (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      disabled={isAnswered}
                      className={cn(
                        "w-full p-3.5 sm:p-4 rounded-lg border-2 text-left transition-all min-h-[52px] sm:min-h-[56px]",
                        "active:scale-[0.98] disabled:cursor-not-allowed",
                        !isAnswered && isSelected && "border-primary bg-primary/5",
                        !isAnswered && !isSelected && "border-border hover:border-primary/50 hover:bg-muted/30",
                        showFeedback && isSelected && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                        showFeedback && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
                        showFeedback && !isSelected && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                        showFeedback && !isSelected && !isCorrect && "border-border opacity-60",
                        isAnswered && !showFeedback && isSelected && "border-primary bg-primary/5",
                        isAnswered && !showFeedback && !isSelected && "border-border opacity-60",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="leading-relaxed text-sm sm:text-base text-pretty flex-1">{option}</span>
                        {showFeedback && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        )}
                        {showFeedback && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {hasAnswer && answerMode === "immediate" && (
                <>
                  <Card className="p-3 sm:p-4 bg-muted/50 border-0 mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      {selectedOption === currentQuestion.correctAnswer ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold mb-1">
                          {selectedOption === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}
                        </p>
                        <p className="text-xs sm:text-sm font-medium mb-2">
                          Correct Answer: {currentQuestion.correctAnswer}
                        </p>
                        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground text-pretty">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold mb-2 text-purple-900 dark:text-purple-100">
                          AI Detailed Explanation
                        </p>
                        {loadingAiExplanation && !aiExplanations[currentQuestionIndex] && (
                          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs sm:text-sm">Generating detailed explanation...</span>
                          </div>
                        )}
                        {aiExplanations[currentQuestionIndex] && (
                          <p className="text-xs sm:text-sm leading-relaxed text-pretty text-purple-900/80 dark:text-purple-100/80 whitespace-pre-wrap">
                            {aiExplanations[currentQuestionIndex]}
                          </p>
                        )}
                        {aiError[currentQuestionIndex] && !aiExplanations[currentQuestionIndex] && (
                          <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                            <p className="mb-2">Unable to generate AI explanation at this time.</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchAiExplanation(currentQuestionIndex, selectedOption!)}
                              className="h-8 text-xs bg-white/50 dark:bg-black/20"
                            >
                              Try Again
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {hasAnswer && answerMode === "after" && (
                <Card className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                      Answer recorded. You'll see the results after completing all questions.
                    </p>
                  </div>
                </Card>
              )}
            </Card>

            <div className="flex flex-col gap-2.5 sm:gap-3 px-1">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="bg-transparent h-12 sm:h-11"
                >
                  <ChevronLeft className="mr-1 sm:mr-2 w-5 h-5" />
                  <span className="text-sm sm:text-base">Previous</span>
                </Button>
                <Button size="lg" onClick={handleNext} className="h-12 sm:h-11">
                  <span className="text-sm sm:text-base">{isLastQuestion ? "Finish" : "Next"}</span>
                  <ChevronRight className="ml-1 sm:ml-2 w-5 h-5" />
                </Button>
              </div>
              {!hasAnswer && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSkip}
                  className="w-full bg-transparent border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20 h-12 sm:h-11"
                >
                  Skip Question
                </Button>
              )}
            </div>

            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-base sm:text-lg">Questions</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {Object.keys(answers).length} / {totalQuestions} Answered
                </p>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-2.5 mb-4">
                {exam.questions.map((_: any, index: number) => {
                  const status = getQuestionStatus(index)
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionClick(index)}
                      className={cn(
                        "relative w-full aspect-square rounded-lg font-medium transition-all text-sm sm:text-base min-h-[44px]",
                        status === "current" && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                        status === "answered" &&
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 active:bg-green-200 dark:active:bg-green-900/40",
                        status === "skipped" &&
                          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 active:bg-amber-200 dark:active:bg-amber-900/40",
                        status === "unanswered" &&
                          "bg-background border-2 border-border active:border-primary/50 active:bg-muted/50",
                      )}
                    >
                      {index + 1}
                      {status === "skipped" && (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-primary flex-shrink-0"></div>
                  <span className="text-muted-foreground">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-green-100 dark:bg-green-900/30 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-amber-100 dark:bg-amber-900/30 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Skipped</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded border-2 border-border flex-shrink-0"></div>
                  <span className="text-muted-foreground">Unanswered</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
