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

