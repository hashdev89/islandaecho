import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Persistent file-based storage for fallback
const FALLBACK_FILE = path.join(process.cwd(), 'data', 'blog.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

interface BlogPost {
  id: number
  title: string
  description: string
  excerpt: string
  author: string
  date: string
  readTime: string
  image: string
  video?: string | null
  category: string
  status: string
  tags: string[]
  content: string
}

// Load blog posts from file
const loadFallbackBlogPosts = (): BlogPost[] => {
  try {
    ensureDataDir()
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8')
      const parsed = JSON.parse(data)
      console.log('Loaded blog posts from file:', parsed.length)
      return parsed
    }
  } catch (error) {
    console.error('Error loading fallback blog posts:', error)
  }
  return []
}

// Save blog posts to file
const saveFallbackBlogPosts = (posts: BlogPost[]) => {
  try {
    ensureDataDir()
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(posts, null, 2))
    console.log('Blog posts saved to fallback file:', FALLBACK_FILE)
  } catch (error) {
    console.error('Error saving fallback blog posts:', error)
  }
}

// Default blog posts data
const defaultBlogPosts = [
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
    console.log('GET /api/blog - Fetching blog posts...')
    const fallbackPosts = loadFallbackBlogPosts()
    
    // If no posts exist, initialize with default posts
    if (fallbackPosts.length === 0) {
      console.log('No blog posts found, initializing with default posts')
      saveFallbackBlogPosts(defaultBlogPosts)
      return NextResponse.json(defaultBlogPosts)
    }
    
    console.log('Returning blog posts from fallback storage:', fallbackPosts.length)
    return NextResponse.json(fallbackPosts)
  } catch (error: unknown) {
    console.error('Blog posts API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('POST /api/blog - Creating new blog post:', body)
    
    const fallbackPosts = loadFallbackBlogPosts()
    const newPost = {
      id: fallbackPosts.length > 0 ? Math.max(...fallbackPosts.map(post => post.id)) + 1 : 1,
      ...body,
      date: body.date || new Date().toISOString().split('T')[0],
      status: body.status || 'Draft',
      readTime: body.readTime || `${Math.ceil((body.content || '').split(' ').length / 200)} min read`
    }
    
    const updatedPosts = [...fallbackPosts, newPost]
    saveFallbackBlogPosts(updatedPosts)
    
    console.log('Blog post created successfully:', newPost.id)
    return NextResponse.json(newPost, { status: 201 })
  } catch (error: unknown) {
    console.error('Create blog post error:', error)
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
    console.log('PUT /api/blog - Updating blog post:', id)
    
    const fallbackPosts = loadFallbackBlogPosts()
    const postIndex = fallbackPosts.findIndex(post => post.id === id)
    
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    const updatedPost = { ...fallbackPosts[postIndex], ...updateData }
    fallbackPosts[postIndex] = updatedPost
    saveFallbackBlogPosts(fallbackPosts)
    
    console.log('Blog post updated successfully:', id)
    return NextResponse.json(updatedPost)
  } catch (error: unknown) {
    console.error('Update blog post error:', error)
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
    console.log('DELETE /api/blog - Deleting blog post:', id)
    
    const fallbackPosts = loadFallbackBlogPosts()
    const postIndex = fallbackPosts.findIndex(post => post.id === id)
    
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    const deletedPost = fallbackPosts.splice(postIndex, 1)[0]
    saveFallbackBlogPosts(fallbackPosts)
    
    console.log('Blog post deleted successfully:', id)
    return NextResponse.json(deletedPost)
  } catch (error: unknown) {
    console.error('Delete blog post error:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
