import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Friends TV Show Quiz | Free F.R.I.E.N.D.S Trivia Game Online',
  description: 'Test your Friends TV show knowledge with our free online quiz! Answer questions about Ross, Rachel, Monica, Chandler, Joey & Phoebe. Earn badges, get certified as a true fan. Play now - no signup required!',
  keywords: [
    // Primary keywords
    'friends quiz',
    'friends trivia',
    'friends tv show quiz',
    'friends quiz online',
    'free friends quiz',
    
    // Character-specific keywords
    'ross geller quiz',
    'rachel green quiz',
    'monica geller quiz',
    'chandler bing quiz',
    'joey tribbiani quiz',
    'phoebe buffay quiz',
    'ross rachel chandler joey phoebe monica quiz',
    
    // Show-related keywords
    'friends tv series quiz',
    'friends sitcom quiz',
    'friends show trivia',
    'central perk quiz',
    'friends episodes quiz',
    'friends characters quiz',
    
    // Game-related keywords
    'free quiz online',
    'free trivia game',
    'brain games',
    'timepass games',
    'fun quiz games',
    'online quiz game free',
    'trivia questions',
    
    // Entertainment keywords
    'friends fan test',
    'how well do you know friends',
    'friends knowledge test',
    'ultimate friends quiz',
    'friends quiz with answers',
    'friends quiz hard',
    'friends quiz easy',
    
    // Long-tail keywords
    'friends tv show trivia questions',
    'play friends quiz free',
    'friends quiz no signup',
    'friends fan quiz online',
    'best friends quiz',
    'friends quiz 2024',
    'timepass friends quiz',
  ],
  authors: [{ name: 'Know Himanshu' }],
  creator: 'Himanshu',
  publisher: 'Know Himanshu',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.knowhimanshu.in/games/friends-quiz',
    siteName: 'Know Himanshu Games',
    title: 'Friends TV Show Quiz | How Well Do You Know F.R.I.E.N.D.S?',
    description: 'Test your Friends knowledge! Free online quiz about Ross, Rachel, Monica, Chandler, Joey & Phoebe. Earn fan badges, compete for the best time. Could you BE any more of a fan?',
    images: [
      {
        url: 'https://www.knowhimanshu.in/friends-characters/friends_cover.png',
        width: 1200,
        height: 630,
        alt: 'Friends TV Show Quiz - Test Your Knowledge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Friends TV Show Quiz | Free F.R.I.E.N.D.S Trivia',
    description: 'How well do you know Friends? Take the ultimate quiz about Ross, Rachel, Monica, Chandler, Joey & Phoebe. Earn badges and prove you\'re a true fan!',
    images: ['https://www.knowhimanshu.in/friends-characters/friends_cover.png'],
    creator: '@knowhimanshu',
  },
  alternates: {
    canonical: 'https://www.knowhimanshu.in/games/friends-quiz',
  },
  category: 'Games',
  classification: 'Entertainment, Quiz Games, Trivia',
}

// JSON-LD Structured Data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // Main Quiz/Game schema
    {
      '@type': 'Quiz',
      '@id': 'https://www.knowhimanshu.in/games/friends-quiz/#quiz',
      'name': 'Friends TV Show Trivia Quiz',
      'description': 'Test your knowledge of the popular TV sitcom Friends with this interactive quiz featuring questions about Ross, Rachel, Monica, Chandler, Joey, and Phoebe.',
      'url': 'https://www.knowhimanshu.in/games/friends-quiz',
      'about': {
        '@type': 'TVSeries',
        'name': 'Friends',
        'description': 'American television sitcom that aired on NBC from 1994 to 2004',
        'genre': ['Comedy', 'Sitcom', 'Romance'],
        'numberOfSeasons': 10,
        'numberOfEpisodes': 236,
      },
      'educationalLevel': 'Entertainment',
      'learningResourceType': 'Quiz',
      'interactivityType': 'active',
      'isAccessibleForFree': true,
      'inLanguage': 'en',
      'audience': {
        '@type': 'Audience',
        'audienceType': 'Friends TV Show Fans',
      },
      'provider': {
        '@type': 'Organization',
        'name': 'Know Himanshu',
        'url': 'https://www.knowhimanshu.in',
      },
    },
    // VideoGame schema (alternative)
    {
      '@type': 'VideoGame',
      '@id': 'https://www.knowhimanshu.in/games/friends-quiz/#game',
      'name': 'Friends Trivia Quiz Game',
      'description': 'Free online trivia game testing your knowledge of the Friends TV show. Play across easy, medium, and hard difficulty levels.',
      'url': 'https://www.knowhimanshu.in/games/friends-quiz',
      'genre': ['Quiz', 'Trivia', 'Entertainment'],
      'gamePlatform': ['Web Browser', 'Mobile Browser'],
      'applicationCategory': 'Game',
      'operatingSystem': 'Any',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
        'availability': 'https://schema.org/InStock',
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.7',
        'ratingCount': '89',
        'bestRating': '5',
        'worstRating': '1',
      },
    },
    // WebPage schema
    {
      '@type': 'WebPage',
      '@id': 'https://www.knowhimanshu.in/games/friends-quiz/#webpage',
      'url': 'https://www.knowhimanshu.in/games/friends-quiz',
      'name': 'Friends TV Show Quiz - Free Online Trivia Game',
      'description': 'Play the ultimate Friends trivia quiz online for free. Test your knowledge about Ross, Rachel, Monica, Chandler, Joey & Phoebe.',
      'isPartOf': {
        '@id': 'https://www.knowhimanshu.in/#website',
      },
      'primaryImageOfPage': {
        '@type': 'ImageObject',
        'url': 'https://www.knowhimanshu.in/friends-characters/friends_cover.png',
      },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://www.knowhimanshu.in',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Games',
            'item': 'https://www.knowhimanshu.in/games',
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': 'Friends Quiz',
            'item': 'https://www.knowhimanshu.in/games/friends-quiz',
          },
        ],
      },
    },
    // FAQPage for common questions
    {
      '@type': 'FAQPage',
      '@id': 'https://www.knowhimanshu.in/games/friends-quiz/#faq',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Is the Friends quiz free to play?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes! The Friends trivia quiz is completely free to play. No signup or registration required.',
          },
        },
        {
          '@type': 'Question',
          'name': 'How many difficulty levels are there?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'There are 3 difficulty levels: Easy (5 minutes), Medium (4 minutes), and Hard (3 minutes). Each level has different time limits and question complexity.',
          },
        },
        {
          '@type': 'Question',
          'name': 'What are the badges I can earn?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'You can earn different fan badges based on your score: from casual viewer to ultimate Friends superfan. Each badge comes with a shareable certificate.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Can I share my quiz results?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes! After completing the quiz, you can download your personalized certificate and share your score on social media.',
          },
        },
      ],
    },
  ],
}

export default function FriendsQuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}

