'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Search, Loader2 } from 'lucide-react'

interface ImageItem {
  id: string
  name: string
  url: string
  category?: string
}

interface ImageSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (imageUrl: string) => void
  currentImageUrl?: string
}

export default function ImageSelector({ isOpen, onClose, onSelect, currentImageUrl }: ImageSelectorProps) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchImages()
    }
  }, [isOpen])

  const fetchImages = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/images')
      const result = await response.json()
      
      if (result.success) {
        setImages(result.data || [])
      } else {
        setError(result.error || 'Failed to load images')
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (imageUrl: string) => {
    onSelect(imageUrl)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Select Image</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchTerm ? 'No images found matching your search' : 'No images available'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleSelect(image.url)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    currentImageUrl === image.url
                      ? 'border-blue-600 ring-2 ring-blue-300'
                      : 'border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    className="object-cover"
                  />
                  {currentImageUrl === image.url && (
                    <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Selected
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

