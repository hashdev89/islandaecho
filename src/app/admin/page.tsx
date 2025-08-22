'use client'

import { useState } from 'react'
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
  CheckCircle
} from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    {
      name: 'Total Tours',
      value: '12',
      change: '+12%',
      changeType: 'positive',
      icon: Package,
      href: '/admin/tours'
    },
    {
      name: 'Destinations',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: MapPin,
      href: '/admin/destinations'
    },
    {
      name: 'Total Bookings',
      value: '156',
      change: '+23%',
      changeType: 'positive',
      icon: Calendar,
      href: '/admin/bookings'
    },
    {
      name: 'Revenue',
      value: '$45,231',
      change: '+20.1%',
      changeType: 'positive',
      icon: DollarSign,
      href: '/admin/bookings'
    }
  ]

  const recentBookings = [
    {
      id: '1',
      customerName: 'John Doe',
      tourPackage: 'Cultural Triangle Adventure',
      date: '2024-03-15',
      status: 'confirmed',
      amount: '$1,200'
    },
    {
      id: '2',
      customerName: 'Sarah Wilson',
      tourPackage: 'Beach Paradise Escape',
      date: '2024-04-10',
      status: 'pending',
      amount: '$1,800'
    },
    {
      id: '3',
      customerName: 'Michael Brown',
      tourPackage: 'Wildlife Safari Adventure',
      date: '2024-05-20',
      status: 'completed',
      amount: '$2,400'
    }
  ]

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
        <p className="text-gray-600">Welcome to your ISLE & ECHO admin dashboard</p>
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
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                        <span className="sr-only">{stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by</span>
                        {stat.change}
                      </div>
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
            <Link
              href="/admin/bookings"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          <div className="flow-root">
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
                        {booking.tourPackage}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-sm text-gray-500">
                      {booking.date}
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex-shrink-0 text-sm font-medium text-gray-900">
                      {booking.amount}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Bookings</dt>
                    <dd className="text-lg font-medium text-gray-900">23</dd>
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
                    <dd className="text-lg font-medium text-gray-900">89</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">$12,345</dd>
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
