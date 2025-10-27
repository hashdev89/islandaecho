import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { BUCKET_NAME } from '@/lib/supabaseStorage'
import fs from 'fs'
import path from 'path'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const fileName = (await params).id
    console.log('DELETE /api/images/[fileName] - Deleting image:', fileName)
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Delete from local storage
    const localPath = path.join(uploadsDir, fileName)
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath)
      console.log('Deleted local file:', fileName)
    } else {
      console.log('Local file not found:', fileName)
    }
    
    // Also try to delete from Supabase if configured (optional)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && supabaseServiceKey && 
        supabaseUrl !== 'https://placeholder.supabase.co' && 
        supabaseServiceKey !== 'placeholder-service-key') {
      
      try {
        const { data: files } = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .list('main/images', { limit: 1000, offset: 0 })

        const fileToDelete = files?.find(file => file.name === fileName || file.id === fileName)
        
        if (fileToDelete) {
          const supabasePath = `main/images/${fileToDelete.name}`
          await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .remove([supabasePath])
          console.log('Deleted from Supabase:', fileToDelete.name)
        }
      } catch (error) {
        console.log('Error deleting from Supabase (optional):', error)
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

// Note: Image metadata updates are not currently supported for Supabase-stored images
// To update an image, delete and re-upload
