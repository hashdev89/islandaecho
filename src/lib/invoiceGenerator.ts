import PDFDocument from 'pdfkit'
import { supabaseAdmin } from './supabaseClient'

interface BookingData {
  id: string
  tour_package_id?: string
  tour_package_name: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  start_date: string
  end_date: string
  guests: number
  total_price: number
  payment_status: string
  payment_method?: string
  payment_id?: string
  created_at: string
}

interface CompanyInfo {
  name: string
  email: string
  phone: string
  address: string
}

// Get company information from settings
async function getCompanyInfo(): Promise<CompanyInfo> {
  // Try to get from Supabase settings
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { data: settingsData } = await supabaseAdmin
        .from('settings')
        .select('site_name, contact_email, contact_phone, contact_address')
        .eq('id', 'main')
        .single()
      
      if (settingsData) {
        return {
          name: settingsData.site_name || 'Isle & Echo Travel',
          email: settingsData.contact_email || 'info@isleandecho.com',
          phone: settingsData.contact_phone || '+94 741 415 812',
          address: settingsData.contact_address || '55/A, Kulupana, Pokunuwita, Sri Lanka'
        }
      }
    } catch (error) {
      console.error('Error fetching company info from database:', error)
    }
  }
  
  // Default values
  return {
    name: 'Isle & Echo Travel',
    email: 'info@isleandecho.com',
    phone: '+94 741 415 812',
    address: '55/A, Kulupana, Pokunuwita, Sri Lanka'
  }
}

// Generate invoice PDF
export async function generateInvoicePDF(booking: BookingData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const companyInfo = await getCompanyInfo()
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const buffers: Buffer[] = []
      
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers)
        resolve(pdfBuffer)
      })
      doc.on('error', reject)
      
      // Header
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('INVOICE', { align: 'center' })
        .moveDown(0.5)
      
      // Company Information
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(companyInfo.name, { align: 'center' })
        .text(companyInfo.address, { align: 'center' })
        .text(`Email: ${companyInfo.email}`, { align: 'center' })
        .text(`Phone: ${companyInfo.phone}`, { align: 'center' })
        .moveDown(1)
      
      // Invoice Details
      const invoiceDate = new Date(booking.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Invoice Number: ${booking.id}`, { align: 'right' })
        .text(`Invoice Date: ${invoiceDate}`, { align: 'right' })
        .moveDown(1)
      
      // Customer Information
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Bill To:', 50)
        .moveDown(0.3)
        .fontSize(10)
        .font('Helvetica')
        .text(booking.customer_name, 50)
        .text(booking.customer_email, 50)
      if (booking.customer_phone) {
        doc.text(booking.customer_phone, 50)
      }
      doc.moveDown(1)
      
      // Line separator
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(1)
      
      // Booking Details
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Booking Details', 50)
        .moveDown(0.5)
        .fontSize(10)
        .font('Helvetica')
      
      const startDate = new Date(booking.start_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const endDate = new Date(booking.end_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      doc
        .text(`Tour Package: ${booking.tour_package_name}`, 50)
        .text(`Start Date: ${startDate}`, 50)
        .text(`End Date: ${endDate}`, 50)
        .text(`Number of Guests: ${booking.guests}`, 50)
        .moveDown(1)
      
      // Line separator
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(1)
      
      // Items Table Header
      const tableTop = doc.y
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Description', 50, tableTop)
        .text('Quantity', 350, tableTop)
        .text('Amount', 450, tableTop, { align: 'right' })
      doc.y = tableTop + 15
      
      // Line under header
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.3)
      
      // Item row
      const itemRowY = doc.y
      doc
        .font('Helvetica')
        .text(booking.tour_package_name, 50, itemRowY)
        .text(`${booking.guests} guest(s)`, 350, itemRowY)
        .text(`LKR ${booking.total_price.toFixed(2)}`, 450, itemRowY, { align: 'right' })
      doc.y = itemRowY + 15
      
      // Line separator
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(1)
      
      // Payment Information
      let paymentY = doc.y
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Payment Status: ${booking.payment_status.toUpperCase()}`, 50, paymentY)
      if (booking.payment_method) {
        paymentY += 15
        doc.text(`Payment Method: ${booking.payment_method}`, 50, paymentY)
      }
      if (booking.payment_id) {
        paymentY += 15
        doc.text(`Payment ID: ${booking.payment_id}`, 50, paymentY)
      }
      doc.y = paymentY + 20
      
      // Total
      const totalY = doc.y
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Total Amount:', 350, totalY)
        .text(`LKR ${booking.total_price.toFixed(2)}`, 450, totalY, { align: 'right' })
      doc.y = totalY + 20
      
      // Line separator
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(2)
      
      // Footer
      doc
        .fontSize(9)
        .font('Helvetica')
        .text('Thank you for choosing Isle & Echo Travel!', { align: 'center' })
        .moveDown(0.5)
        .text('For any inquiries, please contact us at:', { align: 'center' })
        .text(`${companyInfo.email} | ${companyInfo.phone}`, { align: 'center' })
        .moveDown(1)
        .fillColor('#666666')
        .text('This is an automatically generated invoice.', { align: 'center' })
        .fillColor('#000000')
      
      // Finalize PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

