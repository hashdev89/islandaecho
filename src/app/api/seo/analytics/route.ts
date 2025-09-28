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

interface AnalyticsSettings {
  googleAnalyticsId: string
  googleTagManagerId: string
  googleSearchConsoleId: string
  facebookPixelId: string
  googleAdsId: string
  bingWebmasterId: string
  yandexWebmasterId: string
  updatedAt?: string
}

// Load analytics settings from file
const loadAnalytics = (): AnalyticsSettings => {
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
const saveAnalytics = (analytics: AnalyticsSettings): void => {
  try {
    ensureSEODir()
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2))
  } catch (error) {
    console.error('Error saving analytics:', error)
    throw error
  }
}

// Analytics API endpoints
export async function GET() {
  try {
    const analytics = loadAnalytics()
    return NextResponse.json({ success: true, data: analytics })
  } catch (error: unknown) {
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
    
    const analyticsSettings: AnalyticsSettings = {
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
  } catch (error: unknown) {
    console.error('Error updating analytics:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update analytics settings' },
      { status: 500 }
    )
  }
}
