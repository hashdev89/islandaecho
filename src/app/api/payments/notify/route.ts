import { NextResponse } from 'next/server'
import { verifyPayHerePayment, mapPayHereStatusToPaymentStatus, PayHereStatus } from '@/lib/payhere'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { generateInvoicePDF } from '@/lib/invoiceGenerator'
import { sendInvoiceEmail, sendBookingConfirmationToCustomer, sendBookingConfirmationToAdmin } from '@/lib/emailService'

export async function POST(req: Request) {
  try {
    // Parse form data (PayHere sends application/x-www-form-urlencoded)
    const formData = await req.formData()
    
    const merchantId = formData.get('merchant_id') as string
    const orderId = formData.get('order_id') as string
    const paymentId = formData.get('payment_id') as string
    const payhereAmount = formData.get('payhere_amount') as string
    const payhereCurrency = formData.get('payhere_currency') as string
    const statusCode = formData.get('status_code') as string
    const md5sig = formData.get('md5sig') as string
    const method = formData.get('method') as string
    const statusMessage = formData.get('status_message') as string
    
    // Get merchant secret from environment
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET
    
    if (!merchantSecret) {
      console.error('PayHere merchant secret not configured')
      return NextResponse.json({ success: false, error: 'Configuration error' }, { status: 500 })
    }
    
    // Verify the payment notification
    const isValid = verifyPayHerePayment(
      merchantId,
      orderId,
      payhereAmount,
      payhereCurrency,
      statusCode,
      merchantSecret,
      md5sig
    )
    
    if (!isValid) {
      console.error('Invalid PayHere payment notification:', { orderId, md5sig })
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 })
    }
    
    // Map payment status
    const paymentStatus = mapPayHereStatusToPaymentStatus(statusCode)
    const bookingStatus = statusCode === PayHereStatus.SUCCESS ? 'confirmed' : 'pending'
    
    // Update booking in database
    const updateData: any = {
      payment_status: paymentStatus,
      status: bookingStatus,
      updated_at: new Date().toISOString()
    }
    
    // Add payment_id if available
    if (paymentId) {
      updateData.payment_id = paymentId
    }
    
    // Add payment_method if available
    if (method) {
      updateData.payment_method = method
    }
    
    // Try to update in Supabase
    let bookingData = null
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: updatedBooking, error } = await supabaseAdmin
        .from('bookings')
        .update(updateData)
        .eq('id', orderId)
        .select('*')
        .single()
      
      if (error) {
        console.error('Error updating booking in Supabase:', error)
        // Continue to return success to PayHere even if DB update fails
        // You can implement fallback storage here if needed
      } else {
        console.log('Booking updated successfully:', orderId, paymentStatus)
        bookingData = updatedBooking
      }
    }
    
    // Generate and send emails if payment is successful
    if (statusCode === PayHereStatus.SUCCESS && bookingData) {
      try {
        console.log('Generating invoice for booking:', orderId)
        const invoicePdf = await generateInvoicePDF(bookingData)
        
        console.log('Sending invoice email to:', bookingData.customer_email)
        await sendInvoiceEmail(
          bookingData.customer_email,
          bookingData.customer_name,
          orderId,
          invoicePdf
        )
        console.log('Invoice sent successfully to customer')
      } catch (invoiceError) {
        console.error('Error generating/sending invoice:', invoiceError)
      }

      // Send exact-format booking details to customer
      try {
        await sendBookingConfirmationToCustomer(bookingData)
        console.log('Booking confirmation (details) sent to customer')
      } catch (confirmationError) {
        console.error('Error sending booking confirmation to customer:', confirmationError)
      }

      // Send same format to admin email(s)
      try {
        await sendBookingConfirmationToAdmin(bookingData)
      } catch (adminError) {
        console.error('Error sending booking confirmation to admin:', adminError)
      }
    }
    
    // Log payment notification for debugging
    console.log('PayHere payment notification received:', {
      orderId,
      paymentId,
      amount: payhereAmount,
      currency: payhereCurrency,
      statusCode,
      paymentStatus,
      method,
      statusMessage
    })
    
    // Return success to PayHere (important: PayHere expects a response)
    return NextResponse.json({ success: true, message: 'Payment notification processed' })
  } catch (error: unknown) {
    console.error('Payment notification error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

