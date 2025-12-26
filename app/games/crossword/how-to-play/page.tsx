import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, BookOpen, MousePointer, Keyboard, RotateCcw, Send, Trophy, Flame, Target, Lightbulb, Star } from 'lucide-react'

// JSON-LD HowTo Schema for rich snippets
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  '@id': 'https://www.knowhimanshu.in/games/crossword/how-to-play/#howto',
  'url': 'https://www.knowhimanshu.in/games/crossword/how-to-play',
  'name': 'How to Play Daily Crossword Puzzle',
  'description': 'A complete guide to playing our free daily crossword puzzle game, including controls, tips, and strategies.',
  'totalTime': 'PT5M',
  'estimatedCost': {
    '@type': 'MonetaryAmount',
    'currency': 'USD',
    'value': '0'
  },
  'step': [
    {
      '@type': 'HowToStep',
      'position': 1,
      'name': 'Click on a cell or clue',
      'text': 'Click on any white cell in the grid or click on a clue below the grid to start typing. The selected word will be highlighted.',
      'image': 'https://knowhimanshu.in/crossword-step-1.png'
    },
    {
      '@type': 'HowToStep',
      'position': 2,
      'name': 'Type letters',
      'text': 'Simply type on your keyboard. Letters will automatically be entered and the cursor will move to the next cell in the current direction.',
      'image': 'https://knowhimanshu.in/crossword-step-2.png'
    },
    {
      '@type': 'HowToStep',
      'position': 3,
      'name': 'Switch direction',
      'text': 'Click the same cell again or press Tab to switch between Across (→) and Down (↓) directions.',
      'image': 'https://knowhimanshu.in/crossword-step-3.png'
    },
    {
      '@type': 'HowToStep',
      'position': 4,
      'name': 'Submit your answers',
      'text': 'When all cells are filled, click the Submit button. Correct answers turn green, incorrect turn red. Keep trying until you solve the entire puzzle!',
      'image': 'https://knowhimanshu.in/crossword-step-4.png'
    }
  ],
  'tool': [
    {
      '@type': 'HowToTool',
      'name': 'Web browser'
    },
    {
      '@type': 'HowToTool',
      'name': 'Keyboard (optional on mobile)'
    }
  ]
}

export const metadata: Metadata = {
  title: 'How to Play Crossword Puzzle | Complete Guide & Tips',
  description: 'Learn how to play our free daily crossword puzzle with this comprehensive guide. Master the controls, keyboard shortcuts, and strategies to improve your solving time.',
  keywords: [
    'how to play crossword',
    'crossword tutorial',
    'crossword guide',
    'crossword tips',
    'crossword for beginners',
    'learn crossword',
    'crossword strategy',
    'crossword solving tips',
  ],
  alternates: {
    canonical: 'https://knowhimanshu.in/games/crossword/how-to-play',
  },
}

export default function HowToPlayPage() {
  return (
    <>
      {/* HowTo Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Guide
            </h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How to Play Crossword
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              A complete guide to mastering our free daily crossword puzzle.
            </p>
          </section>

          {/* Basic Controls */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <MousePointer className="w-6 h-6 text-emerald-400" />
              Basic Controls
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <ControlCard
                icon={<MousePointer className="w-6 h-6" />}
                title="Click to Select"
                description="Click any white cell to select it. The entire word will be highlighted in blue (Across) or gold (Down)."
              />
              <ControlCard
                icon={<Keyboard className="w-6 h-6" />}
                title="Type to Fill"
                description="Just start typing! Letters auto-capitalize and the cursor moves to the next cell automatically."
              />
              <ControlCard
                icon={<RotateCcw className="w-6 h-6" />}
                title="Switch Direction"
                description="Click the same cell again, press Tab, or use the direction toggle button to switch between Across and Down."
              />
              <ControlCard
                icon={<Send className="w-6 h-6" />}
                title="Submit Answers"
                description="When all cells are filled, click Submit. Green = correct, Red = incorrect. Keep trying!"
              />
            </div>
          </section>

          {/* Step by Step */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-400" />
              Step-by-Step Guide
            </h2>

            <div className="space-y-6">
              <StepCard
                number={1}
                title="Choose Your Mode"
                description="When you first visit, choose between Streak Mode (login to track progress) or Timer Mode (play as guest). You can always switch to Streak Mode later!"
              />
              <StepCard
                number={2}
                title="Read the Clues"
                description="Scroll down to see ACROSS and DOWN clues. Each clue has a number that corresponds to a starting cell in the grid. Click a clue to jump to that word."
              />
              <StepCard
                number={3}
                title="Fill in Answers"
                description="Type your answers letter by letter. Use Backspace to delete. The cursor advances automatically. For longer words, just keep typing!"
              />
              <StepCard
                number={4}
                title="Check Your Work"
                description="Once all cells are filled, the Submit button activates. Click it to verify your answers. Correct cells turn green, incorrect cells turn red."
              />
              <StepCard
                number={5}
                title="Correct and Retry"
                description="Click any red cell to correct it. You can submit as many times as needed. Your attempt count is tracked - lower is better!"
              />
              <StepCard
                number={6}
                title="Complete and Share!"
                description="When all answers are correct, you win! 🎉 Share your score on social media and come back tomorrow for a new puzzle."
              />
            </div>
          </section>

          {/* Pro Tips */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-400" />
              Pro Tips & Strategies
            </h2>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
              <Tip
                emoji="🎯"
                title="Start with Short Words"
                description="3-4 letter words are usually easier. Filling these first gives you letter hints for longer crossing words."
              />
              <Tip
                emoji="🔤"
                title="Look for Common Patterns"
                description="Words ending in -ING, -TION, -LY are common. If you see a 6-letter word ending in 'G', it might end in '-ING'."
              />
              <Tip
                emoji="✏️"
                title="Use Crossing Letters"
                description="When stuck, look at letters from crossing words. Even one confirmed letter can unlock the answer."
              />
              <Tip
                emoji="🧠"
                title="Think Laterally"
                description="Clues can be tricky! 'Bank' could mean a river bank, a money bank, or to tilt. Consider multiple meanings."
              />
              <Tip
                emoji="⏱️"
                title="Don't Overthink"
                description="Your first instinct is often right. If a word fits the pattern and makes sense, go with it!"
              />
              <Tip
                emoji="📚"
                title="Build Vocabulary"
                description="Playing daily improves your vocabulary. You'll start recognizing common crossword words like ERA, ORE, and ARIA."
              />
            </div>
          </section>

          {/* Badges */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-purple-400" />
              Achievement Badges
            </h2>

            <p className="text-slate-300 mb-6">
              Earn badges by reaching milestones. They appear on your profile and share card!
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <BadgeCategory
                title="🔥 Streak Badges"
                badges={['Spark (3 days)', 'Flame (7 days)', 'Inferno (30 days)', 'Legendary (100 days)']}
                color="text-orange-400"
              />
              <BadgeCategory
                title="⚡ Speed Badges"
                badges={['Quick Thinker (<5 min)', 'Speed Demon (<3 min)', 'Lightning (<2 min)', 'Time Lord (<1 min)']}
                color="text-blue-400"
              />
              <BadgeCategory
                title="🎯 Accuracy Badges"
                badges={['Sharp Mind (5 perfect)', 'Perfectionist (10)', 'Flawless (25)', 'Mastermind (50)']}
                color="text-emerald-400"
              />
              <BadgeCategory
                title="📈 Progress Badges"
                badges={['Rookie (10 puzzles)', 'Regular (50)', 'Veteran (100)', 'Legend (500)']}
                color="text-purple-400"
              />
            </div>
          </section>

          {/* Streak Mode */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-400" />
              Streak Mode Explained
            </h2>

            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-xl p-6 space-y-4">
              <p className="text-slate-300">
                <strong className="text-orange-400">Streak Mode</strong> tracks your daily crossword completions. Here&apos;s how it works:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Complete a puzzle each day to maintain your streak</li>
                <li>Your streak resets to 0 if you miss a day</li>
                <li>Your longest streak is always saved</li>
                <li>Compete on the global leaderboard</li>
                <li>Earn special streak badges (3, 7, 30, 100 days)</li>
              </ul>
              <p className="text-amber-400 text-sm">
                💡 Tip: Enable push notifications to get a daily reminder at 5 PM!
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12 px-6 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-2xl border border-emerald-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Play?
            </h2>
            <p className="text-slate-400 mb-6">
              Put your skills to the test with today&apos;s puzzle!
            </p>
            <Link
              href="/games/crossword"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
            >
              <Star className="w-5 h-5" />
              Play Today&apos;s Puzzle
            </Link>
          </section>
        </main>
      </div>
    </>
  )
}

// Control Card Component
function ControlCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex gap-4">
      <div className="text-emerald-400 flex-shrink-0">{icon}</div>
      <div>
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  )
}

// Step Card Component
function StepCard({ 
  number, 
  title, 
  description 
}: { 
  number: number
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
        {number}
      </div>
      <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </div>
    </div>
  )
}

// Tip Component
function Tip({ 
  emoji, 
  title, 
  description 
}: { 
  emoji: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <span className="text-2xl">{emoji}</span>
      <div>
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  )
}

// Badge Category Component
function BadgeCategory({ 
  title, 
  badges, 
  color 
}: { 
  title: string
  badges: string[]
  color: string
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <h3 className={`font-semibold ${color} mb-3`}>{title}</h3>
      <ul className="space-y-1">
        {badges.map((badge, i) => (
          <li key={i} className="text-slate-400 text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            {badge}
          </li>
        ))}
      </ul>
    </div>
  )
}

