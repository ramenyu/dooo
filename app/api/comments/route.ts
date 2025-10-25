import { NextRequest, NextResponse } from 'next/server'
import { getCommentsByTodoId, createComment } from '@/lib/supabase-db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const todoId = request.nextUrl.searchParams.get('todoId')
    
    if (!todoId) {
      return NextResponse.json({ error: 'todoId is required' }, { status: 400 })
    }
    
    const comments = await getCommentsByTodoId(todoId)
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { todo_id, user_id, user_name, text, attached_links } = await request.json()
    
    if (!todo_id || !user_id || !user_name || !text) {
      return NextResponse.json(
        { error: 'todo_id, user_id, user_name, and text are required' },
        { status: 400 }
      )
    }
    
    const comment = await createComment({
      todo_id,
      user_id,
      user_name,
      text,
      attached_links: attached_links || []
    })
    
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

