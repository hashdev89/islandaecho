import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseClient'

// GET unread message count for admin/staff
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const userRole = searchParams.get('role')

    if (!userId || !userRole) {
      return NextResponse.json(
        { success: false, error: 'User ID and role are required' },
        { status: 400 }
      )
    }

    // Build query based on role
    let conversationsQuery = supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('status', 'active')

    // Staff can only see assigned conversations, admins see all
    if (userRole === 'staff') {
      conversationsQuery = conversationsQuery.eq('assigned_to', userId)
    }

    const { data: conversations, error: convError } = await conversationsQuery

    if (convError) {
      console.error('Error fetching conversations:', convError)
      return NextResponse.json(
        { success: false, error: convError.message },
        { status: 500 }
      )
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0
      })
    }

    const conversationIds = conversations.map(c => c.id)

    // Count unread messages (messages from customers that haven't been read)
    const { count, error: countError } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .eq('sender_role', 'customer')
      .is('read_at', null)

    if (countError) {
      console.error('Error counting unread messages:', countError)
      return NextResponse.json(
        { success: false, error: countError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: count || 0
    })
  } catch (error) {
    console.error('Error in GET /api/chat/unread-count:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get unread count' },
      { status: 500 }
    )
  }
}

