'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Search,
  Star,
  Heart,
  Filter,
  ArrowRight,
  Calendar,
  Users
} from 'lucide-react'
import Header from '../../components/Header'

export default function DestinationsPage() {
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [searchQuery, setSearchQuery] = useState('')

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

  const regions = [
    { id: 'all', name: 'All Sri Lanka' },
    { id: 'asia', name: 'Cultural Triangle' },
    { id: 'europe', name: 'Hill Country' },
    { id: 'americas', name: 'Beach Destinations' },
    { id: 'africa', name: 'Wildlife & Nature' },
    { id: 'oceania', name: 'Northern Region' }
  ]

  const destinations = [
    {
      id: 1,
      name: "Colombo, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400&h=300&fit=crop",
      price: 89,
      rating: 4.6,
      reviews: 2341,
      description: "Sri Lanka's vibrant capital city where colonial architecture meets modern development, offering rich cultural experiences and authentic local cuisine.",
      highlights: ["Gangaramaya Temple", "Galle Face Green", "National Museum", "Street Food"],
      bestTime: "January - March, July - September",
      duration: "2-3 days",
      badge: "Capital"
    },
    {
      id: 2,
      name: "Kandy, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop",
      price: 75,
      rating: 4.8,
      reviews: 1876,
      description: "Cultural heart of Sri Lanka with the sacred Temple of the Tooth Relic, surrounded by misty hills and tea plantations.",
      highlights: ["Temple of the Tooth", "Tea Gardens", "Cultural Dance", "Botanical Gardens"],
      bestTime: "January - April, July - September",
      duration: "2-4 days",
      badge: "Cultural"
    },
    {
      id: 3,
      name: "Sigiriya, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
      price: 65,
      rating: 4.9,
      reviews: 2156,
      description: "Ancient palace fortress rising dramatically from the plains, featuring stunning frescoes and panoramic views of the Cultural Triangle.",
      highlights: ["Lion's Rock", "Ancient Frescoes", "Water Gardens", "Sunset Views"],
      bestTime: "January - April, July - September",
      duration: "1-2 days",
      badge: "UNESCO"
    },
    {
      id: 4,
      name: "Galle, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop",
      price: 85,
      rating: 4.7,
      reviews: 1456,
      description: "Historic coastal city with a perfectly preserved Dutch fort, boutique hotels, and some of Sri Lanka's best beaches.",
      highlights: ["Galle Fort", "Lighthouse", "Beaches", "Colonial Architecture"],
      bestTime: "December - April",
      duration: "3-5 days",
      badge: "Historic"
    },
    {
      id: 5,
      name: "Ella, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1502602898534-47d98d8b4b3b?w=400&h=300&fit=crop",
      price: 55,
      rating: 4.8,
      reviews: 1234,
      description: "Charming hill country village known for its scenic train rides, hiking trails, and cool mountain climate.",
      highlights: ["Ella Rock", "Nine Arch Bridge", "Tea Plantations", "Train Journey"],
      bestTime: "January - April, July - September",
      duration: "2-3 days",
      badge: "Adventure"
    },
    {
      id: 6,
      name: "Mirissa, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop",
      price: 45,
      rating: 4.5,
      reviews: 987,
      description: "Laid-back beach paradise famous for whale watching, surfing, and stunning sunsets over the Indian Ocean.",
      highlights: ["Whale Watching", "Surfing", "Beach Bars", "Sunset Views"],
      bestTime: "November - April",
      duration: "3-6 days",
      badge: "Beach"
    },
    {
      id: 7,
      name: "Anuradhapura, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=300&fit=crop",
      price: 35,
      rating: 4.4,
      reviews: 756,
      description: "Ancient capital with sacred Buddhist sites, massive dagobas, and the sacred Sri Maha Bodhi tree.",
      highlights: ["Sacred Bodhi Tree", "Ancient Dagobas", "Buddhist Sites", "Cycling Tours"],
      bestTime: "January - April, July - September",
      duration: "2-3 days",
      badge: "Sacred"
    },
    {
      id: 8,
      name: "Polonnaruwa, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=300&fit=crop",
      price: 40,
      rating: 4.3,
      reviews: 634,
      description: "Medieval capital with well-preserved archaeological sites, ancient temples, and the impressive Gal Vihara Buddha statues.",
      highlights: ["Gal Vihara", "Archaeological Museum", "Ancient Temples", "Bicycle Tours"],
      bestTime: "January - April, July - September",
      duration: "2-3 days",
      badge: "Archaeological"
    },
    {
      id: 9,
      name: "Nuwara Eliya, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400&h=300&fit=crop",
      price: 60,
      rating: 4.6,
      reviews: 892,
      description: "Hill country retreat known as 'Little England' with tea plantations, cool climate, and colonial architecture.",
      highlights: ["Tea Plantations", "Horton Plains", "Gregory Lake", "Cool Climate"],
      bestTime: "March - May, September - December",
      duration: "2-4 days",
      badge: "Hill Country"
    },
    {
      id: 10,
      name: "Dambulla, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop",
      price: 50,
      rating: 4.5,
      reviews: 567,
      description: "Home to the magnificent Dambulla Cave Temple, a UNESCO World Heritage site with ancient Buddhist murals and statues.",
      highlights: ["Cave Temple", "Golden Temple", "Buddhist Art", "Cultural Heritage"],
      bestTime: "January - April, July - September",
      duration: "1-2 days",
      badge: "UNESCO"
    },
    {
      id: 11,
      name: "Bentota, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
      price: 95,
      rating: 4.7,
      reviews: 789,
      description: "Luxury beach destination with pristine beaches, water sports, and upscale resorts along the southwest coast.",
      highlights: ["Beach Resorts", "Water Sports", "River Cruises", "Luxury Spas"],
      bestTime: "November - April",
      duration: "3-7 days",
      badge: "Luxury"
    },
    {
      id: 12,
      name: "Trincomalee, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop",
      price: 70,
      rating: 4.4,
      reviews: 445,
      description: "Northeast coastal city with pristine beaches, whale watching, and the historic Koneswaram Temple.",
      highlights: ["Whale Watching", "Pristine Beaches", "Koneswaram Temple", "Marine Life"],
      bestTime: "March - September",
      duration: "3-5 days",
      badge: "Coastal"
    },
    {
      id: 13,
      name: "Jaffna, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1502602898534-47d98d8b4b3b?w=400&h=300&fit=crop",
      price: 45,
      rating: 4.2,
      reviews: 298,
      description: "Northern cultural capital with unique Tamil culture, historic temples, and authentic local cuisine.",
      highlights: ["Nallur Temple", "Tamil Culture", "Local Cuisine", "Island Hopping"],
      bestTime: "January - September",
      duration: "2-4 days",
      badge: "Cultural"
    },
    {
      id: 14,
      name: "Arugam Bay, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop",
      price: 55,
      rating: 4.6,
      reviews: 523,
      description: "Surfing paradise on the east coast with world-class waves, laid-back atmosphere, and stunning beaches.",
      highlights: ["Surfing", "Beach Life", "Sunrise Point", "Local Vibes"],
      bestTime: "April - October",
      duration: "3-7 days",
      badge: "Surfing"
    },
    {
      id: 15,
      name: "Hikkaduwa, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=300&fit=crop",
      price: 65,
      rating: 4.5,
      reviews: 678,
      description: "Popular beach destination with coral reefs, water sports, and vibrant nightlife along the southwest coast.",
      highlights: ["Coral Reefs", "Water Sports", "Nightlife", "Beach Bars"],
      bestTime: "November - April",
      duration: "3-5 days",
      badge: "Beach"
    },
    {
      id: 16,
      name: "Yala National Park, Sri Lanka",
      region: "asia",
      image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=300&fit=crop",
      price: 120,
      rating: 4.8,
      reviews: 456,
      description: "Famous wildlife sanctuary known for leopards, elephants, and diverse birdlife in a stunning coastal setting.",
      highlights: ["Leopard Safaris", "Wildlife Photography", "Bird Watching", "Safari Lodges"],
      bestTime: "February - July",
      duration: "2-3 days",
      badge: "Wildlife"
    }
  ]

  const filteredDestinations = destinations.filter(destination => {
    const regionMatch = selectedRegion === 'all' || destination.region === selectedRegion
    const priceMatch = destination.price >= priceRange[0] && destination.price <= priceRange[1]
    const searchMatch = destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       destination.description.toLowerCase().includes(searchQuery.toLowerCase())
    return regionMatch && priceMatch && searchMatch
  })

  return (
    <div style={{ background: colors.primary[50] }} className="min-h-screen">
      <Header />
      
      {/* Header */}
      <div style={{ background: `linear-gradient(90deg, ${colors.primary[400]}, ${colors.primary[500]})` }} className="text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Explore Sri Lanka Destinations</h1>
            <p className="text-xl max-w-2xl mx-auto">Discover amazing places in Sri Lanka</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div style={{ background: 'white', borderColor: colors.primary[100] }} className="rounded-xl shadow-lg p-6 border mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: colors.primary[50], color: colors.text.base, borderColor: colors.primary[100] }}
              className="w-full pl-12 pr-4 py-4 border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.primary[500] }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div style={{ background: 'white', borderColor: colors.primary[100] }} className="rounded-xl shadow-lg p-6 border">
              <div className="flex items-center mb-6">
                <Filter className="w-5 h-5 mr-2" style={{ color: colors.primary[500] }} />
                <h3 style={{ color: colors.text.base }} className="text-lg font-semibold">Filters</h3>
              </div>

              {/* Region Filter */}
              <div className="mb-6">
                <h4 style={{ color: colors.text.base }} className="font-medium mb-3">Region</h4>
                <div className="space-y-2">
                  {regions.map((region) => (
                    <label key={region.id} className="flex items-center">
                      <input
                        type="radio"
                        name="region"
                        value={region.id}
                        checked={selectedRegion === region.id}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="mr-2"
                      />
                      <span style={{ color: colors.text.muted }} className="text-sm">{region.name}</span>
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
            </div>
          </div>

          {/* Destinations Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-8">
              <h2 style={{ color: colors.text.base }} className="text-2xl font-bold">
                {filteredDestinations.length} Destinations Found
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDestinations.map((destination) => (
                <div key={destination.id} style={{ border: `1px solid ${colors.primary[100]}` }} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover"
                    />
                    <div style={{ background: `linear-gradient(90deg, ${colors.secondary[400]}, ${colors.secondary[500]})` }} className="absolute top-3 left-3 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {destination.badge}
                    </div>
                    <button style={{ background: colors.primary[50] }} className="absolute top-3 right-3 p-2 rounded-full shadow-md hover:bg-[#DBEAFE] transition-colors">
                      <Heart className="w-5 h-5" style={{ color: colors.primary[500] }} />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <h3 style={{ color: colors.text.base }} className="text-xl font-semibold mb-2">{destination.name}</h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" style={{ color: colors.secondary[400] }} />
                        <span style={{ color: colors.text.muted }} className="text-sm">{destination.rating} ({destination.reviews})</span>
                      </div>
                      <div style={{ color: colors.primary[500] }} className="text-2xl font-bold">${destination.price}</div>
                    </div>
                    
                    <p style={{ color: colors.text.muted }} className="text-sm mb-4">{destination.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" style={{ color: colors.primary[500] }} />
                        <span style={{ color: colors.text.muted }} className="text-sm">{destination.bestTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" style={{ color: colors.primary[500] }} />
                        <span style={{ color: colors.text.muted }} className="text-sm">{destination.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {destination.highlights.map((highlight, index) => (
                        <span key={index} style={{ background: colors.primary[100], color: colors.primary[500] }} className="px-2 py-1 rounded-full text-xs">
                          {highlight}
                        </span>
                      ))}
                    </div>
                    
                    <button style={{ background: `linear-gradient(90deg, ${colors.primary[400]}, ${colors.primary[500]})` }} className="w-full text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center space-x-2">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
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