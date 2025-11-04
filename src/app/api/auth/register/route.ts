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

    // Try inserting with password_hash first
    const userData: Record<string, unknown> = {
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
    }

    let { data, error } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
      .single()

    // If password_hash column doesn't exist, try without it
    if (error && (error.message.includes('password_hash') || error.message.includes('column') || error.code === '42703')) {
      console.log('password_hash column not found, trying without it...')
      // Remove password_hash and try again
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash: _passwordHash, ...userDataWithoutPassword } = userData
      const result = await supabaseAdmin
        .from('users')
        .insert([userDataWithoutPassword])
        .select()
        .single()
      
      if (result.error) {
        error = result.error
      } else {
        data = result.data
        error = null
        console.warn('User created without password_hash. Please add password_hash column to users table.')
      }
    }

    if (error) {
      console.error('Supabase registration error:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // Provide more specific error messages
      let errorMessage = 'Registration failed. Please try again.'
      if (error.message.includes('unique constraint') || error.message.includes('duplicate')) {
        errorMessage = 'Email already registered'
      } else if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        errorMessage = 'Permission denied. Please check database permissions.'
      } else {
        errorMessage = `Registration failed: ${error.message}`
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }

    // Return user data (without password_hash)
    const responseUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role || 'customer'
    }

    return NextResponse.json({
      success: true,
      user: responseUser,
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

