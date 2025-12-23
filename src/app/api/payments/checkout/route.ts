import { NextResponse } from 'next/server'
import { generatePayHereHash } from '@/lib/payhere'
import { supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'

interface CheckoutRequest {
  bookingId: string
  amount: number
  currency?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerCountry?: string
  tourName: string
}

export async function POST(req: Request) {
  try {
    const body: CheckoutRequest = await req.json()
    
    // Try to get PayHere credentials from environment variables first (more secure)
    // Fall back to settings from database if env vars are not set
    let merchantId = process.env.PAYHERE_MERCHANT_ID
    let merchantSecret = process.env.PAYHERE_MERCHANT_SECRET
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    let isSandbox = process.env.PAYHERE_SANDBOX === 'true'
    
    // If not in env vars, try to get from settings database/file
    if (!merchantId || !merchantSecret) {
      try {
        // Try Supabase first
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const { data: settingsData } = await supabaseAdmin
            .from('settings')
            .select('payhere_merchant_id, payhere_merchant_secret, payhere_sandbox, payhere_base_url')
            .eq('id', 'main')
            .single()
          
          if (settingsData) {
            merchantId = merchantId || settingsData.payhere_merchant_id
            merchantSecret = merchantSecret || settingsData.payhere_merchant_secret
            baseUrl = settingsData.payhere_base_url || baseUrl
            isSandbox = settingsData.payhere_sandbox !== undefined ? settingsData.payhere_sandbox : isSandbox
          }
        }
        
        // Fallback to file storage
        if ((!merchantId || !merchantSecret) && fs.existsSync) {
          const settingsFile = path.join(process.cwd(), 'data', 'settings.json')
          if (fs.existsSync(settingsFile)) {
            const fileSettings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'))
            merchantId = merchantId || fileSettings.payhereMerchantId
            merchantSecret = merchantSecret || fileSettings.payhereMerchantSecret
            baseUrl = fileSettings.payhereBaseUrl || baseUrl
            isSandbox = fileSettings.payhereSandbox !== undefined ? fileSettings.payhereSandbox : isSandbox
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    
    if (!merchantId || !merchantSecret) {
      return NextResponse.json(
        { success: false, error: 'PayHere credentials not configured. Please configure them in Settings > Payments or environment variables.' },
        { status: 500 }
      )
    }
    
    const currency = body.currency || 'LKR'
    const customerCountry = body.customerCountry || 'Sri Lanka'
    
    // Generate hash for PayHere
    const hash = generatePayHereHash(
      merchantId,
      body.bookingId,
      body.amount,
      currency,
      merchantSecret
    )
    
    // Prepare PayHere checkout form data
    const checkoutData = {
      merchant_id: merchantId,
      return_url: `${baseUrl}/payments/return?booking_id=${body.bookingId}`,
      cancel_url: `${baseUrl}/payments/cancel?booking_id=${body.bookingId}`,
      notify_url: `${baseUrl}/api/payments/notify`,
      order_id: body.bookingId,
      items: body.tourName,
      currency: currency,
      amount: body.amount.toFixed(2),
      first_name: body.customerName.split(' ')[0] || body.customerName,
      last_name: body.customerName.split(' ').slice(1).join(' ') || '',
      email: body.customerEmail,
      phone: body.customerPhone,
      address: body.customerAddress,
      city: body.customerCity,
      country: customerCountry,
      hash: hash
    }
    
    // PayHere checkout URL
    const checkoutUrl = isSandbox
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout'
    
    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl,
        formData: checkoutData
      }
    })
  } catch (error: unknown) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

