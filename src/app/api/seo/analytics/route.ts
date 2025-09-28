import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// File paths for SEO data storage
const SEO_DATA_DIR = path.join(process.cwd(), 'data', 'seo')
const ANALYTICS_FILE = path.join(SEO_DATA_DIR, 'analytics.json')

// Ensure SEO data directory exists
const ensureSEODir = () => {
  if (!fs.existsSync(SEO_DATA_DIR)) {
    fs.mkdirSync(SEO_DATA_DIR, { recursive: true })
  }
}

// Load analytics settings from file
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
const saveAnalytics = (analytics: any) => {
  try {
    ensureSEODir()
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2))
  } catch (error) {
    console.error('Error saving analytics:', error)
    throw error
  }
}

// Analytics API endpoints
export async function GET(request: NextRequest) {
  try {
    const analytics = loadAnalytics()
    return NextResponse.json({ success: true, data: analytics })
  } catch (error) {
    console.error('Error loading analytics:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to load analytics settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const analyticsSettings = {
      googleAnalyticsId: body.googleAnalyticsId || '',
      googleTagManagerId: body.googleTagManagerId || '',
      googleSearchConsoleId: body.googleSearchConsoleId || '',
      facebookPixelId: body.facebookPixelId || '',
      googleAdsId: body.googleAdsId || '',
      bingWebmasterId: body.bingWebmasterId || '',
      yandexWebmasterId: body.yandexWebmasterId || '',
      updatedAt: new Date().toISOString()
    }
    
    saveAnalytics(analyticsSettings)
    
    return NextResponse.json({ success: true, data: analyticsSettings })
  } catch (error) {
    console.error('Error updating analytics:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update analytics settings' },
      { status: 500 }
    )
  }
}
