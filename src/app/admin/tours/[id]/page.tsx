'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Save,
  ArrowLeft,
  MapPin,
  Plus,
  Trash2,
  Eye,
  Calendar,
  Users,
  DollarSign,
  Map
} from 'lucide-react'
import MapboxMap from '../../../../components/MapboxMap'

interface Day {
  day: number
  title: string
  description: string
  activities: string[]
  accommodation: string
  meals: string[]
}

interface TourPackage {
  id: string
  name: string
  duration: string
  price: string
  destinations: string[]
  highlights: string[]
  description: string
  itinerary: Day[]
  inclusions: string[]
  exclusions: string[]
  accommodation: string[]
  transportation: string
  groupSize: string
  difficulty: string
  bestTime: string
  images: string[]
  status: 'active' | 'draft' | 'archived'
}

interface Destination {
  name: string
  lat: number
  lng: number
  region: string
}

export default function TourEditor() {
  const params = useParams()
  const router = useRouter()
  const tourId = params.id as string
  const isNew = tourId === 'new'

  const [tour, setTour] = useState<TourPackage>({
    id: '',
    name: '',
    duration: '',
    price: '',
    destinations: [],
    highlights: [],
    description: '',
    itinerary: [],
    inclusions: [],
    exclusions: [],
    accommodation: [],
    transportation: '',
    groupSize: '',
    difficulty: '',
    bestTime: '',
    images: [],
    status: 'draft'
  })

  const [availableDestinations] = useState<Destination[]>([
    { name: 'Sigiriya', lat: 7.9570, lng: 80.7603, region: 'Cultural Triangle' },
    { name: 'Dambulla', lat: 7.8567, lng: 80.6492, region: 'Cultural Triangle' },
    { name: 'Polonnaruwa', lat: 7.9403, lng: 81.0187, region: 'Cultural Triangle' },
    { name: 'Anuradhapura', lat: 8.3114, lng: 80.4037, region: 'Cultural Triangle' },
    { name: 'Kandy', lat: 7.2906, lng: 80.6337, region: 'Hill Country' },
    { name: 'Nuwara Eliya', lat: 6.9497, lng: 80.7891, region: 'Hill Country' },
    { name: 'Ella', lat: 6.8767, lng: 81.0463, region: 'Hill Country' },
    { name: 'Galle', lat: 6.0535, lng: 80.2210, region: 'Southern Coast' },
    { name: 'Mirissa', lat: 5.9483, lng: 80.4718, region: 'Southern Coast' },
    { name: 'Bentota', lat: 6.4185, lng: 79.9953, region: 'Southern Coast' },
    { name: 'Hikkaduwa', lat: 6.1394, lng: 80.1038, region: 'Southern Coast' },
    { name: 'Yala National Park', lat: 6.2619, lng: 81.4157, region: 'Wildlife' },
    { name: 'Udawalawe', lat: 6.4500, lng: 80.8833, region: 'Wildlife' },
    { name: 'Sinharaja Forest', lat: 6.4000, lng: 80.4500, region: 'Wildlife' },
    { name: 'Colombo', lat: 6.9271, lng: 79.8612, region: 'Western Province' }
  ])

  const [newInclusion, setNewInclusion] = useState('')
  const [newExclusion, setNewExclusion] = useState('')
  const [newAccommodation, setNewAccommodation] = useState('')
  const [newHighlight, setNewHighlight] = useState('')
  const [newImage, setNewImage] = useState('')

  // Get map coordinates for selected destinations
  const tourDestinations = tour.destinations.map(destName => {
    const dest = availableDestinations.find(d => d.name === destName)
    return dest || null
  }).filter(Boolean) as Destination[]

  useEffect(() => {
    if (!isNew) {
      // Load existing tour data
      // In a real app, this would fetch from your backend
      const existingTour: TourPackage = {
        id: 'cultural-triangle',
        name: 'Cultural Triangle Explorer',
        duration: '5 Days / 4 Nights',
        price: '$899',
        destinations: ['Sigiriya', 'Dambulla', 'Polonnaruwa', 'Anuradhapura'],
        highlights: ['UNESCO Sites', 'Ancient Temples', 'Historical Monuments'],
        description: 'Discover the heart of Sri Lanka\'s ancient civilization with this comprehensive tour of the Cultural Triangle.',
        itinerary: [
          {
            day: 1,
            title: 'Arrival & Sigiriya Introduction',
            description: 'Arrive in Sigiriya and visit the magnificent Lion Rock fortress.',
            activities: ['Airport pickup', 'Sigiriya Rock Fortress', 'Sunset at Pidurangala'],
            accommodation: 'Sigiriya Village Hotel',
            meals: ['Dinner']
          }
        ],
        inclusions: ['All accommodation in 3-4 star hotels', 'Daily breakfast, lunch, and dinner'],
        exclusions: ['International flights', 'Personal expenses'],
        accommodation: ['Sigiriya Village Hotel', 'Polonnaruwa Rest House'],
        transportation: 'Air-conditioned van with professional driver',
        groupSize: '2-12 people',
        difficulty: 'Easy to Moderate',
        bestTime: 'January to April, July to September',
        images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop'],
        status: 'active'
      }
      setTour(existingTour)
    }
  }, [isNew, tourId])

  const handleSave = () => {
    // Save tour data
    console.log('Saving tour:', tour)
    alert('Tour saved successfully!')
    router.push('/admin/tours')
  }

  const addInclusion = () => {
    if (newInclusion.trim()) {
      setTour({ ...tour, inclusions: [...tour.inclusions, newInclusion.trim()] })
      setNewInclusion('')
    }
  }

  const addExclusion = () => {
    if (newExclusion.trim()) {
      setTour({ ...tour, exclusions: [...tour.exclusions, newExclusion.trim()] })
      setNewExclusion('')
    }
  }

  const addAccommodation = () => {
    if (newAccommodation.trim()) {
      setTour({ ...tour, accommodation: [...tour.accommodation, newAccommodation.trim()] })
      setNewAccommodation('')
    }
  }

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setTour({ ...tour, highlights: [...tour.highlights, newHighlight.trim()] })
      setNewHighlight('')
    }
  }

  const addImage = () => {
    if (newImage.trim()) {
      setTour({ ...tour, images: [...tour.images, newImage.trim()] })
      setNewImage('')
    }
  }

  const removeItem = (list: string[], index: number, field: keyof TourPackage) => {
    const newList = list.filter((_, i) => i !== index)
    setTour({ ...tour, [field]: newList })
  }

  const toggleDestination = (destinationName: string) => {
    const newDestinations = tour.destinations.includes(destinationName)
      ? tour.destinations.filter(d => d !== destinationName)
      : [...tour.destinations, destinationName]
    setTour({ ...tour, destinations: newDestinations })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/tours"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? 'Create New Tour' : 'Edit Tour Package'}
            </h1>
            <p className="text-gray-600">
              {isNew ? 'Add a new tour package to your website' : 'Update tour package details'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setTour({ ...tour, status: 'draft' })}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Save as Draft
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Save & Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tour Name</label>
                <input
                  type="text"
                  value={tour.name}
                  onChange={(e) => setTour({ ...tour, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tour name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input
                  type="text"
                  value={tour.duration}
                  onChange={(e) => setTour({ ...tour, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5 Days / 4 Nights"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="text"
                  value={tour.price}
                  onChange={(e) => setTour({ ...tour, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., $899"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
                <input
                  type="text"
                  value={tour.groupSize}
                  onChange={(e) => setTour({ ...tour, groupSize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2-12 people"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={tour.difficulty}
                  onChange={(e) => setTour({ ...tour, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Easy to Moderate">Easy to Moderate</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Moderate to Hard">Moderate to Hard</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Best Time</label>
                <input
                  type="text"
                  value={tour.bestTime}
                  onChange={(e) => setTour({ ...tour, bestTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., January to April"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={tour.description}
                onChange={(e) => setTour({ ...tour, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tour description"
              />
            </div>
          </div>

          {/* Destinations & Map */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Destinations & Route</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Destinations</label>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {availableDestinations.map((dest) => (
                    <label key={dest.name} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={tour.destinations.includes(dest.name)}
                        onChange={() => toggleDestination(dest.name)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{dest.name}</span>
                      <span className="text-xs text-gray-500">({dest.region})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tour Route Map</label>
                {tourDestinations.length > 0 ? (
                  <div className="h-60 border border-gray-300 rounded-lg overflow-hidden">
                    <MapboxMap destinations={tourDestinations} tourName={tour.name} />
                  </div>
                ) : (
                  <div className="h-60 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <Map className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Select destinations to view route map</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Highlights</h2>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add a highlight"
              />
              <button
                onClick={addHighlight}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {tour.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{highlight}</span>
                  <button
                    onClick={() => removeItem(tour.highlights, index, 'highlights')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tour Images</h2>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Image URL"
              />
              <button
                onClick={addImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tour.images.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={image}
                    alt={`Tour image ${index + 1}`}
                    width={200}
                    height={128}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeItem(tour.images, index, 'images')}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Status</h3>
            <select
              value={tour.status}
              onChange={(e) => setTour({ ...tour, status: e.target.value as 'active' | 'draft' | 'archived' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Inclusions */}
          <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">What&apos;s Included</h3>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add inclusion"
              />
              <button
                onClick={addInclusion}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {tour.inclusions.map((inclusion, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm">{inclusion}</span>
                  <button
                    onClick={() => removeItem(tour.inclusions, index, 'inclusions')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Not Included</h3>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add exclusion"
              />
              <button
                onClick={addExclusion}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {tour.exclusions.map((exclusion, index) => (
                <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded">
                  <span className="text-sm">{exclusion}</span>
                  <button
                    onClick={() => removeItem(tour.exclusions, index, 'exclusions')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Accommodation</h3>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newAccommodation}
                onChange={(e) => setNewAccommodation(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add accommodation"
              />
              <button
                onClick={addAccommodation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {tour.accommodation.map((acc, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                  <span className="text-sm">{acc}</span>
                  <button
                    onClick={() => removeItem(tour.accommodation, index, 'accommodation')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Transportation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Transportation</h3>
            <input
              type="text"
              value={tour.transportation}
              onChange={(e) => setTour({ ...tour, transportation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Air-conditioned van with professional driver"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
