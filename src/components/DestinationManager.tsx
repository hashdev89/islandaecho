'use client'

import { useState } from 'react'
import { X, Save, Plus } from 'lucide-react'
import ImageSelector from './ImageSelector'

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
  const PRESET_REGIONS = ['Cultural Triangle', 'Hill Country', 'Southern Coast', 'Wildlife', 'Beach', 'Adventure', 'Other', 'Western Province', 'Central Province', 'Southern Province', 'Uva Province', 'North Central Province', 'Eastern Province', 'Northern Province']
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
  const [imageSelectorOpen, setImageSelectorOpen] = useState(false)
  const isCustomRegion = !formData.region || !PRESET_REGIONS.includes(formData.region)

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
      // Validate required fields (region can be preset or custom)
      const regionValue = (formData.region || '').trim()
      if (!formData.name || !regionValue || !formData.lat || !formData.lng) {
        setError('Please fill in all required fields (including region)')
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
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 overflow-y-auto max-h-96 flex-1">
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
                  value={PRESET_REGIONS.includes(formData.region) ? formData.region : '__custom__'}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '__custom__') {
                      setFormData(prev => ({ ...prev, region: '' }))
                    } else {
                      setFormData(prev => ({ ...prev, region: v }))
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!isCustomRegion}
                >
                  <option value="">Select a region</option>
                  {PRESET_REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  <option value="__custom__">+ Add new region...</option>
                </select>
                {isCustomRegion && (
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Type your new region name"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
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

              {/* Image Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <div className="space-y-3">
                  {formData.image && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                      <img
                        src={formData.image}
                        alt="Destination preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setImageSelectorOpen(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-700"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{formData.image ? 'Change Image' : 'Select Image from Uploaded Images'}</span>
                  </button>
                  <p className="text-xs text-gray-500">Only images uploaded through the Images tab can be used</p>
                </div>
              </div>
            </div>
          </div>

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
        </form>
      </div>

      {/* Image Selector */}
      <ImageSelector
        isOpen={imageSelectorOpen}
        onClose={() => setImageSelectorOpen(false)}
        onSelect={(imageUrl) => {
          setFormData({ ...formData, image: imageUrl })
          setImageSelectorOpen(false)
        }}
        currentImageUrl={formData.image}
      />
    </div>
  )
}
