import { NextRequest, NextResponse } from 'next/server'
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

// Write users to file
const writeUsers = (users: any[]) => {
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
    const users = readUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const users = readUsers()
    
    // Generate new ID
    const newId = (Math.max(...users.map(u => parseInt(u.id)), 0) + 1).toString()
    
    // Create new user
    const newUser = {
      id: newId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role || 'customer',
      status: body.status || 'active',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      totalBookings: 0,
      totalSpent: 0,
      address: body.address || '',
      notes: body.notes || ''
    }
    
    // Add to users array
    users.push(newUser)
    
    // Save to file
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
