import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'

interface Tour {
  id: string
  name: string
  duration: string
  price: string
  image?: string
  images?: string[]
  rating: number
  reviews: number
  destinations?: string[]
  style?: string
  featured?: boolean
  status?: string
  updatedAt?: string
  updated_at?: string
}

// Persistent file-based storage for fallback
const FALLBACK_FILE = path.join(process.cwd(), 'data', 'tours.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load tours from file
const loadFallbackTours = (): Tour[] => {
  try {
    ensureDataDir()
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading fallback tours:', error)
  }
  return []
}

// Save tours to file
const saveFallbackTours = (tours: Tour[]) => {
  try {
    ensureDataDir()
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(tours, null, 2))
    console.log('Tours saved to fallback file:', FALLBACK_FILE)
  } catch (error) {
    console.error('Error saving fallback tours:', error)
  }
}

export async function GET() {
  try {
    console.log('GET /api/tours - Fetching tours from Supabase...')
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, using fallback data')
      const fallbackTours = loadFallbackTours()
      console.log('Loaded fallback tours from file:', fallbackTours.length)
      return NextResponse.json({ 
        success: true, 
        data: fallbackTours.map(tour => ({
          ...tour,
          keyExperiences: tour.keyExperiences || [],
          createdAt: tour.createdAt || new Date().toISOString(),
          updatedAt: tour.updatedAt || new Date().toISOString()
        })), 
        message: 'Tours retrieved from fallback storage' 
      })
    }
    
    const { data, error } = await supabaseAdmin
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('Supabase query result:', { data, error })
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    // Transform database field names to frontend format
    const transformedData = (data || []).map(tour => ({
      ...tour,
      keyExperiences: tour.key_experiences || [],
      createdAt: tour.created_at,
      updatedAt: tour.updated_at
    }))
    
    console.log('Transformed data:', transformedData)
    return NextResponse.json({ success: true, data: transformedData, message: 'Tours retrieved successfully' })
  } catch (error) {
    console.error('API error:', error)
    console.log('Falling back to in-memory storage')
    const fallbackTours = loadFallbackTours()
    console.log('Loaded fallback tours from file (error case):', fallbackTours.length)
    return NextResponse.json({ 
      success: true, 
      data: fallbackTours.map(tour => ({
        ...tour,
        keyExperiences: tour.keyExperiences || [],
        createdAt: tour.createdAt || new Date().toISOString(),
        updatedAt: tour.updatedAt || new Date().toISOString()
      })), 
      message: 'Tours retrieved from fallback storage due to error' 
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('POST /api/tours - Received data:', body)
    
    // Validate required fields
    if (!body.name || !body.duration || !body.price) {
      console.log('Validation failed - missing required fields:', { name: body.name, duration: body.duration, price: body.price })
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique ID
    const id = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    console.log('Generated tour ID:', id)
    
    const newTour = {
      ...body,
      id,
      featured: body.featured ?? false,
      keyExperiences: body.keyExperiences ?? [],
      status: body.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    console.log('Prepared tour data:', newTour)

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, using fallback storage')
      const fallbackTours = loadFallbackTours()
      fallbackTours.push(newTour)
      saveFallbackTours(fallbackTours)
      console.log('Tour added to fallback storage:', newTour)
      console.log('Total tours in fallback storage:', fallbackTours.length)
      return NextResponse.json({ success: true, data: newTour, message: 'Tour created successfully (fallback storage)' }, { status: 201 })
    }

    // Try Supabase first
    const dbTour = {
      ...newTour,
      key_experiences: newTour.keyExperiences,
      created_at: newTour.createdAt,
      updated_at: newTour.updatedAt
    }
    delete dbTour.keyExperiences
    delete dbTour.createdAt
    delete dbTour.updatedAt

    console.log('Prepared tour data for database:', dbTour)

    const { data, error } = await supabaseAdmin.from('tours').insert(dbTour).select().single()
    console.log('Supabase insert result:', { data, error })
    
    if (error) {
      console.error('Supabase error:', error)
      console.log('Falling back to persistent storage')
      const fallbackTours = loadFallbackTours()
      fallbackTours.push(newTour)
      saveFallbackTours(fallbackTours)
      console.log('Tour added to fallback storage (error case):', newTour)
      console.log('Total tours in fallback storage (error case):', fallbackTours.length)
      return NextResponse.json({ success: true, data: newTour, message: 'Tour created successfully (fallback storage)' }, { status: 201 })
    }
    
    console.log('Tour created successfully in Supabase:', data)
    return NextResponse.json({ success: true, data: newTour, message: 'Tour created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Create tour error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create tour' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    console.log('PUT /api/tours - Received update data:', { id, updateData })

    if (!id) {
      console.log('Validation failed - missing tour ID')
      return NextResponse.json(
        { success: false, message: 'Tour ID is required' },
        { status: 400 }
      )
    }

    // Prepare the updated tour data
    const updatedTour = {
      ...updateData,
      id,
      updatedAt: new Date().toISOString()
    }
    console.log('Prepared updated tour data:', updatedTour)

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, using fallback storage for update')
      const fallbackTours = loadFallbackTours()
      const tourIndex = fallbackTours.findIndex(tour => tour.id === id)
      if (tourIndex === -1) {
        console.log('Tour not found in fallback storage:', id)
        return NextResponse.json(
          { success: false, message: 'Tour not found' },
          { status: 404 }
        )
      }
      
      fallbackTours[tourIndex] = { ...fallbackTours[tourIndex], ...updatedTour }
      saveFallbackTours(fallbackTours)
      console.log('Tour updated in fallback storage:', fallbackTours[tourIndex])
      console.log('Total tours in fallback storage after update:', fallbackTours.length)
      return NextResponse.json({ 
        success: true, 
        data: fallbackTours[tourIndex], 
        message: 'Tour updated successfully (fallback storage)' 
      })
    }

    // Try Supabase first
    const dbUpdateData = {
      ...updateData,
      key_experiences: updateData.keyExperiences,
      updated_at: new Date().toISOString()
    }
    delete dbUpdateData.keyExperiences
    delete dbUpdateData.createdAt
    delete dbUpdateData.updatedAt

    console.log('Prepared tour data for database update:', dbUpdateData)

    const { data, error } = await supabaseAdmin
      .from('tours')
      .update(dbUpdateData)
      .eq('id', id)
      .select('*')
      .single()

    console.log('Supabase update result:', { data, error })

    if (error) {
      console.error('Supabase error:', error)
      console.log('Falling back to persistent storage for update')
      
      const fallbackTours = loadFallbackTours()
      const tourIndex = fallbackTours.findIndex(tour => tour.id === id)
    if (tourIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      )
    }

      fallbackTours[tourIndex] = { ...fallbackTours[tourIndex], ...updatedTour }
      saveFallbackTours(fallbackTours)
      console.log('Tour updated in fallback storage (error case):', fallbackTours[tourIndex])
      console.log('Total tours in fallback storage after update (error case):', fallbackTours.length)
      return NextResponse.json({ 
        success: true, 
        data: fallbackTours[tourIndex], 
        message: 'Tour updated successfully (fallback storage)' 
      })
    }

    // Transform back to frontend format
    const transformedData = {
      ...data,
      keyExperiences: data.key_experiences || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    console.log('Tour updated successfully in Supabase:', transformedData)
    return NextResponse.json({ 
      success: true, 
      data: transformedData, 
      message: 'Tour updated successfully' 
    })
  } catch (error) {
    console.error('Update tour error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update tour' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Tour ID is required' },
        { status: 400 }
      )
    }

    console.log('DELETE /api/tours - Deleting tour with ID:', id)

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, using fallback storage')
      const fallbackTours = loadFallbackTours()
      const initialLength = fallbackTours.length
      const filteredTours = fallbackTours.filter(tour => tour.id !== id)
      
      if (filteredTours.length === initialLength) {
        console.log('Tour not found in fallback storage:', id)
        return NextResponse.json(
          { success: false, message: 'Tour not found' },
          { status: 404 }
        )
      }
      
      saveFallbackTours(filteredTours)
      console.log('Tour deleted from fallback storage:', id)
      console.log('Remaining tours in fallback storage:', filteredTours.length)
      return NextResponse.json({ success: true, data: { id }, message: 'Tour deleted successfully (fallback storage)' })
    }

    const { error } = await supabaseAdmin.from('tours').delete().eq('id', id)
    if (error) {
      console.error('Supabase delete error:', error)
      throw error
    }
    console.log('Tour deleted successfully from Supabase:', id)
    return NextResponse.json({ success: true, data: { id }, message: 'Tour deleted successfully' })
  } catch (error) {
    console.error('Delete tour error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete tour' },
      { status: 500 }
    )
  }
}
