'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Filter,
  MoreHorizontal,
  Globe
} from 'lucide-react'

interface Destination {
  id: string
  name: string
  region: string
  lat: number
  lng: number
  description: string
  image: string
  status: 'active' | 'inactive'
  toursCount: number
  lastUpdated: string
}

export default function DestinationsManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [destinations, setDestinations] = useState<Destination[]>([
    {
      id: 'sigiriya',
      name: 'Sigiriya',
      region: 'Cultural Triangle',
      lat: 7.9570,
      lng: 80.7603,
      description: 'Ancient palace and fortress complex with stunning views',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      status: 'active',
      toursCount: 3,
      lastUpdated: '2024-01-15'
    },
    {
      id: 'dambulla',
      name: 'Dambulla',
      region: 'Cultural Triangle',
      lat: 7.8567,
      lng: 80.6492,
      description: 'Famous cave temple complex with Buddhist murals',
      image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=300&fit=crop',
      status: 'active',
      toursCount: 2,
      lastUpdated: '2024-01-10'
    },
    {
      id: 'kandy',
      name: 'Kandy',
      region: 'Hill Country',
      lat: 7.2906,
      lng: 80.6337,
      description: 'Cultural capital with Temple of the Tooth',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop',
      status: 'active',
      toursCount: 4,
      lastUpdated: '2024-01-12'
    },
    {
      id: 'galle',
      name: 'Galle',
      region: 'Southern Coast',
      lat: 6.0535,
      lng: 80.2210,
      description: 'Historic coastal city with Dutch fort',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
      status: 'active',
      toursCount: 2,
      lastUpdated: '2024-01-08'
    },
    {
      id: 'yala',
      name: 'Yala National Park',
      region: 'Wildlife',
      lat: 6.2619,
      lng: 81.4157,
      description: 'Famous wildlife sanctuary for leopards and elephants',
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=300&fit=crop',
      status: 'active',
      toursCount: 1,
      lastUpdated: '2024-01-14'
    }
  ])

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.region.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = regionFilter === 'all' || dest.region === regionFilter
    return matchesSearch && matchesRegion
  })

  const regions = [...new Set(destinations.map(dest => dest.region))]

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Inactive
      </span>
    )
  }

  const handleDeleteDestination = (destId: string) => {
    if (confirm('Are you sure you want to delete this destination?')) {
      setDestinations(destinations.filter(dest => dest.id !== destId))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
          <p className="text-gray-600">Manage destinations and their coordinates</p>
        </div>
        <Link
          href="/admin/destinations/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Destination
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
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
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((destination) => (
          <div key={destination.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <Image
                src={destination.image}
                alt={destination.name}
                width={400}
                height={192}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                {getStatusBadge(destination.status)}
              </div>
              <div className="absolute bottom-2 left-2">
                <div className="flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  <MapPin className="h-3 w-3" />
                  <span>{destination.region}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{destination.name}</h3>
                <div className="flex items-center space-x-1">
                  <Link
                    href={`/admin/destinations/${destination.id}`}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Edit destination"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteDestination(destination.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Delete destination"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {destination.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Coordinates:</span>
                  <div className="font-mono text-xs">
                    {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Tours:</span>
                  <div className="font-semibold text-blue-600">{destination.toursCount}</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Last updated: {new Date(destination.lastUpdated).toLocaleDateString()}</span>
                  <Link
                    href={`/admin/destinations/${destination.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDestinations.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || regionFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first destination.'
            }
          </p>
          {!searchTerm && regionFilter === 'all' && (
            <Link
              href="/admin/destinations/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Destination
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
