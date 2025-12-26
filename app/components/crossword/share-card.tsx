'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Download, Copy, Check, X, Twitter, Facebook } from 'lucide-react'

// Badge type from API
interface Badge {
  id: string
  name: string
  emoji: string
  tier: number
  color: string
  earnedAt?: string
}

interface ShareCardProps {
  isOpen: boolean
  onClose: () => void
  puzzleDate: string
  timeSeconds: number
  attempts: number
  streak: number
  gridState: string[][]
  gridData: { isBlocked: boolean }[][]
  badges?: Badge[]
  username?: string
}

// Format time as MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Format date nicely
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

// Generate mini grid visualization
const generateGridEmoji = (gridState: string[][], gridData: { isBlocked: boolean }[][]): string[] => {
  const lines: string[] = []
  const maxRows = Math.min(gridState.length, 7) // Limit for card
  
  for (let row = 0; row < maxRows; row++) {
    let line = ''
    const maxCols = Math.min(gridState[row]?.length || 0, 9)
    for (let col = 0; col < maxCols; col++) {
      if (gridData[row]?.[col]?.isBlocked) {
        line += '⬛'
      } else if (gridState[row]?.[col]) {
        line += '🟩'
      } else {
        line += '⬜'
      }
    }
    lines.push(line)
  }
  return lines
}

export const ShareCard = ({
  isOpen,
  onClose,
  puzzleDate,
  timeSeconds,
  attempts,
  streak,
  gridState,
  gridData,
  badges = [],
  username,
}: ShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  // Generate shareable text
  const shareText = `🧩 Daily Crossword - ${formatDate(puzzleDate)}

${generateGridEmoji(gridState, gridData).join('\n')}

⏱️ ${formatTime(timeSeconds)} | 🎯 ${attempts} attempt${attempts !== 1 ? 's' : ''} | 🔥 ${streak} day streak

${badges.slice(0, 3).map(b => `${b.emoji} ${b.name}`).join(' • ')}

Play at www.knowhimanshu.in/games/crossword`

  // Generate canvas image
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas dimensions
    const width = 600
    const height = 800
    canvas.width = width
    canvas.height = height

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#0f172a') // slate-900
    gradient.addColorStop(1, '#1e293b') // slate-800
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add subtle pattern
    ctx.fillStyle = 'rgba(16, 185, 129, 0.03)'
    for (let i = 0; i < 20; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 100 + 50, 0, Math.PI * 2)
      ctx.fill()
    }

    // Border
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, width - 20, height - 20)

    // Title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('🧩 DAILY CROSSWORD', width / 2, 60)

    // Date
    ctx.fillStyle = '#94a3b8'
    ctx.font = '20px system-ui, sans-serif'
    ctx.fillText(formatDate(puzzleDate), width / 2, 95)

    // Divider
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(50, 120)
    ctx.lineTo(width - 50, 120)
    ctx.stroke()

    // Grid visualization
    const gridLines = generateGridEmoji(gridState, gridData)
    const cellSize = 35
    const gridWidth = (gridState[0]?.length || 7) * cellSize
    const gridStartX = (width - gridWidth) / 2
    const gridStartY = 150

    gridState.forEach((row, rowIdx) => {
      if (rowIdx >= 7) return // Limit rows
      row.forEach((cell, colIdx) => {
        if (colIdx >= 9) return // Limit cols
        const x = gridStartX + colIdx * cellSize
        const y = gridStartY + rowIdx * cellSize
        
        if (gridData[rowIdx]?.[colIdx]?.isBlocked) {
          ctx.fillStyle = '#1e293b'
        } else if (cell) {
          ctx.fillStyle = '#10b981'
        } else {
          ctx.fillStyle = '#334155'
        }
        
        ctx.fillRect(x, y, cellSize - 2, cellSize - 2)
        
        // Add asterisk for filled cells (hide actual letters for privacy/no spoilers)
        if (cell && !gridData[rowIdx]?.[colIdx]?.isBlocked) {
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 20px system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('✦', x + cellSize / 2 - 1, y + cellSize / 2)
        }
      })
    })

    // Stats section
    const statsY = gridStartY + Math.min(gridState.length, 7) * cellSize + 40

    // Stats background
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)'
    ctx.roundRect(50, statsY, width - 100, 80, 15)
    ctx.fill()
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 1
    ctx.stroke()

    // Stats text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px system-ui, sans-serif'
    ctx.textAlign = 'center'
    
    const statsText = `⏱️ ${formatTime(timeSeconds)}   🎯 ${attempts}   🔥 ${streak}`
    ctx.fillText(statsText, width / 2, statsY + 35)

    // Stats labels
    ctx.fillStyle = '#94a3b8'
    ctx.font = '14px system-ui, sans-serif'
    ctx.fillText('Time              Attempts         Streak', width / 2, statsY + 60)

    // Badges section
    const badgesY = statsY + 110
    if (badges.length > 0) {
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 18px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🏆 BADGES', width / 2, badgesY)

      ctx.fillStyle = '#ffffff'
      ctx.font = '16px system-ui, sans-serif'
      const badgeText = badges.slice(0, 3).map(b => `${b.emoji} ${b.name}`).join('  •  ')
      ctx.fillText(badgeText, width / 2, badgesY + 30)
    }

    // Username if available
    if (username) {
      ctx.fillStyle = '#64748b'
      ctx.font = '16px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`Played by @${username}`, width / 2, height - 100)
    }

    // Call to action
    ctx.fillStyle = '#10b981'
    ctx.font = 'bold 20px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Play at www.knowhimanshu.in/games/crossword', width / 2, height - 50)

    // Logo/branding
    ctx.fillStyle = '#475569'
    ctx.font = '12px system-ui, sans-serif'
    ctx.fillText('Daily Crossword Challenge', width / 2, height - 25)

    // Convert to image URL
    setImageUrl(canvas.toDataURL('image/png'))
  }, [isOpen, puzzleDate, timeSeconds, attempts, streak, gridState, gridData, badges, username])

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Try native share with image
        if (imageUrl) {
          const blob = await (await fetch(imageUrl)).blob()
          const file = new File([blob], 'crossword-score.png', { type: 'image/png' })
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Daily Crossword Score',
              text: shareText,
            })
            return
          }
        }
        
        // Fallback to text-only share
        await navigator.share({
          title: 'Daily Crossword Score',
          text: shareText,
          url: 'https://knowhimanshu.in/games/crossword',
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setShareError('Failed to share. Try copying instead.')
        }
      }
    } else {
      // Fallback for desktop
      handleCopyText()
    }
  }

  // Handle copy text
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setShareError('Failed to copy to clipboard')
    }
  }

  // Handle download image
  const handleDownload = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.download = `crossword-${puzzleDate}.png`
    link.href = imageUrl
    link.click()
  }

  // Share to Twitter
  const shareToTwitter = () => {
    const tweetText = encodeURIComponent(shareText)
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
  }

  // Share to Facebook
  const shareToFacebook = () => {
    const url = encodeURIComponent('https://knowhimanshu.in/games/crossword')
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-emerald-500/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                Share Your Score
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Canvas (hidden, used for generating image) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Preview */}
            {imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden border border-slate-700">
                <img src={imageUrl} alt="Share card preview" className="w-full" />
              </div>
            )}

            {/* Error message */}
            {shareError && (
              <p className="text-red-400 text-sm mb-4">{shareError}</p>
            )}

            {/* Share buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download
              </motion.button>
            </div>

            {/* Social buttons */}
            <div className="flex gap-3 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareToTwitter}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1DA1F2] text-white rounded-xl font-medium hover:bg-[#1a8cd8] transition-colors"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareToFacebook}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#4267B2] text-white rounded-xl font-medium hover:bg-[#375695] transition-colors"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyText}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-600 text-white rounded-xl font-medium hover:bg-slate-500 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>

            {/* Text preview */}
            <details className="text-sm">
              <summary className="text-gray-400 cursor-pointer hover:text-gray-300">
                Preview share text
              </summary>
              <pre className="mt-2 p-3 bg-slate-800 rounded-lg text-gray-300 text-xs overflow-x-auto whitespace-pre-wrap">
                {shareText}
              </pre>
            </details>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ShareCard

