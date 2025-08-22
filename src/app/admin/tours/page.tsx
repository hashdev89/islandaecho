'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  MoreHorizontal
} from 'lucide-react'

interface TourPackage {
  id: string
  name: string
  duration: string
  price: string
  destinations: string[]
  highlights: string[]
  status: 'active' | 'draft' | 'archived'
  bookings: number
  revenue: number
  lastUpdated: string
}

export default function ToursManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tours, setTours] = useState<TourPackage[]>([
    {
      id: 'cultural-triangle',
      name: 'Cultural Triangle Explorer',
      duration: '5 Days / 4 Nights',
      price: '$899',
      destinations: ['Sigiriya', 'Dambulla', 'Polonnaruwa', 'Anuradhapura'],
      highlights: ['UNESCO Sites', 'Ancient Temples', 'Historical Monuments'],
      status: 'active',
      bookings: 12,
      revenue: 10788,
      lastUpdated: '2024-01-15'
    },
    {
      id: 'hill-country',
      name: 'Hill Country Adventure',
      duration: '6 Days / 5 Nights',
      price: '$1,199',
      destinations: ['Kandy', 'Nuwara Eliya', 'Ella', 'Tea Plantations'],
      highlights: ['Tea Gardens', 'Mountain Views', 'Train Journey'],
      status: 'active',
      bookings: 8,
      revenue: 9592,
      lastUpdated: '2024-01-10'
    },
    {
      id: 'beach-paradise',
      name: 'Beach Paradise Tour',
      duration: '7 Days / 6 Nights',
      price: '$1,299',
      destinations: ['Galle', 'Mirissa', 'Bentota', 'Hikkaduwa'],
      highlights: ['Beach Resorts', 'Whale Watching', 'Water Sports'],
      status: 'active',
      bookings: 15,
      revenue: 19485,
      lastUpdated: '2024-01-12'
    },
    {
      id: 'wildlife-safari',
      name: 'Wildlife Safari Adventure',
      duration: '4 Days / 3 Nights',
      price: '$799',
      destinations: ['Yala National Park', 'Udawalawe', 'Sinharaja Forest'],
      highlights: ['Leopard Safari', 'Elephant Watching', 'Bird Watching'],
      status: 'draft',
      bookings: 0,
      revenue: 0,
      lastUpdated: '2024-01-08'
    },
    {
      id: 'complete-sri-lanka',
      name: 'Complete Sri Lanka Experience',
      duration: '12 Days / 11 Nights',
      price: '$2,199',
      destinations: ['Colombo', 'Cultural Triangle', 'Hill Country', 'Beach Destinations'],
      highlights: ['Full Island Tour', 'All Major Attractions', 'Luxury Accommodation'],
      status: 'active',
      bookings: 6,
      revenue: 13194,
      lastUpdated: '2024-01-14'
    }
  ])

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.destinations.some(dest => dest.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || tour.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const handleDeleteTour = (tourId: string) => {
    if (confirm('Are you sure you want to delete this tour?')) {
      setTours(tours.filter(tour => tour.id !== tourId))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tour Packages</h1>
          <p className="text-gray-600">Manage your tour packages and itineraries</p>
        </div>
        <Link
          href="/admin/tours/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Tour
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
                placeholder="Search tours by name or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tours Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredTours.length} Tour Packages
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tour Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration & Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tour.name}</div>
                      <div className="text-sm text-gray-500">{tour.highlights.join(', ')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{tour.duration}</div>
                      <div className="text-sm font-medium text-green-600">{tour.price}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {tour.destinations.slice(0, 2).join(', ')}
                      {tour.destinations.length > 2 && (
                        <span className="text-gray-500"> +{tour.destinations.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(tour.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{tour.bookings} bookings</div>
                      <div className="text-sm font-medium text-green-600">
                        ${tour.revenue.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tour.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/tours/${tour.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View on website"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/tours/${tour.id}`}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Edit tour"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteTour(tour.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete tour"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
