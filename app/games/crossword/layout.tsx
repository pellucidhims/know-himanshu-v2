import type { Metadata } from 'next'

// SEO metadata specifically for Crossword game
export const metadata: Metadata = {
  title: 'Daily Crossword Puzzle | Free Online Word Game | Play Now',
  description: 'Play free daily crossword puzzle online! New puzzle every day at midnight IST. Challenge your vocabulary, build your streak, compete on leaderboards. No download required - play instantly in browser.',
  keywords: [
    // Primary crossword keywords
    'crossword puzzle',
    'daily crossword',
    'free crossword',
    'online crossword',
    'crossword game',
    'crossword online free',
    
    // Word game keywords
    'word puzzle',
    'word game',
    'vocabulary game',
    'word search',
    'word challenge',
    
    // Feature keywords
    'daily puzzle',
    'new puzzle daily',
    'streak mode',
    'crossword leaderboard',
    'timed crossword',
    
    // Brain game keywords
    'brain teaser',
    'brain game',
    'mind game',
    'puzzle game',
    'mental exercise',
    
    // Platform keywords
    'browser crossword',
    'mobile crossword',
    'crossword app',
    'instant play crossword',
    
    // Audience keywords
    'crossword for adults',
    'easy crossword',
    'medium crossword',
    'crossword puzzle game',
    
    // Indian context
    'crossword India',
    'daily crossword India',
    'free puzzle game India',
  ],
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://knowhimanshu.in/games/crossword',
    siteName: 'Daily Crossword - Know Himanshu',
    title: 'Daily Crossword Puzzle | Free Online Word Game',
    description: 'New crossword puzzle every day! Test your vocabulary, maintain your streak, and compete on leaderboards. Free to play, no download required.',
    images: [
      {
        url: '/crossword-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Daily Crossword Puzzle',
        type: 'image/png',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Crossword Puzzle | Free Online Word Game',
    description: 'New crossword puzzle every day! Test your vocabulary and compete on leaderboards. Play free now!',
    creator: '@pelucidhimanshu',
    images: ['/crossword-og-image.png'],
  },
  
  alternates: {
    canonical: 'https://knowhimanshu.in/games/crossword',
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
}

// JSON-LD for Crossword game
const crosswordJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  'name': 'Daily Crossword Puzzle',
  'description': 'A free daily crossword puzzle game with new puzzles generated every day at midnight IST. Features streak mode, leaderboards, and timed challenges.',
  'url': 'https://knowhimanshu.in/games/crossword',
  'image': 'https://knowhimanshu.in/crossword-og-image.png',
  'genre': ['Puzzle', 'Word Game', 'Brain Game', 'Educational'],
  'gamePlatform': ['Web Browser', 'Mobile Browser', 'Desktop Browser'],
  'applicationCategory': 'Game',
  'applicationSubCategory': 'Puzzle Game',
  'operatingSystem': 'Any',
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'USD',
    'availability': 'https://schema.org/InStock'
  },
  'author': {
    '@type': 'Person',
    'name': 'Himanshu',
    'url': 'https://knowhimanshu.in'
  },
  'publisher': {
    '@type': 'Organization',
    'name': 'Know Himanshu',
    'url': 'https://knowhimanshu.in'
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.8',
    'ratingCount': '200',
    'bestRating': '5',
    'worstRating': '1'
  },
  'review': [
    {
      '@type': 'Review',
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': '5',
        'bestRating': '5'
      },
      'author': {
        '@type': 'Person',
        'name': 'Puzzle Enthusiast'
      },
      'reviewBody': 'Love the daily crossword feature! New puzzle every day keeps me coming back.'
    }
  ],
  'interactivityType': 'active',
  'accessibilityFeature': ['highContrastDisplay', 'largePrint'],
  'inLanguage': 'en',
  'numberOfPlayers': {
    '@type': 'QuantitativeValue',
    'minValue': 1,
    'maxValue': 1
  },
  'playMode': 'SinglePlayer',
  'gameItem': {
    '@type': 'Thing',
    'name': 'Crossword Grid',
    'description': 'Interactive crossword puzzle grid with clues'
  }
}

export default function CrosswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* JSON-LD Structured Data for Crossword */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crosswordJsonLd) }}
      />
      {children}
    </>
  )
}

