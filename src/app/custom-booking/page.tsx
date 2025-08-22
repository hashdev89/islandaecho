'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  MapPin, 
  Users, 
  ArrowRight, 
  Clock,
  Check,
  X,
  Edit3,
  CheckCircle,
  Phone,
  Mail,
  Shield,
  Award,
  Camera,
  Navigation
} from 'lucide-react'
import Header from '../../components/Header'
import MapboxMap from '../../components/MapboxMap'

interface CustomTripData {
  destinations: string[]
  dateRange: string
  guests: number
  interests: string[]
}

interface Destination {
  id: string
  name: string
  region: string
  description: string
  image: string
  coordinates: [number, number]
  activities: string[]
}

export default function CustomBookingPage() {
  const router = useRouter()
  const [tripData, setTripData] = useState<CustomTripData | null>(null)
  const [bookingData, setBookingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    guests: 1,
    specialRequests: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  // Available destinations with coordinates
  const availableDestinations: Destination[] = [
    { 
      id: 'colombo', 
      name: 'Colombo', 
      region: 'Western Province',
      description: 'The commercial capital of Sri Lanka with modern shopping centers and colonial architecture.',
      image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400&h=300&fit=crop',
      coordinates: [79.8612, 6.9271],
      activities: ['City Tours', 'Shopping', 'Cultural Sites', 'Nightlife']
    },
    { 
      id: 'kandy', 
      name: 'Kandy', 
      region: 'Central Province',
      description: 'Cultural capital with the Temple of the Sacred Tooth Relic and beautiful botanical gardens.',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop',
      coordinates: [80.6337, 7.2906],
      activities: ['Temple of the Tooth', 'Cultural Shows', 'Botanical Gardens', 'Tea Factory Tours']
    },
    { 
      id: 'galle', 
      name: 'Galle', 
      region: 'Southern Province',
      description: 'UNESCO World Heritage site with well-preserved colonial architecture.',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      coordinates: [80.2176, 6.0535],
      activities: ['Fort Walking Tours', 'Beach Relaxation', 'Boutique Shopping', 'Sunset Views']
    },
    { 
      id: 'sigiriya', 
      name: 'Sigiriya', 
      region: 'Cultural Triangle',
      description: 'Ancient palace and fortress complex, a UNESCO World Heritage site.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      coordinates: [80.7604, 7.9570],
      activities: ['Rock Climbing', 'Ancient Palace Tours', 'Fresco Viewing', 'Sunset Photography']
    },
    { 
      id: 'ella', 
      name: 'Ella', 
      region: 'Uva Province',
      description: 'Scenic hill country town with stunning mountain views and hiking trails.',
      image: 'https://images.unsplash.com/photo-1502602898534-47d98d8b4b3b?w=400&h=300&fit=crop',
      coordinates: [81.0519, 6.8751],
      activities: ['Hiking', 'Train Journey', 'Tea Plantations', 'Mountain Views']
    },
    { 
      id: 'mirissa', 
      name: 'Mirissa', 
      region: 'Southern Province',
      description: 'Beautiful beach destination known for whale watching and water sports.',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
      coordinates: [80.4569, 5.9483],
      activities: ['Whale Watching', 'Beach Activities', 'Water Sports', 'Sunset Views']
    },
    { 
      id: 'anuradhapura', 
      name: 'Anuradhapura', 
      region: 'North Central Province',
      description: 'Ancient capital with well-preserved ruins of an ancient Sinhalese civilization.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      coordinates: [80.4024, 8.3114],
      activities: ['Ancient City Tours', 'Temple Visits', 'Historical Sites', 'Cultural Tours']
    },
    { 
      id: 'polonnaruwa', 
      name: 'Polonnaruwa', 
      region: 'North Central Province',
      description: 'Medieval capital with impressive archaeological ruins and ancient temples.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      coordinates: [81.0000, 7.9333],
      activities: ['Archaeological Tours', 'Temple Visits', 'Historical Sites', 'Cultural Tours']
    },
    { 
      id: 'nuwara-eliya', 
      name: 'Nuwara Eliya', 
      region: 'Central Province',
      description: 'Known as Little England with cool climate and tea plantations.',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
      coordinates: [80.7829, 6.9497],
      activities: ['Tea Plantation Tours', 'Hiking', 'Golf', 'Cool Climate']
    },
    { 
      id: 'dambulla', 
      name: 'Dambulla', 
      region: 'Cultural Triangle',
      description: 'Famous for the Golden Temple and ancient cave temples.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      coordinates: [80.6490, 7.8567],
      activities: ['Cave Temple Tours', 'Golden Temple', 'Cultural Tours', 'Historical Sites']
    }
  ]

  useEffect(() => {
    // Get trip data from localStorage
    const storedData = localStorage.getItem('customTripData')
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      setTripData(parsedData)
      // Set initial booking data
      setBookingData(prev => ({
        ...prev,
        guests: parsedData.guests || 1,
        startDate: parsedData.dateRange ? parsedData.dateRange.split(' - ')[0] : '',
        endDate: parsedData.dateRange ? parsedData.dateRange.split(' - ')[1] : ''
      }))
    } else {
      // Redirect to home if no trip data
      router.push('/')
    }
  }, [router])

  const selectedDestinations = tripData?.destinations.map(id => 
    availableDestinations.find(dest => dest.id === id)
  ).filter(Boolean) as Destination[] || []

  // Calculate estimated price based on destinations and duration
  const estimatedPrice = selectedDestinations.length * 150 + (tripData?.guests || 1) * 50

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle booking submission
    alert('Custom trip booking submitted successfully! We will contact you soon to finalize your itinerary.')
    // You can add API call here to save the booking
  }

  const removeDestination = (destinationId: string) => {
    if (tripData) {
      const updatedDestinations = tripData.destinations.filter(id => id !== destinationId)
      const updatedTripData = { ...tripData, destinations: updatedDestinations }
      setTripData(updatedTripData)
      localStorage.setItem('customTripData', JSON.stringify(updatedTripData))
    }
  }

  if (!tripData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your custom trip...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Your Custom Trip</h1>
              <p className="text-xl mb-8 opacity-90">Personalized itinerary based on your preferences and selected destinations</p>
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{selectedDestinations.length} Days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{tripData.guests} {tripData.guests === 1 ? 'Person' : 'People'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>{selectedDestinations.length} Destinations</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-6">From ${estimatedPrice}</div>
              <button 
                onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
              >
                Book This Custom Trip
              </button>
            </div>
            <div className="relative">
              <Image
                src={selectedDestinations[0]?.image || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'}
                alt="Custom Trip"
                width={800}
                height={384}
                className="rounded-lg shadow-lg w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tour Details */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Interactive 3D Mapbox Map */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tour Route Map</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? 'Done Editing' : 'Edit Trip'}
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  {/* Mapbox 3D Interactive Map */}
                  <MapboxMap 
                    destinations={selectedDestinations.map(dest => ({
                      ...dest,
                      lat: dest.coordinates[1],
                      lng: dest.coordinates[0],
                    }))}
                    tourName="Custom Trip"
                  />
                  
                  {/* Map Legend */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tour Destinations</h4>
                      <div className="space-y-2">
                        {selectedDestinations.map((dest, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{dest.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">({dest.region})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Map Features</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Tour Destinations</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Tour Route</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Navigation className="w-3 h-3 text-green-600" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Interactive Navigation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Destination Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {selectedDestinations.map((dest, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">{dest.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{dest.region}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Coordinates: {dest.coordinates[1].toFixed(4)}, {dest.coordinates[0].toFixed(4)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Itinerary */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Detailed Itinerary</h2>
                <div className="space-y-6">
                  {selectedDestinations.map((destination, index) => (
                    <div key={destination.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{destination.name}</h3>
                          <p className="text-gray-600 dark:text-gray-300">{destination.region}</p>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => removeDestination(destination.id)}
                            className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{destination.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Activities</h4>
                          <ul className="space-y-1">
                            {destination.activities.map((activity, idx) => (
                              <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Highlights</h4>
                          <ul className="space-y-1">
                            <li className="text-sm text-gray-600 dark:text-gray-300">• Cultural exploration</li>
                            <li className="text-sm text-gray-600 dark:text-gray-300">• Local experiences</li>
                            <li className="text-sm text-gray-600 dark:text-gray-300">• Professional guide</li>
                            <li className="text-sm text-gray-600 dark:text-gray-300">• Comfortable accommodation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trip Interests */}
              {tripData.interests.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Interests</h2>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">We&apos;ll tailor activities based on your preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {tripData.interests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Image Gallery */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Destination Gallery</h2>
                <div className="grid grid-cols-3 gap-4">
                  {selectedDestinations.slice(0, 6).map((destination, index) => (
                    <Image
                      key={index}
                      src={destination.image}
                      alt={`${destination.name} - Image ${index + 1}`}
                      width={200}
                      height={150}
                      className={`rounded-lg cursor-pointer transition-all ${
                        selectedImage === index ? 'ring-4 ring-blue-500' : 'hover:opacity-80'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:sticky lg:top-6 lg:h-fit lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto space-y-6">
              {/* Quick Booking */}
              <div id="booking-form" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quick Booking</h3>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={bookingData.fullName}
                      onChange={(e) => setBookingData({...bookingData, fullName: e.target.value})}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                    <input
                      type="date"
                      value={bookingData.endDate}
                      onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Guests</label>
                    <input
                      type="number"
                      value={bookingData.guests}
                      onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Special Requests</label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Any special requirements or preferences..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Book Custom Trip
                  </button>
                </form>
              </div>

              {/* Tour Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tour Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Duration</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedDestinations.length} Days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Group Size</p>
                      <p className="font-medium text-gray-900 dark:text-white">Custom</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Destinations</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedDestinations.length} Locations</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Difficulty</p>
                      <p className="font-medium text-gray-900 dark:text-white">Easy to Moderate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">What&apos;s Included</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Professional English-speaking guide
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    All accommodation
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Daily breakfast
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Air-conditioned vehicle
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Airport transfers
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Bottled water
                  </li>
                </ul>
              </div>

              {/* Not Included */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Not Included</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <X className="w-4 h-4 text-red-500 mr-2" />
                    International flights
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <X className="w-4 h-4 text-red-500 mr-2" />
                    Personal expenses
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <X className="w-4 h-4 text-red-500 mr-2" />
                    Tips for guides
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <X className="w-4 h-4 text-red-500 mr-2" />
                    Travel insurance
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <X className="w-4 h-4 text-red-500 mr-2" />
                    Optional activities
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
