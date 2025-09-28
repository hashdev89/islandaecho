import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Load tours data
const loadTours = (): any[] => {
  try {
    const toursFile = path.join(process.cwd(), 'data', 'tours.json')
    if (fs.existsSync(toursFile)) {
      const data = fs.readFileSync(toursFile, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading tours:', error)
  }
  return []
}

// Load destinations data
const loadDestinations = (): any[] => {
  try {
    const destinationsFile = path.join(process.cwd(), 'data', 'destinations.json')
    if (fs.existsSync(destinationsFile)) {
      const data = fs.readFileSync(destinationsFile, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading destinations:', error)
  }
  return []
}

// Load blog data
const loadBlogs = (): any[] => {
  try {
    const blogFile = path.join(process.cwd(), 'data', 'blog.json')
    if (fs.existsSync(blogFile)) {
      const data = fs.readFileSync(blogFile, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading blogs:', error)
  }
  return []
}

export async function GET() {
  try {
    console.log('GET /api/images/usage - Checking image usage...')
    
    const tours = loadTours()
    const destinations = loadDestinations()
    const blogs = loadBlogs()
    
    // Get all uploaded images
    const imagesFile = path.join(process.cwd(), 'data', 'images.json')
    let images: any[] = []
    if (fs.existsSync(imagesFile)) {
      const data = fs.readFileSync(imagesFile, 'utf8')
      images = JSON.parse(data)
    }
    
    // Track usage for each image
    const imageUsage: { [key: string]: string[] } = {}
    
    images.forEach(image => {
      imageUsage[image.url] = []
      
      // Check tours
      tours.forEach(tour => {
        if (tour.image === image.url) {
          imageUsage[image.url].push(`Tour: ${tour.name}`)
        }
        if (tour.images && Array.isArray(tour.images)) {
          tour.images.forEach((img: string) => {
            if (img === image.url) {
              imageUsage[image.url].push(`Tour: ${tour.name}`)
            }
          })
        }
        // Check itinerary images
        if (tour.itinerary && Array.isArray(tour.itinerary)) {
          tour.itinerary.forEach((day: any) => {
            if (day.image === image.url) {
              imageUsage[image.url].push(`Tour: ${tour.name} (Day ${day.day})`)
            }
          })
        }
      })
      
      // Check destinations
      destinations.forEach(destination => {
        if (destination.image === image.url) {
          imageUsage[image.url].push(`Destination: ${destination.name}`)
        }
      })
      
      // Check blogs
      blogs.forEach(blog => {
        if (blog.image === image.url) {
          imageUsage[image.url].push(`Blog: ${blog.title}`)
        }
      })
    })
    
    console.log('Image usage tracked:', imageUsage)
    
    return NextResponse.json({ 
      success: true, 
      data: imageUsage,
      message: 'Image usage tracked successfully' 
    })
  } catch (error: any) {
    console.error('Image usage API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
