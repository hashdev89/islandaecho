import { NextResponse } from 'next/server'

// Embedded fallback tours data for production (Vercel)
const EMBEDDED_FALLBACK_TOURS = [
  {
    "id": "adventure-fun-10-days",
    "name": "Adventure & Fun Tour – 10 Days",
    "duration": "10 Days / 9 Nights",
    "price": "0",
    "destinations": [
      "Colombo",
      "Weligama",
      "Mirissa",
      "Yala National Park",
      "Nuwara Eliya",
      "Kithulgala",
      "Negombo"
    ],
    "highlights": [
      "Jeep safari in Yala National Park",
      "Visit a tea plantation and factory"
    ],
    "keyExperiences": [
      "Visit Galle Face Green",
      "Explore the Lotus Tower",
      "Surfing session (Beginners Welcome)",
      "Visit Coconut Tree Hill",
      "Relaxing at Weligama Beach",
      "Whale watching tour",
      "Bonfire and BBQ night",
      "Visit Rawana Waterfall",
      "Visit Nine Arch Bridge",
      "Little Adam's Peak",
      "Flying Ravana zipline",
      "Scenic train from Ella to Nanu Oya",
      "Jet Ski ride on Lake Gregory"
    ],
    "description": "This 10-day tour is designed for thrill-seekers and energetic travelers who want to experience the best of Sri Lanka with non-stop adventure, fun, and vibrant moments.",
    "rating": 5,
    "reviews": 12,
    "featured": true,
    "status": "active",
    "style": "Adventure",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  },
  {
    "id": "cultural-heritage-8-days",
    "name": "Cultural Heritage Tour – 8 Days",
    "duration": "8 Days / 7 Nights",
    "price": "0",
    "destinations": [
      "Colombo",
      "Kandy",
      "Sigiriya",
      "Polonnaruwa",
      "Anuradhapura",
      "Negombo"
    ],
    "highlights": [
      "Visit Temple of the Tooth Relic",
      "Climb Sigiriya Rock Fortress",
      "Explore ancient cities"
    ],
    "keyExperiences": [
      "Visit Gangaramaya Temple",
      "Explore Pettah Market",
      "Watch Cultural Dance Show",
      "Visit Royal Botanical Gardens",
      "Climb Sigiriya Rock Fortress",
      "Visit Dambulla Cave Temple",
      "Explore Polonnaruwa Ancient City",
      "Visit Anuradhapura Sacred City"
    ],
    "description": "Discover the rich cultural heritage of Sri Lanka through this comprehensive 8-day tour.",
    "rating": 4,
    "reviews": 8,
    "featured": true,
    "status": "active",
    "style": "Cultural",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  },
  {
    "id": "wildlife-safari-6-days",
    "name": "Wildlife Safari Adventure – 6 Days",
    "duration": "6 Days / 5 Nights",
    "price": "0",
    "destinations": [
      "Colombo",
      "Yala National Park",
      "Udawalawe National Park",
      "Mirissa",
      "Negombo"
    ],
    "highlights": [
      "Multiple safari experiences",
      "Whale watching",
      "Elephant encounters"
    ],
    "keyExperiences": [
      "Jeep Safari in Yala National Park",
      "Spot Leopards & Elephants",
      "Bird Watching",
      "Visit Sithulpawwa Rock Temple",
      "Campfire BBQ Experience",
      "Whale Watching Tour",
      "Visit Coconut Tree Hill"
    ],
    "description": "Experience the incredible wildlife of Sri Lanka with this 6-day safari adventure.",
    "rating": 5,
    "reviews": 15,
    "featured": true,
    "status": "active",
    "style": "Wildlife",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
]

// Test endpoint to verify embedded fallback data works
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Embedded fallback data test successful',
      tourCount: EMBEDDED_FALLBACK_TOURS.length,
      tours: EMBEDDED_FALLBACK_TOURS.map(tour => ({
        id: tour.id,
        name: tour.name,
        duration: tour.duration,
        featured: tour.featured,
        rating: tour.rating,
        reviews: tour.reviews,
        destinations: tour.destinations,
        highlights: tour.highlights,
        keyExperiences: tour.keyExperiences
      })),
      environment: process.env.NODE_ENV,
      supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
                            process.env.SUPABASE_SERVICE_ROLE_KEY &&
                            process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                            process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-service-key')
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Fallback data test failed'
    }, { status: 500 })
  }
}
