'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, ExternalLink, BookOpen, User } from 'lucide-react'
import { fadeIn, staggerContainer, textVariant } from '../../lib/utils'

interface BlogPost {
  title: string
  link: string
  pubDate: string
  description: string
  thumbnail?: string
  categories: string[]
  author: string
  guid: string
}

// Mock data for fallback
const mockBlogPosts: BlogPost[] = [
  {
    title: "Building Scalable React Applications with Modern Architecture",
    link: "https://medium.com/@pellucidhimanshu/building-scalable-react-applications",
    pubDate: "2024-01-15T10:00:00Z",
    description: "Learn how to structure React applications for scalability using modern patterns like atomic design, custom hooks, and state management solutions.",
    categories: ["React", "Architecture", "Frontend"],
    author: "Himanshu",
    guid: "1"
  },
  {
    title: "Optimizing Performance in Next.js Applications",
    link: "https://medium.com/@pellucidhimanshu/nextjs-performance-optimization",
    pubDate: "2024-01-10T14:30:00Z",
    description: "A comprehensive guide to performance optimization techniques in Next.js including image optimization, code splitting, and caching strategies.",
    categories: ["Next.js", "Performance", "Web Development"],
    author: "Himanshu",
    guid: "2"
  },
  {
    title: "The Art of Clean Code: Best Practices for Developers",
    link: "https://medium.com/@pellucidhimanshu/clean-code-best-practices",
    pubDate: "2024-01-05T09:15:00Z",
    description: "Explore essential clean code principles that every developer should follow to write maintainable, readable, and efficient code.",
    categories: ["Clean Code", "Best Practices", "Programming"],
    author: "Himanshu",
    guid: "3"
  },
  {
    title: "Mastering TypeScript: Advanced Patterns and Techniques",
    link: "https://medium.com/@pellucidhimanshu/mastering-typescript",
    pubDate: "2023-12-28T16:45:00Z",
    description: "Dive deep into advanced TypeScript patterns including generics, utility types, and design patterns that improve code quality and developer experience.",
    categories: ["TypeScript", "JavaScript", "Programming"],
    author: "Himanshu",
    guid: "4"
  }
]

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  const fetchBlogPosts = async () => {
    try {
      setLoading(true)
      
      // Try to fetch from Medium RSS (using a CORS proxy)
      const mediumUsername = process.env.NEXT_PUBLIC_MEDIUM_USERNAME || '@pellucidhimanshu'
      const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/${mediumUsername}`
      
      const response = await fetch(rssUrl)
      const data = await response.json()
      
      if (data.status === 'ok' && data.items) {
        const posts: BlogPost[] = data.items.slice(0, 6).map((item: any) => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          description: item.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
          thumbnail: item.thumbnail,
          categories: item.categories || [],
          author: item.author,
          guid: item.guid
        }))
        setBlogPosts(posts)
      } else {
        throw new Error('Failed to fetch from Medium')
      }
    } catch (err) {
      // console.log('Using fallback blog posts:', err)
      setBlogPosts(mockBlogPosts)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getReadingTime = (description: string) => {
    const wordsPerMinute = 200
    const words = description.split(' ').length
    return Math.ceil(words / wordsPerMinute)
  }

  return (
    <section id="blog" className="py-20 bg-white dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="space-y-16"
        >
          {/* Section Title */}
          <motion.div variants={textVariant()} className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Latest Articles
            </h2>
            <p className="text-xl text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              Sharing insights, tutorials, and thoughts on web development, technology, and best practices
            </p>
            <div className="w-24 h-1 bg-gradient-secondary mx-auto rounded-full mt-4"></div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-50 dark:bg-dark-elevated rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-dark-border rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 dark:bg-dark-border rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 dark:bg-dark-border rounded"></div>
                    <div className="h-3 bg-gray-300 dark:bg-dark-border rounded w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              variants={fadeIn('up', 0.2)}
              className="text-center py-12"
            >
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                Unable to load articles
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Please check back later or visit my Medium profile directly.
              </p>
            </motion.div>
          )}

          {/* Blog Posts Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.guid}
                  variants={fadeIn('up', index * 0.1)}
                  className="group"
                >
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="bg-gray-50 dark:bg-dark-elevated rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-dark-border h-full flex flex-col"
                  >
                    {/* Article Header */}
                    <div className="p-6 flex-1">
                      {/* Categories */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.categories.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {post.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-dark-text-secondary text-sm leading-relaxed mb-4 flex-1">
                        {post.description}
                      </p>

                      {/* Meta Information */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-text-muted">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(post.pubDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{getReadingTime(post.description)} min</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <div className="p-6 pt-0">
                      <motion.a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium text-sm hover:text-primary-700 dark:hover:text-primary-300 transition-colors group"
                      >
                        Read Article
                        <ExternalLink className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </motion.a>
                    </div>
                  </motion.div>
                </motion.article>
              ))}
            </div>
          )}

          {/* View All Articles CTA */}
          <motion.div
            variants={fadeIn('up', 0.6)}
            className="text-center bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Want to Read More?
            </h3>
            <p className="text-lg text-gray-600 dark:text-dark-text-secondary mb-6">
              Follow me on Medium for more insights on web development, technology trends, and coding best practices.
            </p>
            <motion.a
              href={`https://medium.com/${process.env.NEXT_PUBLIC_MEDIUM_USERNAME || '@pellucidhimanshu'}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-secondary text-white rounded-lg font-semibold shadow-lg hover:shadow-glow-secondary transition-all duration-300"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Follow on Medium
              <ExternalLink className="ml-2 h-5 w-5" />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
