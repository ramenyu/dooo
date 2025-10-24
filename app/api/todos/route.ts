import { NextRequest, NextResponse } from 'next/server'
import { getTodos, addTodo, updateTodo, deleteTodo, getTodosByUserId, findUserByName } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    let todos
    if (userId) {
      todos = getTodosByUserId(userId)
    } else {
      todos = getTodos()
    }
    
    return NextResponse.json(todos)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, assignedTo, createdBy, createdByUserId, dueDate, organizationId, attachedLinks } = await request.json()
    
    if (!text || !assignedTo || !createdBy || !createdByUserId || !organizationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Handle multiple assignees - store comma-separated string
    // For now, we'll use the first user's ID as the primary assignedToUserId
    // In a more complex system, you might want to create separate records for each assignee
    const assigneeNames = assignedTo.split(', ').map((name: string) => name.trim())
    const primaryAssignee = findUserByName(assigneeNames[0])
    if (!primaryAssignee) {
      return NextResponse.json({ error: 'Primary assigned user not found' }, { status: 404 })
    }

    const newTodo = {
      id: crypto.randomUUID(),
      text,
      assignedTo, // Keep the full comma-separated string
      assignedToUserId: primaryAssignee.id, // Use first user's ID as primary
      createdBy,
      createdByUserId,
      organizationId, // Add organization ID
      dueDate: dueDate || new Date().toISOString(),
      completed: false,
      completedBy: '', // Initialize as empty string
      attachedLinks: attachedLinks || [], // Add attached links
      createdAt: new Date().toISOString()
    }

    addTodo(newTodo)
    return NextResponse.json(newTodo, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Todo ID is required' }, { status: 400 })
    }

    const success = updateTodo(id, updates)
    if (!success) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Todo ID is required' }, { status: 400 })
    }

    const success = deleteTodo(id)
    if (!success) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 })
  }
}
