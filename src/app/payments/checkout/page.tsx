'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Header from '../../../components/Header'
import PayHereCheckout from '../../../components/PayHereCheckout'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking_id')
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    } else {
      setError('Booking ID is required')
      setLoading(false)
    }
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`)
      const result = await response.json()
      
      if (result.success) {
        setBooking(result.data)
      } else {
        setError('Booking not found')
      }
    } catch (err) {
      console.error('Error fetching booking:', err)
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-red-600">{error || 'Booking not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  // Parse customer name for first/last name
  const nameParts = booking.customer_name.split(' ')
  const firstName = nameParts[0] || booking.customer_name
  const lastName = nameParts.slice(1).join(' ') || ''

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Your Payment</h1>
          
          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-medium">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tour:</span>
                <span className="font-medium">{booking.tour_package_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span className="font-medium">{booking.guests}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Travel Dates:</span>
                <div className="text-right">
                  <div className="font-medium text-blue-600">
                    {new Date(booking.start_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })} - {new Date(booking.end_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ({Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-blue-600">LKR {booking.total_price?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Name:</strong> {booking.customer_name}</p>
              <p><strong>Email:</strong> {booking.customer_email}</p>
              <p><strong>Phone:</strong> {booking.customer_phone}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
            
            {/* PayHere Option */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* PayHere Logo */}
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <img 
                      src="https://www.payhere.lk/images/payhere-logo.png" 
                      alt="PayHere Logo" 
                      className="h-12 w-auto"
                      onError={(e) => {
                        // Fallback if logo fails to load
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                    <div className="hidden items-center justify-center h-12 w-32 bg-green-600 rounded text-white font-bold text-sm">
                      PayHere
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">PayHere</h3>
                    <p className="text-sm text-gray-600">Secure payment gateway supporting cards, mobile wallets, and more</p>
                  </div>
                </div>
              </div>
              
              {/* Payment Button */}
              <PayHereCheckout
                bookingId={booking.id}
                amount={parseFloat(booking.total_price)}
                currency="LKR"
                customerName={booking.customer_name}
                customerEmail={booking.customer_email}
                customerPhone={booking.customer_phone}
                customerAddress="N/A" // You may want to add address field to booking
                customerCity="N/A" // You may want to add city field to booking
                customerCountry="Sri Lanka"
                tourName={booking.tour_package_name}
                onError={(error) => {
                  alert(`Payment Error: ${error}`)
                }}
              />
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              You will be redirected to PayHere secure payment gateway to complete your payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}

