import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured'
      }, { status: 500 })
    }

    console.log('Making direct fetch request to OpenAI...')
    
    // Direct fetch call to OpenAI API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Say hi in 5 words'
          }
        ],
        max_tokens: 20
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      return NextResponse.json({ 
        error: 'OpenAI API request failed',
        status: response.status,
        details: errorData
      }, { status: response.status })
    }

    const data = await response.json()
    const message = data.choices[0]?.message?.content || 'No response'

    return NextResponse.json({ 
      success: true,
      message: 'Direct fetch to OpenAI worked!',
      response: message,
      usage: data.usage
    })
  } catch (error: any) {
    console.error('Fetch test error:', error)
    
    if (error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request timed out',
        hint: 'Cannot connect to OpenAI API - check network/firewall'
      }, { status: 408 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to call OpenAI API',
      details: error.message,
      errorName: error.name
    }, { status: 500 })
  }
}

