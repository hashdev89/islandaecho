import nodemailer from 'nodemailer'
import { supabaseAdmin } from './supabaseClient'

interface EmailSettings {
  smtpHost: string
  smtpPort: string
  smtpUsername: string
  smtpPassword: string
  fromEmail: string
  fromName: string
}

// Get email settings from database or environment
async function getEmailSettings(): Promise<EmailSettings> {
  // Try to get from Supabase settings table
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { data: settingsData } = await supabaseAdmin
        .from('settings')
        .select('smtp_host, smtp_port, smtp_username, smtp_password, from_email, from_name')
        .eq('id', 'main')
        .single()
      
      if (settingsData && settingsData.smtp_host && settingsData.smtp_username) {
        return {
          smtpHost: settingsData.smtp_host || 'smtp.gmail.com',
          smtpPort: settingsData.smtp_port || '587',
          smtpUsername: settingsData.smtp_username,
          smtpPassword: settingsData.smtp_password || '',
          fromEmail: settingsData.from_email || settingsData.smtp_username,
          fromName: settingsData.from_name || 'Isle & Echo Travel'
        }
      }
    } catch (error) {
      console.error('Error fetching email settings from database:', error)
    }
  }
  
  // Fallback to environment variables
  return {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUsername: process.env.SMTP_USERNAME || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    fromEmail: process.env.FROM_EMAIL || process.env.SMTP_USERNAME || 'noreply@isleandecho.com',
    fromName: process.env.FROM_NAME || 'Isle & Echo Travel'
  }
}

// Create email transporter
async function createTransporter() {
  const settings = await getEmailSettings()
  
  if (!settings.smtpUsername || !settings.smtpPassword) {
    throw new Error('SMTP credentials not configured. Please configure email settings in admin panel.')
  }
  
  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: parseInt(settings.smtpPort, 10),
    secure: settings.smtpPort === '465', // true for 465, false for other ports
    auth: {
      user: settings.smtpUsername,
      pass: settings.smtpPassword
    }
  })
}

// Get admin email(s) from settings (comma-separated supported)
export async function getAdminEmails(): Promise<string[]> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { data } = await supabaseAdmin
        .from('settings')
        .select('admin_email')
        .eq('id', 'main')
        .single()
      const raw = (data?.admin_email as string) || process.env.ADMIN_EMAIL || ''
      return raw.split(',').map((e) => e.trim()).filter(Boolean)
    } catch (error) {
      console.error('Error fetching admin emails:', error)
    }
  }
  const env = process.env.ADMIN_EMAIL || ''
  return env ? env.split(',').map((e) => e.trim()).filter(Boolean) : []
}

// Format booking details as plain text (exact format for both customer and admin)
function formatBookingDetailsText(booking: BookingForEmail): string {
  const fmt = (v: unknown) => (v == null || v === '' ? '—' : String(v))
  return [
    'BOOKING DETAILS',
    '----------------',
    `Booking reference:  ${fmt(booking.id)}`,
    `Tour package:       ${fmt(booking.tour_package_name)}`,
    `Status:             ${fmt(booking.status)}`,
    `Payment status:     ${fmt(booking.payment_status)}`,
    '',
    'CUSTOMER',
    '--------',
    `Name:               ${fmt(booking.customer_name)}`,
    `Email:              ${fmt(booking.customer_email)}`,
    `Phone:              ${fmt(booking.customer_phone)}`,
    '',
    'DATES & GUESTS',
    '--------------',
    `Start date:         ${fmt(booking.start_date)}`,
    `End date:           ${fmt(booking.end_date)}`,
    `Number of guests:   ${fmt(booking.guests)}`,
    '',
    'PAYMENT',
    '-------',
    `Total price:        ${booking.total_price != null ? `${booking.total_price} LKR` : '—'}`,
    `Payment method:     ${fmt(booking.payment_method)}`,
    `Payment ID:         ${fmt(booking.payment_id)}`,
    '',
    'SPECIAL REQUESTS',
    '-----------------',
    fmt(booking.special_requests),
    '',
    `Created:            ${fmt(booking.created_at)}`,
  ].join('\n')
}

// Format booking details as HTML (exact same structure for customer and admin)
function formatBookingDetailsHtml(booking: BookingForEmail): string {
  const row = (label: string, value: unknown) => {
    const v = value == null || value === '' ? '—' : String(value)
    return `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;width:180px;">${label}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">${v}</td></tr>`
  }
  const section = (title: string, rows: string) =>
    `<h3 style="margin:16px 0 8px;font-size:14px;color:#374151;">${title}</h3><table style="width:100%;border-collapse:collapse;">${rows}</table>`
  const body = [
    section('Booking', [
      row('Booking reference', booking.id),
      row('Tour package', booking.tour_package_name),
      row('Status', booking.status),
      row('Payment status', booking.payment_status),
    ].join('')),
    section('Customer', [
      row('Name', booking.customer_name),
      row('Email', booking.customer_email),
      row('Phone', booking.customer_phone),
    ].join('')),
    section('Dates & guests', [
      row('Start date', booking.start_date),
      row('End date', booking.end_date),
      row('Number of guests', booking.guests),
    ].join('')),
    section('Payment', [
      row('Total price', booking.total_price != null ? `${booking.total_price} LKR` : null),
      row('Payment method', booking.payment_method),
      row('Payment ID', booking.payment_id),
    ].join('')),
    section('Special requests', [row('', booking.special_requests || '—')].join('')),
    `<p style="margin-top:16px;color:#6b7280;font-size:12px;">Created: ${booking.created_at || '—'}</p>`,
  ].join('')
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#3B82F6;color:white;padding:16px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;font-size:20px;">Booking confirmation</h1>
      </div>
      <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
        ${body}
      </div>
      <p style="text-align:center;margin-top:24px;color:#6b7280;font-size:12px;">Isle & Echo Travel</p>
    </body>
    </html>
  `
}

// Booking record shape for confirmation emails
export interface BookingForEmail {
  id: string
  tour_package_id?: string
  tour_package_name?: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  start_date: string
  end_date: string
  guests?: number
  total_price?: number | null
  status?: string
  special_requests?: string | null
  payment_status?: string
  payment_method?: string | null
  payment_id?: string | null
  created_at?: string
  updated_at?: string
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType?: string
  }>
}

// Send email
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const settings = await getEmailSettings()
    const transporter = await createTransporter()
    
    const mailOptions = {
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html,
      attachments: options.attachments || []
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Send invoice email
export async function sendInvoiceEmail(
  customerEmail: string,
  customerName: string,
  bookingId: string,
  invoicePdf: Buffer
): Promise<boolean> {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #3B82F6;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #3B82F6;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Booking!</h1>
        </div>
        <div class="content">
          <p>Dear ${customerName},</p>
          <p>Thank you for booking with Isle & Echo Travel! Your payment has been successfully processed.</p>
          <p>Your booking reference number is: <strong>${bookingId}</strong></p>
          <p>Please find your invoice attached to this email. You can download it for your records.</p>
          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
          <p>We look forward to providing you with an amazing travel experience!</p>
          <p>Best regards,<br>The Isle & Echo Travel Team</p>
        </div>
        <div class="footer">
          <p>Isle & Echo Travel<br>Email: info@isleandecho.com | Phone: +94 741 415 812</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  return await sendEmail({
    to: customerEmail,
    subject: `Invoice for Booking ${bookingId} - Isle & Echo Travel`,
    html: emailHtml,
    text: `Thank you for your booking! Your payment has been successfully processed. Booking reference: ${bookingId}. Please find your invoice attached.`,
    attachments: [
      {
        filename: `Invoice-${bookingId}.pdf`,
        content: invoicePdf,
        contentType: 'application/pdf'
      }
    ]
  })
}

// Send exact-format booking details to the customer (on confirmation)
export async function sendBookingConfirmationToCustomer(booking: BookingForEmail): Promise<boolean> {
  const html = formatBookingDetailsHtml(booking)
  const text = formatBookingDetailsText(booking)
  return await sendEmail({
    to: booking.customer_email,
    subject: `Booking confirmed – ${booking.id} – Isle & Echo Travel`,
    html,
    text,
  })
}

// Send exact-format booking details to admin email(s). Respects booking_notifications.
export async function sendBookingConfirmationToAdmin(booking: BookingForEmail): Promise<void> {
  let notificationsEnabled = true
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { data } = await supabaseAdmin
        .from('settings')
        .select('booking_notifications')
        .eq('id', 'main')
        .single()
      notificationsEnabled = (data?.booking_notifications ?? true) as boolean
    } catch {
      // keep true
    }
  }
  if (!notificationsEnabled) return

  const adminEmails = await getAdminEmails()
  if (adminEmails.length === 0) return

  const html = formatBookingDetailsHtml(booking)
  const text = formatBookingDetailsText(booking)
  const subject = `New booking confirmed – ${booking.id} – ${booking.customer_name}`

  for (const to of adminEmails) {
    try {
      await sendEmail({ to, subject, html, text })
      console.log('Booking confirmation sent to admin:', to)
    } catch (err) {
      console.error('Failed to send booking confirmation to admin', to, err)
    }
  }
}

