'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Upload,
  Search,
  Filter,
  Trash2,
  Download,
  Copy,
  Eye,
  Image as ImageIcon,
  FolderOpen,
  Grid,
  List,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import ImageUploadModal from '@/components/ImageUploadModal'

interface ImageItem {
  id: string
  name: string
  url: string
  size: string
  dimensions: string
  category: string
  uploadedAt: string
  usedIn: string[]
}

export default function ImagesManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [imageUsage, setImageUsage] = useState<{ [key: string]: string[] }>({})

  // Fetch image usage from API
  const fetchImageUsage = async () => {
    try {
      const response = await fetch('/api/images/usage')
      const result = await response.json()
      
      if (result.success) {
        setImageUsage(result.data)
      }
    } catch (err: unknown) {
      console.error('Failed to fetch image usage:', err)
    }
  }

  // Fetch images from API
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/images')
      const result = await response.json()
      
      if (result.success) {
        setImages(result.data)
        // Also fetch usage information
        await fetchImageUsage()
      } else {
        setError(result.error || 'Failed to load images')
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load images')
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete image
  const deleteImage = async (imageId: string) => {
    try {
      setDeleting(imageId)
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        setImages(prev => prev.filter(img => img.id !== imageId))
        setSelectedImages(prev => prev.filter(id => id !== imageId))
      } else {
        setError(result.error || 'Failed to delete image')
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to delete image')
    } finally {
      setDeleting(null)
    }
  }

  // Handle upload success
  const handleUploadSuccess = (newImage: ImageItem) => {
    setImages(prev => [newImage, ...prev])
    setUploadModalOpen(false)
    // Refresh usage data
    fetchImageUsage()
  }

  // Load images on component mount
  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const categories = [...new Set(images.map(img => img.category))]

  const filteredImages = images.filter(img => {
    const matchesSearch = img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         img.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || img.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const handleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([])
    } else {
      setSelectedImages(filteredImages.map(img => img.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (confirm(`Are you sure you want to delete ${selectedImages.length} image(s)?`)) {
      for (const imageId of selectedImages) {
        await deleteImage(imageId)
      }
      setSelectedImages([])
    }
  }

  const handleDeleteSingle = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      await deleteImage(imageId)
    }
  }

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('Image URL copied to clipboard!')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Image Management</h1>
          <p className="text-gray-600">Upload and manage images for your website</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Images
          </button>
          <button 
            onClick={fetchImages}
            disabled={loading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading images...
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ImageIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Images</p>
              <p className="text-2xl font-bold text-gray-900">{images.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">17.1 MB</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Selected</p>
              <p className="text-2xl font-bold text-gray-900">{selectedImages.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search images by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            {selectedImages.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Images Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Header with Preview Thumbnail */}
                <div className="bg-gray-50 p-3 flex items-center space-x-3">
                  <img
                  src={image.url}
                  alt={image.name}
                    className="w-12 h-8 object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.svg';
                      target.alt = 'Image not found';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
                    <span className="text-xs text-gray-500">{image.category}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => copyImageUrl(image.url)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(image.url, '_blank')}
                      className="text-gray-400 hover:text-gray-600"
                      title="View full size"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleImageSelect(image.id)}
                      className={`${
                        selectedImages.includes(image.id)
                          ? 'text-blue-600'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title="Select image"
                    >
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(image.id)}
                        onChange={() => handleImageSelect(image.id)}
                        className="sr-only"
                      />
                      <div className="w-4 h-4 border-2 border-current rounded"></div>
                    </button>
                  </div>
                </div>
                
                {/* Main Image */}
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.svg';
                    target.alt = 'Image not found';
                  }}
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{image.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{image.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span>{image.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Used in:</span>
                    <span>{imageUsage[image.url]?.length || 0} places</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleImageSelect(image.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {selectedImages.includes(image.id) ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedImages.length === filteredImages.length && filteredImages.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredImages.map((image) => (
                <tr key={image.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => handleImageSelect(image.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="h-12 w-12 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.png'; // Fallback image
                        target.alt = 'Image not found';
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{image.name}</div>
                    <div className="text-sm text-gray-500">{image.dimensions}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {image.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {image.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {imageUsage[image.url]?.length || 0} places
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(image.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => copyImageUrl(image.url)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(image.url, '_blank')}
                        className="text-gray-600 hover:text-gray-900"
                        title="View full size"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSingle(image.id)}
                        disabled={deleting === image.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === image.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                        <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by uploading your first image.'
            }
          </p>
          {!searchTerm && categoryFilter === 'all' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upload First Image
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  )
}
