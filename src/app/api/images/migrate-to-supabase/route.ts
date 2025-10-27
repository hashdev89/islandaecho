import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Paths
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const IMAGES_FILE = path.join(process.cwd(), 'data', 'images.json')

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

// Load existing images metadata
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

export async function POST() {
  try {
    console.log('Starting image migration to Supabase...')
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseServiceKey === 'placeholder-service-key') {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.' 
      }, { status: 500 })
    }

    // Check if uploads directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ 
        success: false, 
        error: 'No uploads directory found. Nothing to migrate.' 
      }, { status: 404 })
    }

    // Get all files from uploads directory
    const files = fs.readdirSync(UPLOAD_DIR)
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
    })

    console.log(`Found ${imageFiles.length} image files to migrate`)

    if (imageFiles.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No image files found to migrate',
        migratedCount: 0,
        skippedCount: 0
      })
    }

    const migratedImages: ImageMetadata[] = []
    const skippedFiles: string[] = []
    let successCount = 0
    let errorCount = 0

    // Load existing metadata
    const existingImages = loadImages()
    const existingFileNames = new Set(existingImages.map(img => img.fileName))

    for (const fileName of imageFiles) {
      try {
        console.log(`Migrating ${fileName}...`)
        
        const filePath = path.join(UPLOAD_DIR, fileName)
        const fileStats = fs.statSync(filePath)
        const fileBuffer = fs.readFileSync(filePath)
        
        // Check if file already exists in Supabase (by checking existing metadata)
        if (existingFileNames.has(fileName)) {
          console.log(`Skipping ${fileName} - already in metadata`)
          skippedFiles.push(fileName)
          continue
        }

        // Determine file type
        const ext = path.extname(fileName).toLowerCase()
        let contentType = 'image/jpeg'
        if (ext === '.png') contentType = 'image/png'
        else if (ext === '.gif') contentType = 'image/gif'
        else if (ext === '.webp') contentType = 'image/webp'

        // Upload to Supabase storage
        const supabasePath = `main/images/${fileName}`
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data: _uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('isleandecho')
          .upload(supabasePath, fileBuffer, {
            contentType: contentType,
            upsert: false // Don't overwrite existing files
          })

        if (uploadError) {
          console.error(`Error uploading ${fileName}:`, uploadError.message)
          errorCount++
          continue
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('isleandecho')
          .getPublicUrl(supabasePath)

        // Create image metadata
        const imageData: ImageMetadata = {
          id: uuidv4(),
          name: fileName,
          originalName: fileName,
          fileName: fileName,
          url: urlData.publicUrl,
          size: getFileSize(fileStats.size),
          sizeBytes: fileStats.size,
          dimensions: 'Unknown', // We'll get this later if needed
          category: 'General',
          uploadedAt: new Date().toISOString(),
          usedIn: []
        }

        migratedImages.push(imageData)
        successCount++
        console.log(`Successfully migrated ${fileName}`)

      } catch (error) {
        console.error(`Error processing ${fileName}:`, error)
        errorCount++
      }
    }

    // Update images metadata file with migrated images
    if (migratedImages.length > 0) {
      const allImages = [...existingImages, ...migratedImages]
      try {
        fs.writeFileSync(IMAGES_FILE, JSON.stringify(allImages, null, 2))
        console.log(`Updated images metadata file with ${migratedImages.length} new images`)
      } catch (error) {
        console.error('Error updating images metadata file:', error)
      }
    }

    const result = {
      success: true,
      message: `Image migration completed`,
      migratedCount: successCount,
      skippedCount: skippedFiles.length,
      errorCount: errorCount,
      totalFiles: imageFiles.length,
      migratedImages: migratedImages.map(img => ({
        fileName: img.fileName,
        url: img.url,
        size: img.size
      })),
      skippedFiles: skippedFiles
    }

    console.log('Migration result:', result)
    
    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Image migration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log('Checking migration status...')
    
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

    // Check local uploads directory
    const localFiles = fs.existsSync(UPLOAD_DIR) ? fs.readdirSync(UPLOAD_DIR) : []
    const localImageFiles = localFiles.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
    })

    // Check Supabase storage
    const { data: supabaseFiles, error: listError } = await supabaseAdmin.storage
      .from('isleandecho')
      .list('main/images', {
        limit: 1000,
        offset: 0
      })

    if (listError) {
      console.error('Error listing Supabase files:', listError)
      return NextResponse.json({ 
        success: false, 
        error: listError.message 
      }, { status: 500 })
    }

    const supabaseImageFiles = supabaseFiles?.map(file => file.name) || []

    return NextResponse.json({
      success: true,
      localImages: {
        count: localImageFiles.length,
        files: localImageFiles
      },
      supabaseImages: {
        count: supabaseImageFiles.length,
        files: supabaseImageFiles
      },
      needsMigration: localImageFiles.length > 0
    })
  } catch (error: unknown) {
    console.error('Migration status check error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}
