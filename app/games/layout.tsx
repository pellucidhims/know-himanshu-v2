import type { Metadata } from 'next'

// Comprehensive SEO metadata for Games section
export const metadata: Metadata = {
  title: 'Free Online Games | Play Brain Games, Puzzles & Mind Games | Game Zone',
  description: 'Play free online games including Daily Crossword puzzles, Tic Tac Toe, Memory Games, and more brain-teasing challenges. Perfect for timepass, mental exercise, and fun! New crossword puzzle every day.',
  keywords: [
    // Primary keywords
    'free online games',
    'free games',
    'online games',
    'browser games',
    'play games online',
    
    // Game types
    '2d games',
    'puzzle games',
    'brain games',
    'mind games',
    'word games',
    'strategy games',
    'memory games',
    'logic games',
    
    // Specific games
    'crossword puzzle',
    'daily crossword',
    'crossword game',
    'tic tac toe',
    'tic tac toe online',
    'memory match game',
    'find pairs game',
    
    // Use case keywords
    'timepass games',
    'time pass games',
    'games to pass time',
    'casual games',
    'quick games',
    'fun games',
    'relaxing games',
    
    // Audience keywords
    'games for adults',
    'games for all ages',
    'family games',
    'single player games',
    'multiplayer games',
    
    // Feature keywords
    'no download games',
    'instant play games',
    'mobile games',
    'desktop games',
    'html5 games',
    
    // Indian context
    'free games India',
    'online games India',
    'crossword India',
  ],
  authors: [{ name: 'Himanshu', url: 'https://knowhimanshu.in' }],
  creator: 'Himanshu',
  publisher: 'knowhimanshu.in',
  
  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Open Graph for social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://knowhimanshu.in/games',
    siteName: 'Game Zone - Know Himanshu',
    title: 'Free Online Games | Daily Crossword, Brain Games & Puzzles',
    description: 'Play free online games - Daily Crossword puzzles, Tic Tac Toe, Memory Games & more! Perfect for brain exercise and timepass. No download required.',
    images: [
      {
        url: '/games-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Game Zone - Free Online Games',
        type: 'image/png',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Games | Daily Crossword & Brain Games',
    description: 'Play free online games - Daily Crossword, Tic Tac Toe, Memory Games & more! No download, instant play.',
    creator: '@pelucidhimanshu',
    images: ['/games-og-image.png'],
  },
  
  // Alternate languages (if applicable)
  alternates: {
    canonical: 'https://knowhimanshu.in/games',
  },
  
  // Category
  category: 'Games',
  
  // Classification
  classification: 'Games, Entertainment, Puzzles',
}

// JSON-LD Structured Data for Games
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // WebSite schema
    {
      '@type': 'WebSite',
      '@id': 'https://knowhimanshu.in/#website',
      'url': 'https://knowhimanshu.in',
      'name': 'Know Himanshu',
      'description': 'Personal portfolio and game zone',
      'publisher': {
        '@id': 'https://knowhimanshu.in/#person'
      }
    },
    // WebPage schema for Games
    {
      '@type': 'WebPage',
      '@id': 'https://knowhimanshu.in/games/#webpage',
      'url': 'https://knowhimanshu.in/games',
      'name': 'Free Online Games | Play Brain Games, Puzzles & Mind Games',
      'description': 'Play free online games including Daily Crossword puzzles, Tic Tac Toe, Memory Games, and more brain-teasing challenges.',
      'isPartOf': {
        '@id': 'https://knowhimanshu.in/#website'
      },
      'about': {
        '@type': 'Thing',
        'name': 'Online Games'
      },
      'primaryImageOfPage': {
        '@type': 'ImageObject',
        'url': 'https://knowhimanshu.in/games-og-image.png'
      }
    },
    // ItemList for Games Collection
    {
      '@type': 'ItemList',
      'name': 'Available Games',
      'description': 'Collection of free online games',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'item': {
            '@type': 'VideoGame',
            'name': 'Daily Crossword',
            'description': 'New crossword puzzle every day at midnight IST. Fill in the words using the clues provided!',
            'url': 'https://knowhimanshu.in/games/crossword',
            'genre': ['Puzzle', 'Word Game', 'Brain Game'],
            'gamePlatform': ['Web Browser', 'Mobile Browser'],
            'applicationCategory': 'Game',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD',
              'availability': 'https://schema.org/InStock'
            },
            'aggregateRating': {
              '@type': 'AggregateRating',
              'ratingValue': '4.8',
              'ratingCount': '150',
              'bestRating': '5',
              'worstRating': '1'
            }
          }
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'item': {
            '@type': 'VideoGame',
            'name': 'Tic Tac Toe',
            'description': 'Classic strategy game with AI opponent. Can you outsmart the computer?',
            'url': 'https://knowhimanshu.in/games/tic-tac-toe',
            'genre': ['Strategy', 'Board Game', 'Classic Game'],
            'gamePlatform': ['Web Browser', 'Mobile Browser'],
            'applicationCategory': 'Game',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD'
            }
          }
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'item': {
            '@type': 'VideoGame',
            'name': 'Find Pairs',
            'description': 'Memory game where you match pairs of cards. Test your memory and concentration!',
            'url': 'https://knowhimanshu.in/games/find-pairs',
            'genre': ['Memory Game', 'Brain Game', 'Puzzle'],
            'gamePlatform': ['Web Browser', 'Mobile Browser'],
            'applicationCategory': 'Game',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD'
            }
          }
        },
        {
          '@type': 'ListItem',
          'position': 4,
          'item': {
            '@type': 'VideoGame',
            'name': 'Puller',
            'description': 'Strategic dice game where two players compete to pull the token to their side.',
            'url': 'https://knowhimanshu.in/games/puller',
            'genre': ['Strategy', 'Dice Game', 'Multiplayer'],
            'gamePlatform': ['Web Browser', 'Mobile Browser'],
            'applicationCategory': 'Game',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD'
            }
          }
        }
      ]
    },
    // FAQPage for common questions
    {
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Are these games free to play?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes, all games on Game Zone are completely free to play. No downloads or registrations required for basic gameplay.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can I play these games on mobile?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes, all games are optimized for both desktop and mobile browsers. Play anywhere, anytime!'
          }
        },
        {
          '@type': 'Question',
          'name': 'How often is the crossword puzzle updated?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'A new crossword puzzle is generated every day at midnight IST (Indian Standard Time). Come back daily for a fresh challenge!'
          }
        }
      ]
    }
  ]
}

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}

