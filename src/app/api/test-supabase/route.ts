import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabaseAdmin
      .from('tours')
      .select('*')
      .limit(10)
    
    console.log('Supabase test result:', { data, error })
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection working',
      tourCount: data?.length || 0,
      tours: data || []
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}