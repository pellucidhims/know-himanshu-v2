'use client'

/**
 * Friends TV Show Quiz Game
 * A trivia quiz game based on the iconic American sitcom Friends
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Clock, 
  CheckCircle, 
  Trophy,
  Play,
  RotateCcw,
  Home,
  Share2,
  Coffee,
  Sofa,
  X,
  Download
} from 'lucide-react'
import { api } from '../../lib/api'

// Types
interface QuizQuestion {
  id: string
  questionNumber: number
  question: string
  type: string
  options: string[]
  image?: string
}

interface QuizBadge {
  id: string
  name: string
  description: string
  minScore: number
  maxScore: number
  color: string
  emoji: string
}

interface QuizMeta {
  title: string
  description: string
  questionsPerRound: number
  timeLimits: {
    easy: number
    medium: number
    hard: number
  }
}

interface QuizResult {
  score: {
    correct: number
    total: number
    percentage: number
  }
  badge: QuizBadge
  timeTaken: number
  difficulty: string
  results: { questionId: string; isCorrect: boolean }[]
}

type Difficulty = 'easy' | 'medium' | 'hard'
type GameState = 'menu' | 'playing' | 'results'

// Friends character images
const FRIENDS_CHARACTERS = [
  { id: 'chandler', name: 'Chandler', image: '/friends-characters/chandler_bing.png' },
  { id: 'joey', name: 'Joey', image: '/friends-characters/joey_tribbiani.png' },
  { id: 'monica', name: 'Monica', image: '/friends-characters/monica_geller.png' },
  { id: 'phoebe', name: 'Phoebe', image: '/friends-characters/phoebe_buffay.png' },
  { id: 'rachel', name: 'Rachel', image: '/friends-characters/rachel_green.png' },
  { id: 'ross', name: 'Ross', image: '/friends-characters/ross_geller.png' },
]

// Fallback badges (used if API is not available)
const FALLBACK_BADGES: Record<string, QuizBadge> = {
  novice: {
    id: 'novice',
    name: "Ugly Naked Guy's Neighbor",
    description: "You've seen the show... from across the street",
    minScore: 0,
    maxScore: 49,
    color: '#8B4513',
    emoji: '🏠'
  },
  fan: {
    id: 'fan',
    name: 'Central Perk Regular',
    description: "You're always there for them!",
    minScore: 50,
    maxScore: 69,
    color: '#CD853F',
    emoji: '☕'
  },
  superfan: {
    id: 'superfan',
    name: 'Smelly Cat Singer',
    description: 'You know the lyrics, the characters, everything!',
    minScore: 70,
    maxScore: 89,
    color: '#C0C0C0',
    emoji: '🎸'
  },
  legend: {
    id: 'legend',
    name: 'Lobster Master',
    description: "You're the lobster of Friends trivia!",
    minScore: 90,
    maxScore: 100,
    color: '#FFD700',
    emoji: '🦞'
  }
}

// Friends quotes for loading/transitions
const FRIENDS_QUOTES = [
  "Pivot! PIVOT!",
  "How you doin'?",
  "We were on a break!",
  "Could this BE any harder?",
  "Smelly cat, smelly cat...",
  "I'm not great at the advice...",
  "Joey doesn't share food!",
  "Unagi!",
]

// Timer formatting
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Difficulty colors
const difficultyColors = {
  easy: 'from-green-500 to-emerald-600',
  medium: 'from-amber-500 to-orange-600',
  hard: 'from-red-500 to-rose-600',
}

const difficultyBgColors = {
  easy: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  medium: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  hard: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
}

// Confetti effect component
const Confetti = () => {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#F97316']
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
            opacity: 0,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// Floating Character Component for Background
const FloatingCharacter = ({ 
  character, 
  position, 
  delay = 0 
}: { 
  character: typeof FRIENDS_CHARACTERS[0]
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  delay?: number 
}) => {
  const positionClasses = {
    'top-left': 'top-[5%] left-[2%]',
    'top-right': 'top-[5%] right-[2%]',
    'bottom-left': 'bottom-[15%] left-[2%]',
    'bottom-right': 'bottom-[15%] right-[2%]',
  }

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} w-[20vh] h-[20vh] opacity-30 pointer-events-none`}
      animate={{
        y: [0, -15, 0, 10, 0],
        x: [0, 5, 0, -5, 0],
        rotate: [0, 2, 0, -2, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <Image
        src={character.image}
        alt={character.name}
        fill
        className="object-contain drop-shadow-2xl"
        priority={false}
      />
    </motion.div>
  )
}

// Comic Speech Bubble with Character
const CharacterQuestion = ({ 
  character, 
  question,
  questionNumber 
}: { 
  character: typeof FRIENDS_CHARACTERS[0]
  question: string
  questionNumber: number
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6">
      {/* Character */}
      <motion.div
        className="relative flex-shrink-0"
        animate={{
          y: [0, -8, 0],
          rotate: [0, 2, 0, -2, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Character Image */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40">
          <Image
            src={character.image}
            alt={character.name}
            fill
            className="object-contain drop-shadow-[0_0_20px_rgba(255,200,100,0.5)]"
            priority
          />
        </div>
        {/* Character Name Badge */}
        <motion.div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          {character.name} asks...
        </motion.div>
      </motion.div>

      {/* Speech Bubble */}
      <motion.div
        className="relative flex-1 max-w-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        {/* Bubble Pointer (for desktop) */}
        <div className="hidden md:block absolute left-0 top-8 -translate-x-full">
          <div className="w-0 h-0 border-t-[15px] border-t-transparent border-r-[20px] border-r-white/95 border-b-[15px] border-b-transparent" />
        </div>
        {/* Bubble Pointer (for mobile - points up) */}
        <div className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-b-[20px] border-b-white/95 border-r-[15px] border-r-transparent" />
        </div>

        {/* Main Bubble */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl border-4 border-amber-400 relative">
          {/* Question Number Badge */}
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white">
            Q{questionNumber}
          </div>
          
          {/* Comic dots decoration */}
          <div className="absolute top-2 left-3 flex gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <div className="w-2 h-2 rounded-full bg-red-400" />
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-2 leading-relaxed" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", Arial, sans-serif' }}>
            {question}
          </h2>
        </div>
      </motion.div>
    </div>
  )
}

export default function FriendsQuizPage() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [verificationToken, setVerificationToken] = useState('')
  const [timeLimit, setTimeLimit] = useState(300)
  const [timeRemaining, setTimeRemaining] = useState(300)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<QuizMeta | null>(null)
  const [badges, setBadges] = useState<Record<string, QuizBadge>>(FALLBACK_BADGES)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [loadingQuote, setLoadingQuote] = useState(FRIENDS_QUOTES[0])
  const [certificateCharacters, setCertificateCharacters] = useState<typeof FRIENDS_CHARACTERS[0][]>([])

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const certificateRef = useRef<HTMLDivElement>(null)

  // Generate random character assignments for each question (memoized)
  const questionCharacters = useMemo(() => {
    const shuffled = [...FRIENDS_CHARACTERS].sort(() => Math.random() - 0.5)
    return questions.map((_, index) => shuffled[index % shuffled.length])
  }, [questions])

  // Load meta data on mount
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await api.get('/friends-quiz/meta')
        if (response.data.success) {
          setMeta(response.data.data.meta)
          setBadges(response.data.data.badges)
        }
      } catch (err) {
        console.error('Failed to load quiz meta:', err)
      }
    }
    loadMeta()
  }, [])

  // Random quote on loading
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingQuote(FRIENDS_QUOTES[Math.floor(Math.random() * FRIENDS_QUOTES.length)])
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - auto submit
            submitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isTimerRunning, timeRemaining])

  // Get seen question IDs from localStorage
  const getSeenQuestionIds = (difficultyLevel: Difficulty): string[] => {
    if (typeof window === 'undefined') return []
    try {
      const key = `friends_quiz_seen_${difficultyLevel}`
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Save seen question IDs to localStorage
  const saveSeenQuestionIds = (difficultyLevel: Difficulty, newQuestionIds: string[]) => {
    if (typeof window === 'undefined') return
    try {
      const key = `friends_quiz_seen_${difficultyLevel}`
      const existing = getSeenQuestionIds(difficultyLevel)
      // Append new IDs and keep only the last 500 (50 games * 10 questions)
      const updated = [...existing, ...newQuestionIds].slice(-500)
      localStorage.setItem(key, JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to save seen question IDs:', err)
    }
  }

  // Start quiz
  const startQuiz = async (selectedDifficulty: Difficulty) => {
    setIsLoading(true)
    setError(null)
    setDifficulty(selectedDifficulty)

    try {
      // Get previously seen question IDs to avoid repetition
      const seenQuestionIds = getSeenQuestionIds(selectedDifficulty)
      
      // Use POST to send seen question IDs
      const response = await api.post(`/friends-quiz/start/${selectedDifficulty}`, {
        seenQuestionIds,
      })
      
      if (response.data.success) {
        const data = response.data.data
        setQuestions(data.questions)
        setVerificationToken(data.verificationToken)
        setTimeLimit(data.timeLimit)
        setTimeRemaining(data.timeLimit)
        setAnswers({})
        setCurrentQuestionIndex(0)
        setResult(null)
        setGameState('playing')
        setIsTimerRunning(true)
        startTimeRef.current = Date.now()
        
        // Save the new question IDs as seen
        if (data.questionIds) {
          saveSeenQuestionIds(selectedDifficulty, data.questionIds)
        }
      } else {
        setError(response.data.error || 'Failed to start quiz')
      }
    } catch (err) {
      setError('Failed to load questions. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle answer selection with auto-advance
  const selectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }))

    // Auto-advance to next question after a short delay (except on last question)
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1)
      }, 400) // Short delay for visual feedback
    }
  }

  // Navigate to question
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  // Submit quiz (actual submission)
  const submitQuiz = useCallback(async () => {
    if (isLoading) return
    
    setShowConfirmModal(false)
    setIsTimerRunning(false)
    setIsLoading(true)

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)

    // Select two random characters for certificate
    const shuffled = [...FRIENDS_CHARACTERS].sort(() => Math.random() - 0.5)
    setCertificateCharacters([shuffled[0], shuffled[1]])

    try {
      const response = await api.post('/friends-quiz/submit', {
        verificationToken,
        answers,
        difficulty,
        timeTaken,
      })

      if (response.data.success) {
        setResult(response.data.data)
        setGameState('results')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
      } else {
        setError(response.data.error || 'Failed to submit quiz')
      }
    } catch (err) {
      setError('Failed to submit quiz. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [verificationToken, answers, difficulty, isLoading])

  // Handle submit button click (show confirmation)
  const handleSubmitClick = () => {
    setShowConfirmModal(true)
  }

  // State for showing image preview modal on mobile
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // Download certificate as PNG
  const downloadCertificate = async () => {
    if (!certificateRef.current) {
      alert('Certificate not ready. Please try again.')
      return
    }

    setIsGeneratingImage(true)

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#5B21B6',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      const dataUrl = canvas.toDataURL('image/png')
      
      // Always show the image preview on mobile - most reliable method
      // User can long-press to save
      setShowImagePreview(dataUrl)
      
    } catch (err) {
      console.error('Failed to generate certificate:', err)
      alert('Failed to create certificate. Please try taking a screenshot instead.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // Reset quiz
  const resetQuiz = () => {
    setGameState('menu')
    setQuestions([])
    setAnswers({})
    setResult(null)
    setTimeRemaining(300)
    setIsTimerRunning(false)
    setError(null)
    setShowConfirmModal(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  // Check if all questions are answered
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length

  // Current question
  const currentQuestion = questions[currentQuestionIndex]
  const currentCharacter = questionCharacters[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-950 relative overflow-hidden">
      {/* Large Floating Character Backgrounds */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-violet-900/85 to-purple-950/90 z-10" />
        
        {/* Large floating characters - 20vh each */}
        <FloatingCharacter 
          character={FRIENDS_CHARACTERS[0]} 
          position="top-left" 
          delay={0} 
        />
        <FloatingCharacter 
          character={FRIENDS_CHARACTERS[1]} 
          position="top-right" 
          delay={1.5} 
        />
        <FloatingCharacter 
          character={FRIENDS_CHARACTERS[2]} 
          position="bottom-left" 
          delay={0.8} 
        />
        <FloatingCharacter 
          character={FRIENDS_CHARACTERS[3]} 
          position="bottom-right" 
          delay={2.2} 
        />

        {/* Additional floating icons - large and visible */}
        <motion.div
          className="absolute top-[40%] left-[10%] text-[15vh] opacity-40 z-0"
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          ☕
        </motion.div>
        <motion.div
          className="absolute top-[30%] right-[8%] text-[12vh] opacity-35 z-0"
          animate={{ 
            y: [0, 25, 0],
            rotate: [0, -8, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          🛋️
        </motion.div>
        <motion.div
          className="absolute bottom-[30%] left-[15%] text-[10vh] opacity-35 z-0"
          animate={{ 
            y: [0, -20, 0],
            x: [0, 15, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          🦞
        </motion.div>
        <motion.div
          className="absolute top-[60%] right-[12%] text-[12vh] opacity-40 z-0"
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -15, 0],
          }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          🎸
        </motion.div>

        {/* Central Perk style frame decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] opacity-5 z-0">
          <div className="w-full h-full border-[30px] border-amber-600 rounded-lg transform rotate-6" />
        </div>
      </div>

      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Header */}
      <header className="relative z-20 sticky top-0 bg-purple-900/80 backdrop-blur-md border-b border-purple-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/games"
            className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Games</span>
          </Link>

          <div className="flex items-center gap-2">
            <Coffee className="w-6 h-6 text-amber-400" />
            <h1 className="text-lg sm:text-xl font-bold text-white">F•R•I•E•N•D•S Quiz</h1>
          </div>

          {gameState === 'playing' && (
            <motion.div 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                timeRemaining < 30 ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-300'
              }`}
              animate={timeRemaining < 30 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: timeRemaining < 30 ? Infinity : 0 }}
            >
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            </motion.div>
          )}

          {gameState === 'menu' && <div className="w-20" />}
        </div>
      </header>

      <main className="relative z-20 max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Menu State */}
          {gameState === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Logo/Title with Cover Image */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="mb-8"
              >
                {/* Friends Cover Image - showing title and characters */}
                <div className="relative w-full max-w-md mx-auto h-52 sm:h-64 md:h-72 overflow-hidden rounded-xl mb-4">
                  <Image
                    src="/friends-characters/friends_cover.png"
                    alt="Friends Cast"
                    fill
                    className="object-cover object-center scale-110"
                    style={{ objectPosition: 'center 45%' }}
                    priority
                  />
                </div>

                {/* Subtitle */}
                <p className="text-2xl text-amber-400 font-bold">TRIVIA</p>
                <p className="text-purple-300 text-lg mt-2">
                  &quot;The One Where You Prove You&apos;re A True Fan&quot;
                </p>
              </motion.div>

              {/* Difficulty Selection */}
              <div className="space-y-4 max-w-md mx-auto mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Choose Your Challenge</h2>

                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff, index) => (
                  <motion.button
                    key={diff}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startQuiz(diff)}
                    disabled={isLoading}
                    className={`
                      w-full p-4 rounded-xl border-2 ${difficultyBgColors[diff]}
                      hover:shadow-lg transition-all duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="text-lg font-bold capitalize text-gray-900 dark:text-white">
                          {diff === 'easy' && '☕ '}
                          {diff === 'medium' && '🛋️ '}
                          {diff === 'hard' && '🦞 '}
                          {diff}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {diff === 'easy' && '5 minutes • "Could this BE any easier?"'}
                          {diff === 'medium' && '4 minutes • "We were on a break!"'}
                          {diff === 'hard' && '3 minutes • "Unagi!" - True fans only!'}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full bg-gradient-to-r ${difficultyColors[diff]}`}>
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Badges Preview */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-purple-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-700/50"
              >
                <h3 className="text-lg font-semibold text-white mb-4">🏆 Badges to Earn</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.values(badges).map((badge, index) => (
                    <motion.div 
                      key={badge.id} 
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <div 
                        className="w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl shadow-lg"
                        style={{ 
                          backgroundColor: badge.color + '40',
                          boxShadow: `0 4px 15px ${badge.color}40`
                        }}
                      >
                        {badge.emoji}
                      </div>
                      <p className="text-sm font-medium text-white">{badge.name}</p>
                      <p className="text-xs text-purple-400">{badge.minScore}-{badge.maxScore}%</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Playing State */}
          {gameState === 'playing' && currentQuestion && currentCharacter && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-purple-300 mb-2">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span>{Object.keys(answers).length} answered</span>
                </div>
                <div className="h-2 bg-purple-800/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 100 }}
                  />
                </div>
              </div>

              {/* Question navigation dots */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {questions.map((q, index) => {
                  // Find the first unanswered question index
                  const firstUnansweredIndex = questions.findIndex(quest => answers[quest.id] === undefined)
                  // Allow navigation to: answered questions OR the first unanswered question
                  const isAccessible = answers[q.id] !== undefined || index === firstUnansweredIndex || index <= firstUnansweredIndex
                  const isAnswered = answers[q.id] !== undefined
                  const isCurrent = index === currentQuestionIndex
                  const isLocked = !isAccessible

                  return (
                    <motion.button
                      key={q.id}
                      onClick={() => {
                        if (isAccessible) {
                          goToQuestion(index)
                        }
                      }}
                      whileHover={isAccessible ? { scale: 1.2 } : {}}
                      whileTap={isAccessible ? { scale: 0.9 } : {}}
                      disabled={isLocked}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                        ${isCurrent
                          ? 'bg-amber-500 text-white scale-110 shadow-lg shadow-amber-500/50'
                          : isAnswered
                            ? 'bg-green-500 text-white cursor-pointer'
                            : isLocked
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                              : 'bg-purple-700 text-purple-300 hover:bg-purple-600 cursor-pointer'
                        }
                      `}
                      title={isLocked ? 'Complete previous questions first' : `Question ${index + 1}`}
                    >
                      {isAnswered ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : isLocked ? (
                        <span className="text-xs">🔒</span>
                      ) : (
                        index + 1
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Character asking the Question - Comic Style */}
              <CharacterQuestion
                character={currentCharacter}
                question={currentQuestion.question}
                questionNumber={currentQuestionIndex + 1}
              />

              {currentQuestion.image && (
                <motion.div 
                  className="mb-6 rounded-xl overflow-hidden max-w-md mx-auto"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <img 
                    src={currentQuestion.image} 
                    alt="Question" 
                    className="w-full h-auto rounded-xl shadow-xl"
                  />
                </motion.div>
              )}

              {/* Options - Comic Style Cards */}
              <motion.div 
                className="space-y-3 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currentQuestion.options.map((option, index) => {
                  const isSelected = answers[currentQuestion.id] === index
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectAnswer(currentQuestion.id, index)}
                      className={`
                        w-full p-4 rounded-xl text-left transition-all duration-200
                        flex items-center gap-3 border-3
                        ${isSelected
                          ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/30'
                          : 'bg-white/90 text-gray-800 border-purple-300 hover:border-amber-400 hover:bg-white'
                        }
                      `}
                      style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", Arial, sans-serif' }}
                    >
                      <motion.div 
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg
                          ${isSelected ? 'bg-amber-400 text-white' : 'bg-purple-600 text-white'}
                        `}
                        animate={isSelected ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {isSelected ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </motion.div>
                      <span className="font-medium text-base">{option}</span>
                    </motion.button>
                  )
                })}
              </motion.div>

              {/* Character Warning - Show when no option selected */}
              <AnimatePresence>
                {answers[currentQuestion.id] === undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="flex items-center justify-center gap-3 mt-6 max-w-md mx-auto"
                  >
                    {/* Mini character */}
                    <motion.div 
                      className="relative w-12 h-12 flex-shrink-0"
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Image
                        src={currentCharacter.image}
                        alt={currentCharacter.name}
                        fill
                        className="object-contain"
                      />
                    </motion.div>
                    {/* Speech bubble warning */}
                    <div className="relative bg-yellow-100 border-2 border-yellow-400 rounded-xl px-4 py-2 shadow-lg">
                      {/* Bubble pointer */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-yellow-400 border-b-[8px] border-b-transparent" />
                      </div>
                      <p className="text-yellow-800 font-medium text-sm" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", Arial, sans-serif' }}>
                        ⚠️ Gotta choose an option to proceed!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 max-w-2xl mx-auto">
                <motion.button
                  whileHover={{ scale: 1.05, x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-700/50 text-purple-200 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Sofa className="w-5 h-5" />
                  <span className="hidden sm:inline">Pivot Back!</span>
                  <span className="sm:hidden">Back</span>
                </motion.button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <motion.button
                    whileHover={answers[currentQuestion.id] !== undefined ? { scale: 1.05, x: 3 } : {}}
                    whileTap={answers[currentQuestion.id] !== undefined ? { scale: 0.95 } : {}}
                    onClick={() => {
                      if (answers[currentQuestion.id] !== undefined) {
                        goToQuestion(currentQuestionIndex + 1)
                      }
                    }}
                    disabled={answers[currentQuestion.id] === undefined}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shadow-lg ${
                      answers[currentQuestion.id] !== undefined
                        ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/30 cursor-pointer'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
                    }`}
                  >
                    The Next One →
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmitClick}
                    disabled={!allAnswered || isLoading}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {isLoading ? 'Submitting...' : "I'll Be There For You!"}
                    <Trophy className="w-5 h-5" />
                  </motion.button>
                )}
              </div>

              {!allAnswered && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-purple-400 text-sm mt-4"
                >
                  Answer all questions to submit ({questions.length - Object.keys(answers).length} remaining)
                </motion.p>
              )}

              {/* Hint about auto-advance */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                className="text-center text-purple-500 text-xs mt-2"
              >
                💡 Selecting an answer automatically moves to the next question
              </motion.p>
            </motion.div>
          )}

          {/* Results State */}
          {gameState === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* Certificate - Friends Themed (Purple/Yellow like Monica's door) */}
              <motion.div 
                ref={certificateRef}
                id="friends-certificate"
                initial={{ rotateY: -90 }}
                animate={{ rotateY: 0 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
                className="relative rounded-3xl p-6 sm:p-8 border-8 border-double shadow-2xl mb-8 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 25%, #8B5CF6 50%, #7C3AED 75%, #5B21B6 100%)',
                  borderColor: '#FBBF24',
                }}
              >
                {/* Yellow frame like Monica's door frame */}
                <div className="absolute inset-3 border-4 border-yellow-400 rounded-2xl pointer-events-none" />
                
                {/* Peephole decoration (like Monica's door) */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-yellow-500 border-4 border-yellow-600 shadow-inner" />

                {/* Character on left side */}
                {certificateCharacters[0] && (
                  <motion.div
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-16 h-20 sm:w-24 sm:h-32 md:w-28 md:h-36"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Image
                      src={certificateCharacters[0].image}
                      alt={certificateCharacters[0].name}
                      fill
                      className="object-contain drop-shadow-lg"
                    />
                  </motion.div>
                )}

                {/* Character on right side */}
                {certificateCharacters[1] && (
                  <motion.div
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-16 h-20 sm:w-24 sm:h-32 md:w-28 md:h-36"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  >
                    <Image
                      src={certificateCharacters[1].image}
                      alt={certificateCharacters[1].name}
                      fill
                      className="object-contain drop-shadow-lg"
                    />
                  </motion.div>
                )}

                {/* Content with padding for characters */}
                <div className="relative z-10 px-12 sm:px-20 md:px-24">
                  {/* Header */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-8"
                  >
                    <div className="flex justify-center gap-2 text-3xl mb-2">🛋️☕🦞</div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-300 mb-1" style={{ fontFamily: 'serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                      F•R•I•E•N•D•S FAN CERTIFICATE
                    </h2>
                    <p className="text-purple-200 italic text-sm sm:text-base">&quot;The One Where You Became A Legend&quot;</p>
                  </motion.div>

                  <div className="my-4 sm:my-6 border-t-2 border-dashed border-yellow-400/50" />

                  {/* Challenge Type */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className={`inline-block px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold uppercase mb-3 sm:mb-4 bg-gradient-to-r ${difficultyColors[difficulty]} text-white shadow-lg`}
                  >
                    {difficulty === 'easy' && '☕ '}
                    {difficulty === 'medium' && '🛋️ '}
                    {difficulty === 'hard' && '🦞 '}
                    {difficulty} Challenge Completed
                  </motion.div>

                  {/* Score */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className="text-5xl sm:text-6xl md:text-7xl font-bold text-yellow-300 mb-2"
                    style={{ textShadow: '3px 3px 0 #854d0e, 5px 5px 10px rgba(0,0,0,0.3)' }}
                  >
                    {result.score.percentage}%
                  </motion.div>
                  <p className="text-purple-100 mb-4 sm:mb-6 text-sm sm:text-lg">
                    {result.score.correct} out of {result.score.total} correct • ⏱️ {formatTime(result.timeTaken)}
                  </p>

                  {/* Badge Seal - Royal Style */}
                  {result.badge && (
                    <motion.div 
                      className="relative inline-block my-2 sm:my-4"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
                    >
                      {/* Outer glow */}
                      <div 
                        className="absolute inset-0 rounded-full blur-xl opacity-60"
                        style={{ backgroundColor: result.badge.color }}
                      />
                      
                      {/* Main seal */}
                      <div 
                        className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 mx-auto rounded-full flex items-center justify-center"
                        style={{
                          background: `conic-gradient(from 0deg, ${result.badge.color}, ${result.badge.color}dd, ${result.badge.color}, ${result.badge.color}dd, ${result.badge.color})`,
                          boxShadow: `0 10px 40px ${result.badge.color}66, inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)`,
                        }}
                      >
                        {/* Inner rings */}
                        <div className="absolute inset-2 rounded-full border-4 border-white/40" />
                        <div className="absolute inset-4 rounded-full border-2 border-white/30" />
                        <div className="absolute inset-6 rounded-full border border-white/20" />
                        
                        {/* Content */}
                        <div className="text-center text-white z-10">
                          <motion.div 
                            className="text-3xl sm:text-4xl mb-1"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                          >
                            {result.badge.emoji}
                          </motion.div>
                          <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-3 leading-tight text-center">
                            {result.badge.name}
                          </div>
                        </div>
                      </div>
                      
                      {/* Ribbon effect */}
                      <div className="absolute -bottom-4 sm:-bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
                        <div className="w-5 h-10 sm:w-7 sm:h-14 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-b-lg transform -rotate-12 shadow-lg" />
                        <div className="w-5 h-10 sm:w-7 sm:h-14 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-b-lg transform rotate-12 shadow-lg" />
                      </div>
                    </motion.div>
                  )}

                  {/* Quote */}
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-purple-100 font-medium mt-8 sm:mt-10 italic text-sm sm:text-lg"
                  >
                    &quot;{result.badge?.description}&quot;
                  </motion.p>

                  {/* Footer with URL */}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-yellow-400/30 text-center">
                    <p className="text-yellow-300 text-[10px] sm:text-xs">☕ Central Perk Certified ☕</p>
                    <a 
                      href="https://www.knowhimanshu.in/games/friends-quiz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-200 hover:text-yellow-100 text-[9px] sm:text-xs md:text-sm font-semibold mt-1 inline-block underline decoration-yellow-400/50 hover:decoration-yellow-300 transition-colors whitespace-nowrap"
                    >
                      knowhimanshu.in/games/friends-quiz
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex flex-wrap justify-center gap-3 sm:gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadCertificate}
                  disabled={isGeneratingImage}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl hover:shadow-lg transition-all shadow-lg disabled:opacity-70"
                >
                  {isGeneratingImage ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">{isGeneratingImage ? 'Generating...' : 'Download Certificate'}</span>
                  <span className="sm:hidden">{isGeneratingImage ? '...' : 'Download'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetQuiz}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    const funkyMessages = [
                      `☕ OH. MY. GOD! I just scored ${result.score.percentage}% on the F•R•I•E•N•D•S Quiz! 🛋️ Could I BE any more of a fan? Earned the "${result.badge?.name}" badge! 🦞\n\nPIVOT your way to the quiz 👉 https://www.knowhimanshu.in/games/friends-quiz\n\n#FriendsTrivia #CentralPerk #HowYouDoin`,
                      `🛋️ "How YOU doin'?" I'm doing GREAT because I scored ${result.score.percentage}% on the F•R•I•E•N•D•S Quiz! ☕ Got the "${result.badge?.name}" badge!\n\nI'll be there for you... at the quiz 👉 https://www.knowhimanshu.in/games/friends-quiz\n\n#FriendsTrivia #Lobster`,
                      `☕ UNAGI! My Friends knowledge got me ${result.score.percentage}% and the "${result.badge?.name}" badge! 🦞 We were NOT on a break from this quiz!\n\nProve you're the Ross of trivia 👉 https://www.knowhimanshu.in/games/friends-quiz\n\n#FriendsQuiz #CentralPerk`,
                    ];
                    const text = funkyMessages[Math.floor(Math.random() * funkyMessages.length)];
                    
                    try {
                      // Try native share API first
                      if (typeof navigator.share === 'function') {
                        await navigator.share({ 
                          text,
                          url: 'https://www.knowhimanshu.in/games/friends-quiz'
                        });
                        return;
                      }
                    } catch (err) {
                      // User cancelled or share failed
                      console.log('Share failed or cancelled:', err);
                    }
                    
                    // Fallback: copy to clipboard
                    try {
                      await navigator.clipboard.writeText(text);
                      alert('📋 Copied to clipboard! Share it with your friends!');
                    } catch (clipErr) {
                      // Clipboard failed, show text in prompt
                      prompt('Copy this text to share:', text);
                    }
                  }}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transition-all shadow-lg"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </motion.button>

                <Link
                  href="/games"
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors shadow-lg"
                >
                  <Home className="w-5 h-5" />
                  <span className="hidden sm:inline">More Games</span>
                  <span className="sm:hidden">Games</span>
                </Link>
              </motion.div>

              {/* Score Breakdown */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="mt-8 bg-purple-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-700/50"
              >
                <h3 className="text-lg font-semibold text-white mb-4">📊 Question Results</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {result.results.map((r, index) => (
                    <motion.div
                      key={r.questionId}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.5 + index * 0.05 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        r.isCorrect 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {index + 1}
                    </motion.div>
                  ))}
                </div>
                <p className="text-purple-400 text-sm mt-4">
                  ✅ Green = Correct • ❌ Red = Incorrect
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirm Submit Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-purple-900 border border-purple-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">☕</div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to Submit?</h3>
                <p className="text-purple-300 mb-6">
                  &quot;Could you BE any more ready?&quot; - Once you submit, you can&apos;t change your answers!
                </p>
                
                <div className="flex gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmModal(false)}
                    className="flex items-center gap-2 px-5 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Wait, no!
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={submitQuiz}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    <Trophy className="w-4 h-4" />
                    I&apos;ll Be There!
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal for Mobile Download */}
      <AnimatePresence>
        {showImagePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4"
            onClick={() => setShowImagePreview(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-full max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={showImagePreview} 
                alt="Friends Quiz Certificate" 
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
              />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center"
            >
              <p className="text-white text-lg font-medium mb-2">📱 Long-press the image above</p>
              <p className="text-purple-300 text-sm mb-4">Then tap &quot;Save to Photos&quot; or &quot;Download Image&quot;</p>
              <button
                onClick={() => setShowImagePreview(null)}
                className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-purple-900/90 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"
            />
            <motion.p 
              key={loadingQuote}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-lg italic"
            >
              &quot;{loadingQuote}&quot;
            </motion.p>
          </motion.div>
        </div>
      )}
    </div>
  )
}
