import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'

// Paths
const DESTINATIONS_FILE = path.join(process.cwd(), 'data', 'destinations.json')

interface Destination {
  id: string
  name: string
  region: string
  lat: number
  lng: number
  description: string
  image: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// Load destinations from file
const loadDestinations = (): Destination[] => {
  try {
    if (fs.existsSync(DESTINATIONS_FILE)) {
      const data = fs.readFileSync(DESTINATIONS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading destinations:', error)
  }
  return []
}

export async function POST() {
  try {
    console.log('Starting destinations migration to Supabase...')
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseServiceKey === 'placeholder-service-key' ||
        !supabaseUrl.includes('supabase.co') ||
        supabaseServiceKey.length <= 50) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.' 
      }, { status: 500 })
    }

    // Load destinations from file
    const fileDestinations = loadDestinations()
    console.log(`Found ${fileDestinations.length} destinations in file`)

    if (fileDestinations.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No destinations found in file to migrate',
        migratedCount: 0,
        skippedCount: 0
      })
    }

    // Get existing destinations from Supabase
    const { data: existingDestinations, error: fetchError } = await supabaseAdmin
      .from('destinations')
      .select('id')

    if (fetchError) {
      console.error('Error fetching existing destinations:', fetchError)
      // Check if table exists or if it's a different error
      if (fetchError.message.includes('relation') || fetchError.message.includes('does not exist')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Destinations table does not exist in Supabase. Please run the schema migration first.' 
        }, { status: 500 })
      }
      throw fetchError
    }

    const existingIds = new Set(existingDestinations?.map(d => d.id) || [])
    console.log(`Found ${existingIds.size} existing destinations in Supabase`)

    // Filter out destinations that already exist
    const destinationsToMigrate = fileDestinations.filter(dest => !existingIds.has(dest.id))
    console.log(`${destinationsToMigrate.length} destinations need to be migrated`)

    if (destinationsToMigrate.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'All destinations already exist in Supabase',
        migratedCount: 0,
        skippedCount: fileDestinations.length
      })
    }

    // Insert destinations in batches
    // First, prepare destinations by removing columns that might not exist
    const prepareDestination = (dest: Destination) => {
      const prepared: Record<string, unknown> = {
        id: dest.id,
        name: dest.name,
        region: dest.region,
        lat: dest.lat,
        lng: dest.lng,
        description: dest.description || '',
        image: dest.image || '',
        status: dest.status || 'active'
      }
      // Only include timestamp columns if they exist in the schema
      // We'll check the schema first
      return prepared
    }

    const BATCH_SIZE = 10
    let successCount = 0
    let errorCount = 0
    const errors: Array<{ destination: string; error: string }> = []

    // First, check what columns exist in the table by trying to get one record
    const { data: sampleData } = await supabaseAdmin
      .from('destinations')
      .select('*')
      .limit(1)
    
    // Check if timestamp columns exist by looking at the sample data structure
    const hasTimestamps = sampleData && sampleData.length > 0 && 
      (sampleData[0]?.created_at !== undefined || sampleData[0]?.updated_at !== undefined)
    
    // If no data exists, we'll try without timestamps first (safer approach)
    // Most Supabase tables have these columns, but if the table was created manually
    // they might not exist
    const useTimestamps = hasTimestamps === true

    for (let i = 0; i < destinationsToMigrate.length; i += BATCH_SIZE) {
      const batch = destinationsToMigrate.slice(i, i + BATCH_SIZE)
      
      // Try inserting one by one to handle schema mismatches
      for (const dest of batch) {
        try {
          // First try with all fields
          let destToInsert: Record<string, unknown> = prepareDestination(dest)
          
          // Try with timestamps first
          if (useTimestamps) {
            destToInsert = {
              ...destToInsert,
              created_at: dest.created_at || new Date().toISOString(),
              updated_at: dest.updated_at || new Date().toISOString()
            }
          }

          const { data, error: insertError } = await supabaseAdmin
            .from('destinations')
            .insert([destToInsert])
            .select()

          if (insertError) {
            // If error is about missing columns, try without timestamps
            if (insertError.message.includes('created_at') || insertError.message.includes('updated_at')) {
              console.log(`Retrying ${dest.name} without timestamp columns...`)
              const destWithoutTimestamps = prepareDestination(dest)
              
              const { data: retryData, error: retryError } = await supabaseAdmin
                .from('destinations')
                .insert([destWithoutTimestamps])
                .select()

              if (retryError) {
                console.error(`Error inserting ${dest.name}:`, retryError)
                errorCount++
                errors.push({ destination: dest.name, error: retryError.message })
              } else {
                successCount++
                console.log(`Successfully migrated ${dest.name} (without timestamps)`)
              }
            } else {
              console.error(`Error inserting ${dest.name}:`, insertError)
              errorCount++
              errors.push({ destination: dest.name, error: insertError.message })
            }
          } else {
            successCount++
            console.log(`Successfully migrated ${dest.name}`)
          }
        } catch (err) {
          errorCount++
          errors.push({ destination: dest.name, error: (err as Error).message })
        }
      }
    }

    const result = {
      success: true,
      message: `Destinations migration completed`,
      migratedCount: successCount,
      skippedCount: existingIds.size,
      errorCount: errorCount,
      totalDestinations: fileDestinations.length,
      migratedDestinations: destinationsToMigrate.slice(0, successCount).map(d => ({
        id: d.id,
        name: d.name,
        region: d.region
      })),
      errors: errors
    }

    console.log('Migration result:', result)
    
    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Destinations migration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log('Checking destinations migration status...')
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseServiceKey === 'placeholder-service-key' ||
        !supabaseUrl.includes('supabase.co') ||
        supabaseServiceKey.length <= 50) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase not configured' 
      }, { status: 500 })
    }

    // Check local destinations file
    const localDestinations = loadDestinations()

    // Check Supabase destinations
    const { data: supabaseDestinations, error: fetchError } = await supabaseAdmin
      .from('destinations')
      .select('id, name, region')

    if (fetchError) {
      console.error('Error fetching Supabase destinations:', fetchError)
      if (fetchError.message.includes('relation') || fetchError.message.includes('does not exist')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Destinations table does not exist in Supabase. Please run the schema migration first.',
          localDestinations: {
            count: localDestinations.length,
            destinations: localDestinations.map(d => ({ id: d.id, name: d.name, region: d.region }))
          }
        }, { status: 500 })
      }
      throw fetchError
    }

    const localIds = new Set(localDestinations.map(d => d.id))
    const supabaseIds = new Set(supabaseDestinations?.map(d => d.id) || [])
    const needsMigration = localDestinations.filter(d => !supabaseIds.has(d.id))

    return NextResponse.json({
      success: true,
      localDestinations: {
        count: localDestinations.length,
        destinations: localDestinations.map(d => ({ id: d.id, name: d.name, region: d.region }))
      },
      supabaseDestinations: {
        count: supabaseDestinations?.length || 0,
        destinations: supabaseDestinations?.map(d => ({ id: d.id, name: d.name, region: d.region })) || []
      },
      needsMigration: needsMigration.length > 0,
      missingInSupabase: needsMigration.length,
      missingDestinations: needsMigration.map(d => ({ id: d.id, name: d.name, region: d.region }))
    })
  } catch (error: unknown) {
    console.error('Migration status check error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

