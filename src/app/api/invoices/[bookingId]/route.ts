import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { generateInvoicePDF } from '@/lib/invoiceGenerator'
import fs from 'fs'
import path from 'path'

// Fallback file storage path
const FALLBACK_FILE = path.join(process.cwd(), 'data', 'bookings.json')

// Load bookings from file (fallback)
const loadFallbackBookings = () => {
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
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const resolvedParams = await params
    const bookingId = resolvedParams.bookingId
    
    console.log('GET /api/invoices/[bookingId] - Fetching invoice for booking:', bookingId)
    
    let bookingData = null
    
    // Try to get booking from Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data, error } = await supabaseAdmin
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single()
        
        if (!error && data) {
          bookingData = data
        }
      } catch (error) {
        console.error('Error fetching booking from Supabase:', error)
      }
    }
    
    // Fallback to file storage if Supabase fails or not configured
    if (!bookingData) {
      const fallbackBookings = loadFallbackBookings()
      bookingData = fallbackBookings.find((b: any) => b.id === bookingId)
    }
    
    if (!bookingData) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Generate invoice PDF
    const invoicePdf = await generateInvoicePDF(bookingData)
    
    // Convert Buffer to Uint8Array for NextResponse
    const pdfArray = new Uint8Array(invoicePdf)
    
    // Return PDF as response
    return new NextResponse(pdfArray, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${bookingId}.pdf"`,
        'Content-Length': invoicePdf.length.toString()
      }
    })
  } catch (error: unknown) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

