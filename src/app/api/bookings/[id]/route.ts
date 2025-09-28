import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'

// Persistent file-based storage for fallback
const FALLBACK_FILE = path.join(process.cwd(), 'data', 'bookings.json')

interface Booking {
  id: string
  tour_package_id: string
  tour_package_name: string
  customer_name: string
  customer_email: string
  customer_phone: string
  start_date: string
  end_date: string
  guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  special_requests: string
  created_at: string
  payment_status: 'pending' | 'paid' | 'refunded'
}

// Load bookings from file
const loadFallbackBookings = (): Booking[] => {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading fallback bookings:', error)
  }
  return []
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id
    console.log('GET /api/bookings/[id] - Fetching booking:', bookingId)
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, using fallback bookings data')
      const fallbackBookings = loadFallbackBookings()
      const booking = fallbackBookings.find(b => b.id === bookingId)
      
      if (!booking) {
        return NextResponse.json({ 
          success: false, 
          error: 'Booking not found' 
        }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: true, 
        data: booking,
        message: 'Booking retrieved from fallback storage' 
      })
    }
    
    // TEMPORARY: Force using fallback data for debugging
    console.log('TEMPORARY: Using fallback data instead of Supabase')
    const fallbackBookings = loadFallbackBookings()
    const booking = fallbackBookings.find(b => b.id === bookingId)
    
    if (!booking) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: booking,
      message: 'Booking retrieved from fallback storage (forced)' 
    })
    
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()
    
    console.log('Supabase booking query result:', { data, error })
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Booking API error:', error)
    console.log('Falling back to persistent storage')
    const fallbackBookings = loadFallbackBookings()
    const booking = fallbackBookings.find(b => b.id === params.id)
    
    if (!booking) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: booking,
      message: 'Booking retrieved from fallback storage due to error' 
    })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id
    const body = await request.json()
    console.log('PUT /api/bookings/[id] - Updating booking:', bookingId, body)
    
    const updatedBooking = {
      ...body,
      updated_at: new Date().toISOString(),
    }
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, using fallback storage for booking update')
      const fallbackBookings = loadFallbackBookings()
      const bookingIndex = fallbackBookings.findIndex(b => b.id === bookingId)
      
      if (bookingIndex === -1) {
        return NextResponse.json({ 
          success: false, 
          error: 'Booking not found' 
        }, { status: 404 })
      }
      
      fallbackBookings[bookingIndex] = { ...fallbackBookings[bookingIndex], ...updatedBooking }
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(fallbackBookings, null, 2))
      
      return NextResponse.json({ 
        success: true, 
        data: fallbackBookings[bookingIndex],
        message: 'Booking updated successfully (fallback storage)' 
      })
    }
    
    // TEMPORARY: Force using fallback data for debugging
    console.log('TEMPORARY: Using fallback data instead of Supabase for update')
    const fallbackBookings = loadFallbackBookings()
    const bookingIndex = fallbackBookings.findIndex(b => b.id === bookingId)
    
    if (bookingIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 })
    }
    
    fallbackBookings[bookingIndex] = { ...fallbackBookings[bookingIndex], ...updatedBooking }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(fallbackBookings, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      data: fallbackBookings[bookingIndex],
      message: 'Booking updated successfully (fallback storage forced)' 
    })
    
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(updatedBooking)
      .eq('id', bookingId)
      .select('*')
      .single()
    
    console.log('Supabase booking update result:', { data, error })
    
    if (error) {
      console.error('Supabase booking update error:', error)
      throw error
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Update booking error:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id
    console.log('DELETE /api/bookings/[id] - Deleting booking:', bookingId)
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, using fallback storage for booking deletion')
      const fallbackBookings = loadFallbackBookings()
      const bookingIndex = fallbackBookings.findIndex(b => b.id === bookingId)
      
      if (bookingIndex === -1) {
        return NextResponse.json({ 
          success: false, 
          error: 'Booking not found' 
        }, { status: 404 })
      }
      
      const deletedBooking = fallbackBookings[bookingIndex]
      fallbackBookings.splice(bookingIndex, 1)
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(fallbackBookings, null, 2))
      
      console.log('Booking deleted from fallback storage:', deletedBooking)
      return NextResponse.json({ 
        success: true, 
        data: deletedBooking,
        message: 'Booking deleted successfully (fallback storage)' 
      })
    }
    
    // TEMPORARY: Force using fallback data for debugging
    console.log('TEMPORARY: Using fallback data instead of Supabase for deletion')
    const fallbackBookings = loadFallbackBookings()
    const bookingIndex = fallbackBookings.findIndex(b => b.id === bookingId)
    
    if (bookingIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 })
    }
    
    const deletedBooking = fallbackBookings[bookingIndex]
    fallbackBookings.splice(bookingIndex, 1)
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(fallbackBookings, null, 2))
    
    console.log('Booking deleted from fallback storage (forced):', deletedBooking)
    return NextResponse.json({ 
      success: true, 
      data: deletedBooking,
      message: 'Booking deleted successfully (fallback storage forced)' 
    })
    
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', bookingId)
      .select('*')
      .single()
    
    console.log('Supabase booking delete result:', { data, error })
    
    if (error) {
      console.error('Supabase booking delete error:', error)
      throw error
    }
    
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Delete booking error:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}