import dotenv from 'dotenv'
dotenv.config()

export async function generateTextWithGemini({
  systemPrompt,
  userPrompt,
  history = [],
  maxTokens = 2048,
  temperature = 0.2,
}: {
  systemPrompt?: string
  userPrompt: string
  history?: { role: 'user' | 'model' | 'assistant'; content: string }[]
  maxTokens?: number
  temperature?: number
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables')
  }

  // Map history roles: model/assistant -> model, user -> user
  // Also filter and map to Google's content object format: { role: 'user' | 'model', parts: [{ text: string }] }
  const contents = [
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    })),
    {
      role: 'user',
      parts: [{ text: userPrompt }],
    },
  ]

  const body: any = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  }

  if (systemPrompt) {
    body.systemInstruction = {
      parts: [{ text: systemPrompt }],
    }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error (${response.status}): ${errorText}`)
  }

  const result: any = await response.json()
  const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text
  if (!candidateText) {
    throw new Error('Invalid or empty response from Gemini API')
  }

  return candidateText
}
