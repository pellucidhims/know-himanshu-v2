'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Crown, Copy, Share2, MessageCircle, Play, Clock, Hash, Wifi, WifiOff, X } from 'lucide-react'
import { useMultiplayer } from '../../../lib/multiplayer/useMultiplayer'
import { fadeIn, staggerContainer } from '../../../lib/utils'
import GamesNavbar from '../../../components/navigation/games-navbar'

export default function GameRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const [avatarName, setAvatarName] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [isManualJoin, setIsManualJoin] = useState(false)
  const [hasTriedAutoJoin, setHasTriedAutoJoin] = useState(false)

  const {
    isConnected,
    currentRoom,
    currentPlayer,
    isLoading,
    error,
    turnTimeRemaining,
    chatMessages,
    joinRoom,
    startGame,
    sendChatMessage,
    copyRoomLink,
    shareRoomLink,
    closeRoom,
    getRoomInfo,
    resetRoomState,
    isMyTurn,
    canStartGame,
    myPlayerId
  } = useMultiplayer()

  // Add a simple connectivity test
  useEffect(() => {
    // Test if backend is reachable via HTTP
    if (typeof window !== 'undefined') {
      fetch('http://localhost:8800/')
        .then(response => {
          console.log('Backend health check:', response.status)
          if (response.ok) {
            console.log('✅ Backend is reachable via HTTP')
          } else {
            console.log('❌ Backend HTTP error:', response.status)
          }
        })
        .catch(error => {
          console.log('❌ Backend not reachable:', error.message)
        })
    }
  }, [])

  // Check session storage for existing room membership - trigger when connected
  useEffect(() => {
    console.log('Session storage check:', { roomId, hasJoined, isConnected })
    const storedRoomData = sessionStorage.getItem(`room_${roomId}`)
    console.log('Session storage raw data:', storedRoomData)
    
    if (storedRoomData && !hasJoined && isConnected) {
      try {
        const { playerId, avatarName: storedAvatarName, isLeader } = JSON.parse(storedRoomData)
        console.log('Found stored room data:', { playerId, storedAvatarName, isLeader })
        console.log('Current state:', { currentRoom: !!currentRoom, isConnected })
        
        // If we have stored data but no current room, try to reconnect
        if (!currentRoom) {
          console.log('Attempting to reconnect using stored session data')
          getRoomInfo(roomId)
          setHasTriedAutoJoin(true)
          
          // Give a bit more time for the connection to establish
          setTimeout(() => {
            if (!hasJoined && !currentRoom) {
              console.log('Reconnection timeout, user may need to manually join')
            }
          }, 3000)
        }
      } catch (error) {
        console.error('Error parsing stored room data:', error)
        sessionStorage.removeItem(`room_${roomId}`)
      }
    } else if (!storedRoomData) {
      console.log('No session storage data found for room:', roomId)
    } else if (!isConnected) {
      console.log('Have session data but not connected yet, waiting for connection...')
    } else {
      console.log('Session data found but user already hasJoined')
    }
  }, [roomId, currentRoom, isConnected, getRoomInfo, hasJoined])

  // Reset room state if visiting a different room or if currentRoom doesn't match
  useEffect(() => {
    // Only reset if we have a currentRoom but it doesn't match the URL roomId
    // This prevents interference between different room visits
    if (currentRoom && currentRoom.roomId !== roomId) {
      console.log('Visiting different room, resetting state. Current:', currentRoom.roomId, 'Visiting:', roomId)
      resetRoomState()
    }
  }, [roomId, currentRoom, resetRoomState])

  // Auto-detect if user is already in the room (room creator or returning player)
  useEffect(() => {
    console.log('Room page state check:', {
      roomId,
      hasCurrentRoom: !!currentRoom,
      currentRoomId: currentRoom?.roomId,
      hasJoined,
      isLoading,
      isConnected,
      player: currentPlayer?.avatarName,
      isLeader: currentPlayer?.isLeader,
      playersInRoom: currentRoom?.players?.length || 0
    })

    // Auto-join logic: Check if we should automatically show the lobby
    if (currentRoom && currentRoom.roomId === roomId && !hasJoined) {
      if (currentPlayer) {
        // Verify that the current player is actually in the room's player list
        const playerInRoom = currentRoom.players.some(p => p.playerId === currentPlayer.playerId)
        if (playerInRoom) {
          console.log('Auto-joining room for confirmed player:', currentPlayer.avatarName)
          setHasJoined(true)
          
          // Store room membership in session storage
          sessionStorage.setItem(`room_${roomId}`, JSON.stringify({
            playerId: currentPlayer.playerId,
            avatarName: currentPlayer.avatarName,
            isLeader: currentPlayer.isLeader
          }))
        } else {
          console.log('Current player not found in room player list, requiring manual join')
        }
      } else {
        // Edge case: We have room data but no currentPlayer
        // This might happen when the room info was fetched but we haven't identified the player yet
        console.log('Have room data but no currentPlayer, waiting for player identification')
      }
    }
  }, [currentRoom, roomId, hasJoined, currentPlayer, isLoading, isConnected])

  // Request room info for users who might already be in the room (reconnection scenarios)
  useEffect(() => {
    if (isConnected && !currentRoom && !isLoading && roomId && hasJoined && !hasTriedAutoJoin) {
      console.log('User reconnecting, requesting room info for:', roomId)
      getRoomInfo(roomId)
      setHasTriedAutoJoin(true)
    }
  }, [isConnected, currentRoom, isLoading, roomId, hasJoined, hasTriedAutoJoin, getRoomInfo])

  // Handle avatar name submission
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (avatarName.trim() && isConnected) {
      setIsManualJoin(true)
      joinRoom(roomId, avatarName.trim())
      setHasJoined(true)
    }
  }

  // Store session data when user successfully joins manually
  useEffect(() => {
    if (hasJoined && currentPlayer && currentRoom && currentRoom.roomId === roomId && isManualJoin) {
      sessionStorage.setItem(`room_${roomId}`, JSON.stringify({
        playerId: currentPlayer.playerId,
        avatarName: currentPlayer.avatarName,
        isLeader: currentPlayer.isLeader
      }))
      console.log('Stored session data for manual join:', currentPlayer.avatarName)
    }
  }, [hasJoined, currentPlayer, currentRoom, roomId, isManualJoin])

  // Handle game start
  const handleStartGame = () => {
    if (canStartGame()) {
      startGame()
    }
  }

  // Handle copy room link
  const handleCopyLink = async () => {
    const success = await copyRoomLink()
    if (success) {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  // Handle share via WhatsApp
  const handleShareWhatsApp = () => {
    shareRoomLink('whatsapp')
  }

  // Handle close room
  const handleCloseRoom = () => {
    if (confirm('Are you sure you want to close this room? All players will be disconnected.')) {
      closeRoom()
    }
  }

  // Handle chat message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatMessage.trim()) {
      sendChatMessage(chatMessage.trim())
      setChatMessage('')
    }
  }

  // Redirect to game page when game starts
  useEffect(() => {
    if (currentRoom?.status === 'active') {
      router.push(`/games/${currentRoom.gameType}/multiplayer/${roomId}?playerId=${myPlayerId}`)
    }
  }, [currentRoom?.status, currentRoom?.gameType, roomId, myPlayerId, router])

  // Redirect when room is closed or becomes null
  useEffect(() => {
    if (!isLoading && !currentRoom && hasJoined) {
      // Room was closed or player was disconnected - clean up session storage
      sessionStorage.removeItem(`room_${roomId}`)
      setTimeout(() => {
        router.push('/games')
      }, 2000) // Give user time to see any error message
    }
  }, [currentRoom, hasJoined, isLoading, router, roomId])

  // Loading state - only show if we're genuinely loading and don't have room data
  if (isLoading && !currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">Connecting to game room...</p>
        </motion.div>
      </div>
    )
  }

  // Avatar name input - show for users who haven't joined yet
  // This ensures new users always see the avatar form, even if room data exists
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface">
        <GamesNavbar />
        <motion.div
          variants={staggerContainer(0.1, 0.2)}
          initial="hidden"
          animate="show"
          className="max-w-md mx-auto pt-32 px-4"
        >
          <motion.div
            variants={fadeIn('down', 0)}
            className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-8 text-center"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
                Join Game Room
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Room ID: <span className="font-mono font-bold">{roomId}</span>
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600/30 rounded-lg"
              >
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  Enter your display name
                </label>
                <input
                  type="text"
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  placeholder="Your name..."
                  maxLength={20}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-surface dark:text-dark-text-primary"
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!avatarName.trim() || !isConnected}
                className="w-full px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
              >
                {!isConnected ? 'Connecting...' : 'Join Room'}
              </motion.button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">Connecting...</span>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Show loading if we don't have room data yet but should have it
  if (hasJoined && !currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">Loading room data...</p>
        </motion.div>
      </div>
    )
  }

  // At this point, currentRoom should exist if hasJoined is true
  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-red-600 dark:text-red-400">Room not found</p>
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
        className="max-w-4xl mx-auto pt-24 px-4 pb-8"
      >
        {/* Room Header */}
        <motion.div
          variants={fadeIn('down', 0)}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            {currentRoom?.gameType ? 
              currentRoom.gameType.charAt(0).toUpperCase() + currentRoom.gameType.slice(1) + ' Room' :
              'Game Room'
            }
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Room ID: <span className="font-mono font-bold">{roomId}</span>
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Players List */}
          <motion.div
            variants={fadeIn('left', 0.1)}
            className="lg:col-span-2 bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                <Users className="w-5 h-5" />
                Players ({currentRoom.players.length})
              </h2>
              
              {currentRoom.status === 'waiting' && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-gray-100 dark:bg-dark-surface rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShareWhatsApp}
                    className="px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>

                  {currentPlayer?.isLeader && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCloseRoom}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                      title="Close Room"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {copySuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-2 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-600/30 rounded-lg text-center"
              >
                <p className="text-green-600 dark:text-green-400 text-sm">Room link copied to clipboard!</p>
              </motion.div>
            )}

            <div className="space-y-3">
              {currentRoom.players.map((player, index) => (
                <motion.div
                  key={player.playerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    player.playerId === myPlayerId
                      ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-surface/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        player.playerId === myPlayerId ? 'bg-primary-500' : 'bg-gray-400'
                      }`}>
                        {player.avatarName.charAt(0).toUpperCase()}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                            {player.avatarName}
                          </span>
                          {player.isLeader && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                          {player.playerId === myPlayerId && (
                            <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                          {player.status === 'connected' ? 'Online' : 'Disconnected'}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`w-3 h-3 rounded-full ${
                      player.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Start Game Button */}
            {canStartGame() && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartGame}
                className="w-full mt-6 px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                Start Game
              </motion.button>
            )}

            {currentRoom.status === 'waiting' && !canStartGame() && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/30 rounded-lg text-center">
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  {currentPlayer?.isLeader 
                    ? `Waiting for ${2 - currentRoom.players.length} more player${2 - currentRoom.players.length === 1 ? '' : 's'} to join (${currentRoom.players.length}/2 players)`
                    : 'Waiting for the room leader to start the game'
                  }
                </p>
              </div>
            )}
          </motion.div>

          {/* Game Info & Chat */}
          <motion.div
            variants={fadeIn('right', 0.2)}
            className="space-y-6"
          >
            {/* Game Status */}
            <div className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-4">
              <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-3">Game Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">Status:</span>
                  <span className={`font-semibold ${
                    currentRoom.status === 'waiting' ? 'text-yellow-600' :
                    currentRoom.status === 'active' ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {currentRoom.status.charAt(0).toUpperCase() + currentRoom.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">Players:</span>
                  <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                    {currentRoom.players.length}
                  </span>
                </div>
                {turnTimeRemaining !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-text-secondary">Turn Time:</span>
                    <span className="font-semibold text-primary-600 dark:text-primary-400">
                      {Math.ceil(turnTimeRemaining / 1000)}s
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white/10 dark:bg-dark-elevated/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-dark-border/30 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </h3>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showChat ? 'Hide' : 'Show'}
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
                    <div className="h-32 overflow-y-auto bg-gray-50 dark:bg-dark-surface rounded-lg p-2">
                      {chatMessages.length === 0 ? (
                        <p className="text-gray-500 text-xs text-center py-4">No messages yet</p>
                      ) : (
                        chatMessages.map((message, index) => (
                          <div key={index} className="text-xs mb-2">
                            <span className="font-semibold text-primary-600 dark:text-primary-400">
                              {message.avatarName}:
                            </span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">
                              {message.message}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 text-xs px-2 py-1 border border-gray-300 dark:border-dark-border rounded focus:ring-1 focus:ring-primary-500 dark:bg-dark-surface dark:text-dark-text-primary"
                      />
                      <button
                        type="submit"
                        disabled={!chatMessage.trim()}
                        className="text-xs px-2 py-1 bg-primary-500 text-white rounded disabled:opacity-50"
                      >
                        Send
                      </button>
                    </form>
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
