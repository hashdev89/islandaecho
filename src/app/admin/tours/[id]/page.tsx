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
  Map
} from 'lucide-react'
import MapboxMap from '../../../../components/MapboxMap'
import DestinationSelector from '../../../../components/DestinationSelector'
import DestinationManager from '../../../../components/DestinationManager'
import { dataSync, TourData } from '../../../../lib/dataSync'

interface Day {
  day: number
  title: string
  description: string
  activities: string[]
  accommodation: string
  meals: string[]
  transportation?: string
  travelTime?: string
  image?: string
}

interface TourPackage {
  id: string
  name: string
  duration: string
  price: string
  style: string
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
  images: string[]
  status: 'active' | 'draft' | 'archived'
  featured?: boolean
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
    style: '',
    destinations: [],
    highlights: [],
    keyExperiences: [],
    description: '',
    itinerary: [],
    inclusions: [],
    exclusions: [],
    accommodation: [],
    transportation: '',
    groupSize: '',
    bestTime: '',
    images: [],
    status: 'draft',
    featured: false
  })

  const [availableDestinations, setAvailableDestinations] = useState<Destination[]>([])

  // Fetch destinations from API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations')
        const result = await response.json()
        
        if (result.success) {
          // Map API data to Destination format
          const mappedDestinations = result.data.map((dest: unknown) => {
            const d = dest as Record<string, unknown>
            return {
              name: d.name as string,
              lat: d.lat as number,
              lng: d.lng as number,
              region: d.region as string
            }
          })
          setAvailableDestinations(mappedDestinations)
        }
      } catch (error) {
        console.error('Error fetching destinations:', error)
      }
    }
    
    fetchDestinations()
  }, [])

  const [newInclusion, setNewInclusion] = useState('')
  const [newExclusion, setNewExclusion] = useState('')
  const [newAccommodation, setNewAccommodation] = useState('')
  const [newHighlight, setNewHighlight] = useState('')
  const [newKeyExperience, setNewKeyExperience] = useState('')
  const [newImage, setNewImage] = useState('')
  const [newWhatToBring, setNewWhatToBring] = useState('')
  const [showDestinationSelector, setShowDestinationSelector] = useState(false)
  const [showDestinationManager, setShowDestinationManager] = useState(false)

  // Get map coordinates for selected destinations
  const tourDestinations = (tour.destinations || []).map(destName => {
    const dest = availableDestinations.find(d => d.name === destName)
    return dest || null
  }).filter(Boolean) as Destination[]

  // Debug logging
  console.log('Tour destinations:', tour.destinations)
  console.log('Available destinations:', availableDestinations)
  console.log('Mapped tour destinations:', tourDestinations)

  useEffect(() => {
    const load = async () => {
      if (!isNew) {
        console.log('Fetching tours for tourId:', tourId)
        const all = await dataSync.fetchTours()
        console.log('All tours:', all)
        const found = (all as unknown[]).find(t => (t as Record<string, unknown>).id === tourId)
        if (found) {
          console.log('Found tour data:', found)
          const tourData = found as Record<string, unknown>
          console.log('Tour destinations:', tourData.destinations)
          setTour(found as TourPackage)
        } else {
          console.log('Tour not found with ID:', tourId)
        }
      }
    }
    load()
  }, [isNew, tourId])

  // Force re-render when availableDestinations changes
  useEffect(() => {
    console.log('Available destinations updated:', availableDestinations)
  }, [availableDestinations])

  // Force re-render when tour destinations change
  useEffect(() => {
    console.log('Tour destinations updated:', tour.destinations)
  }, [tour.destinations])

  const handleSave = async () => {
    try {
      // Client-side validation for required fields
      if (!tour.name?.trim()) {
        alert('Please enter a tour name')
        return
      }
      if (!tour.duration?.trim()) {
        alert('Please enter a duration')
        return
      }
      if (!tour.price?.trim()) {
        alert('Please enter a price')
        return
      }

      const payload = { ...tour }
      console.log('Full tour payload before processing:', payload)
      
      if (isNew) {
        const { id: _id, ...createData } = payload as Record<string, unknown>
        console.log('Creating tour with data:', createData)
        console.log('Required fields check:', {
          name: createData.name,
          duration: createData.duration,
          price: createData.price
        })
        
        const created = await dataSync.createTour(createData as Omit<TourPackage, 'id'>)
        if (created) {
          console.log('Tour created successfully:', created)
          alert('Tour created successfully!')
        } else {
          console.error('Failed to create tour - dataSync returned null')
          alert('Failed to create tour. Please check the console for errors.')
        }
      } else {
        const updated = await dataSync.updateTour(payload as TourData)
        if (updated) {
          console.log('Tour updated successfully:', updated)
          alert('Tour updated successfully!')
        } else {
          console.error('Failed to update tour')
          alert('Failed to update tour. Please check the console for errors.')
        }
      }
      router.push('/admin/tours')
    } catch (error) {
      console.error('Error saving tour:', error)
      alert('Error saving tour. Please check the console for details.')
    }
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

  const addKeyExperience = () => {
    if (newKeyExperience.trim()) {
      setTour({ ...tour, keyExperiences: [...(tour.keyExperiences || []), newKeyExperience.trim()] })
      setNewKeyExperience('')
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

  const handleDestinationSelect = (destinationName: string) => {
    if (!tour.destinations.includes(destinationName)) {
      setTour({ ...tour, destinations: [...tour.destinations, destinationName] })
    }
  }

  const handleDestinationDeselect = (destinationName: string) => {
    setTour({ ...tour, destinations: tour.destinations.filter(d => d !== destinationName) })
  }

  const handleDestinationAdded = () => {
    // Refresh the destination selector when a new destination is added
    setShowDestinationSelector(false)
    setShowDestinationManager(false)
    
    // Refetch destinations from API
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations')
        const result = await response.json()
        
        if (result.success) {
          const mappedDestinations = result.data.map((dest: unknown) => {
            const d = dest as Record<string, unknown>
            return {
              name: d.name as string,
              lat: d.lat as number,
              lng: d.lng as number,
              region: d.region as string
            }
          })
          setAvailableDestinations(mappedDestinations)
        }
      } catch (error) {
        console.error('Error fetching destinations:', error)
      }
    }
    
    fetchDestinations()
  }

  // Itinerary management functions
  const addDay = () => {
    const currentItinerary = tour.itinerary || []
    const newDay: Day = {
      day: currentItinerary.length + 1,
      title: '',
      description: '',
      activities: [],
      accommodation: '',
      meals: [],
      transportation: '',
      travelTime: '',
      image: ''
    }
    setTour({ ...tour, itinerary: [...currentItinerary, newDay] })
  }

  const removeDay = (dayIndex: number) => {
    const currentItinerary = tour.itinerary || []
    const newItinerary = currentItinerary.filter((_, index) => index !== dayIndex)
    // Renumber days
    const renumberedItinerary = newItinerary.map((day, index) => ({
      ...day,
      day: index + 1
    }))
    setTour({ ...tour, itinerary: renumberedItinerary })
  }

  const updateDay = (dayIndex: number, field: keyof Day, value: string) => {
    const currentItinerary = tour.itinerary || []
    const newItinerary = [...currentItinerary]
    newItinerary[dayIndex] = { ...newItinerary[dayIndex], [field]: value }
    setTour({ ...tour, itinerary: newItinerary })
  }

  const addDayActivity = (dayIndex: number) => {
    const currentItinerary = tour.itinerary || []
    const newItinerary = [...currentItinerary]
    if (!newItinerary[dayIndex].activities) {
      newItinerary[dayIndex].activities = []
    }
    newItinerary[dayIndex].activities.push('')
    setTour({ ...tour, itinerary: newItinerary })
  }

  const removeDayActivity = (dayIndex: number, activityIndex: number) => {
    const currentItinerary = tour.itinerary || []
    const newItinerary = [...currentItinerary]
    if (newItinerary[dayIndex].activities) {
      newItinerary[dayIndex].activities = newItinerary[dayIndex].activities.filter((_, index) => index !== activityIndex)
    }
    setTour({ ...tour, itinerary: newItinerary })
  }

  const updateDayActivity = (dayIndex: number, activityIndex: number, value: string) => {
    const currentItinerary = tour.itinerary || []
    const newItinerary = [...currentItinerary]
    if (newItinerary[dayIndex].activities) {
      newItinerary[dayIndex].activities[activityIndex] = value
    }
    setTour({ ...tour, itinerary: newItinerary })
  }

  const addDayMeal = (dayIndex: number) => {
    const currentItinerary = tour.itinerary || []
    const newItinerary = [...currentItinerary]
    if (!newItinerary[dayIndex].meals) {
      newItinerary[dayIndex].meals = []
    }
    newItinerary[dayIndex].meals.push('')
    setTour({ ...tour, itinerary: newItinerary })
  }

  const removeDayMeal = (dayIndex: number, mealIndex: number) => {
    const currentItinerary = tour.itinerary || []
    const newItinerary = [...currentItinerary]
    if (newItinerary[dayIndex].meals) {
      newItinerary[dayIndex].meals = newItinerary[dayIndex].meals.filter((_, index) => index !== mealIndex)
    }
    setTour({ ...tour, itinerary: newItinerary })
  }

  const updateDayMeal = (dayIndex: number, mealIndex: number, value: string) => {
    const currentItinerary = tour.itinerary || []
    const newItinerary = [...currentItinerary]
    if (newItinerary[dayIndex].meals) {
      newItinerary[dayIndex].meals[mealIndex] = value
    }
    setTour({ ...tour, itinerary: newItinerary })
  }

  // Important Information management functions
  const addRequirement = () => {
    const currentImportantInfo = tour.importantInfo || { requirements: [], whatToBring: [] }
    const newRequirement = {
      activity: '',
      requirements: ['']
    }
    setTour({
      ...tour,
      importantInfo: {
        ...currentImportantInfo,
        requirements: [...currentImportantInfo.requirements, newRequirement]
      }
    })
  }

  const removeRequirement = (reqIndex: number) => {
    const currentImportantInfo = tour.importantInfo || { requirements: [], whatToBring: [] }
    const newRequirements = currentImportantInfo.requirements.filter((_, index) => index !== reqIndex)
    setTour({
      ...tour,
      importantInfo: {
        ...currentImportantInfo,
        requirements: newRequirements
      }
    })
  }

  const addRequirementItem = (reqIndex: number) => {
    const currentImportantInfo = tour.importantInfo || { requirements: [], whatToBring: [] }
    const newRequirements = [...currentImportantInfo.requirements]
    if (newRequirements[reqIndex]) {
      newRequirements[reqIndex].requirements.push('')
    }
    setTour({
      ...tour,
      importantInfo: {
        ...currentImportantInfo,
        requirements: newRequirements
      }
    })
  }

  const removeRequirementItem = (reqIndex: number, requirementIndex: number) => {
    const currentImportantInfo = tour.importantInfo || { requirements: [], whatToBring: [] }
    const newRequirements = [...currentImportantInfo.requirements]
    if (newRequirements[reqIndex]) {
      newRequirements[reqIndex].requirements = newRequirements[reqIndex].requirements.filter((_, index) => index !== requirementIndex)
    }
    setTour({
      ...tour,
      importantInfo: {
        ...currentImportantInfo,
        requirements: newRequirements
      }
    })
  }

  const updateRequirement = (reqIndex: number, requirementIndex: number, value: string) => {
    const currentImportantInfo = tour.importantInfo || { requirements: [], whatToBring: [] }
    const newRequirements = [...currentImportantInfo.requirements]
    if (newRequirements[reqIndex] && newRequirements[reqIndex].requirements[requirementIndex] !== undefined) {
      newRequirements[reqIndex].requirements[requirementIndex] = value
    }
    setTour({
      ...tour,
      importantInfo: {
        ...currentImportantInfo,
        requirements: newRequirements
      }
    })
  }

  const updateRequirementActivity = (reqIndex: number, value: string) => {
    const currentImportantInfo = tour.importantInfo || { requirements: [], whatToBring: [] }
    const newRequirements = [...currentImportantInfo.requirements]
    if (newRequirements[reqIndex]) {
      newRequirements[reqIndex].activity = value
    }
    setTour({
      ...tour,
      importantInfo: {
        ...currentImportantInfo,
        requirements: newRequirements
      }
    })
  }

  const addWhatToBring = () => {
    if (newWhatToBring.trim()) {
      const currentImportantInfo = tour.importantInfo || { requirements: [], whatToBring: [] }
      setTour({
        ...tour,
        importantInfo: {
          ...currentImportantInfo,
          whatToBring: [...currentImportantInfo.whatToBring, newWhatToBring.trim()]
        }
      })
      setNewWhatToBring('')
    }
  }

  const removeWhatToBring = (index: number) => {
    const currentImportantInfo = tour.importantInfo || { requirements: [], whatToBring: [] }
    const newWhatToBring = currentImportantInfo.whatToBring.filter((_, i) => i !== index)
    setTour({
      ...tour,
      importantInfo: {
        ...currentImportantInfo,
        whatToBring: newWhatToBring
      }
    })
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tour Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tour.name}
                  onChange={(e) => setTour({ ...tour, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tour name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tour.duration}
                  onChange={(e) => setTour({ ...tour, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5 Days / 4 Nights"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tour.price}
                  onChange={(e) => setTour({ ...tour, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., $899"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <select
                  value={tour.style}
                  onChange={(e) => setTour({ ...tour, style: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select style</option>
                  <option value="Fun & Adventure">Fun & Adventure</option>
                  <option value="Cultural & Heritage">Cultural & Heritage</option>
                  <option value="Nature & Wildlife">Nature & Wildlife</option>
                  <option value="Relaxation & Wellness">Relaxation & Wellness</option>
                  <option value="Family Friendly">Family Friendly</option>
                  <option value="Luxury Experience">Luxury Experience</option>
                  <option value="Budget Travel">Budget Travel</option>
                  <option value="Romantic Getaway">Romantic Getaway</option>
                </select>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Destinations & Route</h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDestinationSelector(true)}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Select Destinations
                </button>
                <button
                  type="button"
                  onClick={() => setShowDestinationManager(true)}
                  className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Destinations</label>
                {tour.destinations.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {tour.destinations.map((destName) => {
                      const dest = availableDestinations.find(d => d.name === destName)
                      return (
                        <div key={destName} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg mb-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{destName}</span>
                            {dest && <span className="text-xs text-gray-500">({dest.region})</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleDestination(destName)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="max-h-60 border border-gray-300 rounded-lg p-6 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No destinations selected</p>
                      <p className="text-xs">Click &quot;Select Destinations&quot; to add destinations</p>
                    </div>
                  </div>
                )}
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

          {/* Key Experiences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Key Experiences</h2>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newKeyExperience}
                onChange={(e) => setNewKeyExperience(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add a key experience"
              />
              <button
                onClick={addKeyExperience}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {(tour.keyExperiences || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{item}</span>
                  <button
                    onClick={() => removeItem(tour.keyExperiences || [], index, 'keyExperiences')}
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
                    src={image || '/placeholder-image.svg'}
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

          {/* Itinerary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Daily Itinerary</h2>
            <div className="space-y-4">
              {(tour.itinerary || []).map((day, dayIndex) => (
                <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Day {day.day}</h3>
                    <button
                      onClick={() => removeDay(dayIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Day Title</label>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => updateDay(dayIndex, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Day title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation</label>
                      <input
                        type="text"
                        value={day.accommodation}
                        onChange={(e) => updateDay(dayIndex, 'accommodation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Accommodation"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={day.description}
                      onChange={(e) => updateDay(dayIndex, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Day description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transportation</label>
                      <input
                        type="text"
                        value={day.transportation || ''}
                        onChange={(e) => updateDay(dayIndex, 'transportation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Transportation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Travel Time</label>
                      <input
                        type="text"
                        value={day.travelTime || ''}
                        onChange={(e) => updateDay(dayIndex, 'travelTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Travel time"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Day Image URL</label>
                    <input
                      type="text"
                      value={day.image || ''}
                      onChange={(e) => updateDay(dayIndex, 'image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Image URL for this day"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Activities</label>
                    <div className="space-y-2">
                      {(day.activities || []).map((activity, activityIndex) => (
                        <div key={activityIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={activity}
                            onChange={(e) => updateDayActivity(dayIndex, activityIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Activity"
                          />
                          <button
                            onClick={() => removeDayActivity(dayIndex, activityIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addDayActivity(dayIndex)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Plus className="h-4 w-4 inline mr-1" />
                        Add Activity
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meals</label>
                    <div className="space-y-2">
                      {(day.meals || []).map((meal, mealIndex) => (
                        <div key={mealIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={meal}
                            onChange={(e) => updateDayMeal(dayIndex, mealIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Meal"
                          />
                          <button
                            onClick={() => removeDayMeal(dayIndex, mealIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addDayMeal(dayIndex)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <Plus className="h-4 w-4 inline mr-1" />
                        Add Meal
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addDay}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add New Day
              </button>
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

          {/* Important Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Important Information</h3>
            
            {/* Requirements */}
            <div className="mb-6">
              <h4 className="text-md font-medium mb-3">Activity Requirements</h4>
              <div className="space-y-4">
                {(tour.importantInfo?.requirements || []).map((req, reqIndex) => (
                  <div key={reqIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={req.activity}
                        onChange={(e) => updateRequirementActivity(reqIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                        placeholder="Activity name"
                      />
                      <button
                        onClick={() => removeRequirement(reqIndex)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {req.requirements.map((requirement, requirementIndex) => (
                        <div key={requirementIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={requirement}
                            onChange={(e) => updateRequirement(reqIndex, requirementIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Requirement"
                          />
                          <button
                            onClick={() => removeRequirementItem(reqIndex, requirementIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addRequirementItem(reqIndex)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Plus className="h-3 w-3 inline mr-1" />
                        Add Requirement
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addRequirement}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Activity Requirement
                </button>
              </div>
            </div>

            {/* What to Bring */}
            <div>
              <h4 className="text-md font-medium mb-3">What to Bring</h4>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newWhatToBring}
                  onChange={(e) => setNewWhatToBring(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add item to bring"
                />
                <button
                  onClick={addWhatToBring}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {(tour.importantInfo?.whatToBring || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                    <span className="text-sm">{item}</span>
                    <button
                      onClick={() => removeWhatToBring(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Featured</h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!tour.featured}
                onChange={(e) => setTour({ ...tour, featured: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show as featured tour package</span>
            </label>
          </div>
        </div>
      </div>

      {/* Destination Selector Modal */}
      <DestinationSelector
        isOpen={showDestinationSelector}
        onClose={() => setShowDestinationSelector(false)}
        selectedDestinations={tour.destinations}
        onDestinationSelect={handleDestinationSelect}
        onDestinationDeselect={handleDestinationDeselect}
      />

      {/* Destination Manager Modal */}
      <DestinationManager
        isOpen={showDestinationManager}
        onClose={() => setShowDestinationManager(false)}
        onDestinationAdded={handleDestinationAdded}
      />
    </div>
  )
}
