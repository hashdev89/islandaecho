'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  MapPin,
  Image as ImageIcon,
  Calendar,
  TrendingUp,
  DollarSign,
  Plus,
  ArrowRight,
  CheckCircle,
  Eye,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface Booking {
  id: string
  tourPackageId: string
  tourPackageName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  startDate: string
  endDate: string
  guests: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  specialRequests: string
  bookingDate: string
  paymentStatus: 'pending' | 'paid' | 'refunded'
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [totalChats, setTotalChats] = useState(0)
  
  // Only admin can access dashboard
  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access the dashboard.</p>
        </div>
      </div>
    )
  }
  const [stats, setStats] = useState([
    { name: 'Total Tours', value: '—', change: '', changeType: 'positive' as const, icon: Package, href: '/admin/tours' },
    { name: 'Destinations', value: '—', change: '', changeType: 'positive' as const, icon: MapPin, href: '/admin/destinations' },
    { name: 'Total Bookings', value: '—', change: '', changeType: 'positive' as const, icon: Calendar, href: '/admin/bookings' },
    { name: 'Revenue', value: '—', change: '', changeType: 'positive' as const, icon: DollarSign, href: '/admin/bookings' }
  ])

  const fetchChatCount = async () => {
    try {
      const res = await fetch('/api/chat/conversations?status=all')
      const json = await res.json()
      if (json.success && json.data) {
        setTotalChats(json.data.length)
      }
    } catch (error) {
      console.error('Error fetching chat count:', error)
    }
  }

  const fetchToursAndDestinationsCount = async () => {
    try {
      const [toursRes, destRes] = await Promise.all([
        fetch('/api/tours'),
        fetch('/api/destinations')
      ])
      const toursJson = await toursRes.json()
      const destJson = await destRes.json()
      const toursCount = (toursJson.success && Array.isArray(toursJson.data)) ? toursJson.data.length : 0
      const destCount = (destJson.success && Array.isArray(destJson.data)) ? destJson.data.length : 0
      setStats(prev => prev.map(stat => {
        if (stat.name === 'Total Tours') return { ...stat, value: String(toursCount) }
        if (stat.name === 'Destinations') return { ...stat, value: String(destCount) }
        return stat
      }))
    } catch (error) {
      console.error('Error fetching tours/destinations count:', error)
    }
  }

  // Function to fetch bookings data
  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const json = await res.json()
      
      if (json.success && json.data) {
        // Map API fields to UI fields
        const bookings = json.data.map((b: unknown) => {
          const booking = b as Record<string, unknown>
          return {
            id: booking.id as string,
            tourPackageId: (booking.tour_package_id as string) || (booking.tourPackageId as string),
            tourPackageName: (booking.tour_package_name as string) || (booking.tourPackageName as string),
            customerName: (booking.customer_name as string) || (booking.customerName as string),
            customerEmail: (booking.customer_email as string) || (booking.customerEmail as string),
            customerPhone: (booking.customer_phone as string) || (booking.customerPhone as string),
            startDate: (booking.start_date as string) || (booking.startDate as string),
            endDate: (booking.end_date as string) || (booking.endDate as string),
            guests: (booking.guests as number) || 1,
            totalPrice: (booking.total_price as number) || (booking.totalPrice as number) || 0,
            status: (booking.status as 'pending' | 'confirmed' | 'cancelled' | 'completed') || 'pending',
            specialRequests: (booking.special_requests as string) || (booking.specialRequests as string) || '',
            bookingDate: (booking.created_at as string) || (booking.createdAt as string) || new Date().toISOString(),
            paymentStatus: (booking.payment_status as 'pending' | 'paid' | 'refunded') || (booking.paymentStatus as 'pending' | 'paid' | 'refunded') || 'pending',
          }
        })
        
        // Get recent bookings (last 5)
        const recent = bookings
          .sort((a: { bookingDate: string | number | Date }, b: { bookingDate: string | number | Date }) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
          .slice(0, 5)
        
        setRecentBookings(recent)
        
        // Update stats with real data
        type Booking = {
          status: string;
          totalPrice: number;
        };

        const totalRevenue = bookings
          .filter((b: Booking) => b.status === 'confirmed' || b.status === 'completed')
          .reduce((sum: number, b: Booking) => sum + (b.totalPrice || 0), 0);

        const confirmedBookings = bookings.filter((b: Booking) => b.status === 'confirmed').length;
        setStats(prev => prev.map(stat => {
          if (stat.name === 'Total Bookings') {
            return {
              ...stat,
              value: bookings.length.toString(),
              change: `+${confirmedBookings}`
            }
          }
          if (stat.name === 'Revenue') {
            return {
              ...stat,
              value: `$${totalRevenue.toLocaleString()}`
            }
          }
          if (stat.name === 'Chats') {
            return {
              ...stat,
              value: totalChats.toString()
            }
          }
          return stat
        }))
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchChatCount()
    fetchToursAndDestinationsCount()
  }, [])

  // Update stats when totalChats changes
  useEffect(() => {
    setStats(prev => prev.map(stat => 
      stat.name === 'Chats' 
        ? { ...stat, value: totalChats.toString() }
        : stat
    ))
  }, [totalChats])

  const quickActions = [
    {
      name: 'Add New Tour',
      description: 'Create a new tour package',
      href: '/admin/tours/new',
      icon: Plus,
      color: 'bg-blue-500'
    },
    {
      name: 'View Bookings',
      description: 'Manage all bookings',
      href: '/admin/bookings',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      name: 'Add Destination',
      description: 'Add new destination',
      href: '/admin/destinations',
      icon: MapPin,
      color: 'bg-purple-500'
    },
    {
      name: 'Upload Images',
      description: 'Manage tour images',
      href: '/admin/images',
      icon: ImageIcon,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your ISLE & ECHO Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      {stat.change && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                          <span className="sr-only">{stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by</span>
                          {stat.change}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div>
                  <span className={`rounded-lg inline-flex p-3 ${action.color} ring-4 ring-white`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {action.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{action.description}</p>
                </div>
                <span className="absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                  <ArrowRight className="h-6 w-6" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchBookings}
                disabled={loading}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/admin/bookings"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="flow-root">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading recent bookings...</span>
              </div>
            ) : recentBookings.length > 0 ? (
              <ul className="-my-5 divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <li key={booking.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {booking.customerName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {booking.tourPackageName}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex-shrink-0 text-sm font-medium text-gray-900">
                        ${booking.totalPrice || 0}
                      </div>
                      <div className="flex-shrink-0">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent bookings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  New bookings will appear here as they come in.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Performance Overview</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Bookings</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : recentBookings.filter(b => b.status === 'pending').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Confirmed Bookings</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : recentBookings.filter(b => b.status === 'confirmed').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Recent Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : `$${recentBookings
                        .filter(b => b.status === 'confirmed' || b.status === 'completed')
                        .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
                        .toLocaleString()}`}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
