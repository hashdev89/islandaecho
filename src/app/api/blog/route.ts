import { NextRequest, NextResponse } from 'next/server'

// Mock blog posts data
const blogPosts = [
  {
    id: 1,
    title: "Discovering the Ancient Wonders of Sigiriya",
    description: "Explore the magnificent Sigiriya Rock Fortress, a UNESCO World Heritage site that stands as a testament to ancient Sri Lankan engineering and artistry. This comprehensive guide takes you through the history, architecture, and practical tips for visiting this iconic landmark.",
    excerpt: "A journey through the ancient rock fortress that has captivated travelers for centuries...",
    author: "Isle & Echo Team",
    date: "2024-01-15",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Cultural Heritage",
    status: "Published",
    tags: ["Sigiriya", "UNESCO", "Ancient", "Architecture"],
    content: "This is the full content of the blog post..."
  },
  {
    id: 2,
    title: "Tea Plantations of Nuwara Eliya: A Green Paradise",
    description: "Immerse yourself in the lush green tea plantations of Nuwara Eliya, the heart of Sri Lanka's tea country. Learn about the tea-making process, visit historic tea factories, and experience the cool mountain climate that makes this region perfect for tea cultivation.",
    excerpt: "From leaf to cup: exploring the world-famous tea plantations...",
    author: "Travel Expert",
    date: "2024-01-10",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    video: null,
    category: "Nature",
    status: "Published",
    tags: ["Tea", "Nuwara Eliya", "Plantations", "Mountains"],
    content: "This is the full content of the blog post..."
  },
  {
    id: 3,
    title: "Wildlife Safari in Yala National Park",
    description: "Experience the thrill of spotting leopards, elephants, and exotic birds in their natural habitat at Yala National Park. This guide provides essential tips for the best wildlife viewing experience, including the best times to visit and what to expect.",
    excerpt: "A safari adventure through one of Asia's premier wildlife sanctuaries...",
    author: "Wildlife Guide",
    date: "2024-01-05",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Wildlife",
    status: "Draft",
    tags: ["Yala", "Safari", "Leopards", "Wildlife"],
    content: "This is the full content of the blog post..."
  }
]

export async function GET() {
  try {
    return NextResponse.json(blogPosts)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newPost = {
      id: Math.max(...blogPosts.map(post => post.id)) + 1,
      ...body,
      date: body.date || new Date().toISOString().split('T')[0],
      status: body.status || 'Draft'
    }
    
    blogPosts.push(newPost)
    
    return NextResponse.json(newPost, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    const postIndex = blogPosts.findIndex(post => post.id === id)
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    blogPosts[postIndex] = { ...blogPosts[postIndex], ...updateData }
    
    return NextResponse.json(blogPosts[postIndex])
  } catch {
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')
    
    const postIndex = blogPosts.findIndex(post => post.id === id)
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    const deletedPost = blogPosts.splice(postIndex, 1)[0]
    
    return NextResponse.json(deletedPost)
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
