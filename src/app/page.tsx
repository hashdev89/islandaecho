'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Search,
  Star,
  Heart,
  Globe,
  Calendar,
  Users,
  ChevronDown,
  Shield,
  Clock,
  Headphones,
  Play,
  Award,
  Camera
} from 'lucide-react'
import Header from '../components/Header'
import StructuredData, { organizationSchema, websiteSchema } from '../components/StructuredData'

interface Tour {
  id: string
  name: string
  duration: string
  price: string
  image?: string
  images?: string[]
  rating: number
  reviews: number
  destinations?: string[]
  style?: string
  featured?: boolean
}

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
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([])
  const [allTours, setAllTours] = useState<Tour[]>([])
  const [isVideoPlaying, setIsVideoPlaying] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Update dateRange when selectedStartDate or selectedEndDate changes
  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      // Use local date formatting to avoid timezone issues
      const startStr = selectedStartDate.getFullYear() + '-' + 
        String(selectedStartDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(selectedStartDate.getDate()).padStart(2, '0')
      const endStr = selectedEndDate.getFullYear() + '-' + 
        String(selectedEndDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(selectedEndDate.getDate()).padStart(2, '0')
      const dateRangeStr = `${startStr} to ${endStr}`
      console.log('useEffect updating dateRange:', dateRangeStr)
      console.log('Start date object:', selectedStartDate)
      console.log('End date object:', selectedEndDate)
      setCustomTripData(prev => ({
        ...prev,
        dateRange: dateRangeStr
      }))
    } else if (selectedStartDate && !selectedEndDate) {
      console.log('useEffect clearing dateRange for new selection')
      setCustomTripData(prev => ({
        ...prev,
        dateRange: ''
      }))
    }
  }, [selectedStartDate, selectedEndDate])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/tours')
        const json = await res.json()
        if (json.success) {
          setAllTours(json.data || [])
          setFeaturedTours((json.data || []).filter((t: Tour) => t.featured))
        }
      } catch {}
    }
    load()
  }, [])

  // Statistics data inspired by Swimlane's approach
  const stats = [
    { number: '500+', label: 'Happy Travelers', icon: Users },
    { number: '50+', label: 'Tour Packages', icon: Globe },
    { number: '4.9', label: 'Average Rating', icon: Star },
    { number: '24/7', label: 'Customer Support', icon: Headphones }
  ]

  // Features inspired by Swimlane's feature cards
  const features = [
    {
      icon: Shield,
      title: 'Safe & Secure Travel',
      description: 'Your safety is our priority with comprehensive travel insurance and 24/7 support.',
      color: 'text-blue-600'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Customize your itinerary with flexible dates and personalized experiences.',
      color: 'text-green-600'
    },
    {
      icon: Award,
      title: 'Expert Guides',
      description: 'Professional local guides with deep knowledge of Sri Lankan culture and history.',
      color: 'text-purple-600'
    },
    {
      icon: Camera,
      title: 'Memorable Experiences',
      description: 'Create unforgettable memories with our carefully curated tour experiences.',
      color: 'text-orange-600'
    }
  ]

  // Solutions sections inspired by Swimlane's approach
  const solutions = [
    {
      title: 'Cultural Heritage Tours',
      description: 'Explore ancient temples, UNESCO World Heritage sites, and rich cultural traditions.',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
      highlights: ['Sigiriya Rock Fortress', 'Temple of the Tooth', 'Ancient Cities']
    },
    {
      title: 'Wildlife Safari Adventures',
      description: 'Discover Sri Lanka\'s incredible biodiversity with expert-guided wildlife safaris.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      highlights: ['Yala National Park', 'Elephant Watching', 'Bird Watching']
    },
    {
      title: 'Beach & Coastal Escapes',
      description: 'Relax on pristine beaches and enjoy water sports along Sri Lanka\'s beautiful coastline.',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      highlights: ['Mirissa Beach', 'Whale Watching', 'Water Sports']
    }
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

  const handleVideoPlay = () => {
    const video = document.getElementById('hero-video') as HTMLVideoElement;
    if (video) {
      if (isVideoPlaying) {
        video.pause();
        setIsVideoPlaying(false);
      } else {
        video.play();
        setIsVideoPlaying(true);
      }
    }
  }

  const handleSearch = () => {
    if (searchData.tourPackage) {
      // Navigate to the specific tour package page
      window.location.href = `/tours/${searchData.tourPackage}?startDate=${searchData.startDate}&endDate=${searchData.endDate}&guests=${searchData.guests}`
    } else {
      // Navigate to general tours page
      window.location.href = '/tours'
    }
  }

  const handleViewTourDetails = (tourId: string) => {
    window.location.href = `/tours/${tourId}`
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
    console.log('Date selected:', formatDate(date))
    console.log('Current start date:', selectedStartDate ? formatDate(selectedStartDate) : 'none')
    console.log('Current end date:', selectedEndDate ? formatDate(selectedEndDate) : 'none')
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      console.log('Starting new selection')
      setSelectedStartDate(date)
      setSelectedEndDate(null)
    } else {
      // Complete the range
      console.log('Completing range')
      if (date.getTime() >= selectedStartDate.getTime()) {
        // Normal case: end date is after or same as start date
        console.log('Normal case - end date after start date')
        setSelectedEndDate(date)
        setShowDatePicker(false)
      } else {
        // If end date is before start date, swap them
        console.log('Swapping dates - end date before start date')
        setSelectedStartDate(date)
        setSelectedEndDate(selectedStartDate)
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
    // Use local date formatting to avoid timezone issues
    return date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0')
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

  // Manual scroll detection for tour packages slider
  useEffect(() => {
    const container = document.getElementById('tour-slider');
    if (!container) return;

    const handleScroll = () => {
      const cardWidth = window.innerWidth < 640 ? 288 : 320; // Mobile vs desktop card width (including gap)
      const scrollPosition = container.scrollLeft;
      const newSlide = Math.round(scrollPosition / cardWidth);
      setCurrentSlide(Math.max(0, Math.min(newSlide, featuredTours.length - 1)));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [featuredTours.length]);

  // Function to navigate to specific slide
  const goToSlide = (slideIndex: number) => {
    const container = document.getElementById('tour-slider');
    if (container) {
      const cardWidth = window.innerWidth < 640 ? 288 : 320; // Mobile vs desktop card width (including gap)
      container.scrollLeft = slideIndex * cardWidth;
      setCurrentSlide(slideIndex);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Inspired by Swimlane's hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden min-h-screen flex items-center">
        {/* Background Video/Image */}
        <div className="absolute inset-0">
          {/* Sigiriya Background - shown when video is not playing */}
          <div className={`w-full h-full sigiriya-bg bg-cover bg-center transition-opacity duration-500 ${isVideoPlaying ? 'opacity-0' : 'opacity-100'}`}></div>
          
          {/* Video Background - shown when video is playing */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${isVideoPlaying ? 'opacity-100' : 'opacity-0'}`}>
            <video
              id="hero-video"
              className="w-full h-full object-cover"
              src="/isleandechovideo.mp4"
              muted
              loop
              autoPlay
              playsInline
              onEnded={() => setIsVideoPlaying(false)}
            >
              Your browser does not support the video tag.
            </video>
            {/* Video Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        </div>

        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 backdrop-blur-sm border border-blue-400/30 mb-8">
              <Award className="w-4 h-4 mr-2 text-blue-100" />
              <span className="text-blue-100 font-medium">Top Rated Travel Agency</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Discover the Magic of{' '}<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Sri Lanka
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience breathtaking landscapes, rich culture, and unforgettable adventures with our expertly crafted tour packages.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={() => window.location.href = '/tours'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center"
              >
                <Search className="w-5 h-5 mr-2" />
                Explore Tours
              </button>
              <button 
                onClick={handleVideoPlay}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center"
              >
                {isVideoPlaying ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                    Stop Video
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Watch Video
                  </>
                )}
              </button>
          </div>
          
          {/* Search Section */}
          <div className="w-full max-w-7xl mx-auto animate-fade-in-up delay-100 pb-12 sm:pb-20 px-4">
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
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                     {/* Tour Package */}
                     <div className="relative">
                       <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950 dark:text-white">Tour Package</label>
                       <div className="relative">
                         <select
                           value={searchData.tourPackage}
                           onChange={(e) => setSearchData({...searchData, tourPackage: e.target.value})}
                           className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-3 sm:py-4 text-sm sm:text-base border rounded-lg bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                         >
                           <option value="">Select Your Package</option>
                           {allTours.map((tourPackage: Tour) => (
                             <option key={tourPackage.id} value={tourPackage.id}>
                               {tourPackage.name}
                             </option>
                           ))}
                         </select>
                       </div>
                     </div>
                     
                     {/* Start Date */}
                     <div className="relative">
                       <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950 dark:text-white">Start Date</label>
                       <div className="relative">
                         <input
                           type="date"
                           value={searchData.startDate}
                           onChange={(e) => setSearchData({...searchData, startDate: e.target.value})}
                           className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-10 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent cursor-pointer hover:border-[#187BFF] transition-colors text-gray-900 dark:text-white bg-white/60 dark:bg-gray-800"
                           min={new Date().toISOString().split('T')[0]}
                           placeholder="Select start date"
                         />
                         <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                       </div>
                     </div>
                     
                     {/* Number of Guests */}
                     <div className="relative">
                     <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950 dark:text-white">Number of Guests</label>
                       <div className="relative">
                         <select
                           value={searchData.guests}
                           onChange={(e) => setSearchData({...searchData, guests: parseInt(e.target.value)})}
                           className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-3 sm:py-4 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent appearance-none cursor-pointer hover:border-[#187BFF] transition-colors text-gray-900 dark:text-white bg-white/60 dark:bg-gray-800"
                         >
                           {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                             <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                           ))}
                       </select>
                          <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-blue-600" />
                       </div>
                     </div>
                   </div>
                   
                   {/* Tour Package Summary */}
                   {searchData.tourPackage && (
                     <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                       {(() => {
                         const selectedTour = allTours.find((tour: Tour) => tour.id === searchData.tourPackage);
                         if (!selectedTour) return null;
                         
                         return (
                           <div className="space-y-4">
                             {/* Tour Info */}
                             <div className="flex items-center justify-between">
                               <div>
                                 <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">{selectedTour.name}</h3>
                                 <p className="text-blue-600 dark:text-blue-400 font-medium">{selectedTour.duration}</p>
                               </div>
                               <div className="text-right">
                                 <div className="flex items-center space-x-1">
                                   <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                   <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">{selectedTour.rating}</span>
                                 </div>
                                 <p className="text-xs text-blue-600 dark:text-blue-400">({selectedTour.reviews} reviews)</p>
                               </div>
                             </div>
                             
                             {/* Location Summary */}
                             <div>
                               <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                                 <span className="mr-2">🗺️</span>
                                 Tour Locations
                               </h4>
                               <div className="flex flex-wrap gap-2">
                                 {(selectedTour.destinations || []).map((destination: string, idx: number) => (
                                   <span key={idx} className="bg-white dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                                     {destination}
                                   </span>
                                 ))}
                               </div>
                             </div>
                           </div>
                         );
                       })()}
                     </div>
                   )}
                   
                   {/* Search Button */}
                   <div className="flex justify-center mt-4 sm:mt-6">
                     <button 
                       onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all flex items-center space-x-2 shadow-lg w-full sm:w-auto"
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
                        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950 dark:text-white">Destinations</label>
                        <div className="relative">
                          <select
                            onChange={(e) => {
                              if (e.target.value && !customTripData.destinations.includes(e.target.value)) {
                                handleDestinationToggle(e.target.value)
                              }
                            }}
                            className="w-full pl-3 pr-8 py-3 border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent appearance-none cursor-pointer hover:border-[#187BFF] transition-colors text-sm text-gray-900 dark:text-white bg-white/60 dark:bg-gray-800"
                            value=""
                          >
                            <option value="">Select destinations</option>
                            {availableDestinations.map((destination) => (
                              <option key={destination.id} value={destination.id}>
                                {destination.name} - {destination.region}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-blue-600" />
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
                          <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950 dark:text-white">Date Range</label>
                          <button
                            type="button"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent cursor-pointer hover:border-[#187BFF] transition-colors text-sm text-left bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            {(() => {
                              console.log('Displaying date range:', customTripData.dateRange);
                              return customTripData.dateRange || 'Select date range';
                            })()}
                          </button>
                          
                          {/* Date Picker Popup */}
                          {showDatePicker && (
                            <div className="absolute top-full left-0 -mt-1 text-black bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 sm:p-4 min-w-[280px] max-w-[90vw] sm:max-w-none">
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
                                  <div key={day} className="text-center text-xs font-medium text-gray-700 p-1">
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
                                          ? 'text-gray-500 cursor-not-allowed'
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
                              <div className="mt-3 text-xs text-gray-700 text-center">
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
                          <label className="block text-sm font-medium mb-2 text-blue-950 dark:text-white">Guests</label>
                          <div className="relative">
                            <select
                              value={customTripData.guests}
                              onChange={(e) => setCustomTripData({...customTripData, guests: parseInt(e.target.value)})}
                              className="w-full pl-3 pr-8 py-3 border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent appearance-none cursor-pointer hover:border-[#187BFF] transition-colors text-sm bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                          </select>
                            <Users className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interests Row */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2 text-blue-950 dark:text-white">Interests</label>
                      <div className="flex flex-wrap gap-2">
                        {tripInterests.map((interest) => (
                          <button
                            key={interest.id}
                            onClick={() => handleInterestToggle(interest.id)}
                            className={`px-3 py-1 rounded-full border text-xs transition-colors ${
                              customTripData.interests.includes(interest.id)
                                ? 'bg-blue-100 border-blue-300 text-blue-800'
                                : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all flex items-center space-x-2 shadow-lg"
                      >
                      <Search className="w-5 h-5" />
                      <span>Plan My Trip</span>
                      </button>
                    </div>
                  </>
                )}

               {searchTab === 'rent-car' && (
                 <div className="text-center py-8">
                   <p className="text-gray-800 mb-4">Car rental service coming soon!</p>
                   <button className="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-medium cursor-not-allowed">
                     Coming Soon
                   </button>
                 </div>
               )}
             </div>
          </div>
          </div>
        </div>
      </section>
      
      {/* Featured Tour Packages */}
      <section className="py-8 sm:py-12 bg-white dark:bg-gray-900">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="pr-5 text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">Featured Tour Packages</h2>
          <div className="relative">
            {/* Slider Container */}
            <div 
              id="tour-slider"
              className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 scrollbar-hide scroll-smooth px-2 sm:px-0"
              style={{ scrollBehavior: 'smooth' }}
            >
              {featuredTours.map((tour, index) => (
                <div key={index} className="flex-shrink-0 w-72 sm:w-80">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                    <div className="relative">
                      <Image
                        src={tour.image || (tour.images?.[0] ?? '/next.svg')}
                        alt={tour.name}
                        width={320}
                        height={192}
                        className="w-full h-40 sm:h-48 object-cover"
                      />
                      <div style={{ background: '#A0FF07' }} className="absolute top-2 sm:top-3 left-2 sm:left-3 text-gray-900 px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                      {tour.style}
                      </div>
                      <button className="absolute top-2 sm:top-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </button>
              </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">{tour.name}</h3>
                      <p className="text-gray-800 text-xs sm:text-sm mb-3">{tour.duration}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{tour.rating} Excellent</span>
                          <span className="text-gray-700 text-xs sm:text-sm">({tour.reviews})</span>
            </div>
            </div>
                      <div className="mb-3">
                        <p className="text-xs sm:text-sm text-gray-800 mb-2">Destinations:</p>
                        <div className="flex flex-wrap gap-1">
                          {(tour.destinations || []).slice(0, 2).map((dest: string, idx: number) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {dest}
                            </span>
                          ))}
                          {(tour.destinations || []).length > 2 && (
                            <span className="text-gray-700 text-xs">+{(tour.destinations || []).length - 2} more</span>
                          )}
          </div>
        </div>
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleViewTourDetails(tour.id)}
                          style={{ background: '#CAFA7C' }}
                          className="text-gray-900 px-6 sm:px-8 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors w-full"
                        >
                          Book Now
                        </button>
                      </div>
          </div>
        </div>
              </div>
            ))}
            </div>

            {/* Dots Indicator - Active highlighting and click navigation */}
            <div className="flex justify-center mt-4 sm:mt-6 space-x-2">
              {featuredTours.map((_: Tour, index: number) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                    index === currentSlide 
                      ? 'bg-blue-600 shadow-lg' 
                      : 'bg-gray-300 hover:bg-blue-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Inspired by Swimlane's stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
          </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-800">{stat.label}</div>
                       </div>
            ))}
                     </div>
                   </div>
      </section>

      {/* Features Section - Inspired by Swimlane's features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ISLE & ECHO?
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto">
              We provide exceptional travel experiences with unmatched service and attention to detail.
            </p>
                </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                  </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-800">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section - Inspired by Swimlane's solutions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Discover Sri Lanka
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto">
              From ancient temples to pristine beaches, explore the diverse beauty of Sri Lanka.
            </p>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={solution.image}
                    alt={solution.title}
                    fill
                    className="object-cover"
                  />
                </div>
            <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{solution.title}</h3>
                  <p className="text-gray-800 mb-4">{solution.description}</p>
                <div className="flex flex-wrap gap-2">
                    {solution.highlights.map((highlight, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
                </div>
                              ))}
                            </div>
                          </div>
      </section>

      {/* CTA Section - Inspired by Swimlane's CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Start Your Sri Lankan Adventure?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Let us help you create unforgettable memories with our expertly crafted tour packages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Get Started Today
              </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Contact Us
              </button>
            </div>
          </div>
      </section>

      {/* Structured Data */}
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />

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
