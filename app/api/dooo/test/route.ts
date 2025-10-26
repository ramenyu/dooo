import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        hint: 'Add OPENAI_API_KEY to your .env.local file'
      }, { status: 500 })
    }

    console.log('Testing OpenAI with proxy support...')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Say "Hello! I am Dooo and I am working!" in exactly 10 words.'
        }
      ],
      max_tokens: 50
    })

    const doooResponse = completion.choices[0]?.message?.content || 'No response'

    return NextResponse.json({ 
      success: true,
      message: 'OpenAI API is working with proxy!',
      doooResponse,
      model: completion.model,
      usage: completion.usage
    })
  } catch (error) {
    console.error('OpenAI test error:', error)
    return NextResponse.json({ 
      error: 'Failed to call OpenAI API',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Check if your API key is valid and has credits'
    }, { status: 500 })
  }
}

