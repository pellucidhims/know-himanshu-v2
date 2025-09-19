'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Crown, Trophy, Clock, RotateCcw, MessageCircle, Home } from 'lucide-react'
import { useMultiplayer } from '../../../../lib/multiplayer/useMultiplayer'
import { fadeIn, staggerContainer } from '../../../../lib/utils'
import GamesNavbar from '../../../../components/navigation/games-navbar'

interface DiceComponentProps {
  value: number | string
  isRolling: boolean
  onClick?: (event?: any) => void
  clickable?: boolean
}

const DiceComponent = ({ value, isRolling, onClick, clickable = false }: DiceComponentProps) => {
  const handleClick = (event: React.MouseEvent) => {
    // console.log('🎯 DiceComponent clicked!', { clickable, isRolling, hasOnClick: !!onClick })
    if (clickable && !isRolling && onClick) {
      onClick(event)
    } else {
    //   console.log('🚫 DiceComponent click ignored:', { clickable, isRolling, hasOnClick: !!onClick })
    }
  }

  const getDiceDisplay = (val: number | string) => {
    if (typeof val === 'string') return val
    const dicePatterns: { [key: number]: JSX.Element } = {
      1: <div className="text-5xl">⚀</div>,
      2: <div className="text-5xl">⚁</div>,
      3: <div className="text-5xl">⚂</div>,
      4: <div className="text-5xl">⚃</div>,
      5: <div className="text-5xl">⚄</div>,
      6: <div className="text-5xl">⚅</div>,
    }
    return dicePatterns[val] || <div className="text-lg font-bold">{val}</div>
  }

  return (
    <motion.div
      animate={isRolling ? {
        rotateX: [0, 360, 720],
        rotateY: [0, 180, 360],
        rotateZ: [0, 180, 360],
        scale: [1, 1.2, 1]
      } : {}}
      transition={{
        duration: isRolling ? 1 : 0,
        ease: "easeInOut"
      }}
      onClick={handleClick}
      className={`
        w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold transition-all duration-300 transform-gpu
        ${clickable && !isRolling ? 'cursor-pointer' : 'cursor-default'}
        ${isRolling 
          ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50' 
          : clickable 
            ? 'bg-gradient-to-br from-green-500 to-green-700 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105'
            : 'bg-gradient-to-br from-blue-500 to-blue-700'
        }
        ${isRolling ? 'animate-pulse' : ''}
        ${clickable && !isRolling ? 'ring-2 ring-green-300 ring-opacity-50' : ''}
      `}
      style={{ perspective: '1000px' }}
    >
      {getDiceDisplay(value)}
    </motion.div>
  )
}

export default function MultiplayerPullerGame() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const roomId = params.roomId as string
  const playerId = searchParams.get('playerId')

  const [isRolling, setIsRolling] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [lastReadMessageCount, setLastReadMessageCount] = useState(0)
  
  // Refs for chat functionality
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const prevChatLengthRef = useRef(0)

  const {
    isConnected,
    currentRoom,
    currentPlayer,
    turnTimeRemaining,
    chatMessages,
    makeMove,
    sendChatMessage,
    isMyTurn,
    myPlayerIndex,
    identifyCurrentPlayer,
    isGameCompleted,
    canCloseRoom,
    closeRoom,
    getRoomInfo,
    isLoading,
    error
  } = useMultiplayer()

  // Get game state
  const gameState = currentRoom?.gameState || {
    board: Array(15).fill(null),
    tokenPosition: 7,
    currentPlayer: 0,
    winner: null,
    gameStatus: 'waiting'
  }

  // Debug game state (only log when it changes)
  useEffect(() => {
    // console.log('🎮 Game state updated:', { 
    //   gameState, 
    //   hasGameState: !!currentRoom?.gameState,
    //   lastMoveValue: gameState.lastMove?.diceValue,
    //   tokenPosition: gameState.tokenPosition,
    //   currentPlayer: gameState.currentPlayer
    // })
  }, [gameState, currentRoom?.gameState])

  // Get current player in turn
  const currentTurnPlayer = currentRoom?.players[currentRoom.currentPlayerIndex]
  
  // Check if I'm the current player
  const isMyTurnToPlay = useMemo(() => {
    const myTurn = isMyTurn()
    const gameActive = currentRoom?.status === 'active'
    // console.log('🎯 Turn calculation:', { 
    //   myTurn, 
    //   gameActive, 
    //   isMyTurnToPlay: myTurn && gameActive,
    //   currentPlayerIndex: currentRoom?.currentPlayerIndex,
    //   myPlayerId: playerId,
    //   roomStatus: currentRoom?.status 
    // })
    return myTurn && gameActive
  }, [isMyTurn, currentRoom?.status, currentRoom?.currentPlayerIndex, playerId])

  // Handle dice roll
  const handleDiceRoll = useCallback(async (event?: React.MouseEvent) => {
    // console.log('🎲 Dice clicked! Event details:', { 
    //   eventType: event?.type,
    //   isMyTurnToPlay, 
    //   isRolling, 
    //   roomStatus: currentRoom?.status,
    //   currentPlayerIndex: currentRoom?.currentPlayerIndex,
    //   myPlayerId: playerId 
    // })
    
    // Prevent event bubbling
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    if (!isMyTurnToPlay || isRolling) {
    //   console.log('❌ Dice roll blocked:', { isMyTurnToPlay, isRolling })
      return
    }

    // console.log('✅ Dice roll proceeding...')
    setIsRolling(true)
    
    // Simulate dice roll animation
    const diceValue = Math.floor(Math.random() * 6) + 1
    // console.log('🎲 Rolling dice value:', diceValue)
    
    setTimeout(() => {
    //   console.log('📤 Sending move to server:', { diceValue })
      makeMove({ diceValue })
      setIsRolling(false)
    }, 1000)
  }, [isMyTurnToPlay, isRolling, makeMove, currentRoom, playerId])

  // Auto-scroll chat to bottom
  const scrollChatToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  // Handle chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatMessage.trim()) {
      sendChatMessage(chatMessage.trim())
      setChatMessage('')
      // Auto-scroll after sending message
      setTimeout(scrollChatToBottom, 100)
    }
  }

  // Handle chat open/close with notification clearing
  const handleToggleChat = () => {
    setShowChat(!showChat)
    if (!showChat) {
      // Opening chat - mark all messages as read
      setUnreadMessageCount(0)
      setLastReadMessageCount(chatMessages.length)
      // Auto-scroll when opening
      setTimeout(scrollChatToBottom, 100)
    }
  }

  // Handle room closure and redirect
  const handleCloseRoom = () => {
    if (confirm('Close this room and return to games?')) {
      closeRoom()
      router.push('/games')
    }
  }

  // Get winner info
  const winner = useMemo(() => {
    if (gameState.tokenPosition === 0) {
      return currentRoom?.players[0]
    } else if (gameState.tokenPosition === 14) {
      return currentRoom?.players[1]
    }
    return null
  }, [gameState.tokenPosition, currentRoom?.players])

  // Debug dice props
  useEffect(() => {
    // console.log('🎰 DiceComponent props:', { 
    //   value: gameState.lastMove?.diceValue || 1,
    //   isRolling,
    //   clickable: isMyTurnToPlay,
    //   hasHandler: !!handleDiceRoll 
    // })
  }, [gameState.lastMove?.diceValue, isRolling, isMyTurnToPlay, handleDiceRoll])

  // Fetch room info when page loads (for refresh scenarios)
  useEffect(() => {
    if (isConnected && !currentRoom && !isLoading && roomId && playerId) {
    //   console.log('🔄 Page refresh detected, fetching room info:', { roomId, playerId })
      getRoomInfo(roomId, playerId)
    }
  }, [isConnected, currentRoom, isLoading, roomId, playerId, getRoomInfo])

  // Identify current player when room data is available
  useEffect(() => {
    if (currentRoom && playerId && !currentPlayer) {
    //   console.log('🔍 Attempting to identify current player:', { playerId, hasRoom: !!currentRoom })
      identifyCurrentPlayer(playerId)
    }
  }, [currentRoom, playerId, currentPlayer, identifyCurrentPlayer])

  // Handle new chat messages - notifications and auto-scroll
  useEffect(() => {
    const currentMessageCount = chatMessages.length
    const previousMessageCount = prevChatLengthRef.current

    if (currentMessageCount > previousMessageCount && previousMessageCount > 0) {
      // New message(s) received
      const newMessageCount = currentMessageCount - previousMessageCount
    //   console.log('💬 New chat message(s) received in game:', {
    //     newMessages: newMessageCount,
    //     totalMessages: currentMessageCount,
    //     chatOpen: showChat
    //   })

      if (showChat) {
        // Chat is open - auto-scroll to bottom
        setTimeout(scrollChatToBottom, 100)
        // Mark as read immediately
        setLastReadMessageCount(currentMessageCount)
      } else {
        // Chat is closed - increment unread count
        setUnreadMessageCount(prev => prev + newMessageCount)
      }
    }

    // Update the ref for next comparison
    prevChatLengthRef.current = currentMessageCount
  }, [chatMessages.length, showChat])

  // Auto-scroll when chat is opened and there are messages
  useEffect(() => {
    if (showChat && chatMessages.length > 0) {
      setTimeout(scrollChatToBottom, 200)
    }
  }, [showChat, chatMessages.length])

  // Navigate back if no room or player ID
  useEffect(() => {
    if (!playerId) {
      router.push(`/games/room/${roomId}`)
    }
  }, [playerId, roomId, router])

  // Render board
  const renderBoard = () => {
    return (
      <div className="flex justify-center items-center mb-8">
        <div className="grid grid-cols-15 gap-1 p-4 bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30">
          {gameState.board.map((_: any, index: number) => (
            <motion.div
              key={index}
              className={`
                w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg border-2 flex items-center justify-center font-bold text-sm
                ${index === 0 ? 'bg-red-100 border-red-300 text-red-600' : 
                  index === 14 ? 'bg-blue-100 border-blue-300 text-blue-600' :
                  'bg-gray-100 dark:bg-dark-surface border-gray-300 dark:border-dark-border text-gray-600 dark:text-dark-text-secondary'}
              `}
              whileHover={{ scale: 1.1 }}
            >
              {index === gameState.tokenPosition && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg"
                />
              )}
              {index === 0 && <span className="text-xs">P1</span>}
              {index === 14 && <span className="text-xs">P2</span>}
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // Show loading only when genuinely loading or not connected
  if (!isConnected || (isLoading && !currentRoom)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            {!isConnected ? 'Connecting to server...' : 'Loading game room...'}
          </p>
        </motion.div>
      </div>
    )
  }

  // Show error if room not found after loading
  if (!isLoading && !currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-red-600 dark:text-red-400 mb-4">Game room not found</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/games')}
            className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold"
          >
            Back to Games
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // Additional safety check - this should not happen with the logic above
  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to load game room</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/games')}
            className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold"
          >
            Back to Games
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface">
      <GamesNavbar />
      
      <motion.div
        variants={staggerContainer(0.1, 0.2)}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto pt-24 px-4 pb-8"
      >
        {/* Game Header */}
        <motion.div
          variants={fadeIn('down', 0)}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Multiplayer Puller Game
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary text-sm sm:text-base">
            Pull the token to your side to win!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            {/* Players Display */}
            <motion.div
              variants={fadeIn('up', 0.1)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
            >
              {currentRoom.players.slice(0, 2).map((player, index) => (
                <div
                  key={player.playerId}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    currentTurnPlayer?.playerId === player.playerId
                      ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-surface/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-red-500' : 'bg-blue-500'
                      }`}>
                        {player.avatarName.charAt(0).toUpperCase()}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                            {player.avatarName}
                          </span>
                          {player.isLeader && <Crown className="w-4 h-4 text-yellow-500" />}
                          {player.playerId === playerId && (
                            <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                          Player {index + 1} • {player.status === 'connected' ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    
                    {currentTurnPlayer?.playerId === player.playerId && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                          {turnTimeRemaining ? Math.ceil(turnTimeRemaining / 1000) : 0}s
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Game Board */}
            <motion.div
              variants={fadeIn('up', 0.2)}
              className="mb-8"
            >
              {renderBoard()}
            </motion.div>

            {/* Dice and Controls */}
            <motion.div
              variants={fadeIn('up', 0.3)}
              className="text-center"
            >
              {currentRoom.status === 'active' && !winner && (
                <div className="mb-6">
                  <div className="flex flex-col items-center gap-4">
                    <DiceComponent
                      value={gameState.lastMove?.diceValue || 1}
                      isRolling={isRolling}
                      onClick={handleDiceRoll}
                      clickable={isMyTurnToPlay}
                    />
                    
                    <div className="text-center">
                      {isMyTurnToPlay ? (
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            Your turn! Click the dice to roll
                          </p>
                          {isRolling && (
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              Rolling...
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-dark-text-secondary">
                          Waiting for {currentTurnPlayer?.avatarName} to play
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Winner Display */}
              <AnimatePresence>
                {winner && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-8 text-white mb-6">
                      <Trophy className="w-16 h-16 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                      <p className="text-xl">
                        🎉 {winner.avatarName} wins! 🎉
                      </p>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCloseRoom}
                      className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                      <Home className="w-5 h-5" />
                      Close Room & Return to Games
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600/30 rounded-lg"
                >
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Chat & Game Info */}
          <motion.div
            variants={fadeIn('right', 0.4)}
            className="space-y-6"
          >
            {/* Game Info */}
            <div className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-4">
              <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-3">Game Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">Room ID:</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-dark-text-primary">
                    {roomId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">Status:</span>
                  <span className={`font-semibold ${
                    currentRoom.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {currentRoom.status.charAt(0).toUpperCase() + currentRoom.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">Token Position:</span>
                  <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                    {gameState.tokenPosition + 1}/15
                  </span>
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                  <div className="relative">
                    <MessageCircle className="w-4 h-4" />
                    {/* Notification indicator */}
                    {unreadMessageCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                      >
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </motion.div>
                    )}
                  </div>
                  Chat
                  {unreadMessageCount > 0 && (
                    <span className="text-xs text-red-500 font-normal">
                      ({unreadMessageCount} new)
                    </span>
                  )}
                </h3>
                <button
                  onClick={handleToggleChat}
                  className={`text-xs px-3 py-1 rounded-md transition-all duration-200 ${
                    unreadMessageCount > 0
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {showChat ? 'Hide' : 'Show'}
                  {unreadMessageCount > 0 && !showChat && (
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="ml-1"
                    >
                      •
                    </motion.span>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {showChat && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3"
                  >
                    <div 
                      ref={chatContainerRef}
                      className="h-32 overflow-y-auto bg-gray-50 dark:bg-dark-surface rounded-lg p-2 scroll-smooth"
                    >
                      {chatMessages.length === 0 ? (
                        <p className="text-gray-500 text-xs text-center py-4">No messages yet</p>
                      ) : (
                        <div className="space-y-2">
                          {chatMessages.map((message, index) => {
                            const isOwnMessage = message.playerId === currentPlayer?.playerId
                            const messageTime = new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                            
                            return (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-xs p-2 rounded-lg ${
                                  isOwnMessage 
                                    ? 'bg-primary-100 dark:bg-primary-900/30 ml-4' 
                                    : 'bg-white dark:bg-dark-elevated mr-4'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`font-semibold ${
                                    isOwnMessage 
                                      ? 'text-primary-700 dark:text-primary-300' 
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {isOwnMessage ? 'You' : message.avatarName}
                                  </span>
                                  <span className="text-gray-400 text-xs">
                                    {messageTime}
                                  </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 break-words">
                                  {message.message}
                                </p>
                              </motion.div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        maxLength={200}
                        className="flex-1 text-xs px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-surface dark:text-dark-text-primary transition-all duration-200"
                        autoComplete="off"
                      />
                      <motion.button
                        type="submit"
                        disabled={!chatMessage.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs px-3 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-all duration-200 font-medium"
                      >
                        Send
                      </motion.button>
                    </form>
                    
                    {/* Message count indicator */}
                    {chatMessage.length > 0 && (
                      <div className="text-xs text-gray-400 text-right mt-1">
                        {chatMessage.length}/200
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
