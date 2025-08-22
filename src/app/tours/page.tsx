'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  MapPin,
  Users,
  Star,
  Clock,
  Heart,
  Filter,
  ArrowRight
} from 'lucide-react'
import Header from '../../components/Header'

export default function ToursPage() {
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

  const tours = [
    {
      id: 1,
      name: "Bali Adventure Tour",
      category: "adventure",
      location: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop",
      price: 899,
      duration: "7 days",
      rating: 4.8,
      reviews: 156,
      description: "Explore the best of Bali with adventure activities, cultural experiences, and stunning landscapes.",
      highlights: ["Temple visits", "Rice terraces", "Beach activities", "Local cuisine"],
      badge: "Popular"
    },
    {
      id: 2,
      name: "Tokyo Cultural Experience",
      category: "cultural",
      location: "Tokyo, Japan",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
      price: 1299,
      duration: "5 days",
      rating: 4.9,
      reviews: 234,
      description: "Immerse yourself in Japanese culture with traditional experiences and modern city life.",
      highlights: ["Temple visits", "Tea ceremony", "Sushi making", "Shopping districts"],
      badge: "Best Seller"
    },
    {
      id: 3,
      name: "Santorini Sunset Tour",
      category: "beach",
      location: "Santorini, Greece",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop",
      price: 1499,
      duration: "6 days",
      rating: 4.7,
      reviews: 189,
      description: "Experience the magic of Santorini with stunning sunsets and beautiful beaches.",
      highlights: ["Sunset views", "Beach relaxation", "Wine tasting", "Island hopping"],
      badge: "Romantic"
    },
    {
      id: 4,
      name: "Swiss Alps Expedition",
      category: "mountain",
      location: "Swiss Alps",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
      price: 1799,
      duration: "8 days",
      rating: 4.6,
      reviews: 98,
      description: "Conquer the Swiss Alps with guided hiking and breathtaking mountain views.",
      highlights: ["Mountain hiking", "Alpine villages", "Scenic trains", "Local cuisine"],
      badge: "Adventure"
    },
    {
      id: 5,
      name: "Dubai City Explorer",
      category: "city",
      location: "Dubai, UAE",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
      price: 999,
      duration: "4 days",
      rating: 4.5,
      reviews: 267,
      description: "Discover the modern marvels of Dubai with luxury experiences and desert adventures.",
      highlights: ["Burj Khalifa", "Desert safari", "Shopping malls", "Luxury dining"],
      badge: "Luxury"
    },
    {
      id: 6,
      name: "African Safari Adventure",
      category: "wildlife",
      location: "Serengeti, Tanzania",
      image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=400&h=300&fit=crop",
      price: 2499,
      duration: "10 days",
      rating: 4.9,
      reviews: 76,
      description: "Witness the incredible wildlife of Africa with guided safari experiences.",
      highlights: ["Wildlife viewing", "Luxury lodges", "Cultural visits", "Photography"],
      badge: "Premium"
    }
  ]

  const filteredTours = tours.filter(tour => {
    const categoryMatch = selectedCategory === 'all' || tour.category === selectedCategory
    const priceMatch = tour.price >= priceRange[0] && tour.price <= priceRange[1]
    const durationMatch = duration === 'all' || tour.duration.includes(duration)
    return categoryMatch && priceMatch && durationMatch
  })

  return (
    <div style={{ background: colors.primary[50] }} className="min-h-screen">
      <Header />
      
      {/* Header */}
      <div style={{ background: `linear-gradient(90deg, ${colors.primary[400]}, ${colors.primary[500]})` }} className="text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Explore Amazing Tours</h1>
            <p className="text-xl max-w-2xl mx-auto">Discover incredible destinations with our curated tour packages</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                        className="mr-2"
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
                    className="w-full"
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
                  className="w-full p-2 border rounded-lg"
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
                      src={tour.image}
                      alt={tour.name}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover"
                    />
                    <div style={{ background: `linear-gradient(90deg, ${colors.secondary[400]}, ${colors.secondary[500]})` }} className="absolute top-3 left-3 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {tour.badge}
                    </div>
                    <button style={{ background: colors.primary[50] }} className="absolute top-3 right-3 p-2 rounded-full shadow-md hover:bg-[#DBEAFE] transition-colors">
                      <Heart className="w-5 h-5" style={{ color: colors.primary[500] }} />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <h3 style={{ color: colors.text.base }} className="text-xl font-semibold mb-2">{tour.name}</h3>
                    <p style={{ color: colors.text.muted }} className="text-sm mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" style={{ color: colors.primary[500] }} />
                      {tour.location}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" style={{ color: colors.secondary[400] }} />
                        <span style={{ color: colors.text.muted }} className="text-sm">{tour.rating} ({tour.reviews})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" style={{ color: colors.primary[500] }} />
                        <span style={{ color: colors.text.muted }} className="text-sm">{tour.duration}</span>
                      </div>
                    </div>
                    
                    <p style={{ color: colors.text.muted }} className="text-sm mb-4">{tour.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tour.highlights.slice(0, 3).map((highlight, index) => (
                        <span key={index} style={{ background: colors.primary[100], color: colors.primary[500] }} className="px-2 py-1 rounded-full text-xs">
                          {highlight}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div style={{ color: colors.primary[500] }} className="text-2xl font-bold">${tour.price}</div>
                      <button style={{ background: `linear-gradient(90deg, ${colors.primary[400]}, ${colors.primary[500]})` }} className="text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center space-x-1">
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
    </div>
  )
} 