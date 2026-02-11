'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Search, Check } from 'lucide-react'

interface Destination {
  id: string
  name: string
  region: string
  lat: number
  lng: number
  description: string
  image: string
  status: 'active' | 'inactive'
}

interface DestinationSelectorProps {
  isOpen: boolean
  onClose: () => void
  selectedDestinations: string[]
  onDestinationSelect: (destinationName: string) => void
  onDestinationDeselect: (destinationName: string) => void
}

export default function DestinationSelector({
  isOpen,
  onClose,
  selectedDestinations,
  onDestinationSelect,
  onDestinationDeselect
}: DestinationSelectorProps) {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchDestinations()
    }
  }, [isOpen])

  const fetchDestinations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/destinations')
      const result = await response.json()
      
      if (result.success) {
        setDestinations(result.data || [])
      } else {
        console.error('Failed to fetch destinations:', result.message)
      }
    } catch (error) {
      console.error('Error fetching destinations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.region.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = regionFilter === 'all' || dest.region === regionFilter
    return matchesSearch && matchesRegion && dest.status === 'active'
  })

  const regions = [...new Set([...destinations.map(dest => dest.region), 'Customize'])]

  const handleDestinationToggle = (destinationName: string) => {
    if (selectedDestinations.includes(destinationName)) {
      onDestinationDeselect(destinationName)
    } else {
      onDestinationSelect(destinationName)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Select Destinations</h2>
            <p className="text-sm text-gray-600">Choose destinations for your tour route</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search destinations by name or region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Destinations List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading destinations...</span>
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations found</h3>
              <p className="text-gray-600">
                {searchTerm || regionFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No destinations available.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDestinations.map((destination) => (
                <div
                  key={destination.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDestinations.includes(destination.name)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleDestinationToggle(destination.name)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{destination.name}</h3>
                        {selectedDestinations.includes(destination.name) && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{destination.region}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {destination.description}
                      </p>
                      <div className="mt-2 text-xs text-gray-400">
                        {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedDestinations.length} destination{selectedDestinations.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
