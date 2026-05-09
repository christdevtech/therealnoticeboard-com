import { GoogleGenAI } from '@google/genai'
import { NextRequest } from 'next/server'
import { buildContext } from './contextBuilder'
import { buildSystemPrompt } from './systemPrompt'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'AI assistant is not configured.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    const { message, history = [] } = body

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build RAG context from Payload collections
    const context = await buildContext(message)

    // Build the system prompt with injected context
    const systemPrompt = buildSystemPrompt(context)

    // Build conversation history for Gemini
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []

    // Add conversation history
    for (const msg of history.slice(-10)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })
    }

    // Add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    })

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

    // Stream the response
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      },
    })

    // Create a readable stream for SSE
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text || ''
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`),
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
