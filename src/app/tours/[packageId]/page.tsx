/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Users,
  Star,
  Clock,
  CheckCircle,
  Navigation,
  Calendar,
  Sparkles,
  Hotel,
  UtensilsCrossed,
  Car,
  Moon
} from 'lucide-react'
import Header from '../../../components/Header'
import dynamic from 'next/dynamic'

// Hero height: use '50vh', '60vh', '70vh', etc. to control how tall the hero is
const TOUR_HERO_MIN_HEIGHT = '60vh'

// Dynamically import MapboxMap to reduce initial bundle size
const MapboxMap = dynamic(() => import('../../../components/MapboxMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
})

// Helper function to check if an image is uploaded (not external)
function isUploadedImage(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  // Check if it's a local upload path
  if (url.startsWith('/uploads/')) return true
  
  // Check if it's from Supabase storage
  if (url.includes('supabase.co') && url.includes('storage')) return true
  
  // Everything else is considered external
  return false
}

interface TourPackage {
  id: string
  name: string
  duration: string
  price: string
  destinations: string[]
  highlights: string[]
  keyExperiences?: string[]
  description: string
  itinerary: Day[]
  inclusions: string[]
  exclusions: string[]
  importantInfo?: {
    requirements: {
      activity: string
      requirements: string[]
    }[]
    whatToBring: string[]
  }
  accommodation: string[]
  transportation: string
  groupSize: string
  bestTime: string
  style: string
  images: string[]
}

interface Day {
  day: number
  title: string
  description: string
  activities: string[]
  accommodation: string
  meals: string[]
  transportation?: string
  travelTime?: string
  overnightStay?: string
  image?: string
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
  'Colombo': { lat: 6.9271, lng: 79.8612, region: 'Western Province' },
  'Kitulgala': { lat: 6.9833, lng: 80.4167, region: 'Hill Country' },
  'Ambuluwawa': { lat: 7.2667, lng: 80.6000, region: 'Hill Country' },
  'Weligama': { lat: 5.9667, lng: 80.4167, region: 'Southern Coast' },
  'Negombo': { lat: 7.2086, lng: 79.8358, region: 'Western Province' },
  'Hatton': { lat: 6.9000, lng: 80.6000, region: 'Hill Country' }
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
    bestTime: 'January to April, July to September',
    style: 'Cultural & Heritage',
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
    bestTime: 'March to May, September to December',
    style: 'Nature & Wildlife',
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
     bestTime: 'November to April',
     style: 'Relaxation & Wellness',
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
     bestTime: 'February to July',
     style: 'Fun & Adventure',
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
     bestTime: 'January to April, July to September',
     style: 'Luxury Experience',
     images: [
       'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&h=600&fit=crop',
       'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
       'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop'
     ]
   },
   'adventure-fun-sri-lanka': {
     id: 'adventure-fun-sri-lanka',
     name: 'Adventure & Fun Tour of Sri Lanka',
     duration: '15 Days / 14 Nights',
     price: '$2,499',
     destinations: ['Colombo', 'Kitulgala', 'Ambuluwawa', 'Kandy', 'Nuwara Eliya', 'Ella', 'Yala', 'Mirissa', 'Weligama', 'Galle'],
     highlights: ['White Water Rafting', 'Ziplining', 'Tea Plucking', 'Wildlife Safari', 'Beach Activities', 'Cultural Experiences'],
     keyExperiences: [
       'Lotus Tower climb',
       'Visit Galle Face Green',
       'White Water Rafting in Kitulgala',
       'Ambuluwawa Tower climb',
       'Visit The Temple of Tooth',
       'Scenic train tour (Kandy → Nanu Oya)',
       'Scenic train tour (Nuwara Eliya → Ella)',
       'Jet ski or paddle boat ride in Gregory Lake',
       'Tea plucking Experience',
       'Visit a tea factory',
       'Hike to Little Adam’s Peak',
       'Flying Ravana Zipline',
       'Waterfall Abseiling',
       'Visit Ramboda Waterfall',
       'Visit Nine Arch Bridge',
       'Visit Ravana Waterfall',
       'Safari in Yala',
       'Surfing & Snorkelling whale watching on the south coast',
       'Beach & party scenes in Mirissa and Weligama',
       'Boat safari in Koggala lake and Madu River',
       'Colonial charm in Galle',
       'Country side bike ride',
       'Culture & nightlife in Colombo',
       'Tuk Tuk tour in Colombo city'
     ],
     description: 'Get ready for the ultimate Sri Lankan adventure! This 15-day journey takes you from the energetic streets of Colombo to the wild rivers of Kitulgala, the dizzying heights of Ambuluwawa Tower, and the misty tea hills of Nuwara Eliya. Ride the island\'s iconic scenic trains, go white water rafting, jet ski on Gregory Lake, pluck tea like a local, and chase waterfalls in Ella. Then, dive into the wild at Yala National Park before heading south to surf, party, and unwind on the golden beaches of Mirissa, Weligama, and historic Galle. This tour blends high-energy fun, cultural flavor, and coastal chill.',
     itinerary: [
       {
         day: 1,
         title: 'Arrival & City Lights of Colombo',
         description: 'Begin your Sri Lankan adventure with a warm welcome and a short drive to vibrant Colombo. Wander the breezy Galle Face Green, marvel at the towering Lotus Tower, and unwind at a chic rooftop bar with sweeping views. End your day with a delicious buffet dinner in the heart of the city.',
         activities: ['Warmly welcome by our representative', 'Exploring Galle Face Green and the Lotus Tower', 'Relax in the evening at a rooftop bar', 'Indulge in a delightful buffet dinner'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Buffet Dinner'],
         image: '/colomboskyline.png'
       },
       {
         day: 2,
         title: 'Colombo to Kitulgala – White Waters & Campfire Nights',
         description: 'Leave the city behind for a scenic journey to the lush rainforests of Kitulgala. Dive into a full day of thrilling white-water rafting and canyoning along the Kelani River, with time to swim and soak in the natural beauty around you. As the adrenaline settles, enjoy a peaceful evening with a delicious BBQ dinner beside a crackling campfire, surrounded by the sounds of nature the perfect end to an unforgettable adventure day.',
         activities: ['A scenic journey to the lush rainforests of Kitulgala', 'Full day of thrilling white-water rafting and canyoning', 'Swim in the Kelani River', 'Enjoy a delicious BBQ dinner'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'BBQ Dinner'],
         image: '/KitulgalaWhiteWaters.jpeg'
       },
       {
         day: 3,
         title: 'Kitulgala → Ambuluwawa → Kandy',
         description: 'Begin the day with a scenic drive to the striking Ambuluwawa Tower.',
         activities: ['Climb Ambuluwawa Tower for 360° panoramic views', 'Kandyan Cultural Show with traditional dance and drumming', 'Visit The Temple of Tooth', 'Peaceful walk around the shimmering Kandy Lake'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'Dinner']
       },
       {
         day: 4,
         title: 'Kandy – Explore & Scenic Rail to Nuwara Eliya',
         description: 'Embark on one of the world\'s most scenic train journeys from Kandy to Nanu Oya.',
         activities: ['The world\'s most scenic train journeys from Kandy to Nanu Oya', 'Jet ski or a relaxing paddle boat ride at Gregory Lake', 'Evening walk along the Gregory Lake'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'Dinner']
       },
       {
         day: 5,
         title: 'Explore Nuwara Eliya',
         description: 'Immerse yourself in Nuwara Eliya\'s timeless charm with a hands-on tea plucking experience.',
         activities: ['Hands-on tea plucking experience', 'Visit a Tea Factory and a tasting of world-famous Ceylon tea', 'Discover the beauty of Ramboda Falls', 'Visit the town\'s historic post office'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'Dinner']
       },
       {
         day: 6,
         title: 'Nuwara Eliya → Ella by Train – Hill Country Beauty',
         description: 'Embark on one of the world\'s most breath-taking train journeys from Nuwara Eliya to Ella.',
         activities: ['One of the world\'s most scenic train journey from Nuwara Eliya to Ella', 'Visit iconic Nine Arch Bridge', 'Unwind at a cozy café, soaking in Ella\'s vibe with great food, music, and views'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'Dinner']
       },
       {
         day: 7,
         title: 'Ella Adventure Day',
         description: 'Begin your day with a scenic hike to Little Adam\'s Peak.',
         activities: ['Scenic hike to Little Adam\'s Peak', 'Adventure on Flying Ravana zipline', 'Abseiling experience at Pallewela Waterfall'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'Dinner']
       },
       {
         day: 8,
         title: 'Ella → Yala – Into the Wild',
         description: 'Begin the day with a refreshing stop at the cascading Ravana Waterfall.',
         activities: ['Visit Ravana Waterfall', 'Jeep safari in Yala National Park', 'Enjoying a cozy campfire', 'Enjoy a smoky, flavourful BBQ dinner under the stars'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'BBQ Dinner']
       },
       {
         day: 9,
         title: 'Yala → Mirissa – Beach Bliss',
         description: 'After an early breakfast, leave the wilds of Yala behind and journey to the golden shores of Mirissa.',
         activities: ['Early breakfast and drive to Mirissa', 'Relax with a leisurely stroll or soak up the sun at Mirissa Beach', 'The iconic Coconut Tree Hill for a magical sunset', 'Enjoy at a beachfront bar in the evening'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'Dinner']
       },
       {
         day: 10,
         title: 'Mirissa – Whale Watching & Beach Time',
         description: 'Start the day with an early morning whale watching tour in Mirissa.',
         activities: ['An unforgettable whale watching tour', 'Snorkeling tour and swim alongside graceful sea turtles', 'Beach relaxation & sunset at Mirissa Beach', 'Enjoy at a beachfront bar in the evening'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'Dinner']
       },
       {
         day: 11,
         title: 'Mirissa → Weligama – Surf & Chill',
         description: 'Transfer to nearby Weligama for a laid-back coastal vibe.',
         activities: ['Transfer to Weligama', 'An unforgettable Surfing session (beginners welcome)', 'Boat tour on scenic Koggala Lake', 'Enjoy at a beachfront bar in the evening'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'Dinner']
       },
       {
         day: 12,
         title: 'Weligama – Surf & Countryside Bike Ride',
         description: 'Start your day with an energizing second surf session.',
         activities: ['Begin the day with an energizing second surfing session', 'Cycling tour through Galle\'s picturesque countryside', 'Passing green paddy fields, tranquil lagoons, and charming village scenes', 'Refresh with native king coconut water'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'Dinner']
       },
       {
         day: 13,
         title: 'Weligama → Galle → Colombo – Culture by the Coast',
         description: 'Start with a short transfer to the historic Galle Fort.',
         activities: ['Transfer to the historic Galle Fort', 'Visit the Galle lighthouse and explore boutique shops', 'Transfer to Balapitiya', 'Madu River boat safari, stopping at Cinnamon Island, a serene Buddhist temple', 'Fish massage parlor (Optional)', 'Transfer to Colombo'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'Dinner']
       },
       {
         day: 14,
         title: 'Colombo – Urban Free Day',
         description: 'Hop on a tuk-tuk for a lively city tour.',
         activities: ['Lovely city tour by a tuk-tuk', 'Tasting authentic street food', 'Shopping and souvenir hunting', 'Farewell dinner at the world-famous Ministry of Crab'],
         accommodation: '3–4 Star Hotels (Mid-range)',
         meals: ['Breakfast', 'Dinner']
       },
       {
         day: 15,
         title: 'Departure',
         description: 'Enjoy a final Sri Lankan breakfast before your transfer to the airport.',
         activities: ['Final Sri Lankan breakfast', 'Transfer to airport', 'Take with you unforgettable memories, new friendships, and the vibrant spirit of the island'],
         accommodation: 'N/A',
         meals: ['Breakfast']
       }
     ],
     inclusions: [
       'All transport in private AC vehicle',
       '14 nights in mid-range hotels (confirmable bed, attached bathroom)',
       'Daily breakfast & Dinners',
       'English-speaking local driver-guide',
       'Entrance tickets'
     ],
     exclusions: [
       'International flights',
       'Lunches',
       'Travel insurance',
       'Personal expenses',
       'Camera and video permits',
       'Guide/Driver tips'
     ],
     accommodation: ['3–4 Star Hotels (Mid-range)'],
     transportation: 'Comfortable & Air conditioned car or van',
     groupSize: '2-12 people',
     bestTime: 'November to April',
     style: 'Budget Travel',
     images: [
       'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
       'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
       'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop'
     ]
   }
 }

export default function TourPackagePage({ params }: { params: Promise<{ packageId: string }> }) {
  const searchParams = useSearchParams()
  const [selectedImage, setSelectedImage] = useState(0)
  const [tourPackage, setTourPackage] = useState<TourPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [packageId, setPackageId] = useState<string>('')
  const [availableDestinations, setAvailableDestinations] = useState<Array<{name: string, lat: number, lng: number, region: string}>>([])
  const [bookingData, setBookingData] = useState({
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    guests: parseInt(searchParams.get('guests') || '1'),
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  })

  // Function to extract number of days from duration string (e.g., "7 Days / 6 Nights" -> 7)
  const getDaysFromDuration = (duration: string): number => {
    if (!duration) return 0
    const match = duration.match(/(\d+)\s*Days?/i)
    return match ? parseInt(match[1], 10) : 0
  }

  // Function to calculate end date based on start date and duration
  const calculateEndDate = (startDate: string, duration: string): string => {
    if (!startDate || !duration) return ''
    const days = getDaysFromDuration(duration)
    if (days === 0) return ''
    
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + days - 1) // Subtract 1 because start date is day 1
    
    return end.toISOString().split('T')[0]
  }

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setPackageId(resolvedParams.packageId)
    }
    resolveParams()
  }, [params])

  // Function to normalize tour data from API
  const normalizeTourData = (tour: any): TourPackage => {
    // Handle destinations - could be array, JSONB string, or undefined
    let destinations: string[] = []
    if (tour.destinations) {
      if (Array.isArray(tour.destinations)) {
        destinations = tour.destinations
      } else if (typeof tour.destinations === 'string') {
        try {
          destinations = JSON.parse(tour.destinations)
        } catch {
          // If parsing fails, treat as single destination name
          destinations = [tour.destinations]
        }
      }
    }

    return {
      id: tour.id,
      name: tour.name,
      duration: tour.duration,
      price: tour.price,
      style: tour.style || '',
      destinations: destinations,
      highlights: Array.isArray(tour.highlights) ? tour.highlights : (tour.highlights ? JSON.parse(tour.highlights) : []),
      keyExperiences: Array.isArray(tour.keyExperiences || tour.key_experiences) 
        ? (tour.keyExperiences || tour.key_experiences) 
        : [],
      description: tour.description || '',
      itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : [],
      inclusions: Array.isArray(tour.inclusions) ? tour.inclusions : [],
      exclusions: Array.isArray(tour.exclusions) ? tour.exclusions : [],
      importantInfo: tour.importantInfo || tour.important_info || undefined,
      accommodation: Array.isArray(tour.accommodation) ? tour.accommodation : [],
      transportation: tour.transportation || '',
      groupSize: tour.groupSize || tour.group_size || '',
      bestTime: tour.bestTime || tour.best_time || '',
      images: Array.isArray(tour.images) ? tour.images : []
    }
  }

  // Fetch destinations from API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations')
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          const mappedDestinations = result.data.map((dest: any) => ({
            name: dest.name,
            lat: dest.lat,
            lng: dest.lng,
            region: dest.region
          }))
          setAvailableDestinations(mappedDestinations)
          console.log('Destinations fetched for map:', mappedDestinations.length)
        }
      } catch (error) {
        console.error('Error fetching destinations:', error)
      }
    }
    fetchDestinations()
  }, [])

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await fetch('/api/tours')
        const data = await response.json()
        if (data.success) {
          const tour = data.data.find((t: any) => t.id === packageId)
          if (tour) {
            setTourPackage(normalizeTourData(tour))
          } else {
            setTourPackage(null)
          }
        }
      } catch (error) {
        console.error('Error fetching tour:', error)
        // Fallback to hardcoded data
        const fallbackTour = tourPackages[packageId as keyof typeof tourPackages]
        setTourPackage(fallbackTour || null)
      } finally {
        setLoading(false)
      }
    }

    if (packageId) {
      fetchTour()
    }
  }, [packageId])

  // Auto-calculate end date when tour package is loaded and start date is set
  useEffect(() => {
    if (tourPackage && bookingData.startDate) {
      const calculatedEndDate = calculateEndDate(bookingData.startDate, tourPackage.duration)
      if (calculatedEndDate && calculatedEndDate !== bookingData.endDate) {
        setBookingData(prev => ({
          ...prev,
          endDate: calculatedEndDate
        }))
      }
    }
  }, [tourPackage?.duration, bookingData.startDate])
      
  // Get map coordinates for this tour's destinations - use API data first, fallback to hardcoded
  const tourDestinations = tourPackage?.destinations?.map((dest: string) => {
    // Try to find in API destinations first
    const apiDest = availableDestinations.find(d => d.name === dest)
    if (apiDest) {
      return apiDest
    }
    // Fallback to hardcoded destinations
    const hardcodedDest = sriLankaDestinations[dest as keyof typeof sriLankaDestinations]
    if (hardcodedDest) {
      return {
        name: dest,
        ...hardcodedDest
      }
    }
    console.warn('Destination not found in API or hardcoded list:', dest)
    return null
  }).filter((dest): dest is {name: string, lat: number, lng: number, region: string} => dest !== null && dest.lat !== undefined) || []

  // Debug logging
  useEffect(() => {
    if (tourPackage) {
      console.log('Tour destinations for map:', {
        tourDestinations: tourPackage.destinations,
        mappedDestinations: tourDestinations,
        availableDestinationsCount: availableDestinations.length
      })
    }
  }, [tourPackage?.destinations, tourDestinations.length, availableDestinations.length])

  // Build gallery images from top-level images + day images (only uploaded images)
  const galleryImages: string[] = [
    ...((tourPackage?.images || []) as string[]).filter(img => isUploadedImage(img)),
    ...(((tourPackage?.itinerary || [])
      .map((d) => d.image)
      .filter((src): src is string => typeof src === 'string' && src.length > 0 && isUploadedImage(src)) as string[])),
  ].filter((v, i, arr) => arr.indexOf(v) === i)

  const [showLightbox, setShowLightbox] = useState(false)

  const openLightbox = (index: number) => {
    setSelectedImage(index)
    setShowLightbox(true)
  }

  const closeLightbox = () => setShowLightbox(false)

  const prevImage = () => {
    if (galleryImages.length === 0) return
    setSelectedImage((idx) => (idx - 1 + galleryImages.length) % galleryImages.length)
  }

  const nextImage = () => {
    if (galleryImages.length === 0) return
    setSelectedImage((idx) => (idx + 1) % galleryImages.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading tour details...</p>
        </div>
      </div>
    )
  }

  if (!tourPackage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tour Package Not Found</h1>
          <p className="text-gray-600">The tour package you&apos;re looking for doesn&apos;t exist.</p>
          <div className="mt-8">
            <Link href="/tours" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              View All Tours
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleBooking = async () => {
    try {
      // Validate required fields
      if (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.startDate || !bookingData.endDate) {
        alert('Please fill in all required fields')
        return
      }

      const totalPrice = parseFloat(tourPackage?.price?.replace(/[^0-9.]/g, '') || '0')
      
      const payload = {
        tour_package_id: tourPackage.id,
        tour_package_name: tourPackage.name,
        customer_name: bookingData.name,
        customer_email: bookingData.email,
        customer_phone: bookingData.phone,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        guests: bookingData.guests,
        total_price: totalPrice,
        status: 'pending',
        special_requests: bookingData.specialRequests,
        payment_status: 'pending',
      }
      
      // Create booking first
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      
      if (!json.success) throw new Error(json.error || 'Failed to create booking')
      
      const bookingId = json.data.id
      
      // Redirect to payment checkout page
      window.location.href = `/payments/checkout?booking_id=${bookingId}`
    } catch (e: any) {
      console.error('Booking failed:', e)
      alert(`Booking failed: ${e.message || 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header />
      
      {/* Hero Section - tour image background, ~70% black overlay, content only */}
      <section
        className="relative w-full flex items-center justify-center text-white overflow-hidden"
        style={{ minHeight: TOUR_HERO_MIN_HEIGHT }}
      >
        {/* Background image from tour images */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${tourPackage.images?.find((img: string) => isUploadedImage(img)) || tourPackage.images?.[0] || '/next.svg'})`,
          }}
        />
        {/* ~70% black overlay for readability */}
        <div className="absolute inset-0 bg-black/70 z-[1]" aria-hidden />
        {/* Content on top of overlay */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">{tourPackage.name}</h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 px-2 max-w-3xl">{tourPackage.description}</p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-8 px-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">{tourPackage.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">{tourPackage.groupSize}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">4.8/5 (127 reviews)</span>
              </div>
            </div>
            {parseFloat(tourPackage?.price?.replace(/[^0-9.]/g, '') || '0') > 0 && (
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-4 sm:mb-6 px-2">{tourPackage.price}</div>
            )}
          </div>
        </div>
      </section>

      {/* Tour Details - full width content */}
      <section className="py-16 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-[1920px] mx-auto">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">

              {/* Key Experiences */}
              {tourPackage.keyExperiences && tourPackage.keyExperiences.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Key Experiences</h2>
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                      {(tourPackage.keyExperiences || []).map((item, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tour Destinations: cards first, then map, then map features */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tour Destinations</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
                  {/* Destination cards – right under the title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {tourDestinations.map((dest, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-4 border border-blue-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">{dest.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{dest.region}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Coordinates: {dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Map – below the cards */}
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <MapboxMap 
                      key={`tour-map-${tourPackage.id}-${tourDestinations.map(d => d.name).join(',')}`}
                      destinations={tourDestinations}
                      tourName={tourPackage.name}
                    />
                  </div>

                  {/* Map features – at the bottom, list removed */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Map Features</h4>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Tour Destinations</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Tour Route</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Navigation className="w-3 h-3 text-green-600 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Interactive Navigation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itinerary */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">Detailed Itinerary</h2>
                <div className="space-y-5 sm:space-y-6">
                  {(tourPackage.itinerary || []).map((day) => (
                    <div key={day.day} className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-none border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                          {day.day}
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{day.title}</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-5 leading-relaxed">{day.description}</p>
                      {day.image && isUploadedImage(day.image) && (
                        <div className="mb-5 sm:mb-6 rounded-lg overflow-hidden">
                          <Image
                            src={day.image}
                            alt={`Day ${day.day} - ${day.title}`}
                            width={800}
                            height={400}
                            className="w-full h-48 sm:h-56 md:h-64 object-cover"
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 sm:gap-5 mt-6">
                        {/* Highlights */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 p-4 sm:p-5 flex flex-col min-h-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base mb-3">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                            Highlights
                          </h4>
                          <ul className="space-y-2 flex-1">
                            {(day.activities || []).length > 0 ? (
                              (day.activities || []).map((activity, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                  <span>{activity}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-sm text-gray-400 dark:text-gray-500">—</li>
                            )}
                          </ul>
                        </div>
                        {/* Accommodation */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 p-4 sm:p-5 flex flex-col min-h-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base mb-3">
                            <Hotel className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                            Accommodation
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                            {day.accommodation || '—'}
                          </p>
                        </div>
                        {/* Meals */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 p-4 sm:p-5 flex flex-col min-h-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base mb-3">
                            <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
                            Meals
                          </h4>
                          <ul className="space-y-2 flex-1">
                            {(day.meals || []).length > 0 ? (
                              (day.meals || []).map((meal, index) => (
                                <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{meal}</li>
                              ))
                            ) : (
                              <li className="text-sm text-gray-400 dark:text-gray-500">—</li>
                            )}
                          </ul>
                        </div>
                        {/* Transport */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 p-4 sm:p-5 flex flex-col min-h-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base mb-3">
                            <Car className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400 shrink-0" />
                            Transport
                          </h4>
                          <div className="space-y-2 flex-1 text-sm text-gray-600 dark:text-gray-400">
                            {day.transportation ? (
                              <p><span className="font-medium text-gray-700 dark:text-gray-300">Transport:</span> {day.transportation}</p>
                            ) : null}
                            {day.travelTime ? (
                              <p><span className="font-medium text-gray-700 dark:text-gray-300">Travel time:</span> {day.travelTime}</p>
                            ) : null}
                            {!day.transportation && !day.travelTime && <p className="text-gray-400 dark:text-gray-500">—</p>}
                          </div>
                        </div>
                        {/* Overnight Stay */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 p-4 sm:p-5 flex flex-col min-h-0 sm:col-span-2 xl:col-span-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base mb-3">
                            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0" />
                            Overnight Stay
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                            {day.overnightStay || '—'}
                          </p>
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
                  {galleryImages.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`${tourPackage.name} - Image ${index + 1}`}
                      width={200}
                      height={150}
                      className={`rounded-lg cursor-pointer transition-all ${
                        selectedImage === index ? 'ring-4 ring-blue-500' : 'hover:opacity-80'
                      }`}
                      onClick={() => openLightbox(index)}
                    />
                  ))}
                </div>
              </div>

              {showLightbox && galleryImages.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                  <button
                    aria-label="Close"
                    onClick={closeLightbox}
                    className="absolute top-4 right-4 text-white text-3xl leading-none px-3"
                  >
                    ×
                  </button>
                  <button
                    aria-label="Previous image"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                  >
                    ‹
                  </button>
                  <div className="max-w-5xl w-full">
                    <Image
                      src={galleryImages[selectedImage]}
                      alt={`${tourPackage.name} - Image ${selectedImage + 1}`}
                      width={1280}
                      height={720}
                      className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                    />
                    <div className="mt-3 text-center text-white text-sm">
                      {selectedImage + 1} / {galleryImages.length}
                    </div>
                  </div>
                  <button
                    aria-label="Next image"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                  >
                    ›
                  </button>
                </div>
              )}


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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tour Start Date
                      {tourPackage.duration && (
                        <span className="text-xs text-gray-500 ml-2">({tourPackage.duration})</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={bookingData.startDate}
                        onChange={(e) => {
                          const newStartDate = e.target.value
                          const calculatedEndDate = calculateEndDate(newStartDate, tourPackage?.duration || '')
                          setBookingData({
                            ...bookingData,
                            startDate: newStartDate,
                            endDate: calculatedEndDate || bookingData.endDate
                          })
                        }}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        min={new Date().toISOString().split('T')[0]}
                        placeholder="Select start date"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {bookingData.startDate && tourPackage?.duration && (
                      <p className="text-xs text-gray-500 mt-1">
                        End date will be automatically set to {calculateEndDate(bookingData.startDate, tourPackage.duration) || 'N/A'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tour End Date
                      <span className="text-xs text-gray-500 ml-2">(Auto-calculated)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={bookingData.endDate}
                        onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                        placeholder="Select end date"
                        title="End date is automatically calculated based on package duration. You can manually adjust if needed."
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {bookingData.startDate && bookingData.endDate && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        Date Range: {new Date(bookingData.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })} - {new Date(bookingData.endDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
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
                    Book Now
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
                  {tourPackage.style && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Style:</span>
                      <span className="font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{tourPackage.style}</span>
                    </div>
                  )}
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
                  {(tourPackage.inclusions || []).map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Not Included</h3>
                <ul className="space-y-2">
                  {(tourPackage.exclusions || []).map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-4 h-4 text-red-500 mr-2">×</div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Important Information */}
              {tourPackage.importantInfo && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Important Information</h3>
                  
                  {/* Requirements */}
                  {tourPackage.importantInfo.requirements && tourPackage.importantInfo.requirements.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3 text-gray-800">Requirements</h4>
                      <div className="space-y-4">
                        {tourPackage.importantInfo.requirements.map((req, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4">
                            <h5 className="font-medium text-gray-700 mb-2">{req.activity}</h5>
                            <ul className="space-y-1">
                              {req.requirements.map((requirement, reqIndex) => (
                                <li key={reqIndex} className="text-sm text-gray-600">
                                  • {requirement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* What to Bring */}
                  {tourPackage.importantInfo.whatToBring && tourPackage.importantInfo.whatToBring.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-800">What to Bring</h4>
                      <ul className="space-y-2">
                        {tourPackage.importantInfo.whatToBring.map((item, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
