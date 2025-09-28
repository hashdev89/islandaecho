import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Persistent file-based storage for images metadata
const IMAGES_FILE = path.join(process.cwd(), 'data', 'images.json')
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

interface ImageMetadata {
  id: string
  fileName: string
  name: string
  url: string
  size: string
  sizeBytes: number
  dimensions: string
  category: string
  uploadedAt: string
  updatedAt?: string
  usedIn: string[]
}

// Load images metadata from file
const loadImages = (): ImageMetadata[] => {
  try {
    if (fs.existsSync(IMAGES_FILE)) {
      const data = fs.readFileSync(IMAGES_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading images:', error)
  }
  return []
}

// Save images metadata to file
const saveImages = (images: ImageMetadata[]): void => {
  try {
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2))
    console.log('Images metadata saved to file:', IMAGES_FILE)
  } catch (error) {
    console.error('Error saving images:', error)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const imageId = (await params).id
    console.log('DELETE /api/images/[id] - Deleting image:', imageId)
    
    const images = loadImages()
    const imageIndex = images.findIndex(img => img.id === imageId)
    
    if (imageIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Image not found' 
      }, { status: 404 })
    }
    
    const image = images[imageIndex]
    
    // Delete the physical file
    const filePath = path.join(UPLOAD_DIR, image.fileName)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log('Physical file deleted:', filePath)
    }
    
    // Remove from metadata
    images.splice(imageIndex, 1)
    saveImages(images)
    
    console.log('Image deleted successfully:', imageId)
    
    return NextResponse.json({ 
      success: true, 
      data: image,
      message: 'Image deleted successfully' 
    })
  } catch (error: unknown) {
    console.error('Delete image error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const imageId = (await params).id
    const body = await request.json()
    console.log('PUT /api/images/[id] - Updating image:', imageId, body)
    
    const images = loadImages()
    const imageIndex = images.findIndex(img => img.id === imageId)
    
    if (imageIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Image not found' 
      }, { status: 404 })
    }
    
    // Update image metadata
    images[imageIndex] = { 
      ...images[imageIndex], 
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    saveImages(images)
    
    console.log('Image updated successfully:', imageId)
    
    return NextResponse.json({ 
      success: true, 
      data: images[imageIndex],
      message: 'Image updated successfully' 
    })
  } catch (error: unknown) {
    console.error('Update image error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}
