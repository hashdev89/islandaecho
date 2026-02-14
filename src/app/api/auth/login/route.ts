import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import crypto from 'crypto'

// Simple password hashing (in production, use bcrypt)
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
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

    if (isSupabaseConfigured) {
      // Find user by email
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, name, email, role, status, password_hash')
        .eq('email', email.toLowerCase().trim())
        .limit(1)

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json(
          { success: false, error: 'Authentication failed' },
          { status: 500 }
        )
      }

      if (!users || users.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      const user = users[0]

      // Check if user is active
      if (user.status !== 'active') {
        return NextResponse.json(
          { success: false, error: 'Account is inactive. Please contact administrator.' },
          { status: 403 }
        )
      }

      // Check password
      // If user doesn't have a password_hash set, allow login for existing users (migration period)
      // This allows existing users added via admin panel to login
      if (!user.password_hash) {
        // For existing users without passwords, allow login with any password
        // This is a temporary migration solution - users should set passwords via admin panel
        console.log(`User ${user.email} logging in without password_hash (migration mode)`)
      } else {
        // User has password - verify it
        const hashedPassword = hashPassword(password)
        if (user.password_hash !== hashedPassword) {
          return NextResponse.json(
            { success: false, error: 'Invalid email or password' },
            { status: 401 }
          )
        }
      }

      // Update last login
      await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)

      // Return user data (without password_hash)
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'customer'
      }

      const role = (user.role || 'customer') as string
      const canAccessAdmin = ['admin', 'staff', 'customer'].includes(role)

      const response = NextResponse.json({
        success: true,
        user: userData
      })

      // Set HTTP-only cookie so middleware can protect /admin (server-side)
      if (canAccessAdmin) {
        response.cookies.set('admin_session', '1', {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          secure: process.env.NODE_ENV === 'production'
        })
      }

      return response
    }

    // Fallback: Return error if Supabase not configured
    return NextResponse.json(
      { success: false, error: 'Authentication service not configured' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}

