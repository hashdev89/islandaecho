import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// File paths for SEO data storage
const SEO_DATA_DIR = path.join(process.cwd(), 'data', 'seo')
const META_TAGS_FILE = path.join(SEO_DATA_DIR, 'meta-tags.json')

// Ensure SEO data directory exists
const ensureSEODir = () => {
  if (!fs.existsSync(SEO_DATA_DIR)) {
    fs.mkdirSync(SEO_DATA_DIR, { recursive: true })
  }
}

// Load meta tags from file
const loadMetaTags = (): any[] => {
  try {
    ensureSEODir()
    if (fs.existsSync(META_TAGS_FILE)) {
      const data = fs.readFileSync(META_TAGS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error loading meta tags:', error)
    return []
  }
}

// Save meta tags to file
const saveMetaTags = (metaTags: any[]) => {
  try {
    ensureSEODir()
    fs.writeFileSync(META_TAGS_FILE, JSON.stringify(metaTags, null, 2))
  } catch (error) {
    console.error('Error saving meta tags:', error)
    throw error
  }
}

// Meta Tags API endpoints
export async function GET(request: NextRequest) {
  try {
    const metaTags = loadMetaTags()
    return NextResponse.json({ success: true, data: metaTags })
  } catch (error) {
    console.error('Error loading meta tags:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to load meta tags' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metaTags = loadMetaTags()
    
    const newMetaTag = {
      id: `meta_${Date.now()}`,
      page: body.page,
      title: body.title,
      description: body.description,
      keywords: body.keywords || [],
      ogTitle: body.ogTitle || body.title,
      ogDescription: body.ogDescription || body.description,
      ogImage: body.ogImage || '',
      twitterTitle: body.twitterTitle || body.title,
      twitterDescription: body.twitterDescription || body.description,
      twitterImage: body.twitterImage || body.ogImage || '',
      canonical: body.canonical || '',
      robots: body.robots || 'index,follow',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    metaTags.push(newMetaTag)
    saveMetaTags(metaTags)
    
    return NextResponse.json({ success: true, data: newMetaTag }, { status: 201 })
  } catch (error) {
    console.error('Error creating meta tag:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create meta tag' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const metaTags = loadMetaTags()
    
    const metaTagIndex = metaTags.findIndex(m => m.id === body.id)
    if (metaTagIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Meta tag not found' },
        { status: 404 }
      )
    }
    
    const updatedMetaTag = {
      ...metaTags[metaTagIndex],
      page: body.page,
      title: body.title,
      description: body.description,
      keywords: body.keywords || [],
      ogTitle: body.ogTitle || body.title,
      ogDescription: body.ogDescription || body.description,
      ogImage: body.ogImage || '',
      twitterTitle: body.twitterTitle || body.title,
      twitterDescription: body.twitterDescription || body.description,
      twitterImage: body.twitterImage || body.ogImage || '',
      canonical: body.canonical || '',
      robots: body.robots || 'index,follow',
      updatedAt: new Date().toISOString()
    }
    
    metaTags[metaTagIndex] = updatedMetaTag
    saveMetaTags(metaTags)
    
    return NextResponse.json({ success: true, data: updatedMetaTag })
  } catch (error) {
    console.error('Error updating meta tag:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update meta tag' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Meta tag ID is required' },
        { status: 400 }
      )
    }
    
    const metaTags = loadMetaTags()
    const filteredMetaTags = metaTags.filter(m => m.id !== id)
    
    if (filteredMetaTags.length === metaTags.length) {
      return NextResponse.json(
        { success: false, message: 'Meta tag not found' },
        { status: 404 }
      )
    }
    
    saveMetaTags(filteredMetaTags)
    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('Error deleting meta tag:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete meta tag' },
      { status: 500 }
    )
  }
}
