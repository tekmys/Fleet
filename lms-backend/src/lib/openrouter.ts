import dotenv from 'dotenv'
dotenv.config()

export async function generateTextWithOpenRouter({
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
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not defined in environment variables')
  }

  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3-8b-instruct:free'

  // Map history roles: model/assistant -> assistant, user -> user
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = []

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  history.forEach(h => {
    messages.push({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: h.content,
    })
  })

  messages.push({ role: 'user', content: userPrompt })

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI LMS',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`)
  }

  const result: any = await response.json()
  const choiceText = result.choices?.[0]?.message?.content
  if (!choiceText) {
    throw new Error('Invalid or empty response from OpenRouter API')
  }

  return choiceText
}
