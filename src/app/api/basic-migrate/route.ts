import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    console.log('Starting basic migration of tours to Supabase...')
    
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
    
    // First, clear existing tours to avoid duplicates
    console.log('Clearing existing tours...')
    const { error: deleteError } = await supabaseAdmin
      .from('tours')
      .delete()
      .neq('id', '') // Delete all records
    
    if (deleteError) {
      console.error('Error clearing tours:', deleteError)
    } else {
      console.log('Existing tours cleared')
    }
    
    for (const tour of toursData) {
      try {
        // Create basic tour with only existing columns
        const basicTour = {
          id: tour.id || `tour-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: tour.name || 'Untitled Tour',
          duration: tour.duration || '1 Day',
          price: tour.price || '0',
          description: tour.description || 'Tour description',
          transportation: tour.transportation || 'Air conditioned car or van',
          groupsize: tour.groupSize || 'Private / Group Tour',
          difficulty: tour.difficulty || 'Moderate',
          besttime: tour.bestTime || 'Year Round',
          status: tour.status || 'active',
          featured: tour.featured || false
        }
        
        // Insert into Supabase
        const { data, error } = await supabaseAdmin
          .from('tours')
          .insert(basicTour)
          .select()
          .single()
        
        if (error) {
          console.error(`Error inserting tour ${tour.name}:`, error)
          errors.push({ tour: tour.name, error: error.message })
        } else {
          console.log(`Successfully migrated basic tour: ${tour.name}`)
          migratedTours.push(data)
        }
      } catch (error) {
        console.error(`Error processing tour ${tour.name}:`, error)
        errors.push({ tour: tour.name, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Basic migration finished. ${migratedTours.length} tours migrated successfully.`,
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
