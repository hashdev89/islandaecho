'use client'

import { useState } from 'react'
import { X, MapPin, Plus, Save } from 'lucide-react'

interface DestinationManagerProps {
  isOpen: boolean
  onClose: () => void
  onDestinationAdded: () => void
}

export default function DestinationManager({
  isOpen,
  onClose,
  onDestinationAdded
}: DestinationManagerProps) {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    lat: '',
    lng: '',
    description: '',
    image: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.name || !formData.region || !formData.lat || !formData.lng) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Validate coordinates
      const lat = parseFloat(formData.lat)
      const lng = parseFloat(formData.lng)
      
      if (isNaN(lat) || isNaN(lng)) {
        setError('Please enter valid coordinates')
        setLoading(false)
        return
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError('Please enter valid coordinates (Lat: -90 to 90, Lng: -180 to 180)')
        setLoading(false)
        return
      }

      const response = await fetch('/api/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          lat: lat,
          lng: lng,
          status: 'active'
        })
      })

      const result = await response.json()
      console.log('Destination creation response:', result)

      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          region: '',
          lat: '',
          lng: '',
          description: '',
          image: ''
        })
        onDestinationAdded()
        onClose()
      } else {
        console.error('Destination creation failed:', result)
        setError(result.message || 'Failed to create destination')
      }
    } catch (error) {
      console.error('Error creating destination:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError('Failed to create destination. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      region: '',
      lat: '',
      lng: '',
      description: '',
      image: ''
    })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Destination</h2>
            <p className="text-sm text-gray-600">Create a new destination for your tours</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-96">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Sigiriya"
                required
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a region</option>
                <option value="Cultural Triangle">Cultural Triangle</option>
                <option value="Hill Country">Hill Country</option>
                <option value="Southern Coast">Southern Coast</option>
                <option value="Wildlife">Wildlife</option>
                <option value="Beach">Beach</option>
                <option value="Adventure">Adventure</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  name="lat"
                  value={formData.lat}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 7.9570"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  name="lng"
                  value={formData.lng}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 80.7603"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the destination..."
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Destination
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
