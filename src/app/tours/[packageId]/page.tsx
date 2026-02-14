/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Users,
  Star,
  Clock,
  CheckCircle,
  Navigation,
  Calendar,
  Sparkles,
  Hotel,
  UtensilsCrossed,
  Car,
  Moon
} from 'lucide-react'
import Header from '../../../components/Header'
import dynamic from 'next/dynamic'

// Hero height: use '50vh', '60vh', '70vh', etc. to control how tall the hero is
const TOUR_HERO_MIN_HEIGHT = '60vh'

// Dynamically import MapboxMap to reduce initial bundle size
const MapboxMap = dynamic(() => import('../../../components/MapboxMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
})

// Helper function to check if an image is uploaded (not external)
function isUploadedImage(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  // Check if it's a local upload path
  if (url.startsWith('/uploads/')) return true
  
  // Check if it's from Supabase storage
  if (url.includes('supabase.co') && url.includes('storage')) return true
  
  // Everything else is considered external
  return false
}

interface TourPackage {
  id: string
  name: string
  duration: string
  price: string
  destinations: string[]
  highlights: string[]
  keyExperiences?: string[]
  description: string
  itinerary: Day[]
  inclusions: string[]
  exclusions: string[]
  importantInfo?: {
    requirements: {
      activity: string
      requirements: string[]
    }[]
    whatToBring: string[]
  }
  accommodation: string[]
  transportation: string
  groupSize: string
  bestTime: string
  style: string
  images: string[]
}

interface Day {
  day: number
  title: string
  description: string
  activities: string[]
  accommodation: string
  meals: string[]
  transportation?: string
  travelTime?: string
  overnightStay?: string
  image?: string
}

export default function TourPackagePage({ params }: { params: Promise<{ packageId: string }> }) {
  const searchParams = useSearchParams()
  const [selectedImage, setSelectedImage] = useState(0)
  const [tourPackage, setTourPackage] = useState<TourPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [packageId, setPackageId] = useState<string>('')
  const [availableDestinations, setAvailableDestinations] = useState<Array<{name: string, lat: number, lng: number, region: string}>>([])
  const [bookingData, setBookingData] = useState({
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    guests: parseInt(searchParams.get('guests') || '1'),
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  })

  // Function to extract number of days from duration string (e.g., "7 Days / 6 Nights" -> 7)
  const getDaysFromDuration = (duration: string): number => {
    if (!duration) return 0
    const match = duration.match(/(\d+)\s*Days?/i)
    return match ? parseInt(match[1], 10) : 0
  }

  // Function to calculate end date based on start date and duration
  const calculateEndDate = (startDate: string, duration: string): string => {
    if (!startDate || !duration) return ''
    const days = getDaysFromDuration(duration)
    if (days === 0) return ''
    
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + days - 1) // Subtract 1 because start date is day 1
    
    return end.toISOString().split('T')[0]
  }

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setPackageId(resolvedParams.packageId)
    }
    resolveParams()
  }, [params])

  // Function to normalize tour data from API
  const normalizeTourData = (tour: any): TourPackage => {
    // Handle destinations - could be array, JSONB string, or undefined
    let destinations: string[] = []
    if (tour.destinations) {
      if (Array.isArray(tour.destinations)) {
        destinations = tour.destinations
      } else if (typeof tour.destinations === 'string') {
        try {
          destinations = JSON.parse(tour.destinations)
        } catch {
          // If parsing fails, treat as single destination name
          destinations = [tour.destinations]
        }
      }
    }

    return {
      id: tour.id,
      name: tour.name,
      duration: tour.duration,
      price: tour.price,
      style: tour.style || '',
      destinations: destinations,
      highlights: Array.isArray(tour.highlights) ? tour.highlights : (tour.highlights ? JSON.parse(tour.highlights) : []),
      keyExperiences: Array.isArray(tour.keyExperiences || tour.key_experiences) 
        ? (tour.keyExperiences || tour.key_experiences) 
        : [],
      description: tour.description || '',
      itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : [],
      inclusions: Array.isArray(tour.inclusions) ? tour.inclusions : [],
      exclusions: Array.isArray(tour.exclusions) ? tour.exclusions : [],
      importantInfo: tour.importantInfo || tour.important_info || undefined,
      accommodation: Array.isArray(tour.accommodation) ? tour.accommodation : [],
      transportation: tour.transportation || '',
      groupSize: tour.groupSize || tour.group_size || (tour.importantInfo as Record<string, string>)?.groupSize || (tour.important_info as Record<string, string>)?.groupSize || '',
      bestTime: tour.bestTime || tour.best_time || (tour.importantInfo as Record<string, string>)?.bestTime || (tour.important_info as Record<string, string>)?.bestTime || '',
      images: Array.isArray(tour.images) ? tour.images : []
    }
  }

  // Fetch destinations from API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations')
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          const mappedDestinations = result.data.map((dest: any) => ({
            name: dest.name,
            lat: dest.lat,
            lng: dest.lng,
            region: dest.region
          }))
          setAvailableDestinations(mappedDestinations)
          console.log('Destinations fetched for map:', mappedDestinations.length)
        }
      } catch (error) {
        console.error('Error fetching destinations:', error)
      }
    }
    fetchDestinations()
  }, [])

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await fetch('/api/tours')
        const data = await response.json()
        if (data.success) {
          const tour = data.data.find((t: any) => t.id === packageId)
          if (tour) {
            setTourPackage(normalizeTourData(tour))
          } else {
            setTourPackage(null)
          }
        }
      } catch (error) {
        console.error('Error fetching tour:', error)
        setTourPackage(null)
      } finally {
        setLoading(false)
      }
    }

    if (packageId) {
      fetchTour()
    }
  }, [packageId])

  // Auto-calculate end date when tour package is loaded and start date is set
  useEffect(() => {
    if (tourPackage && bookingData.startDate) {
      const calculatedEndDate = calculateEndDate(bookingData.startDate, tourPackage.duration)
      if (calculatedEndDate && calculatedEndDate !== bookingData.endDate) {
        setBookingData(prev => ({
          ...prev,
          endDate: calculatedEndDate
        }))
      }
    }
  }, [tourPackage?.duration, bookingData.startDate])
      
  // Map coordinates from API destinations only (no dummy data)
  const tourDestinations = (tourPackage?.destinations ?? [])
    .map((dest: string) => availableDestinations.find(d => d.name === dest))
    .filter((d): d is { name: string; lat: number; lng: number; region: string } => d != null && typeof d.lat === 'number' && typeof d.lng === 'number') || []

  // Debug logging
  useEffect(() => {
    if (tourPackage) {
      console.log('Tour destinations for map:', {
        tourDestinations: tourPackage.destinations,
        mappedDestinations: tourDestinations,
        availableDestinationsCount: availableDestinations.length
      })
    }
  }, [tourPackage?.destinations, tourDestinations.length, availableDestinations.length])

  // Build gallery images from top-level images + day images (only uploaded images)
  const galleryImages: string[] = [
    ...((tourPackage?.images || []) as string[]).filter(img => isUploadedImage(img)),
    ...(((tourPackage?.itinerary || [])
      .map((d) => d.image)
      .filter((src): src is string => typeof src === 'string' && src.length > 0 && isUploadedImage(src)) as string[])),
  ].filter((v, i, arr) => arr.indexOf(v) === i)

  const [showLightbox, setShowLightbox] = useState(false)

  const openLightbox = (index: number) => {
    setSelectedImage(index)
    setShowLightbox(true)
  }

  const closeLightbox = () => setShowLightbox(false)

  const prevImage = () => {
    if (galleryImages.length === 0) return
    setSelectedImage((idx) => (idx - 1 + galleryImages.length) % galleryImages.length)
  }

  const nextImage = () => {
    if (galleryImages.length === 0) return
    setSelectedImage((idx) => (idx + 1) % galleryImages.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading tour details...</p>
        </div>
      </div>
    )
  }

  if (!tourPackage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tour Package Not Found</h1>
          <p className="text-gray-600">The tour package you&apos;re looking for doesn&apos;t exist.</p>
          <div className="mt-8">
            <Link href="/tours" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              View All Tours
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleBooking = async () => {
    try {
      // Validate required fields
      if (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.startDate || !bookingData.endDate) {
        alert('Please fill in all required fields')
        return
      }

      const totalPrice = parseFloat(tourPackage?.price?.replace(/[^0-9.]/g, '') || '0')
      
      const payload = {
        tour_package_id: tourPackage.id,
        tour_package_name: tourPackage.name,
        customer_name: bookingData.name,
        customer_email: bookingData.email,
        customer_phone: bookingData.phone,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        guests: bookingData.guests,
        total_price: totalPrice,
        status: 'pending',
        special_requests: bookingData.specialRequests,
        payment_status: 'pending',
      }
      
      // Create booking first
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      
      if (!json.success) throw new Error(json.error || 'Failed to create booking')
      
      const bookingId = json.data.id
      
      // Redirect to payment checkout page
      window.location.href = `/payments/checkout?booking_id=${bookingId}`
    } catch (e: any) {
      console.error('Booking failed:', e)
      alert(`Booking failed: ${e.message || 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header />
      
      {/* Hero Section - tour image background, ~70% black overlay, content only */}
      <section
        className="relative w-full flex items-center justify-center text-white overflow-hidden"
        style={{ minHeight: TOUR_HERO_MIN_HEIGHT }}
      >
        {/* Background image from tour images */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${tourPackage.images?.find((img: string) => isUploadedImage(img)) || tourPackage.images?.[0] || '/next.svg'})`,
          }}
        />
        {/* ~70% black overlay for readability */}
        <div className="absolute inset-0 bg-black/70 z-[1]" aria-hidden />
        {/* Content on top of overlay */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">{tourPackage.name}</h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 px-2 max-w-3xl">{tourPackage.description}</p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-8 px-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">{tourPackage.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">{tourPackage.groupSize}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">4.8/5 (127 reviews)</span>
              </div>
            </div>
            {parseFloat(tourPackage?.price?.replace(/[^0-9.]/g, '') || '0') > 0 && (
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-4 sm:mb-6 px-2">{tourPackage.price}</div>
            )}
          </div>
        </div>
      </section>

      {/* Tour Details - full width content */}
      <section className="py-16 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-[1920px] mx-auto">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">

              {/* Key Experiences */}
              {tourPackage.keyExperiences && tourPackage.keyExperiences.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Key Experiences</h2>
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                      {(tourPackage.keyExperiences || []).map((item, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tour Destinations: cards first, then map, then map features */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tour Destinations</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
                  {/* Destination cards – right under the title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {tourDestinations.map((dest, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-4 border border-blue-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">{dest.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{dest.region}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Coordinates: {dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Map – below the cards */}
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <MapboxMap 
                      key={`tour-map-${tourPackage.id}-${tourDestinations.map(d => d.name).join(',')}`}
                      destinations={tourDestinations}
                      tourName={tourPackage.name}
                    />
                  </div>

                  {/* Map features – at the bottom, list removed */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Map Features</h4>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Tour Destinations</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Tour Route</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Navigation className="w-3 h-3 text-green-600 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Interactive Navigation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itinerary */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">Detailed Itinerary</h2>
                <div className="space-y-5 sm:space-y-6">
                  {(tourPackage.itinerary || []).map((day) => (
                    <div key={day.day} className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-none border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                          {day.day}
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{day.title}</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-5 leading-relaxed">{day.description}</p>
                      {day.image && isUploadedImage(day.image) && (
                        <div className="mb-5 sm:mb-6 rounded-lg overflow-hidden">
                          <Image
                            src={day.image}
                            alt={`Day ${day.day} - ${day.title}`}
                            width={800}
                            height={400}
                            className="w-full h-48 sm:h-56 md:h-64 object-cover"
                          />
                        </div>
                      )}
                      {/* Bento: large = top row Highlights full width, bottom row 4 columns. Mobile = stacked grid. */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mt-6">
                        {/* Highlights - full width top row on xl */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 p-4 sm:p-5 flex flex-col min-h-0 xl:col-span-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base mb-3">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                            Highlights
                          </h4>
                          <ul className="space-y-2 flex-1">
                            {(day.activities || []).length > 0 ? (
                              (day.activities || []).map((activity, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                  <span>{activity}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-sm text-gray-400 dark:text-gray-500">—</li>
                            )}
                          </ul>
                        </div>
                        {/* Accommodation - bottom row, 1 of 4 columns on xl */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 p-4 sm:p-5 flex flex-col min-h-0 xl:col-span-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base mb-3">
                            <Hotel className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                            Accommodation
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                            {day.accommodation || '—'}
                          </p>
                        </div>
                        {/* Meals - bottom row, 1 of 4 columns on xl */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 p-4 sm:p-5 flex flex-col min-h-0 xl:col-span-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base mb-3">
                            <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
                            Meals
                          </h4>
                          <ul className="space-y-2 flex-1">
                            {(day.meals || []).length > 0 ? (
                              (day.meals || []).map((meal, index) => (
                                <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{meal}</li>
                              ))
                            ) : (
                              <li className="text-sm text-gray-400 dark:text-gray-500">—</li>
                            )}
                          </ul>
                        </div>
                        {/* Transport - bottom row, 1 of 4 columns on xl */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 p-4 sm:p-5 flex flex-col min-h-0 xl:col-span-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base mb-3">
                            <Car className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400 shrink-0" />
                            Transport
                          </h4>
                          <div className="space-y-2 flex-1 text-sm text-gray-600 dark:text-gray-400">
                            {day.transportation ? (
                              <p><span className="font-medium text-gray-700 dark:text-gray-300">Transport:</span> {day.transportation}</p>
                            ) : null}
                            {day.travelTime ? (
                              <p><span className="font-medium text-gray-700 dark:text-gray-300">Travel time:</span> {day.travelTime}</p>
                            ) : null}
                            {!day.transportation && !day.travelTime && <p className="text-gray-400 dark:text-gray-500">—</p>}
                          </div>
                        </div>
                        {/* Stay - bottom row, 1 of 4 columns on xl */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 p-4 sm:p-5 flex flex-col min-h-0 sm:col-span-2 xl:col-span-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base mb-3">
                            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0" />
                            Stay
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                            {day.overnightStay || '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Gallery */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Tour Gallery</h2>
                <div className="grid grid-cols-3 gap-4">
                  {galleryImages.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`${tourPackage.name} - Image ${index + 1}`}
                      width={200}
                      height={150}
                      className={`rounded-lg cursor-pointer transition-all ${
                        selectedImage === index ? 'ring-4 ring-blue-500' : 'hover:opacity-80'
                      }`}
                      onClick={() => openLightbox(index)}
                    />
                  ))}
                </div>
              </div>

              {showLightbox && galleryImages.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                  <button
                    aria-label="Close"
                    onClick={closeLightbox}
                    className="absolute top-4 right-4 text-white text-3xl leading-none px-3"
                  >
                    ×
                  </button>
                  <button
                    aria-label="Previous image"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                  >
                    ‹
                  </button>
                  <div className="max-w-5xl w-full">
                    <Image
                      src={galleryImages[selectedImage]}
                      alt={`${tourPackage.name} - Image ${selectedImage + 1}`}
                      width={1280}
                      height={720}
                      className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                    />
                    <div className="mt-3 text-center text-white text-sm">
                      {selectedImage + 1} / {galleryImages.length}
                    </div>
                  </div>
                  <button
                    aria-label="Next image"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                  >
                    ›
                  </button>
                </div>
              )}


            </div>

            {/* Sidebar */}
            <div className="lg:sticky lg:top-6 lg:h-fit lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto space-y-6">
              {/* Quick Booking */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Quick Booking</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={bookingData.name || ''}
                      onChange={(e) => {
                        console.log('Name input changed:', e.target.value)
                        setBookingData({...bookingData, name: e.target.value})
                      }}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tour Start Date
                      {tourPackage.duration && (
                        <span className="text-xs text-gray-500 ml-2">({tourPackage.duration})</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={bookingData.startDate}
                        onChange={(e) => {
                          const newStartDate = e.target.value
                          const calculatedEndDate = calculateEndDate(newStartDate, tourPackage?.duration || '')
                          setBookingData({
                            ...bookingData,
                            startDate: newStartDate,
                            endDate: calculatedEndDate || bookingData.endDate
                          })
                        }}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        min={new Date().toISOString().split('T')[0]}
                        placeholder="Select start date"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {bookingData.startDate && tourPackage?.duration && (
                      <p className="text-xs text-gray-500 mt-1">
                        End date will be automatically set to {calculateEndDate(bookingData.startDate, tourPackage.duration) || 'N/A'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tour End Date
                      <span className="text-xs text-gray-500 ml-2">(Auto-calculated)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={bookingData.endDate}
                        onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                        placeholder="Select end date"
                        title="End date is automatically calculated based on package duration. You can manually adjust if needed."
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {bookingData.startDate && bookingData.endDate && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        Date Range: {new Date(bookingData.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })} - {new Date(bookingData.endDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                    <select
                      value={bookingData.guests}
                      onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                      placeholder="Any special requests or dietary requirements?"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button 
                    onClick={handleBooking}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              {/* Tour Info */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Tour Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-sm">{tourPackage.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Group Size:</span>
                    <span className="font-semibold text-sm">{tourPackage.groupSize}</span>
                  </div>
                  {tourPackage.style && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Style:</span>
                      <span className="font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{tourPackage.style}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Best Time:</span>
                    <span className="font-semibold text-sm">{tourPackage.bestTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Transportation:</span>
                    <span className="font-semibold text-sm">{tourPackage.transportation}</span>
                  </div>
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">What&apos;s Included</h3>
                <ul className="space-y-2 mb-6">
                  {(tourPackage.inclusions || []).map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Not Included</h3>
                <ul className="space-y-2">
                  {(tourPackage.exclusions || []).map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-4 h-4 text-red-500 mr-2">×</div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Important Information */}
              {tourPackage.importantInfo && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Important Information</h3>
                  
                  {/* Requirements */}
                  {tourPackage.importantInfo.requirements && tourPackage.importantInfo.requirements.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3 text-gray-800">Requirements</h4>
                      <div className="space-y-4">
                        {tourPackage.importantInfo.requirements.map((req, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4">
                            <h5 className="font-medium text-gray-700 mb-2">{req.activity}</h5>
                            <ul className="space-y-1">
                              {req.requirements.map((requirement, reqIndex) => (
                                <li key={reqIndex} className="text-sm text-gray-600">
                                  • {requirement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* What to Bring */}
                  {tourPackage.importantInfo.whatToBring && tourPackage.importantInfo.whatToBring.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-800">What to Bring</h4>
                      <ul className="space-y-2">
                        {tourPackage.importantInfo.whatToBring.map((item, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
