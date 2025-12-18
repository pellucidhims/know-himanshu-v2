import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://knowhimanshu.in'
  
  // Get today's date for lastModified
  const today = new Date()
  
  return [
    // Main pages
    {
      url: baseUrl,
      lastModified: today,
    },
    
    // Games section - high priority for SEO
    {
      url: `${baseUrl}/games`,
      lastModified: today,
    },
    
    // Individual games
    {
      url: `${baseUrl}/games/crossword`,
      lastModified: today,
    },
    {
      url: `${baseUrl}/games/tic-tac-toe`,
      lastModified: today,
    },
    {
      url: `${baseUrl}/games/find-pairs`,
      lastModified: today,
    },
    {
      url: `${baseUrl}/games/puller`,
      lastModified: today,
    },
  ]
}

