import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const envCheck = {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlValid: supabaseUrl?.includes('supabase.co'),
      keyLength: supabaseKey?.length || 0,
      environment: process.env.NODE_ENV
    }
    
    console.log('Environment check:', envCheck)
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        message: 'Supabase environment variables not configured',
        envCheck
      }, { status: 500 })
    }
    
    // Test database connection
    const { data, error } = await supabaseAdmin
      .from('tours')
      .select('id, name, featured, status')
      .limit(5)
    
    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({
        success: false,
        message: 'Supabase query failed',
        error: error.message,
        envCheck
      }, { status: 500 })
    }
    
    const featuredTours = data?.filter(tour => tour.featured) || []
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      envCheck,
      totalTours: data?.length || 0,
      featuredTours: featuredTours.length,
      tours: data?.map(tour => ({
        id: tour.id,
        name: tour.name,
        featured: tour.featured,
        status: tour.status
      })) || []
    })
    
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Supabase connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
