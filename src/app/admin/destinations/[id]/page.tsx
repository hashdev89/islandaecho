'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Save, Trash2, Plus, X } from 'lucide-react'
import ImageSelector from '@/components/ImageSelector'

interface Destination {
  id: string
  name: string
  region: string
  lat: number
  lng: number
  description: string
  image: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export default function EditDestination() {
  const params = useParams()
  const router = useRouter()
  const destinationId = params.id as string

  const [destination, setDestination] = useState<Destination | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    lat: '',
    lng: '',
    description: '',
    image: '',
    status: 'active' as 'active' | 'inactive'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageSelectorOpen, setImageSelectorOpen] = useState(false)

  useEffect(() => {
    if (destinationId) {
      const fetchDestination = async () => {
        try {
          const response = await fetch('/api/destinations')
          const result = await response.json()
          
          if (result.success) {
            const dest = result.data.find((d: Destination) => d.id === destinationId)
            if (dest) {
              setDestination(dest)
              setFormData({
                name: dest.name || '',
                region: dest.region || '',
                lat: dest.lat?.toString() || '',
                lng: dest.lng?.toString() || '',
                description: dest.description || '',
                image: dest.image || '',
                status: dest.status || 'active'
              })
            } else {
              setError('Destination not found')
            }
          } else {
            setError('Failed to fetch destination')
          }
        } catch (error) {
          console.error('Error fetching destination:', error)
          setError('Failed to fetch destination')
        } finally {
          setLoading(false)
        }
      }
      fetchDestination()
    }
  }, [destinationId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.name || !formData.region || !formData.lat || !formData.lng) {
        setError('Please fill in all required fields')
        setSaving(false)
        return
      }

      // Validate coordinates
      const lat = parseFloat(formData.lat)
      const lng = parseFloat(formData.lng)
      
      if (isNaN(lat) || isNaN(lng)) {
        setError('Please enter valid coordinates')
        setSaving(false)
        return
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError('Please enter valid coordinates (Lat: -90 to 90, Lng: -180 to 180)')
        setSaving(false)
        return
      }

      const response = await fetch('/api/destinations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: destinationId,
          ...formData,
          lat: lat,
          lng: lng
        })
      })

      let result: { success?: boolean; message?: string } = {}
      const contentType = response.headers.get('content-type')
      try {
        const text = await response.text()
        if (text && contentType?.includes('application/json')) {
          result = JSON.parse(text)
        }
      } catch (_) {
        result = {}
      }

      if (result.success) {
        router.push('/admin/destinations')
      } else {
        const msg = result.message || (response.ok ? 'Update failed' : `Server error ${response.status}`)
        console.error('Destination update failed:', msg, result)
        setError(msg)
      }
    } catch (error) {
      console.error('Error updating destination:', error)
      const msg = error instanceof Error ? error.message : 'Failed to update destination. Please try again.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/destinations?id=${destinationId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        router.push('/admin/destinations')
      } else {
        setError(result.message || 'Failed to delete destination')
      }
    } catch (error) {
      console.error('Error deleting destination:', error)
      setError('Failed to delete destination. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading destination...</span>
      </div>
    )
  }

  if (error && !destination) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/admin/destinations"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Destinations
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-medium text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/destinations"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Destinations
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Destination</h1>
        <p className="text-gray-600">Update destination information</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Sigiriya"
                required
              />
            </div>

            {/* Region */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              <select
                name="region"
                value={formData.region || ''}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="number"
                name="lat"
                value={formData.lat || ''}
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
                value={formData.lng || ''}
                onChange={handleInputChange}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 80.7603"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status || 'active'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the destination..."
              />
            </div>

            {/* Destination Image – upload or paste URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Image
              </label>
              <div className="space-y-3">
                {formData.image ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                    <Image
                      src={formData.image}
                      alt="Destination preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => setImageSelectorOpen(true)}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-700"
                >
                  <Plus className="w-5 h-5" />
                  {formData.image ? 'Change Image (upload or select)' : 'Upload or select from library'}
                </button>
                <div className="relative">
                  <span className="block text-xs text-gray-500 mb-1">Or paste image URL</span>
                  <input
                    type="url"
                    name="image"
                    value={formData.image || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <ImageSelector
                isOpen={imageSelectorOpen}
                onClose={() => setImageSelectorOpen(false)}
                onSelect={(url) => {
                  setFormData(prev => ({ ...prev, image: url }))
                  setImageSelectorOpen(false)
                }}
                currentImageUrl={formData.image}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/admin/destinations"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
