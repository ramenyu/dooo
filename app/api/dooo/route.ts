import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { HttpsProxyAgent } from 'https-proxy-agent'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Create OpenAI client lazily (only when needed, not at build time)
function getOpenAIClient() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  const httpAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
    ...(httpAgent && { httpAgent: httpAgent as any }),
  })
}

export async function POST(request: NextRequest) {
  try {
    const { todoId, todoText, userId, userName } = await request.json()

    if (!todoId || !todoText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let response: string
    let usedMock = false

    // Use real API if key is configured, otherwise use mock
    const hasApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key-for-build'
    const useMock = !hasApiKey
    
    console.log('[Dooo] Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      hasApiKey: hasApiKey,
      useMock: useMock
    })

    if (useMock) {
      // Mock response for local development
      console.log('[Dooo Mock] Generating mock response for:', todoText)
      const mockResponses = [
        `I'll help you with "${todoText}"! Here's what I suggest: Break it down into smaller steps and tackle them one at a time. Let me know if you need more specific guidance! 🚀`,
        `Great task! For "${todoText}", I recommend starting with research and planning. Would you like me to help you create a checklist?`,
        `Interesting! "${todoText}" sounds important. My advice: Set a clear deadline, gather your resources, and start with the most challenging part first. You've got this! 💪`,
        `Got it! "${todoText}" - I'd suggest documenting your approach as you go. It'll help you stay organized and track progress. Need any specific tips?`,
        `Perfect! For "${todoText}", consider breaking it into: 1) Research phase, 2) Planning phase, 3) Execution phase. Start with step 1 and work your way through! 📝`
      ]
      response = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      usedMock = true
    } else {
      // Real OpenAI API call
      console.log('[Dooo] Calling OpenAI API for:', todoText)
      try {
        const openai = getOpenAIClient()
        const completion = await openai.chat.completions.create({
          model: 'gpt-4.1-nano-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'You are Dooo, a helpful AI assistant that helps people with their tasks. Be concise, friendly, and actionable. Keep responses under 100 words unless more detail is needed.'
            },
            {
              role: 'user',
              content: `Task: ${todoText}`
            }
          ],
          temperature: 0.7,
          max_tokens: 300,
        })

        response = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.'
      } catch (error) {
        console.error('[Dooo] OpenAI API error, falling back to mock:', error)
        // Fallback to mock if OpenAI fails
        const mockResponses = [
          `I'll help you with "${todoText}"! Here's what I suggest: Break it down into smaller steps and tackle them one at a time. Let me know if you need more specific guidance! 🚀`,
          `Great task! For "${todoText}", I recommend starting with research and planning. Would you like me to help you create a checklist?`,
        ]
        response = mockResponses[Math.floor(Math.random() * mockResponses.length)]
        usedMock = true
      }
    }

    // Post the response as a comment
    const commentResponse = await fetch(`${request.nextUrl.origin}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todo_id: todoId,
        user_id: userId || 'dooo-bot',
        user_name: 'Dooo',
        text: response,
        attached_links: []
      })
    })

    if (!commentResponse.ok) {
      throw new Error('Failed to post comment')
    }

    const comment = await commentResponse.json()

    return NextResponse.json({ 
      success: true, 
      response,
      comment 
    })
  } catch (error) {
    console.error('Dooo API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

