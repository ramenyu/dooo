import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return NextResponse.json({ 
      status: 'error',
      message: 'OPENAI_API_KEY not found in environment variables'
    })
  }

  // Check key format (should start with sk-proj- or sk-)
  const isValidFormat = apiKey.startsWith('sk-')
  const keyPrefix = apiKey.substring(0, 15) + '...'
  
  return NextResponse.json({ 
    status: 'found',
    keyPrefix,
    isValidFormat,
    keyLength: apiKey.length,
    message: isValidFormat 
      ? 'API key found and format looks correct. Try making a test call.' 
      : 'API key found but format looks incorrect (should start with sk-)'
  })
}

