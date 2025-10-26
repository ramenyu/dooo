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

    // Use mock ONLY in development without API key, real API in production
    const hasApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key-for-build'
    const isProduction = process.env.NODE_ENV === 'production'
    const useMock = !isProduction && !hasApiKey
    
    console.log('[Dooo] Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      isProduction: isProduction,
      hasApiKey: hasApiKey,
      useMock: useMock
    })

    if (useMock) {
      // Mock response for local development
      console.log('[Dooo Mock] Generating mock response for:', todoText)
      const mockResponses = [
        `I'll help you with "${todoText}"! Here's my comprehensive approach:\n\n1. **Initial Planning**: Start by breaking down the task into smaller, manageable components. This makes it less overwhelming and easier to track progress.\n\n2. **Research Phase**: Gather all necessary information and resources before diving in. This saves time later and helps you avoid common pitfalls.\n\n3. **Execution Strategy**: Focus on one component at a time, starting with the most critical or time-sensitive parts. This ensures steady progress.\n\n4. **Review & Iterate**: Regularly check your work against your goals and adjust as needed.\n\nLet me know if you need more specific guidance on any of these steps! 🚀`,
        `Great task! For "${todoText}", I recommend a structured approach:\n\n**Phase 1 - Foundation**\n• Define clear objectives and success criteria\n• Identify potential challenges early\n• Set realistic milestones and deadlines\n\n**Phase 2 - Implementation**\n• Start with the most important aspects\n• Document your process and decisions\n• Test and validate as you go\n\n**Phase 3 - Refinement**\n• Review and optimize your work\n• Gather feedback if applicable\n• Make final adjustments\n\nWould you like me to elaborate on any specific phase?`,
        `Interesting! "${todoText}" sounds important. Here's my detailed advice:\n\nFirst, take a moment to visualize the end result. What does success look like? Once you have that clear picture, work backwards to create your action plan.\n\nConsider these key points:\n• Set a clear, achievable deadline to maintain momentum\n• Gather all necessary resources upfront to avoid interruptions\n• Start with the most challenging aspects when your energy is highest\n• Build in buffer time for unexpected issues\n• Celebrate small wins along the way to stay motivated\n\nRemember: Progress over perfection. You've got this! 💪`,
        `Got it! For "${todoText}", here are my recommendations:\n\n**Organization Tips:**\n1. Create a dedicated workspace or document for this task\n2. Document your approach and key decisions as you go\n3. Set up regular check-ins with yourself to assess progress\n4. Keep notes on what works and what doesn't\n\n**Productivity Strategies:**\n• Time-box your work sessions (e.g., 45 min work, 15 min break)\n• Eliminate distractions during focused work time\n• Use templates or frameworks if available\n• Don't hesitate to ask for help when needed\n\nThis systematic approach will help you stay organized and make steady progress. Need any specific tips on implementation?`,
        `Perfect! For "${todoText}", let me suggest a comprehensive three-phase approach:\n\n**📋 Phase 1: Research & Planning (20% of time)**\n• Understand the full scope and requirements\n• Identify dependencies and prerequisites\n• Create a detailed action plan with milestones\n• Set up your tools and environment\n\n**🚀 Phase 2: Execution (60% of time)**\n• Follow your plan systematically\n• Track progress against milestones\n• Adapt and adjust as you learn\n• Document important decisions\n\n**✨ Phase 3: Review & Polish (20% of time)**\n• Test thoroughly and validate results\n• Refine and optimize\n• Document lessons learned\n• Prepare for next steps\n\nStart with Phase 1 and work your way through. Each phase builds on the previous one! 📝`
      ]
      response = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      usedMock = true
    } else {
      // Real OpenAI API call
      console.log('[Dooo] Calling OpenAI API for:', todoText)
      try {
        const openai = getOpenAIClient()
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // Use widely available model
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
        console.log('[Dooo] OpenAI API success! Response:', response.substring(0, 50) + '...')
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

