import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    console.log('Starting simple migration of tours to Supabase...')
    
    // Load tours from file
    const FALLBACK_FILE = path.join(process.cwd(), 'data', 'tours.json')
    
    if (!fs.existsSync(FALLBACK_FILE)) {
      return NextResponse.json({ 
        success: false, 
        message: 'No tours file found' 
      })
    }
    
    const toursData = JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8'))
    console.log(`Found ${toursData.length} tours in file`)
    
    const migratedTours = []
    const errors = []
    
    for (const tour of toursData) {
      try {
        // Create a simple tour with minimal required fields
        const simpleTour = {
          id: tour.id || `tour-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: tour.name || 'Untitled Tour',
          duration: tour.duration || '1 Day',
          price: tour.price || '0',
          description: tour.description || 'Tour description',
          transportation: 'Air conditioned car or van',
          groupsize: 'Private / Group Tour',
          difficulty: 'Moderate',
          besttime: 'Year Round',
          status: 'active',
          featured: false
        }
        
        // Insert into Supabase
        const { data, error } = await supabaseAdmin
          .from('tours')
          .insert(simpleTour)
          .select()
          .single()
        
        if (error) {
          console.error(`Error inserting tour ${tour.name}:`, error)
          errors.push({ tour: tour.name, error: error.message })
        } else {
          console.log(`Successfully migrated tour: ${tour.name}`)
          migratedTours.push(data)
        }
      } catch (error) {
        console.error(`Error processing tour ${tour.name}:`, error)
        errors.push({ tour: tour.name, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Migration completed. ${migratedTours.length} tours migrated successfully.`,
      migratedCount: migratedTours.length,
      totalTours: toursData.length,
      errors: errors.length > 0 ? errors : null
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}