import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

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

// Get file size in human readable format
const getFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export async function GET() {
  try {
    console.log('GET /api/images - Fetching images from Supabase...')
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseServiceKey === 'placeholder-service-key') {
      console.log('Supabase not configured, returning empty array')
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'Supabase not configured' 
      })
    }

    // Fetch images from Supabase storage
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('isleandecho')
      .list('main/images', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (listError) {
      console.error('Error listing files from Supabase storage:', listError)
      return NextResponse.json({ 
        success: false, 
        error: listError.message 
      }, { status: 500 })
    }

    console.log('Found files in Supabase storage:', files?.length || 0)

    // Get public URLs for all files
    const images: ImageMetadata[] = []
    
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          // Get public URL
          const { data: urlData } = supabaseAdmin.storage
            .from('isleandecho')
            .getPublicUrl(`main/images/${file.name}`)

          const imageData: ImageMetadata = {
            id: file.id || uuidv4(),
            name: file.name,
            originalName: file.name,
            fileName: file.name,
            url: urlData.publicUrl,
            size: getFileSize(file.metadata?.size || 0),
            sizeBytes: file.metadata?.size || 0,
            dimensions: 'Unknown', // We'll get this from metadata if available
            category: 'General',
            uploadedAt: file.created_at || new Date().toISOString(),
            usedIn: []
          }

          images.push(imageData)
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
        }
      }
    }

    console.log('Processed images:', images.length)
    
    return NextResponse.json({ 
      success: true, 
      data: images,
      message: `Retrieved ${images.length} images from Supabase storage` 
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
    console.log('POST /api/images - Uploading image to Supabase...')
    
    const formData = await request.formData()
    const file = formData.get('image') as File
    const category = formData.get('category') as string || 'General'
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No image file provided' 
      }, { status: 400 })
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseServiceKey === 'placeholder-service-key') {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase not configured' 
      }, { status: 500 })
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

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `main/images/${fileName}`

    // Convert file to buffer
    const buffer = await file.arrayBuffer()

    // Upload to Supabase storage
    const { data: _uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('isleandecho')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading to Supabase storage:', uploadError)
      return NextResponse.json({ 
        success: false, 
        error: uploadError.message 
      }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('isleandecho')
      .getPublicUrl(filePath)

    // Create image metadata
    const imageData: ImageMetadata = {
      id: uuidv4(),
      name: file.name,
      originalName: file.name,
      fileName: fileName,
      url: urlData.publicUrl,
      size: getFileSize(file.size),
      sizeBytes: file.size,
      dimensions: 'Unknown', // We'll get this later if needed
      category: category,
      uploadedAt: new Date().toISOString(),
      usedIn: []
    }

    console.log('Image uploaded successfully to Supabase:', imageData)
    
    return NextResponse.json({ 
      success: true, 
      data: imageData,
      message: 'Image uploaded successfully to Supabase storage' 
    })
  } catch (error: unknown) {
    console.error('Upload image to Supabase error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')
    
    if (!fileName) {
      return NextResponse.json({ 
        success: false, 
        error: 'File name is required' 
      }, { status: 400 })
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseServiceKey === 'placeholder-service-key') {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase not configured' 
      }, { status: 500 })
    }

    const filePath = `main/images/${fileName}`

    // Delete from Supabase storage
    const { error: deleteError } = await supabaseAdmin.storage
      .from('isleandecho')
      .remove([filePath])

    if (deleteError) {
      console.error('Error deleting from Supabase storage:', deleteError)
      return NextResponse.json({ 
        success: false, 
        error: deleteError.message 
      }, { status: 500 })
    }

    console.log('Image deleted successfully from Supabase:', fileName)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully from Supabase storage' 
    })
  } catch (error: unknown) {
    console.error('Delete image from Supabase error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}
