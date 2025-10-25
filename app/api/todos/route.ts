import { NextRequest, NextResponse } from 'next/server'
import { getTodosByUserName, createTodo, updateTodo, deleteTodo } from '@/lib/supabase-db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    const userName = request.nextUrl.searchParams.get('userName')
    const organizationId = request.nextUrl.searchParams.get('organizationId')
    
    // If ID is provided, fetch single todo
    if (id) {
      const { getTodoById } = await import('@/lib/supabase-db')
      const todo = await getTodoById(id)
      if (!todo) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
      }
      return NextResponse.json(todo)
    }
    
    // Otherwise fetch todos by user
    if (!userName || !organizationId) {
      return NextResponse.json({ error: 'userName and organizationId are required' }, { status: 400 })
    }
    
    const todos = await getTodosByUserName(userName, organizationId)
    return NextResponse.json(todos)
  } catch (error) {
    console.error('Get todos error:', error)
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, assigned_to, created_by, created_by_user_id, due_date, organization_id, attached_links } = await request.json()
    
    if (!text || !assigned_to || !created_by || !created_by_user_id || !organization_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newTodo = await createTodo({
      text,
      assigned_to,
      created_by,
      created_by_user_id,
      organization_id,
      due_date: due_date || new Date().toISOString(),
      completed: false,
      completed_by: '',
      attached_links: attached_links || [],
      created_at: new Date().toISOString()
    })
    
    return NextResponse.json(newTodo, { status: 201 })
  } catch (error) {
    console.error('Create todo error:', error)
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Todo ID is required' }, { status: 400 })
    }

    const updatedTodo = await updateTodo(id, updates)
    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error('Update todo error:', error)
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Todo ID is required' }, { status: 400 })
    }

    await deleteTodo(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete todo error:', error)
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 })
  }
}
