// Global image cache to prevent multiple network requests
class ImageCache {
  private static instance: ImageCache
  private loadedImages = new Set<string>()
  private loadingPromises = new Map<string, Promise<void>>()
  private errorImages = new Set<string>()

  private constructor() {}

  static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache()
    }
    return ImageCache.instance
  }

  isLoaded(src: string): boolean {
    return this.loadedImages.has(src)
  }

  hasError(src: string): boolean {
    return this.errorImages.has(src)
  }

  async preloadImage(src: string): Promise<void> {
    // Skip if not in browser environment
    if (typeof window === 'undefined') {
      return Promise.resolve()
    }

    // Return immediately if already loaded or errored
    if (this.loadedImages.has(src)) {
      // console.log(`🚀 Using cached image: ${src}`)
      return Promise.resolve()
    }
    
    if (this.errorImages.has(src)) {
      // console.warn(`⚠️ Skipping failed image: ${src}`)
      return Promise.resolve()
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(src)) {
      // console.log(`⏳ Image already loading: ${src}`)
      return this.loadingPromises.get(src)!
    }

    // console.log(`📥 Starting to preload: ${src}`)

    // Create new loading promise
    const loadPromise = new Promise<void>((resolve, reject) => {
      const img = new window.Image()
      
      // Set crossOrigin to ensure proper caching
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        this.loadedImages.add(src)
        this.loadingPromises.delete(src)
        // console.log(`✅ Image successfully cached: ${src}`)
        resolve()
      }
      
      img.onerror = () => {
        this.errorImages.add(src)
        this.loadingPromises.delete(src)
        // console.warn(`❌ Image failed to load: ${src}`)
        reject(new Error(`Failed to load image: ${src}`))
      }
      
      // Force browser cache by setting src last
      img.src = src
    })

    this.loadingPromises.set(src, loadPromise)
    return loadPromise
  }

  async preloadMultiple(sources: string[]): Promise<void> {
    const promises = sources.map(src => this.preloadImage(src))
    await Promise.allSettled(promises)
  }

  // For debugging
  getStatus() {
    return {
      loaded: Array.from(this.loadedImages),
      loading: Array.from(this.loadingPromises.keys()),
      errored: Array.from(this.errorImages)
    }
  }
}

export const imageCache = ImageCache.getInstance()

export const FRIENDS_CHARACTER_IMAGES = [
  '/friends-characters/ross_geller.png',
  '/friends-characters/rachel_green.png',
  '/friends-characters/monica_geller.png',
  '/friends-characters/chandler_bing.png',
  '/friends-characters/joey_tribbiani.png',
  '/friends-characters/phoebe_buffay.png'
]
