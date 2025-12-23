/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Star,
  Clock,
  Heart,
  Filter,
  ArrowRight
} from 'lucide-react'
import Header from '../../components/Header'
import StructuredData, { breadcrumbSchema } from '../../components/StructuredData'

export default function ToursPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [duration, setDuration] = useState('all')

  const colors = {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#6EACFF',
      300: '#A7CDFF',
      400: '#4091FE',
      500: '#187BFF',
    },
    secondary: {
      100: '#CAFA7C',
      200: '#C6FF69',
      300: '#B4FF3A',
      400: '#ADFF29',
      500: '#A0FF07',
      600: '#9CFC00',
    },
    text: {
      base: '#0F172A',
      muted: '#94A3B8',
      highlight: '#334155',
    },
  }

  const categories = [
    { id: 'all', name: 'All Tours' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'cultural', name: 'Cultural' },
    { id: 'beach', name: 'Beach' },
    { id: 'mountain', name: 'Mountain' },
    { id: 'city', name: 'City Breaks' },
    { id: 'wildlife', name: 'Wildlife' }
  ]

  const [tours, setTours] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/tours')
        const json = await res.json()
        if (json.success) setTours(json.data)
      } catch {}
    }
    load()
  }, [])

  const filteredTours = tours.filter(tour => {
    const categoryMatch = selectedCategory === 'all' || tour.category === selectedCategory
    const numericPrice = typeof tour.price === 'number' ? tour.price : parseFloat(String(tour.price || '').replace(/[^0-9.]/g, ''))
    const priceMatch = !isNaN(numericPrice) ? (numericPrice >= priceRange[0] && numericPrice <= priceRange[1]) : true
    const durationMatch = duration === 'all' || String(tour.duration || '').includes(duration)
    return categoryMatch && priceMatch && durationMatch
  })

  return (
    <div style={{ background: colors.primary[50] }} className="min-h-screen">
      <Header />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 sm:py-16 md:py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 px-2">Explore Amazing Tours</h1>
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-2">Discover incredible destinations with our curated tour packages</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div style={{ background: 'white', borderColor: colors.primary[100] }} className="rounded-xl shadow-lg p-6 border">
              <div className="flex items-center mb-6">
                <Filter className="w-5 h-5 mr-2" style={{ color: colors.primary[500] }} />
                <h3 style={{ color: colors.text.base }} className="text-lg font-semibold">Filters</h3>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 style={{ color: colors.text.base }} className="font-medium mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mr-2 w-4 h-4 touch-manipulation"
                      />
                      <span style={{ color: colors.text.muted }} className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 style={{ color: colors.text.base }} className="font-medium mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 touch-manipulation"
                  />
                  <div className="flex justify-between text-sm" style={{ color: colors.text.muted }}>
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Duration Filter */}
              <div className="mb-6">
                <h4 style={{ color: colors.text.base }} className="font-medium mb-3">Duration</h4>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{ background: colors.primary[50], color: colors.text.base, borderColor: colors.primary[100] }}
                  className="w-full p-2.5 border rounded-lg text-base min-h-[44px] touch-manipulation"
                >
                  <option value="all">All Durations</option>
                  <option value="1-3">1-3 days</option>
                  <option value="4-7">4-7 days</option>
                  <option value="8+">8+ days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tours Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-8">
              <h2 style={{ color: colors.text.base }} className="text-2xl font-bold">
                {filteredTours.length} Tours Found
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTours.map((tour) => (
                <div key={tour.id} style={{ border: `1px solid ${colors.primary[100]}` }} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <Image
                      src={tour.image || (tour.images?.[0] ?? '/next.svg')}
                      alt={tour.name}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover"
                    />
                    {/* Style Tag */}
                    {tour.style && (
                      <div style={{ background: 'rgb(160, 255, 7)' }} className="absolute top-3 left-20 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                        {tour.style}
                      </div>
                    )}
                    <button style={{ background: colors.primary[50] }} className="absolute top-3 right-3 p-2.5 rounded-full shadow-md hover:bg-[#DBEAFE] active:bg-[#DBEAFE]/80 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation">
                      <Heart className="w-5 h-5" style={{ color: colors.primary[500] }} />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <h3 style={{ color: colors.text.base }} className="text-xl font-semibold mb-2">{tour.name}</h3>
                    <p style={{ color: colors.text.muted }} className="text-sm mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" style={{ color: colors.primary[500] }} />
                      {(tour.location) || (Array.isArray(tour.destinations) ? tour.destinations.slice(0,2).join(', ') : 'Sri Lanka')}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" style={{ color: colors.secondary[400] }} />
                        <span style={{ color: colors.text.muted }} className="text-sm">{tour.rating ?? '4.8'} ({tour.reviews ?? 120})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" style={{ color: colors.primary[500] }} />
                        <span style={{ color: colors.text.muted }} className="text-sm">{tour.duration}</span>
                      </div>
                    </div>
                    
                    <p style={{ color: colors.text.muted }} className="text-sm mb-4 line-clamp-5">{tour.description}</p>
                    
                    
                    <div className="flex items-center justify-between">
                      <div style={{ color: colors.primary[500] }} className="text-2xl font-bold">{typeof tour.price === 'number' ? `$${tour.price}` : tour.price}</div>
                    </div>
                    
                    <div className="mt-4">
                      <button 
                        onClick={() => router.push(`/tours/${tour.id}?startDate=&endDate=&guests=1`)}
                        style={{ background: `linear-gradient(90deg, ${colors.primary[400]}, ${colors.primary[500]})` }} 
                        className="text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 active:opacity-80 transition-all flex items-center justify-center space-x-1 w-full min-h-[44px] touch-manipulation"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Structured Data */}
      <StructuredData data={breadcrumbSchema([
        { name: "Home", url: "https://isleandecho.com" },
        { name: "Tours", url: "https://isleandecho.com/tours" }
      ])} />
    </div>
  )
} 