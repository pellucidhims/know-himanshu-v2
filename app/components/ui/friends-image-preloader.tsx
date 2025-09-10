'use client'

import { useEffect } from 'react'
import { imageCache, FRIENDS_CHARACTER_IMAGES } from '../../lib/image-cache'

export default function FriendsImagePreloader() {
  useEffect(() => {
    // Preload images using our global cache system
    const preloadImages = async () => {
      try {
        // console.log('🎭 Starting Friends character image preload...')
        
        // Use our global image cache for consistent loading
        await imageCache.preloadMultiple(FRIENDS_CHARACTER_IMAGES)
        
        // console.log('🎭 All Friends character images preloaded successfully!')
        // console.log('📊 Cache status:', imageCache.getStatus())
      } catch (error) {
        console.warn('⚠️ Some Friends character images failed to preload:', error)
      }
    }

    preloadImages()
  }, [])

  // No need for hidden components - global cache handles everything
  return null
}
