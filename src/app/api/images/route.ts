import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { ensureBucketExists, BUCKET_NAME } from '@/lib/supabaseStorage'
import fs from 'fs'
import path from 'path'

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
    console.log('GET /api/images - Fetching images...')
    
    const images: ImageMetadata[] = []
    
    // Try to fetch from Supabase first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && supabaseServiceKey && 
        supabaseUrl !== 'https://placeholder.supabase.co' && 
        supabaseServiceKey !== 'placeholder-service-key') {
      
      console.log('Attempting to fetch from Supabase...')
      
      // Ensure bucket exists
      const bucketCheck = await ensureBucketExists()
      if (!bucketCheck.success && bucketCheck.error) {
        console.error('Bucket check failed:', bucketCheck.error)
      }

      // Fetch images from Supabase storage
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .list('main/images', {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (!listError && files && files.length > 0) {
        console.log('Found files in Supabase storage:', files.length)
        
        for (const file of files) {
          try {
            // Get public URL
            const { data: urlData } = supabaseAdmin.storage
              .from(BUCKET_NAME)
              .getPublicUrl(`main/images/${file.name}`)

            const imageData: ImageMetadata = {
              id: file.id || uuidv4(),
              name: file.name,
              originalName: file.name,
              fileName: file.name,
              url: urlData.publicUrl,
              size: getFileSize(file.metadata?.size || 0),
              sizeBytes: file.metadata?.size || 0,
              dimensions: 'Unknown',
              category: 'General',
              uploadedAt: file.created_at || new Date().toISOString(),
              usedIn: []
            }

            images.push(imageData)
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error)
          }
        }
      } else if (listError) {
        console.error('Error listing files from Supabase storage:', listError.message)
      }
    }
    
    // Also fetch local images from public/uploads (priority for local dev)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Clear Supabase images and only use local ones for now
    images.length = 0
    
    if (fs.existsSync(uploadsDir)) {
      try {
        const localFiles = fs.readdirSync(uploadsDir)
        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        
        console.log('Reading local uploads directory, found', localFiles.length, 'files')
        
        for (const fileName of localFiles) {
          const ext = path.extname(fileName).toLowerCase()
          if (imageExts.includes(ext)) {
            const filePath = path.join(uploadsDir, fileName)
            const stats = fs.statSync(filePath)
            
            const imageData: ImageMetadata = {
              id: uuidv4(),
              name: fileName,
              originalName: fileName,
              fileName: fileName,
              url: `/uploads/${fileName}`, // Local URL
              size: getFileSize(stats.size),
              sizeBytes: stats.size,
              dimensions: 'Unknown',
              category: 'General',
              uploadedAt: stats.birthtime.toISOString(),
              usedIn: []
            }
            
            images.push(imageData)
            console.log('Added local image:', fileName)
          }
        }
      } catch (error) {
        console.error('Error reading local uploads:', error)
      }
    }
    
    console.log('Total images found:', images.length)
    
    return NextResponse.json({ 
      success: true, 
      data: images,
      message: `Retrieved ${images.length} images` 
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

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${uuidv4()}.${fileExtension}`

    // Convert file to buffer
    const buffer = await file.arrayBuffer()

    // Save to local public/uploads directory first
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    
    const localPath = path.join(uploadsDir, fileName)
    fs.writeFileSync(localPath, Buffer.from(buffer))
    console.log('Image saved to local storage:', localPath)

    const localUrl = `/uploads/${fileName}`

    // Try to upload to Supabase as backup (optional - don't fail if it doesn't work)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let supabaseUrl_final = localUrl
    
    if (supabaseUrl && supabaseServiceKey && 
        supabaseUrl !== 'https://placeholder.supabase.co' && 
        supabaseServiceKey !== 'placeholder-service-key') {
      
      try {
        console.log('Attempting to upload to Supabase as backup...')
        
        const bucketCheck = await ensureBucketExists()
        if (!bucketCheck.success) {
          console.log('Bucket check failed, skipping Supabase upload')
        } else {
          const supabasePath = `main/images/${fileName}`
          
        // Upload to Supabase as backup
        const { error: uploadError } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(supabasePath, buffer, {
              contentType: file.type,
              upsert: true // Allow overwriting
            })

          if (!uploadError) {
            // Get Supabase URL
            const { data: urlData } = supabaseAdmin.storage
              .from(BUCKET_NAME)
              .getPublicUrl(supabasePath)
            supabaseUrl_final = urlData.publicUrl
            console.log('Image also uploaded to Supabase as backup')
          } else {
            console.log('Supabase upload failed, will use local storage only:', uploadError.message)
          }
        }
      } catch (supabaseError: unknown) {
        console.log('Error uploading to Supabase, using local storage only:', (supabaseError as Error).message)
        // Continue with local storage - don't fail the request
      }
    } else {
      console.log('Supabase not configured, saving to local storage only')
    }

    // Create image metadata
    const imageData: ImageMetadata = {
      id: uuidv4(),
      name: file.name,
      originalName: file.name,
      fileName: fileName,
      url: supabaseUrl_final,
      size: getFileSize(file.size),
      sizeBytes: file.size,
      dimensions: 'Unknown',
      category: category,
      uploadedAt: new Date().toISOString(),
      usedIn: []
    }

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

    // Delete from local storage
    const localPath = path.join(process.cwd(), 'public', 'uploads', fileName)
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath)
      console.log('Deleted from local storage:', fileName)
    }

    // Also try to delete from Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && supabaseServiceKey && 
        supabaseUrl !== 'https://placeholder.supabase.co' && 
        supabaseServiceKey !== 'placeholder-service-key') {
      
      const filePath = `main/images/${fileName}`

      // Delete from Supabase storage
      const { error: deleteError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([filePath])

      if (deleteError) {
        console.error('Error deleting from Supabase storage:', deleteError)
      } else {
        console.log('Deleted from Supabase storage:', fileName)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
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
