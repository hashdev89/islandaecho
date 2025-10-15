import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET() {
  try {
    console.log('Testing Supabase tours table structure...')
    
    // Try to get one record to see the structure
    const { data, error } = await supabaseAdmin
      .from('tours')
      .select('*')
      .limit(1)
    
    console.log('Supabase test result:', { data, error })
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        hint: error.hint
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection working',
      tourCount: data?.length || 0,
      sampleFields: data?.[0] ? Object.keys(data[0]) : [],
      sampleData: data?.[0] || null
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
