import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { question, options, correctAnswer, userAnswer } = await request.json()

    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const optionLabels = ["A", "B", "C", "D"]
    const optionsText = options.map((opt: string, idx: number) => `${optionLabels[idx]}. ${opt}`).join("\n")

    const prompt = `You are an expert instructor.

Question:
${question}

Options:
${optionsText}

Correct Answer:
${correctAnswer}

User Selected Answer:
${userAnswer}

Explain in detail:
1. Why the correct answer is correct.
2. Why EACH of the other options is incorrect.

Use clear, educational, and student-friendly language.`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://v0.dev",
        "X-Title": "ExitExamApp",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] OpenRouter API error:", errorData)
      return NextResponse.json({ error: "Failed to generate explanation" }, { status: response.status })
    }

    const data = await response.json()
    const aiExplanation = data.choices?.[0]?.message?.content

    if (!aiExplanation) {
      return NextResponse.json({ error: "No explanation generated" }, { status: 500 })
    }

    return NextResponse.json({ explanation: aiExplanation })
  } catch (error) {
    console.error("[v0] Error in ai-explanation route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
