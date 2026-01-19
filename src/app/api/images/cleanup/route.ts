import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { BUCKET_NAME } from '@/lib/supabaseStorage'
import fs from 'fs'
import path from 'path'

// Helper function to check if an image URL is from uploaded images
function isUploadedImage(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  // Check if it's a local upload path
  if (url.startsWith('/uploads/')) return true
  
  // Check if it's from Supabase storage (your bucket)
  if (url.includes('supabase.co') && url.includes(`storage/v1/object/public/${BUCKET_NAME}`)) return true
  
  // Check if it's from your Supabase storage bucket
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && url.includes(supabaseUrl) && url.includes('storage')) return true
  
  // Everything else is considered external
  return false
}

// Get uploaded images directly (same logic as images API)
async function getUploadedImages(): Promise<string[]> {
  const uploadedUrls: string[] = []
  
  // Get local uploads
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (fs.existsSync(uploadsDir)) {
    const localFiles = fs.readdirSync(uploadsDir)
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    
    for (const fileName of localFiles) {
      const ext = path.extname(fileName).toLowerCase()
      if (imageExts.includes(ext)) {
        uploadedUrls.push(`/uploads/${fileName}`)
      }
    }
  }
  
  // Get Supabase images if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (supabaseUrl && supabaseKey && supabaseUrl.includes('supabase.co')) {
    try {
      const { data: files } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .list('main/images', { limit: 1000 })
      
      if (files) {
        for (const file of files) {
          const { data: urlData } = supabaseAdmin.storage
            .from(BUCKET_NAME)
            .getPublicUrl(`main/images/${file.name}`)
          if (urlData?.publicUrl) {
            uploadedUrls.push(urlData.publicUrl)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Supabase images:', error)
    }
  }
  
  return uploadedUrls
}

export async function POST() {
  try {
    console.log('Starting image cleanup - removing external URLs...')
    
    // Get all uploaded images to verify what's valid
    const uploadedImageUrls = await getUploadedImages()
    const uploadedImageUrlsSet = new Set(uploadedImageUrls)
    
    console.log(`Found ${uploadedImageUrlsSet.size} uploaded images`)
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const isSupabaseConfigured = supabaseUrl && 
                                supabaseKey &&
                                supabaseUrl !== 'https://placeholder.supabase.co' &&
                                supabaseKey !== 'placeholder-service-key' &&
                                supabaseUrl.includes('supabase.co')
    
    if (!isSupabaseConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured. Cannot clean up database images.'
      }, { status: 500 })
    }
    
    const cleanupResults = {
      tours: { updated: 0, removed: 0 },
      destinations: { updated: 0, removed: 0 },
      itinerary: { updated: 0, removed: 0 }
    }
    
    // Clean up tours
    console.log('Cleaning up tour images...')
    const { data: tours, error: toursError } = await supabaseAdmin
      .from('tours')
      .select('id, images, itinerary')
    
    if (toursError) {
      console.error('Error fetching tours:', toursError)
    } else if (tours) {
      for (const tour of tours) {
        let needsUpdate = false
        const updatedTour: { images?: string[], itinerary?: unknown[] } = {}
        
        // Clean tour images array
        if (tour.images && Array.isArray(tour.images)) {
          const originalImages = tour.images.length
          const cleanedImages = tour.images.filter((img: string) => {
            const isValid = isUploadedImage(img) || uploadedImageUrlsSet.has(img)
            if (!isValid) {
              cleanupResults.tours.removed++
              console.log(`Removing external image from tour ${tour.id}: ${img}`)
            }
            return isValid
          })
          
          if (cleanedImages.length !== originalImages) {
            updatedTour.images = cleanedImages
            needsUpdate = true
            cleanupResults.tours.updated++
          }
        }
        
        // Clean itinerary day images
        if (tour.itinerary && Array.isArray(tour.itinerary)) {
          const cleanedItinerary = tour.itinerary.map((day: { image?: string; [key: string]: unknown }) => {
            if (day.image && !isUploadedImage(day.image) && !uploadedImageUrlsSet.has(day.image)) {
              cleanupResults.itinerary.removed++
              console.log(`Removing external image from tour ${tour.id} day: ${day.image}`)
              return { ...day, image: '' }
            }
            return day
          })
          
          // Check if any day images were removed
          const hadChanges = cleanedItinerary.some((day: { image?: string }, index: number) => {
            const originalDay = tour.itinerary[index] as { image?: string }
            return day.image !== originalDay?.image
          })
          
          if (hadChanges) {
            updatedTour.itinerary = cleanedItinerary
            needsUpdate = true
            cleanupResults.itinerary.updated++
          }
        }
        
        // Update tour if needed
        if (needsUpdate) {
          const { error: updateError } = await supabaseAdmin
            .from('tours')
            .update(updatedTour)
            .eq('id', tour.id)
          
          if (updateError) {
            console.error(`Error updating tour ${tour.id}:`, updateError)
          } else {
            console.log(`Updated tour ${tour.id}`)
          }
        }
      }
    }
    
    // Clean up destinations
    console.log('Cleaning up destination images...')
    const { data: destinations, error: destError } = await supabaseAdmin
      .from('destinations')
      .select('id, image')
    
    if (destError) {
      console.error('Error fetching destinations:', destError)
    } else if (destinations) {
      for (const dest of destinations) {
        if (dest.image && !isUploadedImage(dest.image) && !uploadedImageUrlsSet.has(dest.image)) {
          cleanupResults.destinations.removed++
          console.log(`Removing external image from destination ${dest.id}: ${dest.image}`)
          
          const { error: updateError } = await supabaseAdmin
            .from('destinations')
            .update({ image: '' })
            .eq('id', dest.id)
          
          if (updateError) {
            console.error(`Error updating destination ${dest.id}:`, updateError)
          } else {
            cleanupResults.destinations.updated++
            console.log(`Updated destination ${dest.id}`)
          }
        }
      }
    }
    
    const summary = {
      success: true,
      message: 'Image cleanup completed',
      results: {
        tours: {
          updated: cleanupResults.tours.updated,
          imagesRemoved: cleanupResults.tours.removed
        },
        destinations: {
          updated: cleanupResults.destinations.updated,
          imagesRemoved: cleanupResults.destinations.removed
        },
        itinerary: {
          updated: cleanupResults.itinerary.updated,
          imagesRemoved: cleanupResults.itinerary.removed
        },
        totalImagesRemoved: cleanupResults.tours.removed + cleanupResults.destinations.removed + cleanupResults.itinerary.removed,
        totalRecordsUpdated: cleanupResults.tours.updated + cleanupResults.destinations.updated + cleanupResults.itinerary.updated
      }
    }
    
    console.log('Cleanup completed:', summary)
    
    return NextResponse.json(summary)
  } catch (error: unknown) {
    console.error('Image cleanup error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message || 'Failed to clean up images'
    }, { status: 500 })
  }
}

