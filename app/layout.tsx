import './globals.css'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from './providers/theme-provider'
import { ToastProvider } from './components/ui/toast'
import FriendsImagePreloader from './components/ui/friends-image-preloader'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Himanshu - Staff Software Engineer',
  description: 'Staff Software Engineer at Agoda. As part of accommodation price display team, drive initiative to maintain consistency of pricing for users and improving the user experience to drive booking.',
  keywords: ['Himanshu', 'Software Engineer', 'Full Stack Developer', 'React', 'Node.js', 'Portfolio', 'NextJs', 'GraphQL'],
  authors: [{ name: 'Himanshu' }],
  creator: 'Himanshu',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://knowhimanshu.in',
    siteName: 'Himanshu Portfolio',
    title: 'Himanshu - Staff Software Engineer',
    description: 'Staff Software Engineer at Agoda. As part of accommodation price display team, drive initiative to maintain consistency of pricing for users and improving the user experience to drive booking.',
    images: [
      {
        url: '/displayProfilePicture.jpg',
        width: 1200,
        height: 630,
        alt: 'Himanshu Profile',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Himanshu - Staff Software Engineer',
    description: 'Staff Software Engineer at Agoda. As part of accommodation price display team, drive initiative to maintain consistency of pricing for users and improving the user experience to drive booking.',
    creator: '@pelucidhimanshu',
    images: ['/displayProfilePicture.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/displayProfilePicture.jpg',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Preload Friends character images for instant display */}
        <link rel="preload" href="/friends-characters/ross_geller.png" as="image" type="image/png" />
        <link rel="preload" href="/friends-characters/rachel_green.png" as="image" type="image/png" />
        <link rel="preload" href="/friends-characters/monica_geller.png" as="image" type="image/png" />
        <link rel="preload" href="/friends-characters/chandler_bing.png" as="image" type="image/png" />
        <link rel="preload" href="/friends-characters/joey_tribbiani.png" as="image" type="image/png" />
        <link rel="preload" href="/friends-characters/phoebe_buffay.png" as="image" type="image/png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <FriendsImagePreloader />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
