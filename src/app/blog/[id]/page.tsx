'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '../../../components/Header'
import { Calendar, Clock, User, ArrowLeft, Play, Share2, Bookmark } from 'lucide-react'

// Mock blog posts data
const blogPosts = [
  {
    id: 1,
    title: "Discovering the Ancient Wonders of Sigiriya",
    description: "Explore the magnificent Sigiriya Rock Fortress, a UNESCO World Heritage site that stands as a testament to ancient Sri Lankan engineering and artistry.",
    content: `

    <h2 class="text-2xl font-bold text-gray-900 mb-4 mt-8">The History of Sigiriya</h2>
      <p class="mb-6 text-lg leading-relaxed">
        Sigiriya, often referred to as the "Eighth Wonder of the World," is one of Sri Lanka's most iconic landmarks. 
        This ancient palace and fortress complex, built by King Kasyapa in the 5th century AD, stands majestically on a 
        massive rock column rising 200 meters above the surrounding plains.
      </p>
      
      
      <p class="mb-6 text-lg leading-relaxed">
        The story of Sigiriya begins with King Kasyapa, who seized the throne from his father, King Dhatusena, 
        and fearing retribution from his half-brother Moggallana, built his palace on top of this impregnable rock.
      </p>
    `,
    author: "Isle & Echo Team",
    date: "2024-01-15",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    video: null,
    category: "Cultural Heritage",
    tags: ["Sigiriya", "UNESCO", "Ancient", "Architecture"]
  },
  {
    id: 2,
    title: "Tea Plantations of Nuwara Eliya: A Green Paradise",
    description: "Immerse yourself in the lush green tea plantations of Nuwara Eliya, the heart of Sri Lanka's tea country.",
    content: `
      <p class="mb-6 text-lg leading-relaxed">
        Nuwara Eliya, often called "Little England" due to its colonial architecture and cool climate, is the heart 
        of Sri Lanka's tea country. The rolling hills covered in emerald green tea bushes create one of the most 
        picturesque landscapes in the country.
      </p>
    `,
    author: "Travel Expert",
    date: "2024-01-10",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    video: null,
    category: "Nature",
    tags: ["Tea", "Nuwara Eliya", "Plantations", "Mountains"]
  }
]

interface BlogPostPageProps {
  params: Promise<{ id: string }>
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  
  const post = blogPosts.find(p => p.id === parseInt(resolvedParams.id))
  
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={() => router.push('/blog')}
              className="flex items-center mx-auto text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative container mx-auto px-4 py-16">
          <button
            onClick={() => router.push('/blog')}
            className="flex items-center text-white hover:text-gray-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </button>
          
          <div className="max-w-6xl">
            <div className="flex items-center text-sm text-gray-300 mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium mr-4">
                {post.category}
              </span>
              <User className="w-4 h-4 mr-1" />
              <span className="mr-4">{post.author}</span>
              <Calendar className="w-4 h-4 mr-1" />
              <span className="mr-4">{new Date(post.date).toLocaleDateString()}</span>
              <Clock className="w-4 h-4 mr-1" />
              <span>{post.readTime}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {post.description}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button className="flex items-center bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="flex items-center bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Featured Image/Video */}
                <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-8">
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
                      width={800}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Article Content */}
                <article className="prose prose-lg max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    className="text-gray-700 leading-relaxed"
                  />
                </article>

                {/* Author Bio */}
                <div className="bg-gray-100 rounded-lg p-6 mt-8">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.author}</h3>
                      <p className="text-gray-600 text-sm">Travel writer and Sri Lanka expert</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  {/* Related Posts */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Related Posts</h3>
                    <div className="space-y-4">
                      {blogPosts
                        .filter(p => p.id !== post.id && p.category === post.category)
                        .slice(0, 3)
                        .map(relatedPost => (
                          <div key={relatedPost.id} className="flex items-start space-x-3">
                            <Image
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                                {relatedPost.title}
                              </h4>
                              <p className="text-gray-500 text-xs mt-1">
                                {new Date(relatedPost.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
                    <div className="space-y-2">
                      {Array.from(new Set(blogPosts.map(p => p.category))).map(category => (
                        <button
                          key={category}
                          onClick={() => router.push(`/blog?category=${category}`)}
                          className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
