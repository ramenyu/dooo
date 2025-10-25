import { NextRequest, NextResponse } from 'next/server'
import { updateUserItemView, getUserItemViews } from '@/lib/supabase-db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const views = await getUserItemViews(userId)
    return NextResponse.json(views)
  } catch (error) {
    console.error('Get user views error:', error)
    return NextResponse.json({ error: 'Failed to fetch user views' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, todoId } = await request.json()

    if (!userId || !todoId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const view = await updateUserItemView(userId, todoId)
    return NextResponse.json(view)
  } catch (error) {
    console.error('Update user view error:', error)
    return NextResponse.json({ error: 'Failed to update user view' }, { status: 500 })
  }
}

