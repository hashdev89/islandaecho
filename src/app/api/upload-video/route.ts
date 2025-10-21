import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting video upload to Supabase...')
    
    // Read the video file from public folder
    const videoPath = path.join(process.cwd(), 'public', 'isleandechovideo.mp4')
    
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json(
        { success: false, error: 'Video file not found in public folder' },
        { status: 404 }
      )
    }

    // Read file as buffer
    const videoBuffer = fs.readFileSync(videoPath)
    const fileName = 'isleandechovideo.mp4'
    const supabasePath = `main/video/${fileName}`

    console.log(`Uploading video: ${fileName} to path: ${supabasePath}`)
    console.log(`File size: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`)

    // Upload to Supabase storage
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('isleandecho')
      .upload(supabasePath, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true // Allow overwriting if file exists
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      )
    }

    console.log('Upload successful:', data)

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('isleandecho')
      .getPublicUrl(supabasePath)

    console.log('Public URL:', urlData.publicUrl)

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        path: supabasePath,
        publicUrl: urlData.publicUrl,
        fileName: fileName,
        size: videoBuffer.length
      }
    })

  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get video URL from Supabase storage
    const { data: urlData } = supabaseAdmin.storage
      .from('isleandecho')
      .getPublicUrl('main/video/isleandechovideo.mp4')

    return NextResponse.json({
      success: true,
      videoUrl: urlData.publicUrl
    })
  } catch (error) {
    console.error('Error getting video URL:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get video URL' },
      { status: 500 }
    )
  }
}
