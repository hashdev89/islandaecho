'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '../../components/Header'
import { Calendar, Clock, User, ArrowRight, Play } from 'lucide-react'

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
    tags: ["Sigiriya", "UNESCO", "Ancient", "Architecture"]
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
    tags: ["Tea", "Nuwara Eliya", "Plantations", "Mountains"]
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
    tags: ["Yala", "Safari", "Leopards", "Wildlife"]
  },
  {
    id: 4,
    title: "Beach Paradise: The Best Beaches in Sri Lanka",
    description: "From pristine white sand beaches to hidden coves, discover the most beautiful beaches that Sri Lanka has to offer. Whether you're looking for surfing, snorkeling, or simply relaxing, this guide covers the best coastal destinations.",
    excerpt: "Crystal clear waters and golden sands await at these stunning beaches...",
    author: "Beach Lover",
    date: "2023-12-28",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    video: null,
    category: "Beaches",
    tags: ["Beaches", "Coast", "Surfing", "Relaxation"]
  },
  {
    id: 5,
    title: "Temple of the Tooth: Sacred Relic in Kandy",
    description: "Visit the sacred Temple of the Tooth Relic in Kandy, one of Buddhism's most important pilgrimage sites. Learn about the temple's history, the sacred tooth relic, and the daily rituals that take place in this spiritual sanctuary.",
    excerpt: "A spiritual journey to one of Buddhism's most revered temples...",
    author: "Cultural Guide",
    date: "2023-12-20",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Cultural Heritage",
    tags: ["Kandy", "Buddhism", "Temple", "Sacred"]
  },
  {
    id: 6,
    title: "Adventure in the Sinharaja Rainforest",
    description: "Explore the biodiversity hotspot of Sinharaja Forest Reserve, a UNESCO World Heritage site. Trek through pristine rainforest, spot endemic birds and wildlife, and learn about the importance of conservation in this unique ecosystem.",
    excerpt: "A rainforest adventure through one of the world's biodiversity hotspots...",
    author: "Nature Explorer",
    date: "2023-12-15",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    video: null,
    category: "Nature",
    tags: ["Sinharaja", "Rainforest", "Biodiversity", "Trekking"]
  }
]

const categories = ["All", "Cultural Heritage", "Nature", "Wildlife", "Beaches"]

export default function BlogPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Travel Blog</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Discover amazing stories, travel tips, and insights about Sri Lanka&apos;s most beautiful destinations
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-96">
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Image/Video */}
                <div className="relative h-48 bg-gray-200">
                  {post.video ? (
                    <div className="relative w-full h-full">
                      <iframe
                        src={post.video}
                        title={post.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={400}
                      height={250}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <User className="w-4 h-4 mr-1" />
                    <span className="mr-4">{post.author}</span>
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="mr-4">{new Date(post.date).toLocaleDateString()}</span>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => router.push(`/blog/${post.id}`)}
                    className="flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
