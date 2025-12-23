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
  keyexperiences?: string[]
  itinerary?: Record<string, unknown>[]
  inclusions?: string[]
  exclusions?: string[]
  accommodation?: string[]
  importantInfo?: Record<string, unknown>
  importantinfo?: Record<string, unknown>
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
  groupsize?: string
  difficulty?: string
  besttime?: string
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

// Embedded fallback tours data for production (Vercel)
const EMBEDDED_FALLBACK_TOURS: Tour[] = [
  {
    "id": "adventure-fun-10-days",
    "name": "Adventure & Fun Tour – 10 Days",
    "duration": "10 Days / 9 Nights",
    "price": "0",
    "destinations": [
      "Colombo",
      "Weligama",
      "Mirissa",
      "Yala National Park",
      "Nuwara Eliya",
      "Kithulgala",
      "Negombo"
    ],
    "highlights": [
      "Jeep safari in Yala National Park",
      "Visit a tea plantation and factory"
    ],
    "keyExperiences": [
      "Visit Galle Face Green",
      "Explore the Lotus Tower",
      "Surfing session (Beginners Welcome)",
      "Visit Coconut Tree Hill",
      "Relaxing at Weligama Beach",
      "Whale watching tour",
      "Bonfire and BBQ night",
      "Visit Rawana Waterfall",
      "Visit Nine Arch Bridge",
      "Little Adam's Peak",
      "Flying Ravana zipline",
      "Scenic train from Ella to Nanu Oya",
      "Jet Ski ride on Lake Gregory"
    ],
    "description": "This 10-day tour is designed for thrill-seekers and energetic travelers who want to experience the best of Sri Lanka with non-stop adventure, fun, and vibrant moments. From partying on the beaches of Weligama and surfing in Mirissa to ziplining in Ella, white-water rafting in Kitulgala, and going on safari in Yala, this itinerary blends nature, nightlife, and excitement. It's the ultimate island getaway for those who love to explore, socialize, and stay active every day.",
    "rating": 5,
    "reviews": 12,
    "featured": true,
    "status": "active",
    "style": "Adventure",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  },
  {
    "id": "cultural-heritage-8-days",
    "name": "Cultural Heritage Tour – 8 Days",
    "duration": "8 Days / 7 Nights",
    "price": "0",
    "destinations": [
      "Colombo",
      "Kandy",
      "Sigiriya",
      "Polonnaruwa",
      "Anuradhapura",
      "Negombo"
    ],
    "highlights": [
      "Visit Temple of the Tooth Relic",
      "Climb Sigiriya Rock Fortress",
      "Explore ancient cities"
    ],
    "keyExperiences": [
      "Visit Gangaramaya Temple",
      "Explore Pettah Market",
      "Watch Cultural Dance Show",
      "Visit Royal Botanical Gardens",
      "Climb Sigiriya Rock Fortress",
      "Visit Dambulla Cave Temple",
      "Explore Polonnaruwa Ancient City",
      "Visit Anuradhapura Sacred City"
    ],
    "description": "Discover the rich cultural heritage of Sri Lanka through this comprehensive 8-day tour. Visit ancient cities, UNESCO World Heritage sites, and experience traditional Sri Lankan culture and history.",
    "rating": 4,
    "reviews": 8,
    "featured": true,
    "status": "active",
    "style": "Cultural",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  },
  {
    "id": "wildlife-safari-6-days",
    "name": "Wildlife Safari Adventure – 6 Days",
    "duration": "6 Days / 5 Nights",
    "price": "0",
    "destinations": [
      "Colombo",
      "Yala National Park",
      "Udawalawe National Park",
      "Mirissa",
      "Negombo"
    ],
    "highlights": [
      "Multiple safari experiences",
      "Whale watching",
      "Elephant encounters"
    ],
    "keyExperiences": [
      "Jeep Safari in Yala National Park",
      "Spot Leopards & Elephants",
      "Bird Watching",
      "Visit Sithulpawwa Rock Temple",
      "Campfire BBQ Experience",
      "Whale Watching Tour",
      "Visit Coconut Tree Hill"
    ],
    "description": "Experience the incredible wildlife of Sri Lanka with this 6-day safari adventure. From spotting leopards in Yala to watching elephants in Udawalawe and whale watching in Mirissa.",
    "rating": 5,
    "reviews": 15,
    "featured": true,
    "status": "active",
    "style": "Wildlife",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
]

// Load tours from file with caching (development) or embedded data (production)
const loadFallbackTours = (): Tour[] => {
  try {
    console.log('loadFallbackTours: Starting to load tours...')
    
    // Check if we have valid cached data
    const now = Date.now()
    if (toursCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Using cached tours data:', toursCache.length)
      return toursCache
    }
    
    // Try to load from file first (development)
    try {
      console.log('Attempting to load from file:', FALLBACK_FILE)
      ensureDataDir()
      if (fs.existsSync(FALLBACK_FILE)) {
        console.log('File exists, reading...')
        const data = fs.readFileSync(FALLBACK_FILE, 'utf8')
        const tours = JSON.parse(data)
        
        console.log('Loaded tours from file:', tours.length, 'tours')
        
        // Update cache
        toursCache = tours
        cacheTimestamp = now
        
        return tours
      } else {
        console.log('File does not exist, using embedded data')
      }
    } catch (fileError) {
      console.log('File system error, using embedded data:', fileError)
    }
    
    // Fallback to embedded data (production/Vercel)
    console.log('Using embedded fallback tours data for production')
    console.log('Embedded tours count:', EMBEDDED_FALLBACK_TOURS.length)
    toursCache = EMBEDDED_FALLBACK_TOURS
    cacheTimestamp = now
    
    return EMBEDDED_FALLBACK_TOURS
  } catch (error) {
    console.error('Error loading fallback tours:', error)
    console.log('Using embedded fallback tours as last resort')
    return EMBEDDED_FALLBACK_TOURS
  }
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
    
    // Check if Supabase is configured (more robust for production)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const isSupabaseConfigured = supabaseUrl && 
                                supabaseKey &&
                                supabaseUrl !== 'https://placeholder.supabase.co' &&
                                supabaseKey !== 'placeholder-service-key' &&
                                supabaseUrl.includes('supabase.co') &&
                                supabaseKey.length > 50 // Basic validation for service key length
    
    console.log('Supabase configuration check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseKey,
      urlValid: supabaseUrl?.includes('supabase.co'),
      keyLength: supabaseKey?.length || 0,
      isConfigured: isSupabaseConfigured,
      environment: process.env.NODE_ENV
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
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        }
      })
    }
    
    console.log('Attempting Supabase query...')
    
    // Try Supabase with timeout (increased for production)
    const supabasePromise = supabaseAdmin
      .from('tours')
      .select('*')
    
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Supabase query timeout after 5 seconds')), 5000)
    )
    
    let supabaseResult: SupabaseResponse<Tour[]>
    try {
      supabaseResult = await Promise.race([supabasePromise, timeoutPromise]) as SupabaseResponse<Tour[]>
    } catch (timeoutError) {
      console.error('Supabase query timed out:', timeoutError)
      console.log('Falling back to embedded tours data due to timeout')
      const fallbackTours = loadFallbackTours()
      const responseTime = Date.now() - startTime
      
      return NextResponse.json({ 
        success: true, 
        data: fallbackTours.map(tour => ({
          ...tour,
          keyExperiences: tour.keyExperiences || [],
          createdAt: tour.createdAt || new Date().toISOString(),
          updatedAt: tour.updatedAt || new Date().toISOString()
        })), 
        message: 'Tours retrieved from fallback storage due to timeout',
        responseTime: `${responseTime}ms`
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        }
      })
    }
    
    const { data, error } = supabaseResult
    
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
      keyExperiences: tour.key_experiences || tour.keyexperiences || [],
      createdAt: tour.createdat || tour.createdAt,
      updatedAt: tour.updatedat || tour.updatedAt,
      destinations: tour.destinations || [],
      highlights: tour.highlights || [],
      itinerary: tour.itinerary || [],
      inclusions: tour.inclusions || [],
      exclusions: tour.exclusions || [],
      accommodation: tour.accommodation || [],
      images: tour.images || [],
      importantInfo: tour.importantinfo || tour.importantInfo || {},
      style: tour.style || 'Adventure',
      rating: tour.rating || 0,
      reviews: tour.reviews || 0,
      destinationsRoute: tour.destinations_route || '',
      includingAll: tour.including_all || ''
    }))
    
    const responseTime = Date.now() - startTime
    console.log(`Retrieved ${transformedData.length} tours from Supabase in ${responseTime}ms`)
    
    // Update cache
    toursCache = transformedData
    cacheTimestamp = Date.now()
    
    return NextResponse.json({ 
      success: true, 
      data: transformedData, 
      message: 'Tours retrieved successfully',
      responseTime: `${responseTime}ms`
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
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
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Failed to parse request body as JSON:', parseError)
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
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

    // Try Supabase first - transform data to match database schema
    // Only include fields that exist in the database
    // Note: created_at, updated_at, best_time, group_size may not exist - skip them
    const dbTour: Record<string, unknown> = {
      id: id,
      name: newTour.name,
      duration: newTour.duration,
      price: newTour.price,
      status: newTour.status || 'draft',
      featured: newTour.featured || false
    }

    // Add optional fields only if they have values
    if (newTour.style) dbTour.style = newTour.style
    if (newTour.description) dbTour.description = newTour.description
    if (newTour.transportation) dbTour.transportation = newTour.transportation
    if (newTour.difficulty) dbTour.difficulty = newTour.difficulty
    
    // Skip timestamp columns (created_at, updated_at) - database likely has defaults or triggers
    // Skip best_time and group_size - they don't exist in this schema

    // Handle array fields - ensure they're arrays
    if (newTour.destinations) {
      dbTour.destinations = Array.isArray(newTour.destinations) 
        ? newTour.destinations 
        : []
    } else {
      dbTour.destinations = []
    }
    
    if (newTour.highlights) {
      dbTour.highlights = Array.isArray(newTour.highlights) 
        ? newTour.highlights 
        : []
    } else {
      dbTour.highlights = []
    }
    
    if (newTour.keyExperiences) {
      dbTour.key_experiences = Array.isArray(newTour.keyExperiences) 
        ? newTour.keyExperiences 
        : []
    } else {
      dbTour.key_experiences = []
    }
    
    if (newTour.inclusions) {
      dbTour.inclusions = Array.isArray(newTour.inclusions) 
        ? newTour.inclusions 
        : []
    } else {
      dbTour.inclusions = []
    }
    
    if (newTour.exclusions) {
      dbTour.exclusions = Array.isArray(newTour.exclusions) 
        ? newTour.exclusions 
        : []
    } else {
      dbTour.exclusions = []
    }
    
    if (newTour.accommodation) {
      dbTour.accommodation = Array.isArray(newTour.accommodation) 
        ? newTour.accommodation 
        : []
    } else {
      dbTour.accommodation = []
    }
    
    if (newTour.images) {
      dbTour.images = Array.isArray(newTour.images) 
        ? newTour.images 
        : []
    } else {
      dbTour.images = []
    }

    // Handle JSONB fields
    if (newTour.itinerary) {
      dbTour.itinerary = Array.isArray(newTour.itinerary) 
        ? newTour.itinerary 
        : []
    } else {
      dbTour.itinerary = []
    }
    
    // Handle importantInfo JSONB field
    if (newTour.importantInfo !== undefined) {
      dbTour.importantInfo = newTour.importantInfo || {}
    }

    console.log('Prepared tour data for database:', JSON.stringify(dbTour, null, 2))

    // Check for duplicate ID first
    const { data: existingTour, error: checkError } = await supabaseAdmin
      .from('tours')
      .select('id')
      .eq('id', id)
      .maybeSingle()
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.warn('Error checking for existing tour:', checkError)
    }
    
    if (existingTour) {
      console.error('Tour with ID already exists:', id)
      // Generate new ID with timestamp
      const newId = `${id}-${Date.now()}`
      dbTour.id = newId
      console.log('Using new ID:', newId)
    }

    console.log('Attempting to insert tour with ID:', dbTour.id)
    const { data, error } = await supabaseAdmin.from('tours').insert(dbTour).select().single()
    
    console.log('Supabase insert result:', { 
      success: !error, 
      data: data ? 'Tour created' : null,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      } : null
    })
    
    if (error) {
      console.error('Supabase insert error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: JSON.stringify(error, null, 2)
      })
      
      // Return error instead of falling back silently
      return NextResponse.json({ 
        success: false, 
        message: `Failed to create tour in database: ${error.message}. Details: ${error.details || 'No details'}. Hint: ${error.hint || 'No hint'}`,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        }
      }, { status: 500 })
    }
    
    if (!data) {
      console.error('No data returned from Supabase insert')
      return NextResponse.json({ 
        success: false, 
        message: 'Tour was inserted but no data was returned from database' 
      }, { status: 500 })
    }
    
    // Transform back to frontend format
    const transformedData = {
      ...data,
      keyExperiences: (data as any).key_experiences || [],
      createdAt: (data as any).created_at || (data as any).createdat || newTour.createdAt || new Date().toISOString(),
      updatedAt: (data as any).updated_at || (data as any).updatedat || newTour.updatedAt || new Date().toISOString(),
      groupSize: (data as any).group_size || (data as any).groupsize || newTour.groupSize || '',
      bestTime: (data as any).best_time || (data as any).besttime || newTour.bestTime || '',
      importantInfo: (data as any).important_info || (data as any).importantInfo || {}
    }
    
    console.log('Tour created successfully in Supabase:', transformedData)
    return NextResponse.json({ 
      success: true, 
      data: transformedData, 
      message: 'Tour created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Create tour error:', error)
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred'
    return NextResponse.json(
      { 
        success: false, 
        message: `Failed to create tour: ${errorMessage}` 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Failed to parse request body as JSON:', parseError)
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
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

    // Try Supabase first - transform data to match database schema
    // Only include columns that exist in the database
    const dbUpdateData: Record<string, unknown> = {
      name: updateData.name,
      duration: updateData.duration,
      price: updateData.price
    }

    // Always include status and featured (they're important for updates)
    if (updateData.status !== undefined) {
      dbUpdateData.status = updateData.status
    } else {
      dbUpdateData.status = 'draft'
    }
    
    if (updateData.featured !== undefined) {
      dbUpdateData.featured = updateData.featured
    } else {
      dbUpdateData.featured = false
    }

    // Add optional fields only if they have values
    if (updateData.style !== undefined) dbUpdateData.style = updateData.style
    if (updateData.description !== undefined) dbUpdateData.description = updateData.description
    if (updateData.transportation !== undefined) dbUpdateData.transportation = updateData.transportation
    if (updateData.difficulty !== undefined) dbUpdateData.difficulty = updateData.difficulty
    
    // Skip timestamp columns (updated_at) - database likely has triggers
    // Skip best_time and group_size - they don't exist in this schema

    // Handle array fields - always include them if they exist in updateData
    if (updateData.destinations !== undefined) {
      dbUpdateData.destinations = Array.isArray(updateData.destinations) 
        ? updateData.destinations 
        : []
    }
    if (updateData.highlights !== undefined) {
      dbUpdateData.highlights = Array.isArray(updateData.highlights) 
        ? updateData.highlights 
        : []
    }
    if (updateData.keyExperiences !== undefined || updateData.key_experiences !== undefined) {
      dbUpdateData.key_experiences = Array.isArray(updateData.keyExperiences || updateData.key_experiences) 
        ? (updateData.keyExperiences || updateData.key_experiences) 
        : []
    }
    if (updateData.inclusions !== undefined) {
      dbUpdateData.inclusions = Array.isArray(updateData.inclusions) 
        ? updateData.inclusions 
        : []
    }
    if (updateData.exclusions !== undefined) {
      dbUpdateData.exclusions = Array.isArray(updateData.exclusions) 
        ? updateData.exclusions 
        : []
    }
    if (updateData.accommodation !== undefined) {
      dbUpdateData.accommodation = Array.isArray(updateData.accommodation) 
        ? updateData.accommodation 
        : []
    }
    if (updateData.images !== undefined) {
      dbUpdateData.images = Array.isArray(updateData.images) 
        ? updateData.images 
        : []
    }

    // Handle JSONB fields
    if (updateData.itinerary !== undefined) {
      dbUpdateData.itinerary = Array.isArray(updateData.itinerary) 
        ? updateData.itinerary 
        : []
    }
    
    // Handle importantInfo JSONB field
    if (updateData.importantInfo !== undefined) {
      dbUpdateData.importantInfo = updateData.importantInfo || {}
    }

    // Remove frontend-only fields
    delete dbUpdateData.keyExperiences
    delete dbUpdateData.createdAt
    delete dbUpdateData.updatedAt
    delete dbUpdateData.id
    delete dbUpdateData.groupSize
    delete dbUpdateData.groupsize
    delete dbUpdateData.bestTime
    delete dbUpdateData.besttime

    console.log('Prepared tour data for database update:', dbUpdateData)

    const { data, error } = await supabaseAdmin
      .from('tours')
      .update(dbUpdateData)
      .eq('id', id)
      .select('*')
      .single()

    console.log('Supabase update result:', { data, error })

    if (error) {
      console.error('Supabase update error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      console.log('Falling back to persistent storage for update')
      
      const fallbackTours = loadFallbackTours()
      const tourIndex = fallbackTours.findIndex(tour => tour.id === id)
    if (tourIndex === -1) {
      return NextResponse.json(
          { 
            success: false, 
            message: `Tour not found. Supabase error: ${error.message}` 
          },
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
        message: `Tour updated successfully (fallback storage). Supabase error: ${error.message}` 
      })
    }

    // Transform back to frontend format
    const transformedData = {
      ...data,
      keyExperiences: (data as any).key_experiences || [],
      createdAt: (data as any).created_at || (data as any).createdat || new Date().toISOString(),
      updatedAt: (data as any).updated_at || (data as any).updatedat || new Date().toISOString(),
      groupSize: (data as any).group_size || (data as any).groupsize || updateData.groupSize || '',
      bestTime: (data as any).best_time || (data as any).besttime || updateData.bestTime || '',
      importantInfo: (data as any).important_info || (data as any).importantInfo || updateData.importantInfo || {}
    }

    console.log('Tour updated successfully in Supabase:', transformedData)
    return NextResponse.json({ 
      success: true, 
      data: transformedData, 
      message: 'Tour updated successfully' 
    })
  } catch (error) {
    console.error('Update tour error:', error)
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred'
    return NextResponse.json(
      { 
        success: false, 
        message: `Failed to update tour: ${errorMessage}` 
      },
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
