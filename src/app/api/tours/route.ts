import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'

interface SupabaseError {
  code?: string
  message: string
  details?: string
  hint?: string
}

interface SupabaseResponse<T> {
  data: T | null
  error: SupabaseError | null
}

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
  highlights?: string[]
  keyExperiences?: string[]
  key_experiences?: string[]
  itinerary?: Record<string, unknown>[]
  inclusions?: string[]
  exclusions?: string[]
  accommodation?: Record<string, unknown>[]
  importantInfo?: Record<string, unknown>
  style?: string
  featured?: boolean
  status?: string
  createdAt?: string
  created_at?: string
  createdat?: string
  updatedAt?: string
  updated_at?: string
  updatedat?: string
  description?: string
  transportation?: string
  groupSize?: string
  difficulty?: string
  destinationsRoute?: string
  destinations_route?: string
  includingAll?: string
  including_all?: string
}

// Persistent file-based storage for fallback
const FALLBACK_FILE = path.join(process.cwd(), 'data', 'tours.json')

// In-memory cache for better performance
let toursCache: Tour[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load tours from file with caching
const loadFallbackTours = (): Tour[] => {
  try {
    ensureDataDir()
    
    // Check if we have valid cached data
    const now = Date.now()
    if (toursCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Using cached tours data')
      return toursCache
    }
    
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8')
      const tours = JSON.parse(data)
      
      // Update cache
      toursCache = tours
      cacheTimestamp = now
      
      console.log('Loaded tours from file and cached:', tours.length)
      return tours
    }
  } catch (error) {
    console.error('Error loading fallback tours:', error)
  }
  return []
}

// Save tours to file and update cache
const saveFallbackTours = (tours: Tour[]) => {
  try {
    ensureDataDir()
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(tours, null, 2))
    
    // Update cache
    toursCache = tours
    cacheTimestamp = Date.now()
    
    console.log('Tours saved to fallback file and cache updated:', tours.length)
  } catch (error) {
    console.error('Error saving fallback tours:', error)
  }
}

// Clear cache when data is modified
// const clearCache = () => {
//   toursCache = null
//   cacheTimestamp = 0
// }

export async function GET() {
  const startTime = Date.now()
  
  try {
    console.log('GET /api/tours - Starting request...')
    
    // Check if Supabase is configured
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.SUPABASE_SERVICE_ROLE_KEY &&
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                                process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-service-key' &&
                                process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co')
    
    console.log('Supabase configuration check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      isConfigured: isSupabaseConfigured
    })
    
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, using fallback data')
      const fallbackTours = loadFallbackTours()
      const responseTime = Date.now() - startTime
      console.log(`Loaded ${fallbackTours.length} fallback tours in ${responseTime}ms`)
      
      return NextResponse.json({ 
        success: true, 
        data: fallbackTours.map(tour => ({
          ...tour,
          keyExperiences: tour.keyExperiences || [],
          createdAt: tour.createdAt || new Date().toISOString(),
          updatedAt: tour.updatedAt || new Date().toISOString()
        })), 
        message: 'Tours retrieved from fallback storage',
        responseTime: `${responseTime}ms`
      })
    }
    
    console.log('Attempting Supabase query...')
    
    // Try Supabase with timeout
    const supabasePromise = supabaseAdmin
      .from('tours')
      .select('*')
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase query timeout')), 3000)
    )
    
          const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as SupabaseResponse<Tour[]>
    
    console.log('Supabase query result:', { 
      dataCount: data?.length || 0, 
      error: error ? { code: error.code, message: error.message } : null 
    })
    
    if (error) {
      console.error('Supabase error details:', error)
      throw error
    }
    
    let toursData = data
    
    // If Supabase is empty but we have fallback data, migrate it
    if ((!toursData || toursData.length === 0) && loadFallbackTours().length > 0) {
      console.log('Supabase is empty, migrating fallback tours...')
      const fallbackTours = loadFallbackTours()
      
      for (const tour of fallbackTours.slice(0, 3)) { // Migrate first 3 tours
        try {
          const simpleTour = {
            id: tour.id,
            name: tour.name,
            duration: tour.duration,
            price: tour.price,
            description: tour.description || 'Tour description',
            transportation: tour.transportation || 'Air conditioned car or van',
            groupsize: tour.groupSize || 'Private / Group Tour',
            difficulty: tour.difficulty || 'Moderate',
            status: tour.status || 'active',
            featured: tour.featured || false
          }
          
          await supabaseAdmin.from('tours').insert(simpleTour)
          console.log(`Migrated tour: ${tour.name}`)
        } catch (migrateError) {
          console.error(`Failed to migrate tour ${tour.name}:`, migrateError)
        }
      }
      
      // Retry the query after migration
      const { data: newData, error: newError } = await supabaseAdmin
        .from('tours')
        .select('*')
        .order('createdat', { ascending: false })
      
      if (!newError && newData) {
        toursData = newData
        console.log(`After migration: ${toursData.length} tours in Supabase`)
      }
    }
    
          // Transform database field names to frontend format
          const transformedData = (toursData || []).map((tour: Tour) => ({
      ...tour,
      keyExperiences: tour.key_experiences || [],
      createdAt: tour.createdat || tour.createdAt,
      updatedAt: tour.updatedat || tour.updatedAt,
      destinations: tour.destinations || [],
      highlights: tour.highlights || [],
      itinerary: tour.itinerary || [],
      inclusions: tour.inclusions || [],
      exclusions: tour.exclusions || [],
      accommodation: tour.accommodation || [],
      images: tour.images || [],
      importantInfo: tour.importantInfo || {},
      style: tour.style || 'Adventure',
      rating: tour.rating || 0,
      reviews: tour.reviews || 0,
      destinationsRoute: tour.destinations_route || '',
      includingAll: tour.including_all || ''
    }))
    
    const responseTime = Date.now() - startTime
    console.log(`Retrieved ${transformedData.length} tours from Supabase in ${responseTime}ms`)
    
    return NextResponse.json({ 
      success: true, 
      data: transformedData, 
      message: 'Tours retrieved successfully',
      responseTime: `${responseTime}ms`
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('API error:', error)
    console.log('Falling back to cached storage')
    
    const fallbackTours = loadFallbackTours()
    console.log(`Loaded ${fallbackTours.length} fallback tours from cache in ${responseTime}ms`)
    
    return NextResponse.json({ 
      success: true, 
      data: fallbackTours.map(tour => ({
        ...tour,
        keyExperiences: tour.keyExperiences || [],
        createdAt: tour.createdAt || new Date().toISOString(),
        updatedAt: tour.updatedAt || new Date().toISOString()
      })), 
      message: 'Tours retrieved from fallback storage due to error',
      responseTime: `${responseTime}ms`
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
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.SUPABASE_SERVICE_ROLE_KEY &&
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                                process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-service-key'
    
    if (!isSupabaseConfigured) {
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
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.SUPABASE_SERVICE_ROLE_KEY &&
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                                process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-service-key'
    
    if (!isSupabaseConfigured) {
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
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.SUPABASE_SERVICE_ROLE_KEY &&
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                                process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-service-key'
    
    if (!isSupabaseConfigured) {
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
