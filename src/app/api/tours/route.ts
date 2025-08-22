import { NextRequest, NextResponse } from 'next/server'

// Mock database - in a real app, this would be a database
const tours = [
  {
    id: 'cultural-triangle',
    name: 'Cultural Triangle Explorer',
    duration: '5 Days / 4 Nights',
    price: '$899',
    destinations: ['Sigiriya', 'Dambulla', 'Polonnaruwa', 'Anuradhapura'],
    highlights: ['UNESCO Sites', 'Ancient Temples', 'Historical Monuments'],
    description: 'Discover the heart of Sri Lanka\'s ancient civilization with this comprehensive tour of the Cultural Triangle.',
    inclusions: ['All accommodation in 3-4 star hotels', 'Daily breakfast, lunch, and dinner'],
    exclusions: ['International flights', 'Personal expenses'],
    accommodation: ['Sigiriya Village Hotel', 'Polonnaruwa Rest House'],
    transportation: 'Air-conditioned van with professional driver',
    groupSize: '2-12 people',
    difficulty: 'Easy to Moderate',
    bestTime: 'January to April, July to September',
    images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'hill-country',
    name: 'Hill Country Adventure',
    duration: '6 Days / 5 Nights',
    price: '$1,199',
    destinations: ['Kandy', 'Nuwara Eliya', 'Ella', 'Tea Plantations'],
    highlights: ['Tea Gardens', 'Mountain Views', 'Train Journey'],
    description: 'Experience the cool climate and stunning landscapes of Sri Lanka\'s hill country.',
    inclusions: ['All accommodation in 3-4 star hotels', 'Daily breakfast, lunch, and dinner'],
    exclusions: ['International flights', 'Personal expenses'],
    accommodation: ['Kandy Hotel', 'Nuwara Eliya Rest House'],
    transportation: 'Air-conditioned van with professional driver',
    groupSize: '2-12 people',
    difficulty: 'Easy to Moderate',
    bestTime: 'January to April, July to September',
    images: ['https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop'],
    status: 'active',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  }
]

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      data: tours,
      message: 'Tours retrieved successfully'
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve tours' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.duration || !body.price) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique ID
    const id = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    const newTour = {
      ...body,
      id,
      status: body.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    tours.push(newTour)

    return NextResponse.json({ 
      success: true, 
      data: newTour,
      message: 'Tour created successfully'
    }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to create tour' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Tour ID is required' },
        { status: 400 }
      )
    }

    const tourIndex = tours.findIndex(tour => tour.id === id)
    
    if (tourIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      )
    }

    tours[tourIndex] = {
      ...tours[tourIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ 
      success: true, 
      data: tours[tourIndex],
      message: 'Tour updated successfully'
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to update tour' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Tour ID is required' },
        { status: 400 }
      )
    }

    const tourIndex = tours.findIndex(tour => tour.id === id)
    
    if (tourIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Tour not found' },
        { status: 404 }
      )
    }

    const deletedTour = tours.splice(tourIndex, 1)[0]

    return NextResponse.json({ 
      success: true, 
      data: deletedTour,
      message: 'Tour deleted successfully'
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to delete tour' },
      { status: 500 }
    )
  }
}
