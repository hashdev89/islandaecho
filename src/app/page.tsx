'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
  Pause,
  Award,
  Camera,
  ArrowRight
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
  const [showToursDatePicker, setShowToursDatePicker] = useState(false)
  const [selectedTourStartDate, setSelectedTourStartDate] = useState<Date | null>(null)
  const [currentToursMonth, setCurrentToursMonth] = useState(new Date())
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([])
  const [allTours, setAllTours] = useState<Tour[]>([])
  const [loadingTours, setLoadingTours] = useState(true)
  const [destinations, setDestinations] = useState<any[]>([])
  const [loadingDestinations, setLoadingDestinations] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [destinationSearchQuery, setDestinationSearchQuery] = useState('')
  const [isVideoPlaying, setIsVideoPlaying] = useState(false) // Start with video not playing to avoid issues
  const [videoError, setVideoError] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [useFallbackImage, setUseFallbackImage] = useState(false)
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

  // Sync selectedTourStartDate with searchData.startDate
  useEffect(() => {
    if (searchData.startDate) {
      const date = new Date(searchData.startDate)
      if (!isNaN(date.getTime())) {
        setSelectedTourStartDate(date)
      }
    } else {
      setSelectedTourStartDate(null)
    }
  }, [searchData.startDate])

  // Fetch featured tours and destinations in parallel for better performance
  useEffect(() => {
    let isMounted = true
    
    // Safety timeout to ensure loading states are cleared after 15 seconds
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Loading timeout reached, clearing loading states')
        setLoadingTours(false)
        setLoadingDestinations(false)
      }
    }, 15000)
    
    const loadData = async () => {
      try {
        setLoadingTours(true)
        setLoadingDestinations(true)
        
        // Create a timeout promise
        const timeoutPromise = (ms: number) => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), ms)
          )
        
        // Fetch with timeout (10 seconds)
        const fetchWithTimeout = async (url: string, timeout = 10000) => {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), timeout)
            
            const response = await fetch(url, {
              signal: controller.signal,
              next: { revalidate: 300 } // Cache for 5 minutes, revalidate in background
            })
            
            clearTimeout(timeoutId)
            return response
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              throw new Error('Request timeout')
            }
            throw error
          }
        }
        
        // Fetch featured tours and destinations in parallel (priority)
        try {
          const [toursRes, destinationsRes] = await Promise.allSettled([
            fetchWithTimeout('/api/tours/featured', 10000),
            fetchWithTimeout('/api/destinations?includeTourCount=false', 10000)
          ])
          
          // Handle featured tours
          if (isMounted) {
            try {
              if (toursRes.status === 'fulfilled' && toursRes.value.ok) {
                const contentType = toursRes.value.headers.get('content-type')
                if (contentType && contentType.includes('application/json')) {
                  const json = await toursRes.value.json()
                  if (json.success && json.data) {
                    const featured = (json.data || []).filter((t: Tour) => {
                      const isValid = t && t.featured && t.id && t.name
                      return isValid
                    })
                    setFeaturedTours(featured)
                  } else {
                    setFeaturedTours([])
                  }
                } else {
                  setFeaturedTours([])
                }
              } else {
                setFeaturedTours([])
              }
            } catch (error) {
              console.error('Error processing featured tours:', error)
              setFeaturedTours([])
            } finally {
              setLoadingTours(false)
            }
          }
          
          // Handle destinations
          if (isMounted) {
            try {
              if (destinationsRes.status === 'fulfilled' && destinationsRes.value.ok) {
                const contentType = destinationsRes.value.headers.get('content-type')
                if (contentType && contentType.includes('application/json')) {
                  const json = await destinationsRes.value.json()
                  if (json.success && json.data) {
                    setDestinations(json.data || [])
                  } else {
                    setDestinations([])
                  }
                } else {
                  setDestinations([])
                }
              } else {
                setDestinations([])
              }
            } catch (error) {
              console.error('Error processing destinations:', error)
              setDestinations([])
            } finally {
              setLoadingDestinations(false)
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error)
          if (isMounted) {
            setFeaturedTours([])
            setDestinations([])
            setLoadingTours(false)
            setLoadingDestinations(false)
          }
        }
        
        // Fetch all tours in the background (for search functionality) - lower priority
        // This doesn't block the initial render
        if (isMounted) {
          fetchWithTimeout('/api/tours', 15000)
            .then(async (res) => {
              if (isMounted && res.ok) {
                const contentType = res.headers.get('content-type')
                if (contentType && contentType.includes('application/json')) {
                  const json = await res.json()
                  if (json.success && json.data) {
                    const tours = json.data || []
                    // Remove duplicates based on id
                    const uniqueTours = tours.filter((tour: Tour, index: number, self: Tour[]) => 
                      index === self.findIndex((t: Tour) => t.id === tour.id)
                    )
                    setAllTours(uniqueTours)
                  }
                }
              }
            })
            .catch((error) => {
              console.error('Error loading all tours (background):', error)
              // Don't set loading state for background fetch
            })
        }
      } catch (error) {
        console.error('Error loading data:', error)
        if (isMounted) {
          setFeaturedTours([])
          setDestinations([])
          setLoadingTours(false)
          setLoadingDestinations(false)
        }
      }
    }
    
    loadData()
    
    // Cleanup function
    return () => {
      isMounted = false
      clearTimeout(safetyTimeout)
    }
  }, [])

  // Filter destinations with useMemo for performance
  const filteredDestinations = useMemo(() => {
    return (destinations || []).filter(destination => {
      const regionMatch = selectedRegion === 'all' || destination.region === selectedRegion
      const searchMatch = destination.name.toLowerCase().includes(destinationSearchQuery.toLowerCase()) ||
                         (destination.description || '').toLowerCase().includes(destinationSearchQuery.toLowerCase())
      return regionMatch && searchMatch
    })
  }, [destinations, selectedRegion, destinationSearchQuery])

  // Handle YouTube video initialization and state tracking
  useEffect(() => {
    const iframe = document.getElementById('hero-video') as HTMLIFrameElement;
    if (iframe) {
      console.log('YouTube iframe found:', iframe);
      console.log('YouTube src:', iframe.src);
      
      // Listen for YouTube API events
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== 'https://www.youtube.com') return;
        
        try {
          const data = JSON.parse(event.data);
          
          switch (data.event) {
            case 'video-pause':
              setIsVideoPlaying(false);
              break;
            case 'video-play':
              setIsVideoPlaying(true);
              break;
          }
        } catch {
          // Ignore non-JSON messages
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
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
    const iframe = document.getElementById('hero-video') as HTMLIFrameElement;
    if (iframe) {
      console.log('Play button clicked, current state:', isVideoPlaying);
      
      if (isVideoPlaying) {
        console.log('Pausing YouTube video...');
        // Pause the video by sending a message to the iframe
        iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        setIsVideoPlaying(false);
      } else {
        console.log('Resuming YouTube video...');
        // Resume the video by sending a message to the iframe
        iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        setIsVideoPlaying(true);
      }
    } else {
      console.error('Video iframe not found!');
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

  const handleTourDateSelect = (date: Date) => {
    setSelectedTourStartDate(date)
    const dateStr = formatDate(date)
    setSearchData({...searchData, startDate: dateStr})
    setShowToursDatePicker(false)
  }

  const isTourDateSelected = (date: Date) => {
    if (!selectedTourStartDate) return false
    return formatDate(date) === formatDate(selectedTourStartDate)
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
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-visible sm:overflow-hidden min-h-auto sm:min-h-screen w-full flex items-start sm:items-center pt-20 pb-11 sm:pt-0 sm:pb-0">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Sigiriya Background - shown when video is not playing or failed */}
          {/* Always visible on mobile, conditionally hidden on desktop when video plays */}
          <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${isVideoPlaying && !useFallbackImage ? 'sm:opacity-0 opacity-100' : 'opacity-100'}`}>
            <Image
              src="/sigiriya.jpeg"
              alt="Sigiriya Rock Fortress - Sri Lanka"
              fill
              priority
              className="object-cover"
              quality={75}
              sizes="100vw"
              fetchPriority="high"
              unoptimized={false}
              style={{ objectFit: 'cover' }}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
          
          {/* YouTube Video Background - shown only on desktop when video is playing and not using fallback */}
          <div className={`absolute inset-0 z-20 transition-opacity duration-500 hidden sm:block ${isVideoPlaying && !useFallbackImage ? 'opacity-100' : 'opacity-0'}`}>
            <div className="youtube-container">
              <iframe
                id="hero-video"
                src="https://www.youtube.com/embed/y5bHGWAE50c?autoplay=1&mute=1&loop=1&playlist=y5bHGWAE50c&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1&start=0&cc_load_policy=0&playsinline=1&enablejsapi=1&origin=*&widget_referrer=*&widgetid=1&autohide=1&wmode=transparent"
                title="Sri Lanka Travel Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => {
                  console.log('YouTube video loaded');
                  setVideoLoaded(true);
                  setIsVideoPlaying(true);
                }}
                onError={() => {
                  console.error('YouTube video failed to load');
                  setIsVideoPlaying(false);
                  setVideoError(true);
                  setUseFallbackImage(true);
                }}
              />
              {/* CSS Overlay to hide YouTube controls */}
              <div className="youtube-overlay"></div>
            </div>
            {/* Dark overlay on top of video */}
            <div className="absolute inset-0 bg-black/70 z-30"></div>
          </div>
        </div>

        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:py-12 md:py-16 lg:py-20 xl:py-32 z-10 w-full">
          <div className="text-center max-w-4xl mx-auto w-full">
            {/* Badge */}
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-600/20 backdrop-blur-sm border border-blue-400/30 mb-4 sm:mb-4 md:mb-6">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-blue-100" />
              <span className="text-blue-100 font-medium text-xs sm:text-sm">Top Rated Travel Agency</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-4 md:mb-6 leading-tight px-2">
              Discover the Magic of{' '}<br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 animated-gradient-text">
                Sri Lanka
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-6 sm:mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
              Experience breathtaking landscapes, rich culture, and unforgettable adventures with our expertly crafted tour packages.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 md:mb-12 px-2">
              <button 
                onClick={() => window.location.href = '/tours'}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors flex items-center justify-center min-h-[44px] touch-manipulation"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Explore Tours
              </button>
              <button 
                onClick={handleVideoPlay}
                disabled={videoError}
                className="hidden sm:flex bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
              >
                {videoError || useFallbackImage ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {useFallbackImage ? 'Using Image' : 'Video Error'}
                  </>
                ) : isVideoPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Play
                  </>
                )}
              </button>
          </div>
          
          {/* Search Section */}
          <div className="w-full max-w-7xl mx-auto animate-fade-in-up delay-100 pt-7 sm:pt-0 pb-8 sm:pb-8 md:pb-12 lg:pb-20 px-2 sm:px-4">
              {/* Search Tabs */}
              <div className="flex flex-wrap gap-2 sm:gap-1 mb-3 sm:mb-6 justify-center">
                {[
                { id: 'tours', label: 'Tours' },
                { id: 'plan-trip', label: 'Plan Your Trip' },
                { id: 'rent-car', label: 'Rent a Car' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSearchTab(tab.id)}
                  style={searchTab === tab.id ? { color: '#fff', borderBottom: '2px solid #fff' } : { color: 'rgba(255,255,255,0.7)' }}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 min-h-[44px] touch-manipulation ${searchTab === tab.id ? 'border-b-2' : 'hover:text-white'}`}
                  >
                  {tab.label}
                  </button>
                ))}
              </div>
            
                             {/* Search Form */}
             <div className="rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-6 md:p-8 backdrop-blur-lg border bg-white/60">
               {searchTab === 'tours' && (
                 <>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 relative z-10">
                     {/* Tour Package */}
                     <div className="relative">
                       <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950">Tour Package</label>
                       <div className="relative">
                         <select
                           value={searchData.tourPackage}
                           onChange={(e) => setSearchData({...searchData, tourPackage: e.target.value})}
                           className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-3 sm:py-4 text-base sm:text-base border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent appearance-none cursor-pointer hover:border-[#187BFF] transition-colors bg-white/60"
                         >
                           <option value="" className="bg-white">Select Your Package</option>
                          {allTours.map((tourPackage: Tour, index: number) => (
                            <option key={`${tourPackage.id}-${index}`} value={tourPackage.id} className="bg-white">
                              {tourPackage.name}
                            </option>
                          ))}
                         </select>
                         <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-600" />
                       </div>
                     </div>
                     
                     {/* Start Date */}
                     <div className="relative">
                       <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950">Start Date</label>
                       <div className="relative">
                         <button
                           type="button"
                           onClick={() => setShowToursDatePicker(!showToursDatePicker)}
                           className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-10 text-base sm:text-base border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent cursor-pointer hover:border-[#187BFF] active:border-[#187BFF] transition-colors text-left bg-white/60"
                         >
                           {searchData.startDate 
                             ? new Date(searchData.startDate).toLocaleDateString('en-US', { 
                                 year: 'numeric', 
                                 month: 'short', 
                                 day: 'numeric' 
                               })
                             : 'Select start date'}
                         </button>
                         <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                       </div>
                       
                       {/* Date Picker Popup */}
                       {showToursDatePicker && (
                         <div className="absolute top-full left-0 mt-1 text-black">
                           {/* Calendar Header */}
                           <div className="flex items-center justify-between mb-4">
                             <button
                               onClick={() => setCurrentToursMonth(new Date(currentToursMonth.getFullYear(), currentToursMonth.getMonth() - 1))}
                               className="p-1 hover:bg-gray-100"
                             >
                               ←
                             </button>
                             <h3 className="font-semibold text-gray-900">
                               {currentToursMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                             </h3>
                             <button
                               onClick={() => setCurrentToursMonth(new Date(currentToursMonth.getFullYear(), currentToursMonth.getMonth() + 1))}
                               className="p-1 hover:bg-gray-100"
                             >
                               →
                             </button>
                           </div>
                           
                           {/* Calendar Grid */}
                           <div className="grid grid-cols-7 gap-1 mb-2">
                             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                               <div key={day} className="text-center text-xs font-medium text-gray-700">
                                 {day}
                               </div>
                             ))}
                           </div>
                           
                           <div className="grid grid-cols-7 gap-1">
                             {/* Empty cells for days before first day of month */}
                             {Array.from({ length: getFirstDayOfMonth(currentToursMonth.getFullYear(), currentToursMonth.getMonth()) }).map((_, i) => (
                               <div key={`empty-${i}`} className="p-2"></div>
                             ))}
                             
                             {/* Days of the month */}
                             {Array.from({ length: getDaysInMonth(currentToursMonth.getFullYear(), currentToursMonth.getMonth()) }).map((_, i) => {
                               const day = i + 1
                               const date = new Date(currentToursMonth.getFullYear(), currentToursMonth.getMonth(), day)
                               const isToday = formatDate(date) === formatDate(new Date())
                               const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                               
                               return (
                                 <button
                                   key={day}
                                   onClick={() => !isPast && handleTourDateSelect(date)}
                                   disabled={isPast}
                                   className={`p-2 text-sm rounded transition-colors ${
                                     isPast
                                       ? 'text-gray-500'
                                       : isTourDateSelected(date)
                                       ? 'bg-blue-600'
                                       : isToday
                                       ? 'bg-gray-100'
                                       : 'hover:bg-gray-100'
                                   }`}
                                 >
                                   {day}
                                 </button>
                               )
                             })}
                           </div>
                           
                           {/* Instructions */}
                           <div className="mt-3 text-xs text-gray-700">
                             {!selectedTourStartDate 
                               ? 'Click to select start date'
                               : 'Date selected'
                             }
                           </div>
                         </div>
                       )}
                     </div>
                     
                     {/* Number of Guests */}
                     <div className="relative">
                     <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950">Number of Guests</label>
                       <div className="relative">
                         <select
                           value={searchData.guests}
                           onChange={(e) => setSearchData({...searchData, guests: parseInt(e.target.value)})}
                           className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-3 sm:py-4 text-base sm:text-base border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent appearance-none cursor-pointer hover:border-[#187BFF] transition-colors text-gray-900"
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
                     <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                       {(() => {
                         const selectedTour = allTours.find((tour: Tour) => tour.id === searchData.tourPackage);
                         if (!selectedTour) return null;
                         
                         return (
                           <div className="space-y-4">
                             {/* Tour Info */}
                             <div className="flex items-center justify-between">
                               <div className="text-left">
                                 <h3 className="text-lg font-bold text-blue-900">{selectedTour.name}</h3>
                                 <p className="text-blue-600">{selectedTour.duration}</p>
                               </div>
                               <div className="text-right">
                                 <div className="flex items-center space-x-1">
                                   <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                   <span className="text-sm font-semibold text-blue-900">{selectedTour.rating}</span>
                                 </div>
                                 <p className="text-xs text-blue-600">({selectedTour.reviews} reviews)</p>
                               </div>
                             </div>
                             
                             {/* Location Summary */}
                             <div>
                               <h4 className="text-sm font-semibold text-blue-900">
                                 <span className="mr-2">🗺️</span>
                                 Tour Locations
                               </h4>
                               <div className="flex flex-wrap gap-2">
                                 {(selectedTour.destinations || []).map((destination: string, idx: number) => (
                                   <span key={idx} className="bg-white">
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
                        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all flex items-center justify-center space-x-2 shadow-lg w-full sm:w-auto min-h-[44px] touch-manipulation"
                     >
                     <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                     <span>Search</span>
                     </button>
                   </div>
                 </>
               )}

                               {searchTab === 'plan-trip' && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 relative z-10">
                      {/* Destinations Selection */}
                      <div className="lg:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950">Destinations</label>
                        <div className="relative">
                          <select
                            onChange={(e) => {
                              if (e.target.value && !customTripData.destinations.includes(e.target.value)) {
                                handleDestinationToggle(e.target.value)
                              }
                            }}
                            className="w-full pl-3 pr-8 py-3 border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent appearance-none cursor-pointer hover:border-[#187BFF] transition-colors text-base text-gray-900"
                            value=""
                          >
                            <option value="" className="bg-white">Select destinations</option>
                            {availableDestinations.map((destination) => (
                              <option key={destination.id} value={destination.id} className="bg-white">
                                {destination.name} - {destination.region}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-600" />
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
                                      className="text-blue-600 hover:text-blue-800 active:text-blue-900 min-w-[24px] min-h-[24px] flex items-center justify-center touch-manipulation"
                                      aria-label="Remove destination"
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
                          <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950">Date Range</label>
                          <button
                            type="button"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent cursor-pointer hover:border-[#187BFF] active:border-[#187BFF] transition-colors text-base text-left bg-white/60"
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
                          <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-950">Guests</label>
                          <div className="relative">
                            <select
                              value={customTripData.guests}
                              onChange={(e) => setCustomTripData({...customTripData, guests: parseInt(e.target.value)})}
                              className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-3 sm:py-4 text-base sm:text-base border rounded-lg focus:ring-2 focus:ring-[#187BFF] focus:border-transparent appearance-none cursor-pointer hover:border-[#187BFF] transition-colors bg-white/60"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                          </select>
                            <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interests Row */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2 text-blue-950">Interests</label>
                      <div className="flex flex-wrap gap-2">
                        {tripInterests.map((interest) => (
                          <button
                            key={interest.id}
                            onClick={() => handleInterestToggle(interest.id)}
                            className={`px-4 py-2 rounded-full border text-sm transition-colors min-h-[36px] touch-manipulation ${
                              customTripData.interests.includes(interest.id)
                                ? 'bg-blue-100 border-blue-300 text-blue-800 active:bg-blue-200'
                                : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100 active:bg-gray-200'
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
                        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition-all flex items-center justify-center space-x-2 shadow-lg w-full sm:w-auto min-h-[44px] touch-manipulation"
                      >
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Plan My Trip</span>
                      </button>
                    </div>
                  </>
                )}

               {searchTab === 'rent-car' && (
                 <div className="text-center py-8">
                   <p className="text-gray-800">Car rental service coming soon!</p>
                   <button className="bg-gray-300">
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
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="pr-5 text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-900">Featured Tour Packages</h2>
          <div className="relative">
            {/* Slider Container */}
            <div 
              id="tour-slider"
              className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 scrollbar-hide scroll-smooth px-2 sm:px-0 snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
            >
              {loadingTours ? (
                <div className="flex items-center justify-center w-full py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading featured tours...</p>
                  </div>
                </div>
              ) : !loadingTours && (!featuredTours || featuredTours.length === 0) ? (
                <div className="flex items-center justify-center w-full py-12">
                  <div className="text-center">
                    <p className="text-gray-500">No featured tours available at the moment.</p>
                  </div>
                </div>
              ) : featuredTours && featuredTours.length > 0 ? featuredTours.map((tour, index) => (
                <div key={tour.id || `tour-${index}`} className="flex-shrink-0 w-[280px] sm:w-72 md:w-80 snap-start">
                  <div className="bg-white">
                    <div className="relative">
                      <Image
                        src={tour.image || (tour.images?.[0] ?? '/next.svg')}
                        alt={tour.name}
                        width={320}
                        height={192}
                        className="w-full h-40 sm:h-48 object-cover"
                        loading={index < 3 ? "eager" : "lazy"}
                        priority={index < 3}
                        sizes="(max-width: 640px) 280px, (max-width: 768px) 288px, 320px"
                      />
                      <div style={{ background: '#A0FF07' }} className="absolute top-2 sm:top-3 left-2 sm:left-3 text-gray-900 px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                      {tour.style}
                      </div>
                      <button className="absolute top-2 sm:top-3 right-2 sm:right-3 w-9 h-9 sm:w-10 sm:h-10 bg-white/90">
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </button>
              </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900">{tour.name}</h3>
                      <p className="text-gray-800">{tour.duration}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">{tour.rating} Excellent</span>
                          <span className="text-gray-700">({tour.reviews})</span>
            </div>
            </div>
                      <div className="mb-3">
                        <p className="text-xs sm:text-sm text-gray-800">Destinations:</p>
                        <div className="flex flex-wrap gap-1">
                          {(tour.destinations || []).slice(0, 2).map((dest: string, idx: number) => (
                            <span key={idx} className="bg-blue-100">
                              {dest}
                            </span>
                          ))}
                          {(tour.destinations || []).length > 2 && (
                            <span className="text-gray-700">+{(tour.destinations || []).length - 2} more</span>
                          )}
          </div>
        </div>
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleViewTourDetails(tour.id)}
                          style={{ background: '#CAFA7C' }}
                          className="text-gray-900 px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-base font-medium hover:opacity-90 active:opacity-80 transition-colors w-full min-h-[44px] touch-manipulation"
                        >
                          Book Now
                        </button>
                      </div>
          </div>
        </div>
              </div>
            )) : (
              <div className="flex items-center justify-center w-full py-8">
                <div className="text-center">
                  <p className="text-gray-500">No featured tours available</p>
                  <p className="text-gray-400">Please check back later</p>
                </div>
              </div>
            )}
            </div>

            {/* Dots Indicator - Active highlighting and click navigation */}
            {featuredTours && featuredTours.length > 0 && (
            <div className="flex justify-center mt-4 sm:mt-6 space-x-2">
              {featuredTours.map((_: Tour, index: number) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 sm:w-3 sm:h-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation ${
                    index === currentSlide 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <span className={`w-3 h-3 rounded-full ${
                    index === currentSlide 
                      ? 'bg-white' 
                      : 'bg-gray-500'
                  }`}></span>
                </button>
              ))}
            </div>
            )}
          </div>
        </div>
      </section>

      {/* Statistics Section - Inspired by Swimlane's stats */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-600">
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
          </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-sm sm:text-base text-gray-800">{stat.label}</div>
                       </div>
            ))}
                     </div>
                   </div>
      </section>


      <section className='py-12 sm:py-16 md:py-20 bg-image-bg'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-center text-white text-shadow-sri-lanka'>
            Sri Lanka
          </h1>
          <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-center text-black text-shadow-subtitle mt-2 sm:mt-4'>Mystic Isle of Echoes</p>
        </div>  
      </section>
      {/* Features Section - Inspired by Swimlane's features */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Why Choose ISLE & ECHO?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-800">
              We provide exceptional travel experiences with unmatched service and attention to detail.
            </p>
                </div>
                      
 

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="text-center p-4 sm:p-6 rounded-xl hover:shadow-lg transition-shadow bg-white">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-100 mb-4">
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-700" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-800">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      
      {/* Destinations & Activities Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Discover Sri Lanka&apos;s Destinations
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-800">
              Explore the diverse beauty of Sri Lanka with our curated list of destinations and activities.
            </p>
          </div>

          {/* Top Filter Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={destinationSearchQuery}
                  onChange={(e) => setDestinationSearchQuery(e.target.value)}
                  className="px-4 py-2.5 pl-10 border border-gray-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2.5 border border-gray-300"
              >
                <option value="all">All Regions</option>
                <option value="Cultural Triangle">Cultural Triangle</option>
                <option value="Hill Country">Hill Country</option>
                <option value="Southern Coast">Beach Destinations</option>
                <option value="Wildlife">Wildlife & Nature</option>
                <option value="Northern">Northern Region</option>
              </select>
            </div>
          </div>

          {/* Destinations Grid */}
          {loadingDestinations ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading destinations...</p>
              </div>
            </div>
          ) : !loadingDestinations && filteredDestinations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-500">No destinations found.</p>
              </div>
            </div>
          ) : filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredDestinations.map((destination) => {
                // Generate default values for missing properties
                const badge = destination.region === 'Cultural Triangle' ? 'Heritage' : 
                             destination.region === 'Wildlife' ? 'Nature' :
                             destination.region.includes('Province') ? 'Cultural' : 'Explore'
                
                const rating = 4.5 + Math.random() * 0.5 // Random rating between 4.5-5.0
                const reviews = Math.floor(Math.random() * 200) + 50 // Random reviews 50-250

                return (
                  <div key={destination.id} className="bg-white">
                    <div className="relative">
                      <Image
                        src={destination.image || 'https://images.unsplash.com/photo-1506905925346-14b1e0dbb51e?w=400&h=300&fit=crop'}
                        alt={destination.name}
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover"
                      />
                      <div style={{ background: 'linear-gradient(90deg, #ADFF29, #A0FF07)' }} className="absolute top-3 left-3 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                        {badge}
                      </div>
                      <button className="absolute top-3 right-3 w-10 h-10 bg-white/90">
                        <Heart className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">{destination.name}</h3>
                      
                      <div className="flex items-center mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{rating.toFixed(1)} ({reviews})</span>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-4 text-gray-600">{destination.description}</p>
                      
                      <Link href={`/destinations`}>
                        <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 active:opacity-80 transition-all flex items-center justify-center space-x-2 min-h-[44px] touch-manipulation">
                          <span>Explore</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">No destinations found</p>
              <p className="text-gray-400 text-sm">Please check back later</p>
            </div>
          )}
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
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-2">
            Ready to Start Your Sri Lankan Adventure?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Let us help you create unforgettable memories with our expertly crafted tour packages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-2">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors min-h-[44px] touch-manipulation">
              Get Started Today
              </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors min-h-[44px] touch-manipulation">
              Contact Us
              </button>
            </div>
          </div>
      </section>

      {/* Structured Data */}
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
    </div>
  )
}
