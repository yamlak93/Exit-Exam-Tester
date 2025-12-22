"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, AlertCircle, Sparkles, Loader2 } from "lucide-react"
import type { Exam } from "@/types/exam"

interface ExamInterfaceProps {
  exam: Exam
  answerMode: "immediate" | "after"
  onBackToList: () => void
}

export default function ExamInterface({ exam, answerMode, onBackToList }: ExamInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [skipped, setSkipped] = useState<{ [key: number]: boolean }>({})
  const [aiExplanations, setAiExplanations] = useState<{ [key: number]: string }>({})
  const [aiLoading, setAiLoading] = useState<{ [key: number]: boolean }>({})
  const [aiError, setAiError] = useState<{ [key: number]: string }>({})

  const currentQuestion = exam.questions[currentQuestionIndex]

  const handleOptionSelect = (option: string) => {
    if (answers[currentQuestionIndex]) return

    setSelectedOption(option)
    setAnswers({ ...answers, [currentQuestionIndex]: option })
    setSkipped((prev) => {
      const newSkipped = { ...prev }
      delete newSkipped[currentQuestionIndex]
      return newSkipped
    })
  }

  const handleSkip = () => {
    setSkipped({ ...skipped, [currentQuestionIndex]: true })
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedOption(answers[currentQuestionIndex + 1] || null)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedOption(answers[currentQuestionIndex + 1] || null)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedOption(answers[currentQuestionIndex - 1] || null)
    }
  }

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index)
    setSelectedOption(answers[index] || null)
  }

  const handleFinish = () => {
    const unansweredQuestions = exam.questions.filter((_, index) => !answers[index] && !skipped[index])

    if (unansweredQuestions.length > 0) {
      const firstUnanswered = exam.questions.findIndex((_, index) => !answers[index] && !skipped[index])
      setCurrentQuestionIndex(firstUnanswered)
      setSelectedOption(answers[firstUnanswered] || null)
      return
    }

    setShowResults(true)
  }

  const fetchAiExplanation = async (questionIndex: number) => {
    // Check if explanation already exists
    if (aiExplanations[questionIndex]) {
      return
    }

    // Get the user's answer for this question
    const userAnswer = answers[questionIndex]
    if (!userAnswer) {
      return
    }

    setAiLoading((prev) => ({ ...prev, [questionIndex]: true }))
    setAiError((prev) => ({ ...prev, [questionIndex]: "" }))

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
      setAiError((prev) => ({ ...prev, [questionIndex]: (error as Error).message }))
    } finally {
      setAiLoading((prev) => ({ ...prev, [questionIndex]: false }))
    }
  }

  const handleBackToList = () => {
    setAiExplanations({})
    setAiLoading({})
    setAiError({})
    onBackToList()
  }

  const calculateScore = () => {
    let correct = 0
    Object.entries(answers).forEach(([index, answer]) => {
      if (exam.questions[Number(index)].correctAnswer === answer) {
        correct++
      }
    })
    return {
      correct,
      total: Object.keys(answers).length,
      percentage: Math.round((correct / Object.keys(answers).length) * 100),
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setAnswers({})
    setShowResults(false)
    setSkipped({})
    setAiExplanations({})
    setAiLoading({})
    setAiError({})
  }

  useEffect(() => {
    setSelectedOption(answers[currentQuestionIndex] || null)
  }, [currentQuestionIndex, answers])

  if (showResults) {
    const score = calculateScore()
    const isPassed = score.percentage >= 50

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-8">
            <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-4xl font-bold text-balance">Exam Complete!</h1>
              {exam.isCustom && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Custom Exam: {exam.questions.length} random questions from {exam.name}
                </p>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-base sm:text-lg">
                <div>
                  Score: <span className="font-bold text-lg sm:text-2xl">{score.percentage}%</span>
                </div>
                <div className="text-muted-foreground text-sm sm:text-base">
                  {score.correct} / {score.total} correct
                </div>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base ${
                  isPassed
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {isPassed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Passed
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Failed
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {exam.questions.map((question, index) => {
                const userAnswer = answers[index]
                const isCorrect = userAnswer === question.correctAnswer
                const wasSkipped = skipped[index]

                if (wasSkipped) return null

                return (
                  <Card
                    key={index}
                    className={`p-3 sm:p-4 border-l-4 ${
                      isCorrect
                        ? "border-l-green-500 bg-green-50/50 dark:bg-green-900/10"
                        : "border-l-red-500 bg-red-50/50 dark:bg-red-900/10"
                    }`}
                  >
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start gap-2 sm:gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base text-balance mb-2 sm:mb-3">
                            {index + 1}. {question.questionText}
                          </p>
                          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                            <p>
                              <span className="font-semibold">Your answer:</span>{" "}
                              <span
                                className={
                                  isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                                }
                              >
                                {userAnswer}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p>
                                <span className="font-semibold">Correct answer:</span>{" "}
                                <span className="text-green-700 dark:text-green-300">{question.correctAnswer}</span>
                              </p>
                            )}
                            {question.explanation && (
                              <p className="text-muted-foreground text-pretty mt-2 sm:mt-3">
                                <span className="font-semibold text-foreground">Explanation:</span>{" "}
                                {question.explanation}
                              </p>
                            )}
                          </div>

                          {!aiExplanations[index] && !aiLoading[index] && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchAiExplanation(index)}
                              className="mt-3 h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30"
                            >
                              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                              Describe with AI
                            </Button>
                          )}

                          {aiLoading[index] && (
                            <div className="mt-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-xs sm:text-sm">Describing...</span>
                            </div>
                          )}

                          {aiExplanations[index] && (
                            <div className="mt-3 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 sm:p-4 rounded-lg border border-purple-200 dark:border-purple-800">
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

                          {aiError[index] && !aiExplanations[index] && (
                            <div className="mt-3 text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                              <p className="mb-2">Unable to generate AI explanation at this time.</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchAiExplanation(index)}
                                className="h-8 text-xs bg-white/50 dark:bg-black/20"
                              >
                                Try Again
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={handleRestart}
                className="flex-1 h-11 sm:h-12 text-sm sm:text-base bg-transparent"
                variant="outline"
              >
                Restart Exam
              </Button>
              <Button onClick={handleBackToList} className="flex-1 h-11 sm:h-12 text-sm sm:text-base">
                Back to Exam List
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <Button variant="ghost" onClick={handleBackToList} className="gap-2 h-9 sm:h-10 text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4" />
            Back to Exam List
          </Button>
        </div>

        <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-balance">{exam.name}</h1>
            {exam.isCustom && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Custom Exam: {exam.questions.length} random questions
              </p>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {exam.questions.length} • {Object.keys(answers).length} answered
            </p>
          </div>
        </Card>

        <div className="flex flex-col gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 flex-1">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 text-balance leading-relaxed">
                  {currentQuestionIndex + 1}. {currentQuestion.questionText}
                </h2>

                <div className="space-y-2 sm:space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === option
                    const isAnswered = !!answers[currentQuestionIndex]
                    const isCorrect = option === currentQuestion.correctAnswer
                    const showFeedback = isAnswered && answerMode === "immediate"

                    return (
                      <button
                        key={index}
                        onClick={() => handleOptionSelect(option)}
                        disabled={isAnswered}
                        className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation min-h-[44px] ${
                          showFeedback
                            ? isCorrect
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : isSelected
                                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                : "border-gray-200 dark:border-gray-700 opacity-50"
                            : isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                        } ${isAnswered ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span className="text-sm sm:text-base text-pretty">{option}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {answers[currentQuestionIndex] && answerMode === "immediate" && (
                <div className="space-y-3 sm:space-y-4">
                  <Card
                    className={`p-3 sm:p-4 ${
                      selectedOption === currentQuestion.correctAnswer
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <p className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                      {selectedOption === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}
                    </p>
                    {selectedOption !== currentQuestion.correctAnswer && (
                      <p className="text-xs sm:text-sm mb-2">
                        The correct answer is: <span className="font-semibold">{currentQuestion.correctAnswer}</span>
                      </p>
                    )}
                    {currentQuestion.explanation && (
                      <p className="text-xs sm:text-sm text-pretty text-muted-foreground">
                        {currentQuestion.explanation}
                      </p>
                    )}
                  </Card>

                  <div className="space-y-3">
                    {!aiExplanations[currentQuestionIndex] && !aiLoading[currentQuestionIndex] && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchAiExplanation(currentQuestionIndex)}
                        className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Describe with AI
                      </Button>
                    )}

                    {aiLoading[currentQuestionIndex] && (
                      <Card className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
                          <p className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-100">
                            Describing...
                          </p>
                        </div>
                      </Card>
                    )}

                    {aiExplanations[currentQuestionIndex] && (
                      <Card className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <p className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-100">
                            AI Detailed Explanation
                          </p>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-pretty text-purple-900/80 dark:text-purple-100/80 whitespace-pre-wrap">
                          {aiExplanations[currentQuestionIndex]}
                        </p>
                      </Card>
                    )}

                    {aiError[currentQuestionIndex] && !aiExplanations[currentQuestionIndex] && (
                      <Card className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        <p className="text-xs sm:text-sm text-red-900 dark:text-red-100 mb-2">
                          Unable to generate AI explanation at this time.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchAiExplanation(currentQuestionIndex)}
                          className="h-8 text-xs"
                        >
                          Try Again
                        </Button>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {!answers[currentQuestionIndex] && (
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="flex-1 h-10 sm:h-11 text-sm sm:text-base bg-transparent"
                  >
                    Skip
                  </Button>
                )}
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="flex-1 h-10 sm:h-11 text-sm sm:text-base bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                {currentQuestionIndex < exam.questions.length - 1 ? (
                  <Button onClick={handleNext} className="flex-1 h-10 sm:h-11 text-sm sm:text-base">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleFinish} className="flex-1 h-10 sm:h-11 text-sm sm:text-base">
                    Finish Exam
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Questions</h3>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2">
              {exam.questions.map((_, index) => {
                const isAnswered = !!answers[index]
                const isSkipped = skipped[index]
                const isCurrent = index === currentQuestionIndex

                return (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(index)}
                    className={`aspect-square min-h-[44px] sm:min-h-0 rounded-lg border-2 flex items-center justify-center text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                      isCurrent
                        ? "border-blue-500 bg-blue-500 text-white"
                        : isAnswered
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                          : isSkipped
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {isAnswered ? (
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Circle className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
