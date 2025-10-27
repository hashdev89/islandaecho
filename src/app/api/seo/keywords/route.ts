/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// File paths for SEO data storage
const SEO_DATA_DIR = path.join(process.cwd(), 'data', 'seo')
const KEYWORDS_FILE = path.join(SEO_DATA_DIR, 'keywords.json')
const META_TAGS_FILE = path.join(SEO_DATA_DIR, 'meta-tags.json')
const ANALYTICS_FILE = path.join(SEO_DATA_DIR, 'analytics.json')

// Ensure SEO data directory exists
const ensureSEODir = () => {
  if (!fs.existsSync(SEO_DATA_DIR)) {
    fs.mkdirSync(SEO_DATA_DIR, { recursive: true })
  }
}

// Load keywords from file
const loadKeywords = (): any[] => {
  try {
    ensureSEODir()
    if (fs.existsSync(KEYWORDS_FILE)) {
      const data = fs.readFileSync(KEYWORDS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error loading keywords:', error)
    return []
  }
}

// Save keywords to file
const saveKeywords = (keywords: any[]) => {
  try {
    ensureSEODir()
    fs.writeFileSync(KEYWORDS_FILE, JSON.stringify(keywords, null, 2))
  } catch (error) {
    console.error('Error saving keywords:', error)
    throw error
  }
}

// Load meta tags from file
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const saveMetaTags = (metaTags: any[]) => {
  try {
    ensureSEODir()
    fs.writeFileSync(META_TAGS_FILE, JSON.stringify(metaTags, null, 2))
  } catch (error) {
    console.error('Error saving meta tags:', error)
    throw error
  }
}

// Load analytics settings from file
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loadAnalytics = (): any => {
  try {
    ensureSEODir()
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return {
      googleAnalyticsId: '',
      googleTagManagerId: '',
      googleSearchConsoleId: '',
      facebookPixelId: '',
      googleAdsId: '',
      bingWebmasterId: '',
      yandexWebmasterId: ''
    }
  } catch (error) {
    console.error('Error loading analytics:', error)
    return {
      googleAnalyticsId: '',
      googleTagManagerId: '',
      googleSearchConsoleId: '',
      facebookPixelId: '',
      googleAdsId: '',
      bingWebmasterId: '',
      yandexWebmasterId: ''
    }
  }
}

// Save analytics settings to file
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const saveAnalytics = (analytics: any) => {
  try {
    ensureSEODir()
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2))
  } catch (error) {
    console.error('Error saving analytics:', error)
    throw error
  }
}

// Keywords API endpoints
export async function GET() {
  try {
    const keywords = loadKeywords()
    return NextResponse.json({ success: true, data: keywords })
  } catch (error) {
    console.error('Error loading keywords:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to load keywords' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const keywords = loadKeywords()
    
    const newKeyword = {
      id: `keyword_${Date.now()}`,
      keyword: body.keyword,
      category: body.category,
      priority: body.priority || 'medium',
      searchVolume: body.searchVolume || 0,
      difficulty: body.difficulty || 0,
      currentRank: body.currentRank || null,
      targetRank: body.targetRank || 1,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    keywords.push(newKeyword)
    saveKeywords(keywords)
    
    return NextResponse.json({ success: true, data: newKeyword }, { status: 201 })
  } catch (error) {
    console.error('Error creating keyword:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create keyword' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const keywords = loadKeywords()
    
    const keywordIndex = keywords.findIndex(k => k.id === body.id)
    if (keywordIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Keyword not found' },
        { status: 404 }
      )
    }
    
    const updatedKeyword = {
      ...keywords[keywordIndex],
      keyword: body.keyword,
      category: body.category,
      priority: body.priority,
      status: body.status,
      targetRank: body.targetRank,
      updatedAt: new Date().toISOString()
    }
    
    keywords[keywordIndex] = updatedKeyword
    saveKeywords(keywords)
    
    return NextResponse.json({ success: true, data: updatedKeyword })
  } catch (error) {
    console.error('Error updating keyword:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update keyword' },
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
        { success: false, message: 'Keyword ID is required' },
        { status: 400 }
      )
    }
    
    const keywords = loadKeywords()
    const filteredKeywords = keywords.filter(k => k.id !== id)
    
    if (filteredKeywords.length === keywords.length) {
      return NextResponse.json(
        { success: false, message: 'Keyword not found' },
        { status: 404 }
      )
    }
    
    saveKeywords(filteredKeywords)
    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('Error deleting keyword:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete keyword' },
      { status: 500 }
    )
  }
}
