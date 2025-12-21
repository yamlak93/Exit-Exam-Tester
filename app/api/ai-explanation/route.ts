import { type NextRequest, NextResponse } from "next/server"
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference"
import { AzureKeyCredential } from "@azure/core-auth"

const endpoint = "https://models.github.ai/inference"
const model = "deepseek/DeepSeek-V3-0324";

export async function POST(request: NextRequest) {
  try {
    const { question, options, correctAnswer, userAnswer } = await request.json()

    const githubToken = process.env.GITHUB_TOKEN

    if (!githubToken) {
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 })
    }

    const client = ModelClient(endpoint, new AzureKeyCredential(githubToken))

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
2. Why each of the other options is incorrect.

Use clear, educational, and student-friendly language.`

    const response = await client.path("/chat/completions").post({
      body: {
        model,
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
    })

    if (isUnexpected(response)) {
      console.error("[v0] GitHub Models API error:", response.body.error)
      return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 })
    }

    const aiExplanation = response.body.choices[0].message.content

    if (!aiExplanation) {
      return NextResponse.json({ error: "No explanation generated" }, { status: 500 })
    }

    return NextResponse.json({ explanation: aiExplanation })
  } catch (error) {
    console.error("[v0] Error in ai-explanation route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
