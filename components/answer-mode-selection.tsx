"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, ClipboardCheck } from "lucide-react"

interface AnswerModeSelectionProps {
  onModeSelect: (mode: "immediate" | "after") => void
}

export default function AnswerModeSelection({ onModeSelect }: AnswerModeSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-balance px-2">
              Choose Answer Display Mode
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground text-balance px-4">
              How would you like to see the answers?
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Card className="p-6 sm:p-8 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group active:scale-[0.98]">
              <div className="text-center" onClick={() => onModeSelect("immediate")}>
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 text-primary mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Eye className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Immediate Feedback</h2>
                <p className="text-muted-foreground mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed text-balance">
                  See the correct answer and explanation right after submitting each question
                </p>
                <Button
                  size="lg"
                  className="w-full h-12 sm:h-11"
                  onClick={(e) => {
                    e.stopPropagation()
                    onModeSelect("immediate")
                  }}
                >
                  Choose This Mode
                </Button>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group active:scale-[0.98]">
              <div className="text-center" onClick={() => onModeSelect("after")}>
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 text-primary mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ClipboardCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Review at the End</h2>
                <p className="text-muted-foreground mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed text-balance">
                  View all answers and explanations after completing the entire exam
                </p>
                <Button
                  size="lg"
                  className="w-full h-12 sm:h-11"
                  onClick={(e) => {
                    e.stopPropagation()
                    onModeSelect("after")
                  }}
                >
                  Choose This Mode
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
