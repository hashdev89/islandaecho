import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Read users from file
const readUsers = () => {
  try {
    ensureDataDir()
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading users file:', error)
  }
  
  // Return default users if file doesn't exist or error occurs
  return [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0123',
      role: 'customer',
      status: 'active',
      lastLogin: '2024-12-20T10:30:00Z',
      createdAt: '2024-01-15T08:00:00Z',
      totalBookings: 3,
      totalSpent: 5697
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+44-20-7946-0958',
      role: 'customer',
      status: 'active',
      lastLogin: '2024-12-19T14:45:00Z',
      createdAt: '2024-02-10T09:15:00Z',
      totalBookings: 2,
      totalSpent: 2598
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@email.com',
      phone: '+34-91-123-4567',
      role: 'customer',
      status: 'active',
      lastLogin: '2024-12-18T16:20:00Z',
      createdAt: '2024-03-05T11:30:00Z',
      totalBookings: 1,
      totalSpent: 899
    },
    {
      id: '4',
      name: 'David Thompson',
      email: 'david.thompson@email.com',
      phone: '+61-2-9374-4000',
      role: 'customer',
      status: 'inactive',
      lastLogin: '2024-11-15T12:00:00Z',
      createdAt: '2024-01-20T10:00:00Z',
      totalBookings: 1,
      totalSpent: 1599
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@email.com',
      phone: '+1-416-555-0199',
      role: 'customer',
      status: 'active',
      lastLogin: '2024-12-17T09:30:00Z',
      createdAt: '2024-04-12T14:45:00Z',
      totalBookings: 2,
      totalSpent: 2398
    },
    {
      id: '6',
      name: 'Admin User',
      email: 'admin@isleandecho.com',
      phone: '+94-11-234-5678',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-12-20T08:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      totalBookings: 0,
      totalSpent: 0
    },
    {
      id: '7',
      name: 'Staff Member',
      email: 'staff@isleandecho.com',
      phone: '+94-11-234-5679',
      role: 'staff',
      status: 'active',
      lastLogin: '2024-12-19T17:30:00Z',
      createdAt: '2024-02-01T09:00:00Z',
      totalBookings: 0,
      totalSpent: 0
    }
  ]
}

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'staff' | 'customer'
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string
  createdAt: string
  totalBookings: number
  totalSpent: number
  address?: string
  notes?: string
}

// Write users to file
const writeUsers = (users: User[]): boolean => {
  try {
    ensureDataDir()
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
    return true
  } catch (error) {
    console.error('Error writing users file:', error)
    return false
  }
}

// GET /api/users - Get all users
export async function GET() {
  try {
    console.log('GET /api/users - Fetching users...')
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const isSupabaseConfigured = supabaseUrl && 
                                  supabaseKey && 
                                  supabaseUrl.includes('supabase.co') && 
                                  supabaseKey.length > 50
    
    if (isSupabaseConfigured) {
      console.log('Supabase configured, fetching from database...')
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('Supabase users query result:', { 
        count: data?.length || 0, 
        error: error?.message 
      })
      
      if (error) {
        console.error('Supabase error:', error)
        // Fall through to file-based fallback
      } else if (data && data.length > 0) {
        // Map Supabase data to expected format
        const mappedUsers = data.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role || 'customer',
          status: user.status || 'active',
          lastLogin: user.last_login ? new Date(user.last_login).toISOString() : new Date().toISOString(),
          createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
          totalBookings: user.total_bookings || 0,
          totalSpent: user.total_spent || 0,
          address: user.address || '',
          notes: user.notes || ''
        }))
        
        console.log(`Retrieved ${mappedUsers.length} users from Supabase`)
        return NextResponse.json(mappedUsers)
      } else {
        console.log('No users found in Supabase, falling back to file storage')
      }
    } else {
      console.log('Supabase not configured, using fallback storage')
    }
    
    // Fallback to file storage
    const users = readUsers()
    console.log(`Loaded ${users.length} users from file`)
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    // Fallback to file storage on error
    const users = readUsers()
    return NextResponse.json(users)
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const isSupabaseConfigured = supabaseUrl && 
                                  supabaseKey && 
                                  supabaseUrl.includes('supabase.co') && 
                                  supabaseKey.length > 50
    
    // Generate new ID
    const newId = crypto.randomUUID()
    
    // Create new user data
    const newUser = {
      id: newId,
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      role: body.role || 'customer',
      status: body.status || 'active',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      totalBookings: 0,
      totalSpent: 0,
      address: body.address || '',
      notes: body.notes || ''
    }
    
    if (isSupabaseConfigured) {
      // Try Supabase first
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([{
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          status: newUser.status,
          last_login: newUser.lastLogin,
          created_at: newUser.createdAt,
          total_bookings: newUser.totalBookings,
          total_spent: newUser.totalSpent,
          address: newUser.address,
          notes: newUser.notes
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error:', error)
        // Fall through to file storage
      } else if (data) {
        // Map back to expected format
        const mappedUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          role: data.role || 'customer',
          status: data.status || 'active',
          lastLogin: data.last_login ? new Date(data.last_login).toISOString() : new Date().toISOString(),
          createdAt: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
          totalBookings: data.total_bookings || 0,
          totalSpent: data.total_spent || 0,
          address: data.address || '',
          notes: data.notes || ''
        }
        return NextResponse.json(mappedUser, { status: 201 })
      }
    }
    
    // Fallback to file storage
    const users = readUsers()
    users.push(newUser)
    
    if (writeUsers(users)) {
      return NextResponse.json(newUser, { status: 201 })
    } else {
      return NextResponse.json(
        { error: 'Failed to save user' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// PUT /api/users - Update users (bulk operation)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const users = body.users || []
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const isSupabaseConfigured = supabaseUrl && 
                                  supabaseKey && 
                                  supabaseUrl.includes('supabase.co') && 
                                  supabaseKey.length > 50
    
    if (isSupabaseConfigured) {
      // Update users in Supabase
      const updates = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'customer',
        status: user.status || 'active',
        last_login: user.lastLogin ? new Date(user.lastLogin).toISOString() : null,
        created_at: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
        total_bookings: user.totalBookings || 0,
        total_spent: user.totalSpent || 0,
        address: user.address || '',
        notes: user.notes || ''
      }))
      
      // Use upsert to insert or update
      const { error } = await supabaseAdmin
        .from('users')
        .upsert(updates, { onConflict: 'id' })
      
      if (error) {
        console.error('Supabase error:', error)
        // Fall through to file storage
      } else {
        return NextResponse.json({ success: true })
      }
    }
    
    // Fallback to file storage
    if (writeUsers(users)) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to update users' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating users:', error)
    return NextResponse.json(
      { error: 'Failed to update users' },
      { status: 500 }
    )
  }
}
