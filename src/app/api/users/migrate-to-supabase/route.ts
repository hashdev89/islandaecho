import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'

// Paths
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

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

// Load users from file
const loadUsers = (): User[] => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading users:', error)
  }
  return []
}

export async function POST() {
  try {
    console.log('Starting users migration to Supabase...')
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseServiceKey === 'placeholder-service-key' ||
        !supabaseUrl.includes('supabase.co') ||
        supabaseServiceKey.length <= 50) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.' 
      }, { status: 500 })
    }

    // Load users from file
    const fileUsers = loadUsers()
    console.log(`Found ${fileUsers.length} users in file`)

    if (fileUsers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No users found in file to migrate',
        migratedCount: 0,
        skippedCount: 0
      })
    }

    // Get existing users from Supabase
    const { data: existingUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id')

    if (fetchError) {
      console.error('Error fetching existing users:', fetchError)
      // Check if table exists or if it's a different error
      if (fetchError.message.includes('relation') || fetchError.message.includes('does not exist')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Users table does not exist in Supabase. Please run the schema migration first.' 
        }, { status: 500 })
      }
      throw fetchError
    }

    const existingIds = new Set(existingUsers?.map(u => u.id) || [])
    console.log(`Found ${existingIds.size} existing users in Supabase`)

    // Filter out users that already exist
    const usersToMigrate = fileUsers.filter(user => !existingIds.has(user.id))
    console.log(`${usersToMigrate.length} users need to be migrated`)

    if (usersToMigrate.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'All users already exist in Supabase',
        migratedCount: 0,
        skippedCount: fileUsers.length
      })
    }

    // Insert users one by one to handle schema mismatches
    let successCount = 0
    let errorCount = 0
    const errors: Array<{ user: string; error: string }> = []

    for (const user of usersToMigrate) {
      try {
        // Prepare user data for Supabase (handle missing timestamp columns)
        const userData: Record<string, unknown> = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role || 'customer',
          status: user.status || 'active',
          total_bookings: user.totalBookings || 0,
          total_spent: user.totalSpent || 0,
          address: user.address || '',
          notes: user.notes || ''
        }

        // Add timestamp fields if they exist
        if (user.lastLogin) {
          userData.last_login = new Date(user.lastLogin).toISOString()
        }
        if (user.createdAt) {
          userData.created_at = new Date(user.createdAt).toISOString()
        }

        console.log(`Attempting to insert user: ${user.name} (${user.email})`)
        console.log(`User data:`, JSON.stringify(userData, null, 2))
        
        const { data, error: insertError } = await supabaseAdmin
          .from('users')
          .insert([userData])
          .select()

        if (insertError) {
          console.error(`Insert error for ${user.name}:`, insertError)
          console.error(`Error details:`, {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint
          })
          
          // If error is about missing columns, try without optional fields
          if (insertError.message.includes('last_login') || insertError.message.includes('created_at')) {
            console.log(`Retrying ${user.name} without timestamp columns...`)
            const userWithoutTimestamps = {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              role: user.role || 'customer',
              status: user.status || 'active',
              total_bookings: user.totalBookings || 0,
              total_spent: user.totalSpent || 0,
              address: user.address || '',
              notes: user.notes || ''
            }
            
            const { data: retryData, error: retryError } = await supabaseAdmin
              .from('users')
              .insert([userWithoutTimestamps])
              .select()

            if (retryError) {
              console.error(`Retry error for ${user.name}:`, retryError)
              errorCount++
              errors.push({ 
                user: user.name, 
                error: `${retryError.message} (Code: ${retryError.code || 'N/A'})` 
              })
            } else {
              successCount++
              console.log(`✓ Successfully migrated ${user.name} (without timestamps)`)
            }
          } else if (insertError.message.includes('duplicate key') || insertError.message.includes('unique constraint')) {
            // User already exists, skip it
            console.log(`User ${user.name} already exists, skipping...`)
            successCount++ // Count as success since it's already there
          } else if (insertError.message.includes('permission denied') || insertError.message.includes('RLS')) {
            // RLS policy issue
            console.error(`RLS/Permission error for ${user.name}. The service role should bypass RLS.`)
            errorCount++
            errors.push({ 
              user: user.name, 
              error: `RLS/Permission denied: ${insertError.message}. Check your RLS policies.` 
            })
          } else {
            console.error(`Error inserting ${user.name}:`, insertError)
            errorCount++
            errors.push({ 
              user: user.name, 
              error: `${insertError.message} (Code: ${insertError.code || 'N/A'})` 
            })
          }
        } else {
          successCount++
          console.log(`✓ Successfully migrated ${user.name}`)
          console.log(`Inserted data:`, data)
        }
      } catch (err) {
        errorCount++
        errors.push({ user: user.name, error: (err as Error).message })
      }
    }

    const result = {
      success: true,
      message: `Users migration completed`,
      migratedCount: successCount,
      skippedCount: existingIds.size,
      errorCount: errorCount,
      totalUsers: fileUsers.length,
      migratedUsers: usersToMigrate.slice(0, successCount).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
      })),
      errors: errors
    }

    console.log('Migration result:', result)
    
    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Users migration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log('Checking users migration status...')
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseServiceKey === 'placeholder-service-key' ||
        !supabaseUrl.includes('supabase.co') ||
        supabaseServiceKey.length <= 50) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase not configured' 
      }, { status: 500 })
    }

    // Check local users file
    const localUsers = loadUsers()

    // Check Supabase users
    const { data: supabaseUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role')

    if (fetchError) {
      console.error('Error fetching Supabase users:', fetchError)
      if (fetchError.message.includes('relation') || fetchError.message.includes('does not exist')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Users table does not exist in Supabase. Please run the schema migration first.',
          localUsers: {
            count: localUsers.length,
            users: localUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
          }
        }, { status: 500 })
      }
      throw fetchError
    }

    const localIds = new Set(localUsers.map(u => u.id))
    const supabaseIds = new Set(supabaseUsers?.map(u => u.id) || [])
    const needsMigration = localUsers.filter(u => !supabaseIds.has(u.id))

    return NextResponse.json({
      success: true,
      localUsers: {
        count: localUsers.length,
        users: localUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
      },
      supabaseUsers: {
        count: supabaseUsers?.length || 0,
        users: supabaseUsers?.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })) || []
      },
      needsMigration: needsMigration.length > 0,
      missingInSupabase: needsMigration.length,
      missingUsers: needsMigration.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
    })
  } catch (error: unknown) {
    console.error('Migration status check error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

