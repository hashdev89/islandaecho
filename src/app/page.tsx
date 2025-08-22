'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Search,
  Star,
  Heart,
  ArrowRight,
  Globe,
  Calendar,
  Users,
  ChevronDown,
  Mail,
  Shield,
  Clock,
  Headphones
} from 'lucide-react'
import Header from '../components/Header'
import WordSlider from '../components/WordSlider'

export default function HomePage() {
  const [searchTab, setSearchTab] = useState('tours')
  const [searchData, setSearchData] = useState({
    tourPackage: '',
    startDate: '',
    endDate: '',
    guests: 1
  })
  const [customTripData, setCustomTripData] = useState({
    destinations: [] as string[],
    dateRange: '',
    guests: 1,
    interests: [] as string[]
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const colors = {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#6EACFF',
      300: '#A7CDFF',
      400: '#4091FE',
      500: '#187BFF',
      600: '#1E40AF',
      700: '#1E3A8A',
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

  const tourPackages = [
    {
      id: 'cultural-triangle',
      name: 'Cultural Triangle Explorer',
      duration: '5 Days / 4 Nights',
      price: '$899',
      destinations: ['Sigiriya', 'Dambulla', 'Polonnaruwa', 'Anuradhapura'],
      highlights: ['UNESCO Sites', 'Ancient Temples', 'Historical Monuments'],
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 4.9,
      reviews: 156,
      badge: 'MOST POPULAR'
    },
    {
      id: 'hill-country',
      name: 'Hill Country Adventure',
      duration: '6 Days / 5 Nights',
      price: '$1,199',
      destinations: ['Kandy', 'Nuwara Eliya', 'Ella', 'Tea Plantations'],
      highlights: ['Tea Gardens', 'Mountain Views', 'Train Journey'],
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 4.8,
      reviews: 89,
      badge: 'BEST VALUE'
    },
    {
      id: 'beach-paradise',
      name: 'Beach Paradise Tour',
      duration: '7 Days / 6 Nights',
      price: '$1,299',
      destinations: ['Galle', 'Mirissa', 'Bentota', 'Hikkaduwa'],
      highlights: ['Beach Resorts', 'Whale Watching', 'Water Sports'],
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 4.7,
      reviews: 134,
      badge: 'TRENDING'
    },
    {
      id: 'wildlife-safari',
      name: 'Wildlife Safari Adventure',
      duration: '4 Days / 3 Nights',
      price: '$799',
      destinations: ['Yala National Park', 'Udawalawe', 'Sinharaja Forest'],
      highlights: ['Leopard Safari', 'Elephant Watching', 'Bird Watching'],
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 4.9,
      reviews: 67,
      badge: 'ADVENTURE'
    },
    {
      id: 'complete-sri-lanka',
      name: 'Complete Sri Lanka Experience',
      duration: '12 Days / 11 Nights',
      price: '$2,199',
      destinations: ['Colombo', 'Cultural Triangle', 'Hill Country', 'Beach Destinations'],
      highlights: ['Full Island Tour', 'All Major Attractions', 'Luxury Accommodation'],
      image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 4.8,
      reviews: 45,
      badge: 'PREMIUM'
    }
  ]

  const featuredDestinations = [
    { name: "Colombo", image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=200&fit=crop" },
    { name: "Kandy", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&h=200&fit=crop" },
    { name: "Galle", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop" },
    { name: "Sigiriya", image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=300&h=200&fit=crop" },
    { name: "Ella", image: "https://images.unsplash.com/photo-1502602898534-47d98d8b4b3b?w=300&h=200&fit=crop" },
    { name: "Mirissa", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&h=200&fit=crop" }
  ]

    /*
  const recommendedHotels = [
    {
      name: "Galle Face Hotel",
      location: "Colombo, Sri Lanka",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop",
      rating: 4.8,
      reviews: 1247,
      price: 89,
      badge: "HISTORIC LANDMARK"
    },
    {
      name: "Tea Trails by Dilmah",
      location: "Nuwara Eliya, Sri Lanka",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop",
      rating: 4.9,
      reviews: 892,
      price: 156,
      badge: "LUXURY EXPERIENCE"
    },
    {
      name: "Fort Bazaar Hotel",
      location: "Galle Fort, Sri Lanka",
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=200&fit=crop",
      rating: 4.7,
      reviews: 567,
      price: 134,
      badge: "BEST LOCATION"
    },
    {
      name: "Heritance Kandalama",
      location: "Dambulla, Sri Lanka",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop",
      rating: 4.6,
      reviews: 789,
      price: 112,
      badge: "ECO-FRIENDLY"
    }
  ]
  */

  const blogPosts = [
    {
      title: "The ultimate guide to Sri Lanka's Cultural Triangle",
      image: "https://images.unsplash.com/photo-1551524164-4876eb6e4a09?w=300&h=200&fit=crop",
      date: "Aug 3, 2025",
      category: "Destination Guide",
      readTime: "8 min read"
    },
    {
      title: "Best time to visit Sri Lanka: A month-by-month guide",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=200&fit=crop",
      date: "Aug 2, 2025",
      category: "Travel Tips",
      readTime: "6 min read"
    },
    {
      title: "15 things you need to know before traveling to Sri Lanka",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      date: "Aug 1, 2025",
      category: "Tips & Advice",
      readTime: "7 min read"
    }
  ]

  /*
  const travelStories = [
    {
      title: "A first-time guide to the Hill Country",
      image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=200&fit=crop",
      date: "Aug 3, 2025",
      category: "Destination Practicalities",
      readTime: "8 min read",
      excerpt: "Everything you need to know about exploring Sri Lanka's misty mountains, tea plantations, and cool climate retreats."
    },
    {
      title: "The 12 best things to do in Galle Fort",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&h=200&fit=crop",
      date: "Aug 3, 2025",
      category: "Activities",
      readTime: "7 min read",
      excerpt: "From historic ramparts to boutique shopping, discover the must-see attractions in this UNESCO World Heritage site."
    },
    {
      title: "Exploring Sri Lanka's rich culinary scene",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop",
      date: "Aug 1, 2025",
      category: "Food and Drink",
      readTime: "5 min read",
      excerpt: "From street food to fine dining, discover the flavors that make Sri Lankan cuisine truly special."
    }
  ]
  */

  // Sri Lanka locations for Mapbox map
  const sriLankaLocations = [
    { id: 1, name: 'NEGOMBO', lng: 79.8833, lat: 7.2091, activities: ['Beach Activities', 'Fishing Village Tours', 'Seafood Dining', 'Water Sports'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=200&fit=crop' },
    { id: 2, name: 'COLOMBO', lng: 79.8612, lat: 6.9271, activities: ['City Tours', 'Shopping', 'Cultural Sites', 'Nightlife'], image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400&h=200&fit=crop' },
    { id: 3, name: 'BENTOTA', lng: 79.9983, lat: 6.4211, activities: ['Beach Relaxation', 'Water Sports', 'Ayurveda', 'River Cruises'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=200&fit=crop' },
    { id: 4, name: 'GALLE', lng: 80.2176, lat: 6.0535, activities: ['Fort Walking Tours', 'Beach Relaxation', 'Boutique Shopping', 'Sunset Views'], image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=200&fit=crop' },
    { id: 5, name: 'YALA', lng: 81.5247, lat: 6.3690, activities: ['Wildlife Safari', 'Leopard Spotting', 'Bird Watching', 'Nature Photography'], image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop' },
    { id: 6, name: 'NUWARA ELIYA', lng: 80.7829, lat: 6.9497, activities: ['Tea Plantation Tours', 'Hiking', 'Golf', 'Cool Climate'], image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=200&fit=crop' },
    { id: 7, name: 'KANDY', lng: 80.6337, lat: 7.2906, activities: ['Temple of the Tooth', 'Cultural Shows', 'Botanical Gardens', 'Tea Factory Tours'], image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=200&fit=crop' },
    { id: 8, name: 'SIGIRIYA', lng: 80.7604, lat: 7.9570, activities: ['Rock Climbing', 'Ancient Palace Tours', 'Fresco Viewing', 'Sunset Photography'], image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop' },
    { id: 9, name: 'PASIKUDA', lng: 81.7289, lat: 7.9167, activities: ['Beach Activities', 'Snorkeling', 'Diving', 'Water Sports'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=200&fit=crop' },
    { id: 10, name: 'JAFFNA', lng: 80.0169, lat: 9.6615, activities: ['Cultural Tours', 'Temple Visits', 'Local Cuisine', 'Historical Sites'], image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400&h=200&fit=crop' },
    { id: 11, name: 'ARUGAM BAY', lng: 81.8319, lat: 6.8389, activities: ['Surfing', 'Beach Relaxation', 'Fishing', 'Local Culture'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=200&fit=crop' },
    { id: 12, name: 'BATTICALOA', lng: 81.7011, lat: 7.7167, activities: ['Lagoon Tours', 'Beach Activities', 'Cultural Tours', 'Fishing'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=200&fit=crop' },
    { id: 13, name: 'ANURADHAPURA', lng: 80.4024, lat: 8.3114, activities: ['Ancient City Tours', 'Temple Visits', 'Historical Sites', 'Cultural Tours'], image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop' },
    { id: 14, name: 'TRINCOMALEE', lng: 81.2333, lat: 8.5768, activities: ['Beach Activities', 'Diving', 'Whale Watching', 'Cultural Tours'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=200&fit=crop' },
    { id: 15, name: 'HAPUTALE', lng: 80.9556, lat: 6.7667, activities: ['Tea Estate Tours', 'Hiking', 'Cool Climate', 'Scenic Views'], image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=200&fit=crop' },
    { id: 16, name: 'HIKKADUWA', lng: 80.0889, lat: 6.1397, activities: ['Beach Activities', 'Surfing', 'Diving', 'Nightlife'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=200&fit=crop' },
    { id: 17, name: 'HAMBANTOTA', lng: 81.1167, lat: 6.1167, activities: ['Beach Activities', 'Wildlife Tours', 'Cultural Sites', 'Local Markets'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=200&fit=crop' },
    { id: 18, name: 'CHILAW', lng: 79.7833, lat: 7.5833, activities: ['Lagoon Tours', 'Bird Watching', 'Fishing', 'Nature Walks'], image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop' },
    { id: 19, name: 'MANNAR', lng: 79.8833, lat: 8.9667, activities: ['Beach Activities', 'Cultural Tours', 'Historical Sites', 'Local Cuisine'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=200&fit=crop' },
    { id: 20, name: 'KALPITIYA', lng: 79.7167, lat: 8.1667, activities: ['Dolphin Watching', 'Beach Activities', 'Water Sports', 'Fishing'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=200&fit=crop' },
    { id: 21, name: 'TANGALLE', lng: 80.7833, lat: 6.0167, activities: ['Beach Activities', 'Turtle Watching', 'Fishing', 'Local Culture'], image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=200&fit=crop' }
  ]

  const availableDestinations = [
    { id: 'colombo', name: 'Colombo', region: 'Western Province' },
    { id: 'kandy', name: 'Kandy', region: 'Central Province' },
    { id: 'galle', name: 'Galle', region: 'Southern Province' },
    { id: 'sigiriya', name: 'Sigiriya', region: 'Cultural Triangle' },
    { id: 'ella', name: 'Ella', region: 'Uva Province' },
    { id: 'mirissa', name: 'Mirissa', region: 'Southern Province' },
    { id: 'anuradhapura', name: 'Anuradhapura', region: 'North Central Province' },
    { id: 'polonnaruwa', name: 'Polonnaruwa', region: 'North Central Province' },
    { id: 'nuwara-eliya', name: 'Nuwara Eliya', region: 'Central Province' },
    { id: 'dambulla', name: 'Dambulla', region: 'Cultural Triangle' },
    { id: 'bentota', name: 'Bentota', region: 'Southern Province' },
    { id: 'trincomalee', name: 'Trincomalee', region: 'Eastern Province' },
    { id: 'jaffna', name: 'Jaffna', region: 'Northern Province' },
    { id: 'arugam-bay', name: 'Arugam Bay', region: 'Eastern Province' },
    { id: 'hikkaduwa', name: 'Hikkaduwa', region: 'Southern Province' },
    { id: 'unawatuna', name: 'Unawatuna', region: 'Southern Province' },
    { id: 'tangalle', name: 'Tangalle', region: 'Southern Province' },
    { id: 'yala', name: 'Yala', region: 'Southern Province' },
    { id: 'udawalawe', name: 'Udawalawe', region: 'Southern Province' },
    { id: 'sinharaja', name: 'Sinharaja', region: 'Southern Province' }
  ]

  const tripInterests = [
    { id: 'culture', name: 'Culture & History' },
    { id: 'nature', name: 'Nature & Wildlife' },
    { id: 'beach', name: 'Beaches & Water Sports' },
    { id: 'adventure', name: 'Adventure & Hiking' },
    { id: 'food', name: 'Food & Cuisine' },
    { id: 'relaxation', name: 'Relaxation & Wellness' },
    { id: 'photography', name: 'Photography' },
    { id: 'shopping', name: 'Shopping & Markets' }
  ]

  const destinationsWeLove = [
    { name: "Colombo", tours: 12, image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=200&fit=crop" },
    { name: "Kandy", tours: 8, image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&h=200&fit=crop" },
    { name: "Galle", tours: 10, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop" },
    { name: "Sigiriya", tours: 6, image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=300&h=200&fit=crop" },
    { name: "Ella", tours: 7, image: "https://images.unsplash.com/photo-1502602898534-47d98d8b4b3b?w=300&h=200&fit=crop" },
    { name: "Mirissa", tours: 9, image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&h=200&fit=crop" },
    { name: "Anuradhapura", tours: 4, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Polonnaruwa", tours: 3, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Nuwara Eliya", tours: 5, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Dambulla", tours: 4, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Bentota", tours: 8, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Trincomalee", tours: 3, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Jaffna", tours: 2, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Arugam Bay", tours: 3, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Hikkaduwa", tours: 6, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Unawatuna", tours: 7, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Tangalle", tours: 4, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Yala", tours: 3, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Udawalawe", tours: 2, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
    { name: "Sinharaja", tours: 2, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" }
  ]

  const [selectedLocation, setSelectedLocation] = useState(sriLankaLocations[17]) // Default to Chilaw (id: 18)
  const [mapLoaded, setMapLoaded] = useState(false)

  const handleSearch = () => {
    if (searchData.tourPackage) {
      // Navigate to the specific tour package page
      window.location.href = `/tours/${searchData.tourPackage}?startDate=${searchData.startDate}&endDate=${searchData.endDate}&guests=${searchData.guests}`
    } else {
      // Navigate to general tours page
      window.location.href = '/tours'
    }
  }

  const handleCustomTripBooking = () => {
    // Create custom trip booking
    const tripData = {
      destinations: customTripData.destinations,
      dateRange: customTripData.dateRange,
      guests: customTripData.guests,
      interests: customTripData.interests
    }
    
    // Store in localStorage for the booking page
    localStorage.setItem('customTripData', JSON.stringify(tripData))
    
    // Navigate to custom booking page
    window.location.href = '/custom-booking'
  }

  const handleDestinationToggle = (destinationId: string) => {
    setCustomTripData(prev => ({
      ...prev,
      destinations: prev.destinations.includes(destinationId)
        ? prev.destinations.filter(id => id !== destinationId)
        : [...prev.destinations, destinationId]
    }))
  }

  const handleInterestToggle = (interestId: string) => {
    setCustomTripData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }))
  }

  const handleDateSelect = (date: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(date)
      setSelectedEndDate(null)
    } else {
      // Complete the range
      if (date > selectedStartDate) {
        setSelectedEndDate(date)
        const startStr = selectedStartDate.toISOString().split('T')[0]
        const endStr = date.toISOString().split('T')[0]
        setCustomTripData(prev => ({
          ...prev,
          dateRange: `${startStr} to ${endStr}`
        }))
        setShowDatePicker(false)
      } else {
        // If end date is before start date, swap them
        setSelectedStartDate(date)
        setSelectedEndDate(selectedStartDate)
        const startStr = date.toISOString().split('T')[0]
        const endStr = selectedStartDate.toISOString().split('T')[0]
        setCustomTripData(prev => ({
          ...prev,
          dateRange: `${startStr} to ${endStr}`
        }))
        setShowDatePicker(false)
      }
    }
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false
    const dateStr = formatDate(date)
    const startStr = formatDate(selectedStartDate)
    const endStr = formatDate(selectedEndDate)
    return dateStr >= startStr && dateStr <= endStr
  }

  const isDateSelected = (date: Date) => {
    const dateStr = formatDate(date)
    const startStr = selectedStartDate ? formatDate(selectedStartDate) : ''
    const endStr = selectedEndDate ? formatDate(selectedEndDate) : ''
    return dateStr === startStr || dateStr === endStr
  }

  // Initialize Mapbox map for Sri Lanka locations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('mapbox-gl').then((mapboxgl) => {
        mapboxgl.default.accessToken = 'pk.eyJ1IjoiaGFzaGRldjg5IiwiYSI6ImNtZWt3dTJ3cTBhc2Yya29jY2FpZHluZ20ifQ.ID9_-ktKbovDhmeQZL8_1Q'

        const map = new mapboxgl.default.Map({
          container: 'sri-lanka-map',
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [80.5, 7.5], // Center of Sri Lanka
          zoom: 7,
          pitch: 0,
          bearing: 0
        })

        // Add navigation controls immediately
        map.addControl(new mapboxgl.default.NavigationControl(), 'top-right')

        map.on('load', () => {
          // Add markers for each location immediately when map loads
          sriLankaLocations.forEach((location) => {
            const markerEl = document.createElement('div')
            markerEl.className = 'marker'
            markerEl.style.width = '30px'
            markerEl.style.height = '30px'
            markerEl.style.backgroundColor = location.id === 18 ? '#ef4444' : '#3b82f6' // Red for Chilaw, blue for others
            markerEl.style.borderRadius = '50%'
            markerEl.style.border = '3px solid white'
            markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
            markerEl.style.cursor = 'pointer'
            markerEl.style.display = 'flex'
            markerEl.style.alignItems = 'center'
            markerEl.style.justifyContent = 'center'
            markerEl.style.fontWeight = 'bold'
            markerEl.style.color = 'white'
            markerEl.style.fontSize = '12px'
            markerEl.textContent = location.id.toString()

            const marker = new mapboxgl.default.Marker(markerEl)
              .setLngLat([location.lng, location.lat])
              .addTo(map)

            // Create popup content
            const popupContent = `
              <div style="padding: 10px; max-width: 200px;">
                <h3 style="margin: 0 0 5px 0; color: #333; font-weight: bold;">${location.name}</h3>
                <p style="margin: 0; color: #666; font-size: 12px;">Click to see activities</p>
              </div>
            `

            const popup = new mapboxgl.default.Popup({ offset: 25 })
              .setHTML(popupContent)

            marker.setPopup(popup)

            // Add click handler to update featured location
            markerEl.addEventListener('click', () => {
              setSelectedLocation(location)
            })
          })

          // Set map as loaded
          setMapLoaded(true)
        })

        return () => {
          if (map) {
            map.remove()
          }
        }
      })
    }
  }, [sriLankaLocations])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section className="relative text-white overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        {/* Background Image - Sigiriya, Sri Lanka */}
        <div className="absolute inset-0 sigiriya-bg bg-cover bg-center"></div>
        
        
        <div className="relative max-w-50xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 items-center">
          <div className="text-center animate-fade-in-up mb-8 sm:mb-12">
            <WordSlider 
              words={[
                'Plan Your Next Trip',
                'Discover Sri Lanka',
                'Explore Wonders',
                'Feel Paradise'
              ]}
              interval={5000}
            />
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto text-white/90 px-4">With us for a better experience</p>
          </div>
          
          {/* Search Section */}
          <div className="w-full max-w-4xl mx-auto animate-fade-in-up delay-100 pb-12 sm:pb-20 px-4">
              {/* Search Tabs */}
              <div className="flex flex-wrap gap-2 sm:gap-1 mb-4 sm:mb-6 justify-center">
                {[
                { id: 'tours', label: 'Tours' },
                { id: 'plan-trip', label: 'Plan Your Trip' },
                { id: 'rent-car', label: 'Rent a Car' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSearchTab(tab.id)}
                  style={searchTab === tab.id ? { color: '#fff', borderBottom: '2px solid #fff' } : { color: 'rgba(255,255,255,0.7)' }}
                  className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 ${searchTab === tab.id ? 'border-b-2' : 'hover:text-white'}`}
                  >
                  {tab.label}
                  </button>
                ))}
              </div>
            
                             {/* Search Form */}
             <div className="rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 backdrop-blur-lg border bg-white/60 dark:bg-gray-800">
               {searchTab === 'tours' && (
                 <>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                     {/* Tour Package */}
                     <div className="relative">
                       <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950 dark:text-white">Tour Package</label>
                       <div className="relative">
                         <select
                           value={searchData.tourPackage}
                           onChange={(e) => setSearchData({...searchData, tourPackage: e.target.value})}
                         style={{ background: colors.primary[50], color: colors.text.base, borderColor: colors.primary[100] }}
                           className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-3 sm:py-4 text-sm sm:text-base border rounded-lg bg-white/60 dark:bg-gray-800 transition-colors"
                         >
                           <option value="">Select Your Package</option>
                           {tourPackages.map((tourPackage) => (
                             <option key={tourPackage.id} value={tourPackage.id}>{tourPackage.name}</option>
                           ))}
                         </select>
                         <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: colors.primary[500] }} />
                       </div>
                     </div>
                     
                     {/* Start Date */}
                     <div className="relative">
                       <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950 dark:text-white">Start Date</label>
                       <input
                         type="date"
                         value={searchData.startDate}
                         onChange={(e) => setSearchData({...searchData, startDate: e.target.value})}
                         style={{ background: colors.primary[50], color: colors.text.base, borderColor: colors.primary[100] }}
                         className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent cursor-pointer hover:border-[#187BFF] transition-colors"
                         min={new Date().toISOString().split('T')[0]}
                       />
                     </div>
                     
                     {/* End Date */}
                     <div className="relative">
                       <label style={{ color: colors.text.base }} className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">End Date</label>
                       <input
                         type="date"
                         value={searchData.endDate}
                         onChange={(e) => setSearchData({...searchData, endDate: e.target.value})}
                         style={{ background: colors.primary[50], color: colors.text.base, borderColor: colors.primary[100] }}
                         className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent cursor-pointer hover:border-[#187BFF] transition-colors"
                         min={searchData.startDate || new Date().toISOString().split('T')[0]}
                       />
                     </div>
                     
                     {/* Number of Guests */}
                     <div className="relative">
                       <label style={{ color: colors.text.base }} className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Number of Guests</label>
                       <div className="relative">
                         <select
                           value={searchData.guests}
                           onChange={(e) => setSearchData({...searchData, guests: parseInt(e.target.value)})}
                           style={{ background: colors.primary[50], color: colors.text.base, borderColor: colors.primary[100] }}
                           className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-3 sm:py-4 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent appearance-none cursor-pointer hover:border-[#187BFF] transition-colors"
                         >
                           {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                             <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                           ))}
                       </select>
                         <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: colors.primary[500] }} />
                       </div>
                     </div>
                   </div>
                   
                   {/* Search Button */}
                   <div className="flex justify-center mt-4 sm:mt-6">
                     <button 
                       onClick={handleSearch}
                       style={{ background: `linear-gradient(90deg, ${colors.primary[400]}, ${colors.primary[500]})` }} 
                       className="text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg w-full sm:w-auto"
                     >
                     <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                     <span>Search</span>
                     </button>
                   </div>
                 </>
               )}

                               {searchTab === 'plan-trip' && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                      {/* Destinations Selection */}
                      <div className="lg:col-span-2">
                        <label style={{ color: colors.text.base }} className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Destinations</label>
                        <div className="relative">
                          <select
                            onChange={(e) => {
                              if (e.target.value && !customTripData.destinations.includes(e.target.value)) {
                                handleDestinationToggle(e.target.value)
                              }
                            }}
                            style={{ background: colors.primary[50], color: colors.text.base, borderColor: colors.primary[100] }}
                            className="w-full pl-3 pr-8 py-3 border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent appearance-none cursor-pointer hover:border-[#187BFF] transition-colors text-sm"
                            value=""
                          >
                            <option value="">Select destinations</option>
                            {availableDestinations.map((destination) => (
                              <option key={destination.id} value={destination.id}>
                                {destination.name} - {destination.region}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: colors.primary[500] }} />
                        </div>
                        
                        {/* Selected Destinations Display */}
                        {customTripData.destinations.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {customTripData.destinations.map((destId) => {
                                const destination = availableDestinations.find(d => d.id === destId)
                                return destination ? (
                                  <span
                                    key={destId}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {destination.name}
                                    <button
                                      onClick={() => handleDestinationToggle(destId)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ) : null
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Trip Details */}
                      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 z-20">
                        {/* Date Range */}
                        <div className="relative">
                          <label style={{ color: colors.text.base }} className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Date Range</label>
                          <button
                            type="button"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            style={{ background: colors.primary[50], color: colors.text.base, borderColor: colors.primary[100] }}
                            className="w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent cursor-pointer hover:border-[#187BFF] transition-colors text-sm text-left"
                          >
                            {customTripData.dateRange || 'Select date range'}
                          </button>
                          
                          {/* Date Picker Popup */}
                          {showDatePicker && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-0 p-3 sm:p-4 min-w-[280px] max-w-[90vw] sm:max-w-none">
                              {/* Calendar Header */}
                              <div className="flex items-center justify-between mb-4">
                                <button
                                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  ←
                                </button>
                                <h3 className="font-semibold">
                                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h3>
                                <button
                                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  →
                                </button>
                              </div>
                              
                              {/* Calendar Grid */}
                              <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                  <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
                                    {day}
                                  </div>
                                ))}
                              </div>
                              
                              <div className="grid grid-cols-7 gap-1">
                                {/* Empty cells for days before first day of month */}
                                {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                                  <div key={`empty-${i}`} className="p-2"></div>
                                ))}
                                
                                {/* Days of the month */}
                                {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                                  const day = i + 1
                                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                                  const isToday = formatDate(date) === formatDate(new Date())
                                  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                                  
                                  return (
                                    <button
                                      key={day}
                                      onClick={() => !isPast && handleDateSelect(date)}
                                      disabled={isPast}
                                      className={`p-2 text-sm rounded transition-colors ${
                                        isPast
                                          ? 'text-gray-300 cursor-not-allowed'
                                          : isDateSelected(date)
                                          ? 'bg-blue-600 text-white'
                                          : isDateInRange(date)
                                          ? 'bg-blue-100 text-blue-800'
                                          : isToday
                                          ? 'bg-gray-100 text-gray-900'
                                          : 'hover:bg-gray-100 text-gray-900'
                                      }`}
                                    >
                                      {day}
                                    </button>
                                  )
                                })}
                              </div>
                              
                              {/* Instructions */}
                              <div className="mt-3 text-xs text-gray-500 text-center">
                                {!selectedStartDate 
                                  ? 'Click to select start date'
                                  : !selectedEndDate 
                                  ? 'Click to select end date'
                                  : 'Date range selected'
                                }
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Number of Guests */}
                        <div className="relative">
                          <label style={{ color: colors.text.base }} className="block text-sm font-medium mb-2">Guests</label>
                          <div className="relative">
                            <select
                              value={customTripData.guests}
                              onChange={(e) => setCustomTripData({...customTripData, guests: parseInt(e.target.value)})}
                              style={{ background: colors.primary[50], color: colors.text.base, borderColor: colors.primary[100] }}
                              className="w-full pl-3 pr-8 py-3 border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent appearance-none cursor-pointer hover:border-[#187BFF] transition-colors text-sm"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                          </select>
                            <Users className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: colors.primary[500] }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interests Row */}
                    <div className="mt-4">
                      <label style={{ color: colors.text.base }} className="block text-sm font-medium mb-2">Interests</label>
                      <div className="flex flex-wrap gap-2">
                        {tripInterests.map((interest) => (
                          <button
                            key={interest.id}
                            onClick={() => handleInterestToggle(interest.id)}
                            className={`px-3 py-1 rounded-full border text-xs transition-colors ${
                              customTripData.interests.includes(interest.id)
                                ? 'bg-blue-100 border-blue-300 text-blue-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {interest.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Plan Trip Button */}
                    <div className="flex justify-center mt-6">
                      <button 
                        onClick={handleCustomTripBooking}
                        style={{ background: `linear-gradient(90deg, ${colors.primary[400]}, ${colors.primary[500]})` }} 
                        className="text-white px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg"
                      >
                      <Search className="w-5 h-5" />
                      <span>Plan My Trip</span>
                      </button>
                    </div>
                  </>
                )}

               {searchTab === 'rent-car' && (
                 <div className="text-center py-8">
                   <p className="text-gray-600 mb-4">Car rental service coming soon!</p>
                   <button className="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-medium cursor-not-allowed">
                     Coming Soon
                   </button>
                 </div>
               )}
             </div>
          </div>
          
          {/* Scroll Down Indicator */}
          <div className="absolute mt-70 bottom-8 left-1/2 transform -translate-x-1/2 text-center animate-bounce z-8">
            <p className="text-white text-sm mb-2">Scroll Down</p>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mx-auto">
              <ArrowRight className="w-4 h-4 text-white transform rotate-90" />
            </div>
            <p className="text-white/70 text-xs mt-2">to discover more</p>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section style={{ background: '#1E3A8A' }} className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg font-semibold">Get Travel Inspiration & Special Offers</h3>
                <p className="text-white/80 text-sm">Subscribe for exclusive tour deals and travel tips</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Your Email"
                className="px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
              />
              <button style={{ background: '#A0FF07' }} className="text-gray-900 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-8 sm:py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-3 sm:space-x-4 pb-4 scrollbar-hide px-2 sm:px-0">
            {featuredDestinations.map((destination, index) => (
              <div key={index} className="flex-shrink-0 w-48 sm:w-56">
                <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    width={224}
                    height={128}
                    className="w-full h-28 sm:h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                    <h3 className="text-white text-sm sm:text-base font-semibold">{destination.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Things to Do in Sri Lanka Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">THINGS TO DO IN SRI LANKA</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We want to share Sri Lanka&apos;s extraordinarily diverse and authentic story with the rest of the world. 
              We want to help you discover the many thousands of different ways in which you can fall in love with our home &amp; 
              plan the perfect trip; local experts, local perspective and all the best tips on where to eat, what to do, 
              who to meet, how to get there and where to make your next favourite memory.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         {/* Interactive Mapbox Map */}
             <div className="lg:col-span-2 relative">
               <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                 <div className="relative w-full h-96">
                   <div id="sri-lanka-map" className="w-full h-full rounded-xl"></div>
                   
                   {/* Loading Overlay */}
                   {!mapLoaded && (
                     <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 flex items-center justify-center rounded-xl">
                       <div className="text-center">
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                         <p className="text-gray-600 dark:text-gray-300 font-medium">Loading Sri Lanka Map...</p>
                       </div>
                     </div>
                   )}
                   
                   {/* Map Title Overlay */}
                   <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                     🗺️ Sri Lanka - Things to Do
                   </div>
                 </div>
               </div>
             </div>

            {/* Featured Location */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-400 relative">
                  <Image
                    src={selectedLocation.image}
                    alt={selectedLocation.name}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedLocation.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{selectedLocation.name}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                    {selectedLocation.name === 'CHILAW' 
                      ? 'The Chilaw Lagoon, located approximately 80 kilometers away from the center of Colombo, is a beautiful coastal lagoon that offers stunning views and diverse wildlife.'
                      : selectedLocation.name === 'SIGIRIYA'
                      ? 'Sigiriya, also known as Lion Rock, is an ancient palace and fortress complex located in the central Matale District. This UNESCO World Heritage site features stunning frescoes and breathtaking views.'
                      : selectedLocation.name === 'COLOMBO'
                      ? 'Colombo, the commercial capital of Sri Lanka, offers a mix of colonial architecture, modern shopping centers, and vibrant street markets. Experience the perfect blend of old and new.'
                      : selectedLocation.name === 'KANDY'
                      ? 'Kandy, the cultural capital of Sri Lanka, is home to the Temple of the Sacred Tooth Relic and offers beautiful botanical gardens, cultural shows, and tea factory tours.'
                      : selectedLocation.name === 'GALLE'
                      ? 'Galle Fort, a UNESCO World Heritage site, features well-preserved colonial architecture, boutique shops, and stunning sunset views over the Indian Ocean.'
                      : selectedLocation.name === 'NUWARA ELIYA'
                      ? 'Nuwara Eliya, known as Little England, offers cool climate, tea plantations, hiking trails, and colonial architecture in the heart of Sri Lanka&apos;s hill country.'
                      : selectedLocation.name === 'YALA'
                      ? 'Yala National Park is famous for its leopard population and diverse wildlife. Experience thrilling safari adventures and nature photography opportunities.'
                      : selectedLocation.name === 'BENTOTA'
                      ? 'Bentota offers pristine beaches, water sports, Ayurveda treatments, and scenic river cruises along the Bentota River.'
                      : selectedLocation.name === 'ANURADHAPURA'
                      ? 'Anuradhapura, an ancient capital, features well-preserved ruins of an ancient Sinhalese civilization, including massive stupas and ancient temples.'
                      : selectedLocation.name === 'TRINCOMALEE'
                      ? 'Trincomalee offers beautiful beaches, excellent diving spots, whale watching opportunities, and rich cultural heritage sites.'
                      : selectedLocation.name === 'JAFFNA'
                      ? 'Jaffna, the cultural heart of the Tamil north, offers unique temples, local cuisine, and a rich historical heritage distinct from the rest of Sri Lanka.'
                      : selectedLocation.name === 'ARUGAM BAY'
                      ? 'Arugam Bay is a world-famous surfing destination with pristine beaches, laid-back atmosphere, and excellent waves for surfers of all levels.'
                      : selectedLocation.name === 'BATTICALOA'
                      ? 'Batticaloa features beautiful lagoons, pristine beaches, cultural tours, and excellent fishing opportunities in a peaceful setting.'
                      : selectedLocation.name === 'PASIKUDA'
                      ? 'Pasikuda offers shallow, calm waters perfect for swimming, snorkeling, diving, and various water sports activities.'
                      : selectedLocation.name === 'HAPUTALE'
                      ? 'Haputale offers stunning tea estate tours, hiking trails, cool climate, and panoramic views of the surrounding hills and valleys.'
                      : selectedLocation.name === 'HIKKADUWA'
                      ? 'Hikkaduwa is famous for its coral reefs, beach activities, surfing, diving, and vibrant nightlife along the southern coast.'
                      : selectedLocation.name === 'HAMBANTOTA'
                      ? 'Hambantota offers beautiful beaches, wildlife tours, cultural sites, and local markets in a developing coastal region.'
                      : selectedLocation.name === 'MANNAR'
                      ? 'Mannar features pristine beaches, cultural tours, historical sites, and unique local cuisine in a less-explored region.'
                      : selectedLocation.name === 'KALPITIYA'
                      ? 'Kalpitiya offers dolphin watching, beach activities, water sports, and excellent fishing opportunities in a peaceful setting.'
                      : selectedLocation.name === 'TANGALLE'
                      ? 'Tangalle offers beautiful beaches, turtle watching, fishing, and local culture in a relaxed coastal atmosphere.'
                      : selectedLocation.name === 'NEGOMBO'
                      ? 'Negombo offers beautiful beaches, fishing village tours, seafood dining, and various water sports activities near Colombo.'
                      : 'Discover the unique attractions and activities this beautiful location has to offer in Sri Lanka.'
                    }
                  </p>
                  <button className="text-blue-600 font-medium text-sm hover:underline flex items-center">
                    Learn more 
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>


      </section>

      {/* Travel Experience Cards */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cultural Triangle Experience */}
            <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <Image
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop"
                alt="Cultural Triangle"
                width={600}
                height={224}
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-white text-2xl font-bold mb-4">Cultural Triangle Explorer</h3>
                <p className="text-white/90 mb-4">Discover ancient wonders of Sigiriya, Dambulla, and Polonnaruwa</p>
                <button 
                  onClick={() => window.location.href = '/tours/cultural-triangle'}
                  style={{ background: '#A0FF07' }} 
                  className="text-gray-900 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg"
                >
                  Explore Tour
                </button>
              </div>
            </div>

            {/* Special Offers */}
            <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <Image
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
                alt="Special Offers"
                width={600}
                height={224}
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-white text-2xl font-bold mb-4">Early Bird Special!</h3>
                <p className="text-white/90 mb-4">Book 3 months in advance and save up to 25% on all tours</p>
                <button style={{ background: '#A0FF07' }} className="text-gray-900 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg">
                  View Offers
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tour Packages */}
      <section className="py-8 sm:py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">Featured Tour Packages</h2>
          <div className="relative">
            {/* Navigation Arrows - Hidden on mobile, visible on larger screens */}
            <button 
              onClick={() => {
                const container = document.getElementById('tour-slider');
                if (container) {
                  const cardWidth = window.innerWidth < 640 ? 280 : 320; // Mobile vs desktop card width
                  container.scrollLeft -= cardWidth + 24; // Width of one card + gap
                }
              }}
              className="hidden sm:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 transform rotate-180" />
            </button>
            
            <button 
              onClick={() => {
                const container = document.getElementById('tour-slider');
                if (container) {
                  const cardWidth = window.innerWidth < 640 ? 280 : 320; // Mobile vs desktop card width
                  container.scrollLeft += cardWidth + 24; // Width of one card + gap
                }
              }}
              className="hidden sm:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>

            {/* Slider Container */}
            <div 
              id="tour-slider"
              className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 scrollbar-hide scroll-smooth px-2 sm:px-0"
              style={{ scrollBehavior: 'smooth' }}
            >
              {tourPackages.map((tour, index) => (
                <div key={index} className="flex-shrink-0 w-72 sm:w-80">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                    <div className="relative">
                      <Image
                        src={tour.image}
                        alt={tour.name}
                        width={320}
                        height={192}
                        className="w-full h-40 sm:h-48 object-cover"
                      />
                      <div style={{ background: '#A0FF07' }} className="absolute top-2 sm:top-3 left-2 sm:left-3 text-gray-900 px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                        {tour.badge}
                      </div>
                      <button className="absolute top-2 sm:top-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">{tour.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3">{tour.duration}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{tour.rating} Excellent</span>
                          <span className="text-gray-500 text-xs sm:text-sm">({tour.reviews})</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">Destinations:</p>
                        <div className="flex flex-wrap gap-1">
                          {tour.destinations.slice(0, 2).map((dest, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {dest}
                            </span>
                          ))}
                          {tour.destinations.length > 2 && (
                            <span className="text-gray-500 text-xs">+{tour.destinations.length - 2} more</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <button 
                          onClick={() => window.location.href = `/tours/${tour.id}`}
                          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors flex-1"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => window.location.href = `/tours/${tour.id}`}
                          style={{ background: '#CAFA7C' }}
                          className="text-gray-900 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-colors flex-1"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots Indicator - Responsive */}
            <div className="flex justify-center mt-4 sm:mt-6 space-x-2">
              {[0, 1, 2, 3, 4].map((dot, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const container = document.getElementById('tour-slider');
                    if (container) {
                      const cardWidth = window.innerWidth < 640 ? 280 : 320; // Mobile vs desktop card width
                      container.scrollLeft = index * (cardWidth + 24); // Width of one card + gap
                    }
                  }}
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-300 hover:bg-blue-600 transition-colors"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Icons */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Best Price Guarantee</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">We guarantee the best prices for all our services with competitive rates and transparent pricing.</p>
            </div>
            <div>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Easy & Quick Booking</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Book your trips quickly and easily with our streamlined platform and instant confirmation.</p>
            </div>
            <div>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Customer Care 24/7</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Round the clock customer support for all your travel needs and emergency assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-blue-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">What our customers are saying us?</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">Discover what our satisfied travelers have to say about their tour experiences with us. We&apos;re proud to have helped thousands of travelers explore the wonders of Sri Lanka.</p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">50k+</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">Happy Travelers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">4.9</div>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Tour rating</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-4 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AB</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sarah Johnson</h4>
                  <p className="text-gray-600 dark:text-gray-400">Cultural Triangle Explorer Tour</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                &quot;The Cultural Triangle Explorer tour was absolutely incredible! Our guide was knowledgeable and the ancient sites were breathtaking. The 3D map showing our route was a fantastic touch. Highly recommend!&quot;
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">01 / 03</div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Get inspiration for your next trip</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
                  <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={192}
                    className="w-full h-48 object-cover"
                  />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white line-clamp-2">{post.title}</h3>
                  <p className="text-gray-500 text-sm">{post.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Stories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">TRAVEL STORIES</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Large Card - Beach Holidays */}
            <div className="lg:col-span-1 lg:row-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
              <div className="relative h-80">
                <Image
                  src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop"
                  alt="Beach Holidays"
                  width={600}
                  height={320}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">BEACH HOLIDAYS</h3>
                <p className="text-blue-600 text-sm font-medium mb-3">DISCOVER SRI LANKA&apos;S GOLDEN COAST</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  Go beyond sun, sand and surf! Dive, snorkel, paddle and explore the golden beaches and enticing waters around the island. From pristine shores to vibrant coral reefs, discover the perfect beach getaway.
                </p>
                <button className="text-blue-600 font-medium text-sm hover:underline flex items-center">
                  FIND OUT MORE 
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Small Cards Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Back Packing */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="relative h-48">
                  <Image
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"
                    alt="Back Packing"
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">BACK PACKING</h3>
                  <p className="text-blue-600 text-xs font-medium mb-2">ROUGH IT OUT IN CEYLON</p>
                  <button className="text-blue-600 font-medium text-sm hover:underline flex items-center">
                    FIND OUT MORE 
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>

              {/* History and Culture */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="relative h-48">
                  <Image
                    src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop"
                    alt="History and Culture"
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">HISTORY AND CULT...</h3>
                  <p className="text-blue-600 text-xs font-medium mb-2">RICH HISTORY AND RICHER CULTURE</p>
                  <button className="text-blue-600 font-medium text-sm hover:underline flex items-center">
                    FIND OUT MORE 
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>

              {/* Misty Mountains */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="relative h-48">
                  <Image
                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=200&fit=crop"
                    alt="Misty Mountains"
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">MISTY MOUNTAINS</h3>
                  <p className="text-blue-600 text-xs font-medium mb-2">ROLLING HILLS OF TEA AND JUNGLE</p>
                  <button className="text-blue-600 font-medium text-sm hover:underline flex items-center">
                    FIND OUT MORE 
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>

              {/* Safaris */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="relative h-48">
                  <Image
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"
                    alt="Safaris"
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">SAFARIS</h3>
                  <p className="text-blue-600 text-xs font-medium mb-2">THE WILD SIDE OF SRI LANKA</p>
                  <button className="text-blue-600 font-medium text-sm hover:underline flex items-center">
                    FIND OUT MORE 
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Travel Guide Section - Inspired by Lonely Planet */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Sri Lanka Travel Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "When to Go",
                icon: "📅",
                description: "Best times to visit different regions",
                link: "Best Time to Visit"
              },
              {
                title: "Getting Around",
                icon: "🚗",
                description: "Transport options and tips",
                link: "Transport Guide"
              },
              {
                title: "Tour Packages",
                icon: "🎒",
                description: "Curated tour experiences",
                link: "Tour Guide"
              },
              {
                title: "What to Eat",
                icon: "🍽️",
                description: "Local cuisine and dining tips",
                link: "Food Guide"
              },
              {
                title: "Money & Costs",
                icon: "💰",
                description: "Budget planning and expenses",
                link: "Budget Guide"
              },
              {
                title: "Health & Safety",
                icon: "🏥",
                description: "Medical advice and safety tips",
                link: "Health Guide"
              },
              {
                title: "Language & Culture",
                icon: "🗣️",
                description: "Cultural etiquette and phrases",
                link: "Culture Guide"
              },
              {
                title: "Packing List",
                icon: "🎒",
                description: "What to bring for your trip",
                link: "Packing Guide"
              }
            ].map((guide, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="text-3xl mb-4">{guide.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{guide.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
                <a href="#" className="text-blue-600 font-medium text-sm group-hover:underline">
                  {guide.link} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations We Love */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">Destinations we love</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
            {['All Sri Lanka', 'Cultural Triangle', 'Hill Country', 'Beach Destinations'].map((filter, index) => (
              <button
                key={filter}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full border transition-all font-medium text-sm sm:text-base ${
                  index === 0 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {destinationsWeLove.map((destination, index) => (
              <div key={index} className="text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-lg overflow-hidden">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white text-sm sm:text-base">{destination.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">{destination.tours} tours available</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best in Travel Section - Inspired by Lonely Planet */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Best in Travel 2025</h2>
            <p className="text-xl opacity-90">Discover the winners of our annual travel awards</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-800" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Cultural Experience</h3>
              <p className="opacity-90">Sigiriya & Cultural Triangle</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-800" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Adventure Destination</h3>
              <p className="opacity-90">Ella & Hill Country</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-800" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Beach Destination</h3>
              <p className="opacity-90">Mirissa & Southern Coast</p>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Interests Section - Inspired by Lonely Planet */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-900 dark:text-white">Travel Interests</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[
              { name: "Adventure Travel", icon: "🏔️", color: "bg-orange-100 text-orange-800" },
              { name: "Art and Culture", icon: "🎨", color: "bg-purple-100 text-purple-800" },
              { name: "Beaches & Islands", icon: "🏖️", color: "bg-blue-100 text-blue-800" },
              { name: "Family Holidays", icon: "👨‍👩‍👧‍👦", color: "bg-green-100 text-green-800" },
              { name: "Festivals", icon: "🎉", color: "bg-pink-100 text-pink-800" },
              { name: "Food and Drink", icon: "🍽️", color: "bg-red-100 text-red-800" },
              { name: "Honeymoon & Romance", icon: "💕", color: "bg-rose-100 text-rose-800" },
              { name: "Road Trips", icon: "🚗", color: "bg-yellow-100 text-yellow-800" },
              { name: "Sustainable Travel", icon: "🌱", color: "bg-emerald-100 text-emerald-800" },
              { name: "Travel on a Budget", icon: "💰", color: "bg-gray-100 text-gray-800" },
              { name: "Wildlife & Nature", icon: "🦁", color: "bg-amber-100 text-amber-800" }
            ].map((interest, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 ${interest.color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 text-lg sm:text-2xl group-hover:scale-110 transition-transform`}>
                  {interest.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {interest.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practical Travel Tips Section - Inspired by Lonely Planet */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Essential Travel Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Best Time to Visit</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Sri Lanka has two monsoon seasons. The southwest coast (Colombo, Galle) is best from December to April, while the east coast (Trincomalee, Arugam Bay) is ideal from March to September.</p>
              <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Learn more →</a>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Safety & Health</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Sri Lanka is generally safe for travelers. Drink bottled water, use mosquito protection, and ensure your vaccinations are up to date before visiting.</p>
              <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Learn more →</a>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Local Customs</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Dress modestly when visiting temples, remove shoes before entering religious sites, and avoid pointing with your feet. Learn basic Sinhala phrases for a better experience.</p>
              <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Learn more →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Planning Section - Inspired by Lonely Planet's "Elsewhere" */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Your dream itinerary, crafted with you</h2>
              <p className="text-xl mb-8 opacity-90">ISLE & ECHO connects you with award-winning local experts to craft your personalized, unforgettable Sri Lanka trip.</p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <span>Make a trip request, connect with a local expert</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <span>Sit back while our experts craft a custom itinerary</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <span>Enjoy 24/7 on-the-ground support throughout your trip</span>
                </div>
              </div>
              <button className="bg-white text-green-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Planning Your Trip
              </button>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
                <h3 className="text-2xl font-semibold mb-4">What&apos;s included?</h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Personalized itinerary based on your interests</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Local expert guidance and insider knowledge</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>24/7 support during your entire journey</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Exclusive access to hidden gems and local experiences</span>
                  </li>
              </ul>
              </div>
            </div>
          </div>
        </div>
      </section>



      <style jsx>{`
        .sigiriya-bg {
          background-image: linear-gradient(rgba(17, 24, 39, 0.6), rgba(17, 24, 39, 0.6)), url('/sigiriya.jpeg');
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-fade-in-up.delay-100 {
          animation-delay: 0.1s;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
