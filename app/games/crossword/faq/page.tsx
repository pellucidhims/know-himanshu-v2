import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, Lightbulb, Trophy, Clock, Flame, Target } from 'lucide-react'

// FAQ data for schema and content
const faqs = [
  {
    question: "Is this crossword puzzle really free?",
    answer: "Yes! Our daily crossword puzzle is completely free to play. No subscriptions, no hidden fees. You can play as a guest or create a free account to track your streak and compete on leaderboards."
  },
  {
    question: "When does a new puzzle appear?",
    answer: "A new crossword puzzle is generated every day at midnight IST (Indian Standard Time). Everyone around the world gets the same puzzle on the same day, making it fair for leaderboard competitions."
  },
  {
    question: "How do I play the crossword puzzle?",
    answer: "Click on any cell or clue to start typing. Use arrow keys or click to navigate between cells. Press Tab or click the same cell again to switch between Across and Down directions. Fill all cells and click Submit to check your answers."
  },
  {
    question: "What is Streak Mode?",
    answer: "Streak Mode lets you track your daily crossword completions. When you solve a puzzle every day, your streak counter increases. Create a free account to save your streak and compete on the leaderboard."
  },
  {
    question: "How is my streak calculated?",
    answer: "Your streak counts consecutive days where you completed the daily puzzle. If you miss a day, your streak resets to zero. However, your longest streak is always saved so you can try to beat your personal record!"
  },
  {
    question: "Can I play on mobile?",
    answer: "Absolutely! Our crossword is fully responsive and works great on mobile phones and tablets. You can even install it as an app on your home screen for quick access using the 'Install App' button."
  },
  {
    question: "What are the achievement badges?",
    answer: "Badges are special achievements you earn by reaching milestones. There are badges for maintaining streaks (3, 7, 30, 100 days), solving puzzles quickly (under 5, 3, 2, or 1 minute), first-attempt solves, and total puzzles completed. They appear on your profile and share card!"
  },
  {
    question: "How do I share my score?",
    answer: "After completing a puzzle, click the 'Share' button to generate a beautiful score card showing your time, attempts, streak, and badges. You can share it directly to Twitter, Facebook, or copy the text to share anywhere."
  },
  {
    question: "Is my data saved if I don't have an account?",
    answer: "Yes, your progress is saved locally in your browser. However, if you clear your browser data or switch devices, your progress will be lost. Creating a free account ensures your streak and stats are saved permanently."
  },
  {
    question: "Can I play previous day's puzzles?",
    answer: "Currently, only today's puzzle is available. We're working on an archive feature that will let you play past puzzles. Create an account to be notified when this feature launches!"
  },
  {
    question: "How are the puzzles generated?",
    answer: "Our puzzles are algorithmically generated using a curated word bank with words from various categories including vocabulary, science, geography, business, and Indian culture. Each day uses a unique seed to ensure everyone gets the same puzzle."
  },
  {
    question: "What happens if I make a mistake?",
    answer: "You can submit as many times as you want. Correct cells turn green, incorrect cells turn red. Your attempt count is tracked, so try to solve it in as few attempts as possible for a better score!"
  },
]

// JSON-LD FAQ Schema for rich snippets
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://www.knowhimanshu.in/games/crossword/faq/#faqpage',
  'name': 'Crossword Puzzle FAQ',
  'description': 'Frequently asked questions about our free daily crossword puzzle game',
  'url': 'https://www.knowhimanshu.in/games/crossword/faq',
  'mainEntity': faqs.map((faq, index) => ({
    '@type': 'Question',
    '@id': `https://www.knowhimanshu.in/games/crossword/faq/#question-${index + 1}`,
    'name': faq.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': faq.answer
    }
  }))
}

export const metadata: Metadata = {
  title: 'FAQ - Daily Crossword Puzzle | Common Questions Answered',
  description: 'Find answers to frequently asked questions about our free daily crossword puzzle. Learn about streak mode, badges, how to play, and more.',
  keywords: [
    'crossword faq',
    'crossword help',
    'how to play crossword',
    'crossword rules',
    'crossword streak',
    'free crossword help',
    'crossword tips',
  ],
  alternates: {
    canonical: 'https://knowhimanshu.in/games/crossword/faq',
  },
}

export default function CrosswordFAQPage() {
  return (
    <>
      {/* FAQ Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link 
              href="/games/crossword"
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Game</span>
            </Link>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              FAQ
            </h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to know about our free daily crossword puzzle game.
            </p>
          </section>

          {/* Quick Links */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <QuickLink 
              icon={<Lightbulb className="w-6 h-6" />}
              title="How to Play"
              href="#how-to-play"
              color="bg-amber-500/10 text-amber-400 border-amber-500/30"
            />
            <QuickLink 
              icon={<Flame className="w-6 h-6" />}
              title="Streak Mode"
              href="#streak"
              color="bg-orange-500/10 text-orange-400 border-orange-500/30"
            />
            <QuickLink 
              icon={<Trophy className="w-6 h-6" />}
              title="Badges"
              href="#badges"
              color="bg-purple-500/10 text-purple-400 border-purple-500/30"
            />
            <QuickLink 
              icon={<Clock className="w-6 h-6" />}
              title="Daily Reset"
              href="#reset"
              color="bg-blue-500/10 text-blue-400 border-blue-500/30"
            />
          </section>

          {/* FAQ List */}
          <section className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
            ))}
          </section>

          {/* CTA Section */}
          <section className="mt-16 text-center py-12 px-6 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-2xl border border-emerald-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Play?
            </h2>
            <p className="text-slate-400 mb-6">
              Today&apos;s puzzle is waiting for you. Challenge yourself and build your streak!
            </p>
            <Link
              href="/games/crossword"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
            >
              <Target className="w-5 h-5" />
              Play Now - It&apos;s Free!
            </Link>
          </section>

          {/* Still have questions */}
          <section className="mt-12 text-center text-slate-400">
            <p>
              Still have questions?{' '}
              <Link href="/#contact" className="text-emerald-400 hover:underline">
                Contact us
              </Link>
            </p>
          </section>
        </main>
      </div>
    </>
  )
}

// Quick Link Component
function QuickLink({ 
  icon, 
  title, 
  href, 
  color 
}: { 
  icon: React.ReactNode
  title: string
  href: string
  color: string
}) {
  return (
    <a
      href={href}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${color} hover:scale-105 transition-transform`}
    >
      {icon}
      <span className="text-sm font-medium">{title}</span>
    </a>
  )
}

// FAQ Item Component
function FAQItem({ 
  question, 
  answer,
  index 
}: { 
  question: string
  answer: string
  index: number
}) {
  const id = question.toLowerCase().includes('play') ? 'how-to-play'
    : question.toLowerCase().includes('streak') ? 'streak'
    : question.toLowerCase().includes('badge') ? 'badges'
    : question.toLowerCase().includes('new puzzle') ? 'reset'
    : `faq-${index}`

  return (
    <details 
      id={id}
      className="group bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
    >
      <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-slate-800 transition-colors">
        <h3 className="text-lg font-semibold text-white pr-4">{question}</h3>
        <span className="text-emerald-400 text-2xl group-open:rotate-45 transition-transform">
          +
        </span>
      </summary>
      <div className="px-5 pb-5 pt-2 text-slate-300 leading-relaxed">
        {answer}
      </div>
    </details>
  )
}

