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
            // Validate file has valid metadata (size > 0 indicates file exists)
            if (!file.metadata?.size || file.metadata.size === 0) {
              console.warn(`Skipping file ${file.name} - invalid or missing metadata`)
              continue
            }

            const filePath = `main/images/${file.name}`
            
            // Get public URL first
            const { data: urlData } = supabaseAdmin.storage
              .from(BUCKET_NAME)
              .getPublicUrl(filePath)

            if (!urlData?.publicUrl) {
              console.warn(`Skipping file ${file.name} - could not generate public URL`)
              continue
            }

            // Verify file is accessible by making a HEAD request (non-blocking - log warning but don't skip)
            // This helps identify broken images but doesn't prevent valid images from showing
            try {
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
              
              const headResponse = await fetch(urlData.publicUrl, { 
                method: 'HEAD',
                signal: controller.signal
              })
              
              clearTimeout(timeoutId)
              
              if (!headResponse.ok) {
                console.warn(`Warning: File ${file.name} returned HTTP ${headResponse.status} - may not be accessible`)
                // Don't skip - still include it, let the frontend handle broken images
              }
            } catch (fetchError) {
              // Log warning but don't skip - network issues shouldn't prevent images from showing
              console.warn(`Warning: Could not verify accessibility for ${file.name}: ${(fetchError as Error).message}`)
            }

            const imageData: ImageMetadata = {
              id: file.id || uuidv4(),
              name: file.name,
              originalName: file.name,
              fileName: file.name,
              url: urlData.publicUrl,
              size: getFileSize(file.metadata.size),
              sizeBytes: file.metadata.size,
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
    
    // Fetch local images as fallback (only in non-serverless environments)
    // This allows local images to show while migrating to Supabase
    const isServerless = process.cwd().includes('/var/task') || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    const supabaseConfigured = supabaseUrl && supabaseServiceKey && 
        supabaseUrl !== 'https://placeholder.supabase.co' && 
        supabaseServiceKey !== 'placeholder-service-key'
    
    // Show local images as fallback in development (not in serverless)
    // In production (serverless), only Supabase images will be shown
    if (!isServerless) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      
      if (fs.existsSync(uploadsDir)) {
        try {
          const localFiles = fs.readdirSync(uploadsDir)
          const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
          
          console.log('Reading local uploads directory (Supabase not configured), found', localFiles.length, 'files')
          
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
      } else {
        console.log('No local uploads directory found')
      }
    } else {
      console.log('Serverless environment detected, skipping local file reading')
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

    // Check if we're in a serverless environment (read-only filesystem)
    const isServerless = process.cwd().includes('/var/task') || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    let localUrl: string | null = null

    // Only try to save locally if not in serverless environment
    if (!isServerless) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }
        
        const localPath = path.join(uploadsDir, fileName)
        fs.writeFileSync(localPath, Buffer.from(buffer))
        console.log('Image saved to local storage:', localPath)
        localUrl = `/uploads/${fileName}`
      } catch (localError: unknown) {
        console.log('Local storage not available (likely serverless environment), will use Supabase only:', (localError as Error).message)
      }
    } else {
      console.log('Serverless environment detected, skipping local file storage')
    }

    // Upload to Supabase (required in serverless, optional in local dev)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let supabaseUrl_final: string | null = null
    
    if (supabaseUrl && supabaseServiceKey && 
        supabaseUrl !== 'https://placeholder.supabase.co' && 
        supabaseServiceKey !== 'placeholder-service-key') {
      
      try {
        console.log('Uploading to Supabase storage...')
        
        const bucketCheck = await ensureBucketExists()
        if (!bucketCheck.success) {
          console.error('Bucket check failed:', bucketCheck.error)
          if (isServerless) {
            // In serverless, Supabase is required
            return NextResponse.json({ 
              success: false, 
              error: 'Supabase storage not available. Cannot upload in serverless environment without Supabase.' 
            }, { status: 500 })
          }
        } else {
          const supabasePath = `main/images/${fileName}`
          
          // Upload to Supabase
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
            console.log('Image uploaded to Supabase storage')
          } else {
            console.error('Supabase upload failed:', uploadError.message)
            if (isServerless) {
              // In serverless, Supabase is required
              return NextResponse.json({ 
                success: false, 
                error: `Failed to upload to Supabase: ${uploadError.message}` 
              }, { status: 500 })
            }
          }
        }
      } catch (supabaseError: unknown) {
        console.error('Error uploading to Supabase:', (supabaseError as Error).message)
        if (isServerless) {
          // In serverless, Supabase is required
          return NextResponse.json({ 
            success: false, 
            error: `Failed to upload to Supabase: ${(supabaseError as Error).message}` 
          }, { status: 500 })
        }
      }
    } else {
      if (isServerless) {
        // In serverless, Supabase is required
        return NextResponse.json({ 
          success: false, 
          error: 'Supabase not configured. Cannot upload in serverless environment without Supabase.' 
        }, { status: 500 })
      }
      console.log('Supabase not configured, using local storage only')
    }

    // Determine final URL (prefer Supabase, fallback to local)
    const finalUrl = supabaseUrl_final || localUrl
    if (!finalUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to upload image: no storage available' 
      }, { status: 500 })
    }

    // Create image metadata
    const imageData: ImageMetadata = {
      id: uuidv4(),
      name: file.name,
      originalName: file.name,
      fileName: fileName,
      url: finalUrl,
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

    // Delete from local storage (only in non-serverless environments)
    const isServerless = process.cwd().includes('/var/task') || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    
    if (!isServerless) {
      try {
        const localPath = path.join(process.cwd(), 'public', 'uploads', fileName)
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath)
          console.log('Deleted from local storage:', fileName)
        }
      } catch (error) {
        console.log('Local storage not available, skipping local delete:', error)
      }
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
