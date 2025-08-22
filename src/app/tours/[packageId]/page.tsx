'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { use } from 'react'
import Image from 'next/image'
import {
  MapPin,
  Users,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Shield,
  Award,
  Navigation
} from 'lucide-react'
import Header from '../../../components/Header'
import MapboxMap from '../../../components/MapboxMap'

interface TourPackage {
  id: string
  name: string
  duration: string
  price: string
  destinations: string[]
  highlights: string[]
  description: string
  itinerary: Day[]
  inclusions: string[]
  exclusions: string[]
  accommodation: string[]
  transportation: string
  groupSize: string
  difficulty: string
  bestTime: string
  images: string[]
}

interface Day {
  day: number
  title: string
  description: string
  activities: string[]
  accommodation: string
  meals: string[]
}

// Sri Lanka map coordinates for destinations
const sriLankaDestinations = {
  'Sigiriya': { lat: 7.9570, lng: 80.7603, region: 'Cultural Triangle' },
  'Dambulla': { lat: 7.8567, lng: 80.6492, region: 'Cultural Triangle' },
  'Polonnaruwa': { lat: 7.9403, lng: 81.0187, region: 'Cultural Triangle' },
  'Anuradhapura': { lat: 8.3114, lng: 80.4037, region: 'Cultural Triangle' },
  'Kandy': { lat: 7.2906, lng: 80.6337, region: 'Hill Country' },
  'Nuwara Eliya': { lat: 6.9497, lng: 80.7891, region: 'Hill Country' },
  'Ella': { lat: 6.8767, lng: 81.0463, region: 'Hill Country' },
  'Tea Plantations': { lat: 6.9497, lng: 80.7891, region: 'Hill Country' },
  'Galle': { lat: 6.0535, lng: 80.2210, region: 'Southern Coast' },
  'Mirissa': { lat: 5.9483, lng: 80.4718, region: 'Southern Coast' },
  'Bentota': { lat: 6.4185, lng: 79.9953, region: 'Southern Coast' },
  'Hikkaduwa': { lat: 6.1394, lng: 80.1038, region: 'Southern Coast' },
  'Yala National Park': { lat: 6.2619, lng: 81.4157, region: 'Wildlife' },
  'Udawalawe': { lat: 6.4500, lng: 80.8833, region: 'Wildlife' },
  'Sinharaja Forest': { lat: 6.4000, lng: 80.4500, region: 'Wildlife' },
  'Colombo': { lat: 6.9271, lng: 79.8612, region: 'Western Province' }
}

const tourPackages: { [key: string]: TourPackage } = {
  'cultural-triangle': {
    id: 'cultural-triangle',
    name: 'Cultural Triangle Explorer',
    duration: '5 Days / 4 Nights',
    price: '$899',
    destinations: ['Sigiriya', 'Dambulla', 'Polonnaruwa', 'Anuradhapura'],
    highlights: ['UNESCO Sites', 'Ancient Temples', 'Historical Monuments'],
    description: 'Discover the heart of Sri Lanka\'s ancient civilization with this comprehensive tour of the Cultural Triangle. Visit UNESCO World Heritage sites, ancient temples, and historical monuments that tell the story of Sri Lanka\'s rich cultural heritage.',
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Sigiriya Introduction',
        description: 'Arrive in Sigiriya and visit the magnificent Lion Rock fortress.',
        activities: ['Airport pickup', 'Sigiriya Rock Fortress', 'Sunset at Pidurangala'],
        accommodation: 'Sigiriya Village Hotel',
        meals: ['Dinner']
      },
      {
        day: 2,
        title: 'Dambulla Cave Temple',
        description: 'Explore the ancient cave temple complex with stunning Buddhist murals.',
        activities: ['Dambulla Cave Temple', 'Golden Temple', 'Local village visit'],
        accommodation: 'Sigiriya Village Hotel',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      },
      {
        day: 3,
        title: 'Polonnaruwa Ancient City',
        description: 'Discover the medieval capital with well-preserved archaeological sites.',
        activities: ['Polonnaruwa Archaeological Park', 'Gal Vihara', 'Royal Palace ruins'],
        accommodation: 'Polonnaruwa Rest House',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      },
      {
        day: 4,
        title: 'Anuradhapura Sacred City',
        description: 'Visit the ancient capital and sacred Buddhist sites.',
        activities: ['Sri Maha Bodhi', 'Ruwanwelisaya', 'Jetavanaramaya', 'Isurumuniya'],
        accommodation: 'Polonnaruwa Rest House',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      },
      {
        day: 5,
        title: 'Departure',
        description: 'Transfer to airport with memories of ancient Sri Lanka.',
        activities: ['Morning temple visit', 'Airport transfer'],
        accommodation: 'N/A',
        meals: ['Breakfast']
      }
    ],
    inclusions: [
      'All accommodation in 3-4 star hotels',
      'Daily breakfast, lunch, and dinner',
      'Professional English-speaking guide',
      'All entrance fees to attractions',
      'Air-conditioned vehicle with driver',
      'Airport transfers',
      'Bottled water throughout the tour'
    ],
    exclusions: [
      'International flights',
      'Personal expenses',
      'Tips for guides and drivers',
      'Optional activities',
      'Travel insurance'
    ],
    accommodation: ['Sigiriya Village Hotel', 'Polonnaruwa Rest House'],
    transportation: 'Air-conditioned van with professional driver',
    groupSize: '2-12 people',
    difficulty: 'Easy to Moderate',
    bestTime: 'January to April, July to September',
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop'
    ]
  },
  'hill-country': {
    id: 'hill-country',
    name: 'Hill Country Adventure',
    duration: '6 Days / 5 Nights',
    price: '$1,199',
    destinations: ['Kandy', 'Nuwara Eliya', 'Ella', 'Tea Plantations'],
    highlights: ['Tea Gardens', 'Mountain Views', 'Train Journey'],
    description: 'Experience the cool climate and stunning landscapes of Sri Lanka\'s hill country. Visit tea plantations, take scenic train rides, and explore charming mountain towns.',
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Kandy',
        description: 'Arrive in the cultural capital and visit the Temple of the Tooth.',
        activities: ['Airport pickup', 'Temple of the Tooth', 'Cultural dance show'],
        accommodation: 'Kandy City Hotel',
        meals: ['Dinner']
      },
      {
        day: 2,
        title: 'Kandy to Nuwara Eliya',
        description: 'Travel to Little England and explore tea plantations.',
        activities: ['Tea factory visit', 'Gregory Lake', 'Victoria Park'],
        accommodation: 'Nuwara Eliya Grand Hotel',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      },
      {
        day: 3,
        title: 'Horton Plains & World\'s End',
        description: 'Hike through the misty plains and see spectacular views.',
        activities: ['Horton Plains National Park', 'World\'s End viewpoint', 'Baker\'s Falls'],
        accommodation: 'Nuwara Eliya Grand Hotel',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      },
      {
        day: 4,
        title: 'Scenic Train to Ella',
        description: 'Take the famous train journey through tea country.',
        activities: ['Train journey', 'Ella Rock hike', 'Nine Arch Bridge'],
        accommodation: 'Ella Jungle Resort',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      },
      {
        day: 5,
        title: 'Ella Exploration',
        description: 'Explore the charming village and surrounding nature.',
        activities: ['Little Adam\'s Peak', 'Tea plantation visit', 'Local cooking class'],
        accommodation: 'Ella Jungle Resort',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      },
      {
        day: 6,
        title: 'Departure',
        description: 'Transfer to airport with memories of the hill country.',
        activities: ['Morning village walk', 'Airport transfer'],
        accommodation: 'N/A',
        meals: ['Breakfast']
      }
    ],
    inclusions: [
      'All accommodation in boutique hotels',
      'Daily breakfast, lunch, and dinner',
      'Professional English-speaking guide',
      'All entrance fees to attractions',
      'Train tickets (2nd class reserved)',
      'Air-conditioned vehicle with driver',
      'Airport transfers',
      'Bottled water throughout the tour'
    ],
    exclusions: [
      'International flights',
      'Personal expenses',
      'Tips for guides and drivers',
      'Optional activities',
      'Travel insurance'
    ],
    accommodation: ['Kandy City Hotel', 'Nuwara Eliya Grand Hotel', 'Ella Jungle Resort'],
    transportation: 'Air-conditioned van + scenic train journey',
    groupSize: '2-8 people',
    difficulty: 'Moderate',
    bestTime: 'March to May, September to December',
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502602898534-47d98d8b4b3b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&h=600&fit=crop'
         ]
   },
   'beach-paradise': {
     id: 'beach-paradise',
     name: 'Beach Paradise Tour',
     duration: '7 Days / 6 Nights',
     price: '$1,299',
     destinations: ['Galle', 'Mirissa', 'Bentota', 'Hikkaduwa'],
     highlights: ['Beach Resorts', 'Whale Watching', 'Water Sports'],
     description: 'Experience the pristine beaches and crystal-clear waters of Sri Lanka\'s southern coast. From historic Galle Fort to the laid-back beaches of Mirissa, this tour offers the perfect blend of culture and relaxation.',
     itinerary: [
       {
         day: 1,
         title: 'Arrival in Galle',
         description: 'Arrive in the historic coastal city and explore the UNESCO World Heritage site.',
         activities: ['Airport pickup', 'Galle Fort exploration', 'Lighthouse visit'],
         accommodation: 'Galle Fort Hotel',
         meals: ['Dinner']
       },
       {
         day: 2,
         title: 'Galle Fort & Beaches',
         description: 'Discover the colonial architecture and pristine beaches.',
         activities: ['Fort walking tour', 'Unawatuna Beach', 'Local market visit'],
         accommodation: 'Galle Fort Hotel',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 3,
         title: 'Mirissa Beach',
         description: 'Travel to the famous whale watching destination.',
         activities: ['Mirissa Beach', 'Whale watching (seasonal)', 'Sunset beach walk'],
         accommodation: 'Mirissa Beach Resort',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 4,
         title: 'Bentota Luxury',
         description: 'Experience luxury beach resorts and water sports.',
         activities: ['Bentota Beach', 'Water sports', 'River cruise'],
         accommodation: 'Bentota Beach Resort',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 5,
         title: 'Hikkaduwa Adventure',
         description: 'Explore coral reefs and vibrant beach life.',
         activities: ['Snorkeling', 'Coral reef exploration', 'Beach bars'],
         accommodation: 'Hikkaduwa Beach Hotel',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 6,
         title: 'Beach Relaxation',
         description: 'Enjoy the final day of beach paradise.',
         activities: ['Beach relaxation', 'Spa treatments', 'Sunset dinner'],
         accommodation: 'Hikkaduwa Beach Hotel',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 7,
         title: 'Departure',
         description: 'Transfer to airport with memories of beach paradise.',
         activities: ['Morning beach walk', 'Airport transfer'],
         accommodation: 'N/A',
         meals: ['Breakfast']
       }
     ],
     inclusions: [
       'All accommodation in beachfront resorts',
       'Daily breakfast, lunch, and dinner',
       'Professional English-speaking guide',
       'All entrance fees to attractions',
       'Water sports equipment',
       'Air-conditioned vehicle with driver',
       'Airport transfers',
       'Bottled water throughout the tour'
     ],
     exclusions: [
       'International flights',
       'Personal expenses',
       'Tips for guides and drivers',
       'Optional activities',
       'Travel insurance'
     ],
     accommodation: ['Galle Fort Hotel', 'Mirissa Beach Resort', 'Bentota Beach Resort', 'Hikkaduwa Beach Hotel'],
     transportation: 'Air-conditioned van with professional driver',
     groupSize: '2-10 people',
     difficulty: 'Easy',
     bestTime: 'November to April',
     images: [
       'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
       'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
       'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=600&fit=crop'
     ]
   },
   'wildlife-safari': {
     id: 'wildlife-safari',
     name: 'Wildlife Safari Adventure',
     duration: '4 Days / 3 Nights',
     price: '$799',
     destinations: ['Yala National Park', 'Udawalawe', 'Sinharaja Forest'],
     highlights: ['Leopard Safari', 'Elephant Watching', 'Bird Watching'],
     description: 'Embark on an unforgettable wildlife adventure through Sri Lanka\'s most famous national parks. Spot leopards, elephants, and hundreds of bird species in their natural habitat.',
     itinerary: [
       {
         day: 1,
         title: 'Arrival & Yala Safari',
         description: 'Arrive and head straight to Yala National Park for your first safari.',
         activities: ['Airport pickup', 'Yala National Park safari', 'Wildlife photography'],
         accommodation: 'Yala Safari Lodge',
         meals: ['Dinner']
       },
       {
         day: 2,
         title: 'Yala Full Day Safari',
         description: 'Full day exploring Yala National Park for wildlife.',
         activities: ['Morning safari', 'Afternoon safari', 'Bird watching'],
         accommodation: 'Yala Safari Lodge',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 3,
         title: 'Udawalawe Safari',
         description: 'Visit Udawalawe National Park for elephant encounters.',
         activities: ['Udawalawe safari', 'Elephant transit home', 'Nature trails'],
         accommodation: 'Udawalawe Safari Camp',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 4,
         title: 'Sinharaja Forest & Departure',
         description: 'Explore the rainforest and transfer to airport.',
         activities: ['Sinharaja Forest walk', 'Bird watching', 'Airport transfer'],
         accommodation: 'N/A',
         meals: ['Breakfast']
       }
     ],
     inclusions: [
       'All accommodation in safari lodges',
       'Daily breakfast, lunch, and dinner',
       'Professional wildlife guide',
       'All safari fees and permits',
       'Safari vehicle with driver',
       'Airport transfers',
       'Bottled water throughout the tour'
     ],
     exclusions: [
       'International flights',
       'Personal expenses',
       'Tips for guides and drivers',
       'Optional activities',
       'Travel insurance'
     ],
     accommodation: ['Yala Safari Lodge', 'Udawalawe Safari Camp'],
     transportation: 'Safari jeep with professional driver',
     groupSize: '2-6 people',
     difficulty: 'Easy to Moderate',
     bestTime: 'February to July',
     images: [
       'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop',
       'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&h=600&fit=crop',
       'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop'
     ]
   },
   'complete-sri-lanka': {
     id: 'complete-sri-lanka',
     name: 'Complete Sri Lanka Experience',
     duration: '12 Days / 11 Nights',
     price: '$2,199',
     destinations: ['Colombo', 'Cultural Triangle', 'Hill Country', 'Beach Destinations'],
     highlights: ['Full Island Tour', 'All Major Attractions', 'Luxury Accommodation'],
     description: 'Experience the complete Sri Lanka with this comprehensive 12-day tour covering all major attractions from the cultural triangle to hill country and pristine beaches.',
     itinerary: [
       {
         day: 1,
         title: 'Arrival in Colombo',
         description: 'Arrive in the capital and explore the city.',
         activities: ['Airport pickup', 'Colombo city tour', 'Welcome dinner'],
         accommodation: 'Colombo Luxury Hotel',
         meals: ['Dinner']
       },
       {
         day: 2,
         title: 'Colombo to Sigiriya',
         description: 'Travel to the Cultural Triangle and visit Sigiriya.',
         activities: ['Sigiriya Rock Fortress', 'Sunset at Pidurangala'],
         accommodation: 'Sigiriya Village Hotel',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 3,
         title: 'Cultural Triangle',
         description: 'Explore Dambulla and Polonnaruwa.',
         activities: ['Dambulla Cave Temple', 'Polonnaruwa Archaeological Park'],
         accommodation: 'Sigiriya Village Hotel',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 4,
         title: 'Anuradhapura',
         description: 'Visit the ancient capital.',
         activities: ['Anuradhapura sacred sites', 'Sri Maha Bodhi'],
         accommodation: 'Anuradhapura Rest House',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 5,
         title: 'Kandy',
         description: 'Travel to the hill country capital.',
         activities: ['Temple of the Tooth', 'Cultural dance show'],
         accommodation: 'Kandy City Hotel',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 6,
         title: 'Nuwara Eliya',
         description: 'Explore Little England.',
         activities: ['Tea factory visit', 'Gregory Lake', 'Victoria Park'],
         accommodation: 'Nuwara Eliya Grand Hotel',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 7,
         title: 'Ella',
         description: 'Scenic train journey to Ella.',
         activities: ['Train journey', 'Ella Rock hike'],
         accommodation: 'Ella Jungle Resort',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 8,
         title: 'Yala Safari',
         description: 'Wildlife adventure in Yala.',
         activities: ['Yala National Park safari', 'Wildlife photography'],
         accommodation: 'Yala Safari Lodge',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 9,
         title: 'Galle',
         description: 'Historic coastal city.',
         activities: ['Galle Fort exploration', 'Beach visit'],
         accommodation: 'Galle Fort Hotel',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 10,
         title: 'Mirissa',
         description: 'Beach paradise and whale watching.',
         activities: ['Mirissa Beach', 'Whale watching (seasonal)'],
         accommodation: 'Mirissa Beach Resort',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 11,
         title: 'Bentota',
         description: 'Luxury beach resort experience.',
         activities: ['Bentota Beach', 'Water sports', 'Spa treatments'],
         accommodation: 'Bentota Beach Resort',
         meals: ['Breakfast', 'Lunch', 'Dinner']
       },
       {
         day: 12,
         title: 'Departure',
         description: 'Transfer to airport with memories of Sri Lanka.',
         activities: ['Morning beach walk', 'Airport transfer'],
         accommodation: 'N/A',
         meals: ['Breakfast']
       }
     ],
     inclusions: [
       'All accommodation in luxury hotels and resorts',
       'Daily breakfast, lunch, and dinner',
       'Professional English-speaking guide',
       'All entrance fees to attractions',
       'Safari fees and permits',
       'Train tickets (1st class reserved)',
       'Air-conditioned vehicle with driver',
       'Airport transfers',
       'Bottled water throughout the tour'
     ],
     exclusions: [
       'International flights',
       'Personal expenses',
       'Tips for guides and drivers',
       'Optional activities',
       'Travel insurance'
     ],
     accommodation: ['Colombo Luxury Hotel', 'Sigiriya Village Hotel', 'Anuradhapura Rest House', 'Kandy City Hotel', 'Nuwara Eliya Grand Hotel', 'Ella Jungle Resort', 'Yala Safari Lodge', 'Galle Fort Hotel', 'Mirissa Beach Resort', 'Bentota Beach Resort'],
     transportation: 'Air-conditioned van + train + safari jeep',
     groupSize: '2-8 people',
     difficulty: 'Easy to Moderate',
     bestTime: 'January to April, July to September',
     images: [
       'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&h=600&fit=crop',
       'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
       'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop'
     ]
   }
 }

export default function TourPackagePage({ params }: { params: Promise<{ packageId: string }> }) {
  const searchParams = useSearchParams()
  const [selectedImage, setSelectedImage] = useState(0)
  const [bookingData, setBookingData] = useState({
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    guests: parseInt(searchParams.get('guests') || '1'),
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  })

  const resolvedParams = use(params)
  const tourPackage = tourPackages[resolvedParams.packageId]

  // Get map coordinates for this tour's destinations
  const tourDestinations = tourPackage?.destinations.map(dest => ({
    name: dest,
    ...sriLankaDestinations[dest as keyof typeof sriLankaDestinations]
  })).filter(dest => dest.lat) || []

  if (!tourPackage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tour Package Not Found</h1>
                      <p className="text-gray-600">The tour package you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  const handleBooking = () => {
    // Handle booking logic here
    console.log('Booking:', bookingData)
    alert('Booking request sent! We will contact you soon.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{tourPackage.name}</h1>
              <p className="text-xl mb-8 opacity-90">{tourPackage.description}</p>
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{tourPackage.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{tourPackage.groupSize}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>4.8/5 (127 reviews)</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-6">{tourPackage.price}</div>
              <button 
                onClick={handleBooking}
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
              >
                Book This Tour
              </button>
            </div>
            <div className="relative">
              <Image
                src={tourPackage.images[0]}
                alt={tourPackage.name}
                width={800}
                height={384}
                className="rounded-lg shadow-lg w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tour Details */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Interactive 3D Mapbox Map */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Tour Route Map</h2>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  {/* Mapbox 3D Interactive Map */}
                  <MapboxMap 
                    destinations={tourDestinations}
                    tourName={tourPackage.name}
                  />
                  
                  {/* Map Legend */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Tour Destinations</h4>
                      <div className="space-y-2">
                        {tourDestinations.map((dest, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">{dest.name}</span>
                            <span className="text-xs text-gray-500">({dest.region})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Map Features</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Tour Destinations</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Tour Route</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Navigation className="w-3 h-3 text-green-600" />
                          <span className="text-sm text-gray-700">Interactive Navigation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Destination Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {tourDestinations.map((dest, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{dest.region}</p>
                        <div className="text-xs text-gray-500">
                          Coordinates: {dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Itinerary */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Detailed Itinerary</h2>
                <div className="space-y-6">
                  {tourPackage.itinerary.map((day) => (
                    <div key={day.day} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                          {day.day}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{day.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{day.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Activities</h4>
                          <ul className="space-y-1">
                            {day.activities.map((activity, index) => (
                              <li key={index} className="flex items-center text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Accommodation</h4>
                          <p className="text-sm text-gray-600">{day.accommodation}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Meals</h4>
                          <ul className="space-y-1">
                            {day.meals.map((meal, index) => (
                              <li key={index} className="text-sm text-gray-600">{meal}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Gallery */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Tour Gallery</h2>
                <div className="grid grid-cols-3 gap-4">
                  {tourPackage.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`${tourPackage.name} - Image ${index + 1}`}
                      width={200}
                      height={150}
                      className={`rounded-lg cursor-pointer transition-all ${
                        selectedImage === index ? 'ring-4 ring-blue-500' : 'hover:opacity-80'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              </div>


            </div>

            {/* Sidebar */}
            <div className="lg:sticky lg:top-6 lg:h-fit lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto space-y-6">
              {/* Quick Booking */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Quick Booking</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={bookingData.name || ''}
                      onChange={(e) => {
                        console.log('Name input changed:', e.target.value)
                        setBookingData({...bookingData, name: e.target.value})
                      }}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tour Start Date</label>
                    <input
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tour End Date</label>
                    <input
                      type="date"
                      value={bookingData.endDate}
                      onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                    <select
                      value={bookingData.guests}
                      onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                      placeholder="Any special requests or dietary requirements?"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button 
                    onClick={handleBooking}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Book Now - {tourPackage.price}
                  </button>
                </div>
              </div>

              {/* Tour Info */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Tour Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-sm">{tourPackage.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Group Size:</span>
                    <span className="font-semibold text-sm">{tourPackage.groupSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="font-semibold text-sm">{tourPackage.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Best Time:</span>
                    <span className="font-semibold text-sm">{tourPackage.bestTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Transportation:</span>
                    <span className="font-semibold text-sm">{tourPackage.transportation}</span>
                  </div>
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">What&apos;s Included</h3>
                <ul className="space-y-2 mb-6">
                  {tourPackage.inclusions.map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Not Included</h3>
                <ul className="space-y-2">
                  {tourPackage.exclusions.map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-4 h-4 text-red-500 mr-2">×</div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
