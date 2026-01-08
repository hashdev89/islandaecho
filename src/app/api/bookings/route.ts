import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'

// Persistent file-based storage for fallback
const FALLBACK_FILE = path.join(process.cwd(), 'data', 'bookings.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

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
    ensureDataDir()
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading fallback bookings:', error)
  }
  return []
}

// Save bookings to file
const saveFallbackBookings = (bookings: Booking[]) => {
  try {
    ensureDataDir()
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(bookings, null, 2))
    console.log('Bookings saved to fallback file:', FALLBACK_FILE)
  } catch (error) {
    console.error('Error saving fallback bookings:', error)
  }
}

export async function GET(request: Request) {
	try {
		// Get user info from request headers (passed from frontend)
		const userEmail = request.headers.get('x-user-email') || ''
		const userRole = request.headers.get('x-user-role') || ''
		const userId = request.headers.get('x-user-id') || ''
		
		console.log('GET /api/bookings - User info:', { userEmail, userRole, userId })
		
		const fallbackBookings = loadFallbackBookings()
		
		// Filter bookings based on user role
		let filteredBookings = fallbackBookings
		
		if (userRole === 'customer') {
			// Customers can only see their own bookings
			filteredBookings = fallbackBookings.filter(
				(booking: Booking) => booking.customer_email?.toLowerCase() === userEmail.toLowerCase()
			)
			console.log(`Filtered bookings for customer ${userEmail}: ${filteredBookings.length} bookings`)
		} else if (userRole === 'staff') {
			// Staff can see all bookings (they can manage them)
			// No filtering needed for staff
			console.log(`Staff user ${userEmail}: showing all ${fallbackBookings.length} bookings`)
		} else if (userRole === 'admin') {
			// Admin can see all bookings
			console.log(`Admin user: showing all ${fallbackBookings.length} bookings`)
		}
		
		// Check if Supabase is configured
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
			console.log('Supabase not configured, using fallback bookings data')
			return NextResponse.json({ 
				success: true, 
				data: filteredBookings,
				message: 'Bookings retrieved from fallback storage' 
			})
		}
		
		// Try Supabase with role-based filtering
		let query = supabaseAdmin
			.from('bookings')
			.select('*')
		
		// Apply role-based filtering
		if (userRole === 'customer') {
			query = query.eq('customer_email', userEmail.toLowerCase())
		}
		// Staff and admin see all bookings, no filter needed
		
		query = query.order('created_at', { ascending: false })
		
		const { data, error } = await query
		
		if (error) {
			console.error('Supabase error:', error)
			// Return filtered fallback data
			return NextResponse.json({ 
				success: true, 
				data: filteredBookings,
				message: 'Bookings retrieved from fallback storage due to Supabase error' 
			})
		}
		
		// Apply role-based filtering to Supabase data as well
		let filteredData = data || []
		if (userRole === 'customer') {
			filteredData = filteredData.filter(
				(booking: Booking) => booking.customer_email?.toLowerCase() === userEmail.toLowerCase()
			)
		}
		
		return NextResponse.json({ success: true, data: filteredData })
	} catch (error: unknown) {
		console.error('Bookings API error:', error)
		const fallbackBookings = loadFallbackBookings()
		
		// Apply role-based filtering even in error case
		const userEmail = request.headers.get('x-user-email') || ''
		const userRole = request.headers.get('x-user-role') || ''
		let filteredBookings = fallbackBookings
		
		if (userRole === 'customer') {
			filteredBookings = fallbackBookings.filter(
				(booking: Booking) => booking.customer_email?.toLowerCase() === userEmail.toLowerCase()
			)
		}
		
		return NextResponse.json({ 
			success: true, 
			data: filteredBookings,
			message: 'Bookings retrieved from fallback storage due to error' 
		})
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json()
		console.log('POST /api/bookings - Received booking data:', body)
		
		// Generate booking reference number in B001 format
		const generateBookingRef = async () => {
			try {
				// Try to get existing bookings from Supabase first
				if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
					const { data: supabaseBookings } = await supabaseAdmin
						.from('bookings')
						.select('id')
					
					if (supabaseBookings) {
						const existingIds = supabaseBookings.map(b => b.id).filter(id => id.startsWith('B'))
						const maxNum = existingIds.length > 0 
							? Math.max(...existingIds.map(id => parseInt(id.substring(1)) || 0))
							: 0
						return `B${String(maxNum + 1).padStart(3, '0')}`
					}
				}
			} catch (error) {
				console.log('Error fetching from Supabase, using fallback:', error)
			}
			
			// Fallback to local storage
			const fallbackBookings = loadFallbackBookings()
			const existingIds = fallbackBookings.map(b => b.id).filter(id => id.startsWith('B'))
			const maxNum = existingIds.length > 0 
				? Math.max(...existingIds.map(id => parseInt(id.substring(1)) || 0))
				: 0
			return `B${String(maxNum + 1).padStart(3, '0')}`
		}

		const newBooking = {
			id: body.id || await generateBookingRef(),
			tour_package_id: body.tour_package_id,
			tour_package_name: body.tour_package_name,
			customer_name: body.customer_name,
			customer_email: body.customer_email,
			customer_phone: body.customer_phone,
			start_date: body.start_date,
			end_date: body.end_date,
			guests: body.guests ?? 1,
			total_price: body.total_price ?? null,
			status: body.status ?? 'pending',
			special_requests: body.special_requests ?? '',
			payment_status: body.payment_status ?? 'pending',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		}
		
		console.log('Prepared booking data:', newBooking)
		
		// Check if Supabase is configured
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
			console.log('Supabase not configured, using fallback storage for booking')
			const fallbackBookings = loadFallbackBookings()
			fallbackBookings.push(newBooking)
			saveFallbackBookings(fallbackBookings)
			console.log('Booking added to fallback storage:', newBooking)
			console.log('Total fallback bookings after add:', fallbackBookings.length)
			return NextResponse.json({ 
				success: true, 
				data: newBooking,
				message: 'Booking created successfully (fallback storage)' 
			})
		}
		
		const { data, error } = await supabaseAdmin
			.from('bookings')
			.insert(newBooking)
			.select('*')
			.single()
		
		console.log('Supabase booking insert result:', { data, error })
		
		if (error) {
			console.error('Supabase booking error:', error)
			console.log('Falling back to persistent storage for booking')
			const fallbackBookings = loadFallbackBookings()
			fallbackBookings.push(newBooking)
			saveFallbackBookings(fallbackBookings)
			console.log('Booking added to fallback storage (error case):', newBooking)
			console.log('Total fallback bookings after add (error case):', fallbackBookings.length)
			return NextResponse.json({ 
				success: true, 
				data: newBooking,
				message: 'Booking created successfully (fallback storage)' 
			})
		}
		
		console.log('Booking created successfully in Supabase:', data)
		return NextResponse.json({ success: true, data })
	} catch (error: unknown) {
		console.error('Create booking error:', error)
		return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
	}
}
