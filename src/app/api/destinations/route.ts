import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'

// Persistent file-based storage for fallback
const FALLBACK_FILE = path.join(process.cwd(), 'data', 'destinations.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load destinations from file
const loadFallbackDestinations = (): any[] => {
  try {
    ensureDataDir()
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8')
      const parsed = JSON.parse(data)
      console.log('Loaded destinations from file:', parsed.length)
      return parsed
    }
  } catch (error) {
    console.error('Error loading fallback destinations:', error)
  }
  return []
}

// Save destinations to file
const saveFallbackDestinations = (destinations: any[]) => {
  try {
    ensureDataDir()
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(destinations, null, 2))
    console.log('Destinations saved to fallback file:', FALLBACK_FILE)
  } catch (error) {
    console.error('Error saving fallback destinations:', error)
  }
}

export async function GET() {
  try {
    console.log('GET /api/destinations - Fetching destinations...')
    const fallbackDestinations = loadFallbackDestinations()
    console.log('Current fallback destinations count:', fallbackDestinations.length)
    
    // Always use fallback data for now (Supabase not configured)
    console.log('Using fallback destinations data')
    return NextResponse.json({ 
      success: true, 
      data: fallbackDestinations,
      message: 'Destinations retrieved from fallback storage' 
    })
    
    const { data, error } = await supabaseAdmin
      .from('destinations')
      .select('*')
      .order('name', { ascending: true })
    
    console.log('Supabase destinations query result:', { data, error })
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Destinations API error:', error)
    console.log('Falling back to persistent storage')
    const fallbackDestinations = loadFallbackDestinations()
    return NextResponse.json({ 
      success: true, 
      data: fallbackDestinations,
      message: 'Destinations retrieved from fallback storage due to error' 
    })
  }
}

export async function POST(req: Request) {
  let body: any = {}
  
  try {
    body = await req.json()
    console.log('POST /api/destinations - Received destination data:', body)
    
    const newDestination = {
      id: body.id || crypto.randomUUID(),
      name: body.name,
      region: body.region,
      lat: parseFloat(body.lat),
      lng: parseFloat(body.lng),
      description: body.description || '',
      image: body.image || '',
      status: body.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, saving to fallback storage')
      const fallbackDestinations = loadFallbackDestinations()
      const updatedDestinations = [...fallbackDestinations, newDestination]
      saveFallbackDestinations(updatedDestinations)
      
      return NextResponse.json({ 
        success: true, 
        data: newDestination,
        message: 'Destination created in fallback storage' 
      })
    }
    
    const { data, error } = await supabaseAdmin
      .from('destinations')
      .insert([newDestination])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return NextResponse.json({ success: true, data: data })
  } catch (error: any) {
    console.error('Destination creation error:', error)
    console.log('Falling back to persistent storage')
    
    // Only try to create fallback if we have valid body data
    if (body && body.name && body.region && body.lat && body.lng) {
      const newDestination = {
        id: body.id || crypto.randomUUID(),
        name: body.name,
        region: body.region,
        lat: parseFloat(body.lat),
        lng: parseFloat(body.lng),
        description: body.description || '',
        image: body.image || '',
        status: body.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const fallbackDestinations = loadFallbackDestinations()
      const updatedDestinations = [...fallbackDestinations, newDestination]
      saveFallbackDestinations(updatedDestinations)
      
      return NextResponse.json({ 
        success: true, 
        data: newDestination,
        message: 'Destination created in fallback storage due to error' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid destination data provided' 
      }, { status: 400 })
    }
  }
}

export async function PUT(req: Request) {
  let body: any = {}
  
  try {
    body = await req.json()
    console.log('PUT /api/destinations - Received destination update:', body)
    
    const updatedDestination = {
      ...body,
      updated_at: new Date().toISOString()
    }
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, updating fallback storage')
      const fallbackDestinations = loadFallbackDestinations()
      const updatedDestinations = fallbackDestinations.map(dest => 
        dest.id === body.id ? updatedDestination : dest
      )
      saveFallbackDestinations(updatedDestinations)
      
      return NextResponse.json({ 
        success: true, 
        data: updatedDestination,
        message: 'Destination updated in fallback storage' 
      })
    }
    
    const { data, error } = await supabaseAdmin
      .from('destinations')
      .update(updatedDestination)
      .eq('id', body.id)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return NextResponse.json({ success: true, data: data })
  } catch (error: any) {
    console.error('Destination update error:', error)
    console.log('Falling back to persistent storage')
    
    if (body && body.id) {
      const updatedDestination = {
        ...body,
        updated_at: new Date().toISOString()
      }
      
      const fallbackDestinations = loadFallbackDestinations()
      const updatedDestinations = fallbackDestinations.map(dest => 
        dest.id === body.id ? updatedDestination : dest
      )
      saveFallbackDestinations(updatedDestinations)
      
      return NextResponse.json({ 
        success: true, 
        data: updatedDestination,
        message: 'Destination updated in fallback storage due to error' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid destination data provided' 
      }, { status: 400 })
    }
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Destination ID is required' }, { status: 400 })
    }
    
    console.log('DELETE /api/destinations - Deleting destination:', id)
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, deleting from fallback storage')
      const fallbackDestinations = loadFallbackDestinations()
      const updatedDestinations = fallbackDestinations.filter(dest => dest.id !== id)
      saveFallbackDestinations(updatedDestinations)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Destination deleted from fallback storage' 
      })
    }
    
    const { error } = await supabaseAdmin
      .from('destinations')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return NextResponse.json({ success: true, message: 'Destination deleted successfully' })
  } catch (error: any) {
    console.error('Destination deletion error:', error)
    console.log('Falling back to persistent storage')
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    const fallbackDestinations = loadFallbackDestinations()
    const updatedDestinations = fallbackDestinations.filter(dest => dest.id !== id)
    saveFallbackDestinations(updatedDestinations)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Destination deleted from fallback storage due to error' 
    })
  }
}