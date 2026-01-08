import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseClient'
import fs from 'fs'
import path from 'path'

const CHAT_DATA_DIR = path.join(process.cwd(), 'data', 'chat')
const CONVERSATIONS_FILE = path.join(CHAT_DATA_DIR, 'conversations.json')
const MESSAGES_FILE = path.join(CHAT_DATA_DIR, 'messages.json')

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(CHAT_DATA_DIR)) {
    fs.mkdirSync(CHAT_DATA_DIR, { recursive: true })
  }
}

// Load conversations from file (fallback)
function loadConversationsFromFile() {
  try {
    ensureDataDir()
    if (fs.existsSync(CONVERSATIONS_FILE)) {
      const data = fs.readFileSync(CONVERSATIONS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading conversations from file:', error)
  }
  return []
}

// Save conversations to file (fallback)
function saveConversationsToFile(conversations: unknown[]) {
  try {
    ensureDataDir()
    fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2))
    return true
  } catch (error) {
    console.error('Error saving conversations to file:', error)
    return false
  }
}

// GET all conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const assignedTo = searchParams.get('assigned_to')

    // Check if Supabase is configured
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.SUPABASE_SERVICE_ROLE_KEY &&
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                                process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-service-key'

    let conversations: any[] = []

    if (isSupabaseConfigured) {
      let query = supabaseAdmin
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false })

      if (status !== 'all') {
        query = query.eq('status', status)
      }

      if (assignedTo) {
        query = query.eq('assigned_to', assignedTo)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching conversations from Supabase:', error)
        // Fall through to file storage
      } else if (data) {
        conversations = data
      }
    }

    // Fallback to file storage if Supabase failed or not configured
    if (conversations.length === 0) {
      const fileConversations = loadConversationsFromFile()
      conversations = fileConversations.filter((conv: any) => {
        if (status !== 'all' && conv.status !== status) return false
        if (assignedTo && conv.assigned_to !== assignedTo) return false
        return true
      })
      // Sort by last_message_at
      conversations.sort((a: any, b: any) => {
        const dateA = new Date(a.last_message_at || a.created_at).getTime()
        const dateB = new Date(b.last_message_at || b.created_at).getTime()
        return dateB - dateA
      })
    }

    // Get unread message counts (simplified for fallback)
    const conversationsWithUnread = conversations.map((conv) => ({
      ...conv,
      unread_count: 0 // Simplified - can be enhanced later
    }))

    return NextResponse.json({
      success: true,
      data: conversationsWithUnread
    })
  } catch (error) {
    console.error('Error in GET /api/chat/conversations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_name, customer_email, customer_phone, customer_id } = body

    if (!customer_name) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      )
    }

    // Generate unique ID
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newConversation = {
      id,
      customer_id: customer_id || null,
      customer_name,
      customer_email: customer_email || null,
      customer_phone: customer_phone || null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString()
    }

    // Check if Supabase is configured and tables exist
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.SUPABASE_SERVICE_ROLE_KEY &&
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                                process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-service-key'

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .insert([newConversation])
        .select()
        .single()

      if (error) {
        console.error('Error creating conversation in Supabase:', error)
        // Fall through to file storage
      } else if (data) {
        return NextResponse.json({
          success: true,
          data
        }, { status: 201 })
      }
    }

    // Fallback to file storage
    const conversations = loadConversationsFromFile()
    conversations.push(newConversation)
    if (saveConversationsToFile(conversations)) {
      return NextResponse.json({
        success: true,
        data: newConversation
      }, { status: 201 })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error in POST /api/chat/conversations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}

// PUT - Update a conversation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.SUPABASE_SERVICE_ROLE_KEY &&
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                                process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-service-key'

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating conversation in Supabase:', error)
        // Fall through to file storage
      } else if (data) {
        return NextResponse.json({
          success: true,
          data
        })
      }
    }

    // Fallback to file storage
    try {
      const conversations = loadConversationsFromFile()
      const convIndex = conversations.findIndex((conv: any) => conv.id === id)
      
      if (convIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Conversation not found' },
          { status: 404 }
        )
      }

      conversations[convIndex] = {
        ...conversations[convIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }

      if (saveConversationsToFile(conversations)) {
        return NextResponse.json({
          success: true,
          data: conversations[convIndex]
        })
      }
    } catch (error) {
      console.error('Error updating conversation in file storage:', error)
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update conversation' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error in PUT /api/chat/conversations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}

