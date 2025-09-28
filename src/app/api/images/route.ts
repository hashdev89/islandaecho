import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

// Persistent file-based storage for images metadata
const IMAGES_FILE = path.join(process.cwd(), 'data', 'images.json')
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// Ensure directories exist
const ensureDirectories = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

interface ImageMetadata {
  id: string
  name: string
  originalName: string
  fileName: string
  url: string
  size: string
  sizeBytes: number
  dimensions: string
  category: string
  uploadedAt: string
  usedIn: string[]
}

// Load images metadata from file
const loadImages = (): ImageMetadata[] => {
  try {
    ensureDirectories()
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
    ensureDirectories()
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2))
    console.log('Images metadata saved to file:', IMAGES_FILE)
  } catch (error) {
    console.error('Error saving images:', error)
  }
}

// Get file size in human readable format
const getFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get image dimensions
const getImageDimensions = (filePath: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    sharp(filePath)
      .metadata()
      .then((metadata: { width: number; height: number }) => {
        resolve({
          width: metadata.width,
          height: metadata.height
        })
      })
      .catch(reject)
  })
}

export async function GET() {
  try {
    console.log('GET /api/images - Fetching images...')
    const images = loadImages()
    console.log('Loaded images:', images.length)
    
    return NextResponse.json({ 
      success: true, 
      data: images,
      message: 'Images retrieved successfully' 
    })
  } catch (error: unknown) {
    console.error('Images API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/images - Uploading image...')
    
    const formData = await request.formData()
    const file = formData.get('image') as File
    const category = formData.get('category') as string || 'General'
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No image file provided' 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    ensureDirectories()

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const fileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(UPLOAD_DIR, fileName)
    const publicUrl = `/uploads/${fileName}`

    // Save file to disk
    const buffer = await file.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(buffer))

    // Get image dimensions
    let dimensions = 'Unknown'
    try {
      const { width, height } = await getImageDimensions(filePath)
      dimensions = `${width}x${height}`
    } catch (error) {
      console.warn('Could not get image dimensions:', error)
    }

    // Create image metadata
    const imageData: ImageMetadata = {
      id: uuidv4(),
      name: file.name,
      originalName: file.name,
      fileName: fileName,
      url: publicUrl,
      size: getFileSize(file.size),
      sizeBytes: file.size,
      dimensions: dimensions,
      category: category,
      uploadedAt: new Date().toISOString(),
      usedIn: []
    }

    // Save to images metadata file
    const images = loadImages()
    images.push(imageData)
    saveImages(images)

    console.log('Image uploaded successfully:', imageData)
    
    return NextResponse.json({ 
      success: true, 
      data: imageData,
      message: 'Image uploaded successfully' 
    })
  } catch (error: unknown) {
    console.error('Upload image error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}
