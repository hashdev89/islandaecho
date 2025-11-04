import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import crypto from 'crypto'

// Simple password hashing (in production, use bcrypt)
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const isSupabaseConfigured = supabaseUrl && 
                                  supabaseKey && 
                                  supabaseUrl.includes('supabase.co') && 
                                  supabaseKey.length > 50

    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Registration service not configured' },
        { status: 500 }
      )
    }

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .limit(1)

    if (checkError) {
      console.error('Error checking existing user:', checkError)
      return NextResponse.json(
        { success: false, error: 'Registration failed' },
        { status: 500 }
      )
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create new user
    const newId = crypto.randomUUID()
    const hashedPassword = hashPassword(password)

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        id: newId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: '',
        role: 'customer',
        status: 'active',
        password_hash: hashedPassword,
        total_bookings: 0,
        total_spent: 0,
        address: '',
        notes: '',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Registration failed. Please try again.' },
        { status: 500 }
      )
    }

    // Return user data (without password_hash)
    const userData = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role || 'customer'
    }

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'Account created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}

