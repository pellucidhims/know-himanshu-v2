'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { socketManager, GameRoom, Player, MultiplayerEvents } from './socketManager'

export interface MultiplayerState {
  isConnected: boolean
  currentRoom: GameRoom | null
  currentPlayer: Player | null
  isLoading: boolean
  error: string | null
  roomLink: string | null
  turnTimeRemaining: number | null
  chatMessages: ChatMessage[]
}

export interface ChatMessage {
  playerId: string
  avatarName: string
  message: string
  timestamp: string
}

export interface UseMultiplayerOptions {
  autoConnect?: boolean
  apiUrl?: string
}

export function useMultiplayer(options: UseMultiplayerOptions = {}) {
  const { autoConnect = true, apiUrl } = options
  
  const [state, setState] = useState<MultiplayerState>({
    isConnected: false,
    currentRoom: null,
    currentPlayer: null,
    isLoading: false,
    error: null,
    roomLink: null,
    turnTimeRemaining: null,
    chatMessages: []
  })

  const turnTimerRef = useRef<NodeJS.Timeout | null>(null)
  const currentPlayerIdRef = useRef<string | null>(null)

  // Helper function to update state
  const updateState = useCallback((updates: Partial<MultiplayerState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Auto-connect to multiplayer server on hook initialization
  useEffect(() => {
    const currentlyConnected = socketManager.isConnected()
    console.log('Auto-connect check:', { currentlyConnected })
    
    if (!currentlyConnected) {
      console.log('Auto-connecting to multiplayer server...')
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'
        : 'http://localhost:8800'
      
      console.log('Connecting to API URL:', apiUrl)
      
      try {
        socketManager.connect(apiUrl)
        updateState({ isLoading: true })
        console.log('Auto-connect initiated, waiting for connection...')
      } catch (error) {
        console.error('Auto-connect failed:', error)
        updateState({ 
          error: 'Failed to connect to multiplayer server',
          isLoading: false 
        })
      }
    } else {
      console.log('Already connected to multiplayer server')
      updateState({ isConnected: true, isLoading: false })
    }
  }, [updateState])

  // Timer management
  const startTurnTimer = useCallback((timeLimit: number, startTime: number) => {
    if (turnTimerRef.current) {
      clearInterval(turnTimerRef.current)
    }

    const updateTimer = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, timeLimit - elapsed)
      
      updateState({ turnTimeRemaining: remaining })
      
      if (remaining <= 0) {
        if (turnTimerRef.current) {
          clearInterval(turnTimerRef.current)
          turnTimerRef.current = null
        }
      }
    }

    updateTimer() // Initial call
    turnTimerRef.current = setInterval(updateTimer, 100)
  }, [updateState])

  const stopTurnTimer = useCallback(() => {
    if (turnTimerRef.current) {
      clearInterval(turnTimerRef.current)
      turnTimerRef.current = null
    }
    updateState({ turnTimeRemaining: null })
  }, [updateState])

  // Connection management
  const connect = useCallback(() => {
    try {
      socketManager.connect(apiUrl)
      updateState({ isLoading: true })
    } catch (error) {
      updateState({ 
        error: 'Failed to connect to multiplayer server',
        isLoading: false 
      })
    }
  }, [apiUrl, updateState])

  const disconnect = useCallback(() => {
    socketManager.disconnect()
    stopTurnTimer()
    updateState({
      isConnected: false,
      currentRoom: null,
      currentPlayer: null,
      error: null,
      roomLink: null
    })
  }, [stopTurnTimer, updateState])

  // Room management
  const createRoom = useCallback((gameType: string, avatarName: string) => {
    updateState({ isLoading: true, error: null })
    try {
      socketManager.createRoom(gameType, avatarName)
    } catch (error) {
      updateState({ 
        error: 'Failed to create room',
        isLoading: false 
      })
    }
  }, [updateState])

  const joinRoom = useCallback((roomId: string, avatarName: string) => {
    updateState({ isLoading: true, error: null })
    try {
      socketManager.joinRoom(roomId, avatarName)
    } catch (error) {
      updateState({ 
        error: 'Failed to join room',
        isLoading: false 
      })
    }
  }, [updateState])

  const startGame = useCallback(() => {
    if (!state.currentRoom || !state.currentPlayer) {
      updateState({ error: 'No active room or player' })
      return
    }

    try {
      socketManager.startGame(state.currentRoom.roomId, state.currentPlayer.playerId)
    } catch (error) {
      updateState({ error: 'Failed to start game' })
    }
  }, [state.currentRoom, state.currentPlayer, updateState])

  const makeMove = useCallback((moveData: any) => {
    console.log('📤 makeMove called:', { 
      moveData, 
      hasRoom: !!state.currentRoom, 
      hasPlayer: !!state.currentPlayer,
      roomId: state.currentRoom?.roomId,
      playerId: state.currentPlayer?.playerId 
    })
    
    if (!state.currentRoom || !state.currentPlayer) {
      console.log('❌ makeMove failed: No active room or player')
      updateState({ error: 'No active room or player' })
      return
    }

    try {
      console.log('🚀 Sending move to server via socket:', {
        roomId: state.currentRoom.roomId,
        playerId: state.currentPlayer.playerId,
        moveData
      })
      socketManager.makeMove(state.currentRoom.roomId, state.currentPlayer.playerId, moveData)
    } catch (error) {
      console.error('❌ Failed to send move:', error)
      updateState({ error: 'Failed to make move' })
    }
  }, [state.currentRoom, state.currentPlayer, updateState])

  const sendChatMessage = useCallback((message: string) => {
    if (!state.currentRoom || !state.currentPlayer) return

    try {
      socketManager.sendChatMessage(
        state.currentRoom.roomId,
        state.currentPlayer.playerId,
        message,
        state.currentPlayer.avatarName
      )
    } catch (error) {
      console.error('Failed to send chat message:', error)
    }
  }, [state.currentRoom, state.currentPlayer])

  const leaveRoom = useCallback(() => {
    disconnect()
  }, [disconnect])

  const closeRoom = useCallback(() => {
    if (!state.currentRoom || !state.currentPlayer) {
      updateState({ error: 'No active room or player' })
      return
    }

    try {
      socketManager.closeRoom(state.currentRoom.roomId, state.currentPlayer.playerId)
    } catch (error) {
      updateState({ error: 'Failed to close room' })
    }
  }, [state.currentRoom, state.currentPlayer, updateState])

  const getRoomInfo = useCallback((roomId: string, playerId?: string) => {
    try {
      updateState({ isLoading: true, error: null })
      socketManager.getRoomInfo(roomId, playerId)
    } catch (error) {
      updateState({ 
        error: 'Failed to get room info',
        isLoading: false 
      })
    }
  }, [updateState])

  const resetRoomState = useCallback(() => {
    updateState({
      currentRoom: null,
      currentPlayer: null,
      error: null,
      roomLink: null,
      isLoading: false
    })
    currentPlayerIdRef.current = null
    stopTurnTimer()
  }, [updateState, stopTurnTimer])

  // Function to identify current player based on playerId
  const identifyCurrentPlayer = useCallback((playerId: string) => {
    if (!state.currentRoom || !playerId) {
      console.log('🚫 Cannot identify player: No room or playerId', { 
        hasRoom: !!state.currentRoom, 
        playerId 
      })
      return
    }

    const currentPlayer = state.currentRoom.players.find(p => p.playerId === playerId)
    if (currentPlayer) {
      console.log('✅ Player identified:', { 
        playerId, 
        avatarName: currentPlayer.avatarName, 
        isLeader: currentPlayer.isLeader 
      })
      currentPlayerIdRef.current = playerId
      updateState({ currentPlayer })
    } else {
      console.log('❌ Player not found in room:', { 
        playerId, 
        playersInRoom: state.currentRoom.players.map(p => ({ id: p.playerId, name: p.avatarName }))
      })
    }
  }, [state.currentRoom, updateState])

  // Utility functions
  const isMyTurn = useCallback(() => {
    if (!state.currentRoom || !state.currentPlayer) {
      console.log('🚫 isMyTurn: No room or player', { 
        hasRoom: !!state.currentRoom, 
        hasPlayer: !!state.currentPlayer 
      })
      return false
    }
    
    const currentPlayerInTurn = state.currentRoom.players[state.currentRoom.currentPlayerIndex]
    const result = currentPlayerInTurn?.playerId === state.currentPlayer.playerId
    
    console.log('🎯 isMyTurn calculation:', {
      currentPlayerIndex: state.currentRoom.currentPlayerIndex,
      currentPlayerInTurn: currentPlayerInTurn?.avatarName,
      currentPlayerInTurnId: currentPlayerInTurn?.playerId,
      myPlayerId: state.currentPlayer.playerId,
      myPlayerName: state.currentPlayer.avatarName,
      result
    })
    
    return result
  }, [state.currentRoom, state.currentPlayer])

  const getMyPlayerIndex = useCallback(() => {
    if (!state.currentRoom || !state.currentPlayer) return -1
    
    return state.currentRoom.players.findIndex(
      player => player.playerId === state.currentPlayer!.playerId
    )
  }, [state.currentRoom, state.currentPlayer])

  const canStartGame = useCallback(() => {
    if (!state.currentRoom || !state.currentPlayer) return false
    
    // Check if user is leader and room is waiting
    const isLeaderAndWaiting = state.currentPlayer.isLeader && state.currentRoom.status === 'waiting'
    
    // For most games, we need at least 2 players
    // For games like Puller that need exactly 2, this will work
    // For games that need more (like some board games), this ensures minimum requirement
    const hasMinPlayers = state.currentRoom.players.length >= 2
    
    return isLeaderAndWaiting && hasMinPlayers
  }, [state.currentRoom, state.currentPlayer])

  const isGameCompleted = useCallback(() => {
    return state.currentRoom?.status === 'completed'
  }, [state.currentRoom])

  const canCloseRoom = useCallback(() => {
    if (!state.currentRoom || !state.currentPlayer) return false
    // Leader can always close, or any player if game is completed
    return state.currentPlayer.isLeader || isGameCompleted()
  }, [state.currentRoom, state.currentPlayer, isGameCompleted])

  const getRoomShareLink = useCallback(() => {
    if (!state.currentRoom) return null
    
    const baseUrl = window.location.origin
    return `${baseUrl}/games/room/${state.currentRoom.roomId}`
  }, [state.currentRoom])

  // Copy room link to clipboard
  const copyRoomLink = useCallback(async () => {
    const link = getRoomShareLink()
    if (!link) return false

    try {
      await navigator.clipboard.writeText(link)
      return true
    } catch (error) {
      console.error('Failed to copy link:', error)
      return false
    }
  }, [getRoomShareLink])

  // Share room link via Web Share API or WhatsApp
  const shareRoomLink = useCallback(async (platform?: 'whatsapp' | 'native') => {
    const link = getRoomShareLink()
    if (!link) return false

    try {
      if (platform === 'whatsapp') {
        const message = `Join my multiplayer game! ${link}`
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
        return true
      }
      
      if (platform === 'native' && navigator.share) {
        await navigator.share({
          title: 'Join my multiplayer game!',
          text: 'Come play with me!',
          url: link
        })
        return true
      }
      
      // Fallback to clipboard
      return await copyRoomLink()
    } catch (error) {
      console.error('Failed to share link:', error)
      return false
    }
  }, [getRoomShareLink, copyRoomLink])

  // Set up socket event listeners
  useEffect(() => {
    const events: MultiplayerEvents = {
      onConnect: () => {
        console.log('Socket.IO connected successfully!')
        updateState({ isConnected: true, isLoading: false, error: null })
      },

      onDisconnect: () => {
        console.log('Socket.IO disconnected')
        updateState({ isConnected: false })
        stopTurnTimer()
      },

      onRoomCreated: (data) => {
        console.log('onRoomCreated event received:', {
          roomId: data.room.roomId,
          playerId: data.playerId,
          playerCount: data.room.players.length,
          roomStatus: data.room.status
        })
        const currentPlayer = data.room.players.find(p => p.playerId === data.playerId)
        currentPlayerIdRef.current = data.playerId
        updateState({
          currentRoom: data.room,
          currentPlayer: currentPlayer || null,
          roomLink: data.roomLink,
          isLoading: false,
          error: null
        })
        
        // Store room membership in session storage for persistence across page reloads
        if (currentPlayer) {
          sessionStorage.setItem(`room_${data.room.roomId}`, JSON.stringify({
            playerId: data.playerId,
            avatarName: currentPlayer.avatarName,
            isLeader: currentPlayer.isLeader
          }))
          console.log('Stored room creator session data:', currentPlayer.avatarName)
        }
        
        console.log('Room creation state updated:', {
          hasCurrentRoom: !!data.room,
          hasCurrentPlayer: !!currentPlayer,
          isLeader: currentPlayer?.isLeader
        })
      },

      onRoomJoined: (data) => {
        const currentPlayer = data.room.players.find(p => p.playerId === data.playerId)
        currentPlayerIdRef.current = data.playerId
        updateState({
          currentRoom: data.room,
          currentPlayer: currentPlayer || null,
          isLoading: false,
          error: null
        })
        
        // Store room membership in session storage for persistence
        if (currentPlayer) {
          sessionStorage.setItem(`room_${data.room.roomId}`, JSON.stringify({
            playerId: data.playerId,
            avatarName: currentPlayer.avatarName,
            isLeader: currentPlayer.isLeader
          }))
          console.log('Stored room joiner session data:', currentPlayer.avatarName)
        }
      },

      onRoomInfo: (data) => {
        console.log('onRoomInfo event received:', {
          roomId: data.room.roomId,
          hasPlayerId: !!data.playerId,
          playerId: data.playerId,
          playerCount: data.room.players.length,
          roomStatus: data.room.status,
          chatMessages: data.room.chatMessages?.length || 0
        })
        
        // Load persisted chat messages
        const chatMessages = data.room.chatMessages || []
        
        // If playerId is provided, it means we're already in the room
        if (data.playerId) {
          const currentPlayer = data.room.players.find(p => p.playerId === data.playerId)
          currentPlayerIdRef.current = data.playerId
          updateState({
            currentRoom: data.room,
            currentPlayer: currentPlayer || null,
            chatMessages,
            isLoading: false,
            error: null
          })
          console.log('Room info state updated with player:', {
            hasCurrentRoom: !!data.room,
            hasCurrentPlayer: !!currentPlayer,
            isLeader: currentPlayer?.isLeader,
            chatMessages: chatMessages.length
          })
        } else {
          // Just room info without player data
          updateState({
            currentRoom: data.room,
            chatMessages,
            isLoading: false,
            error: null
          })
          console.log('Room info state updated without player data')
        }
      },

      onPlayerJoined: (data) => {
        updateState({ currentRoom: data.room })
      },

      onGameStarted: (data) => {
        console.log('🎮 onGameStarted event received:', {
          roomId: data.room.roomId,
          currentPlayerIndex: data.room.currentPlayerIndex,
          playersCount: data.room.players.length,
          roomStatus: data.room.status,
          players: data.room.players.map((p, i) => ({ id: p.playerId, name: p.avatarName, index: i }))
        })
        updateState({ currentRoom: data.room })
      },

      onMoveMade: (data) => {
        console.log('📨 onMoveMade event received:', {
          roomId: data.room.roomId,
          currentPlayerIndex: data.room.currentPlayerIndex,
          playersCount: data.room.players.length,
          gameState: data.gameState,
          tokenPosition: data.gameState?.tokenPosition
        })
        updateState({ currentRoom: data.room })
        stopTurnTimer()
      },

      onGameEnded: (data) => {
        console.log('🏁 onGameEnded event received:', {
          roomId: data.room.roomId,
          winner: data.winner,
          roomStatus: data.room.status
        })
        updateState({ currentRoom: data.room })
        stopTurnTimer()
      },

      onTurnTimeout: (data) => {
        updateState({ currentRoom: data.room })
        stopTurnTimer()
      },

      onTurnTimerStarted: (data) => {
        startTurnTimer(data.timeLimit, data.startTime)
      },

      onError: (data) => {
        updateState({ error: data.message, isLoading: false })
      },

      onJoinError: (data) => {
        updateState({ error: data.message, isLoading: false })
      },

      onMoveError: (data) => {
        updateState({ error: data.message })
      },

      onChatMessage: (data) => {
        const newMessage: ChatMessage = {
          playerId: data.playerId,
          avatarName: data.avatarName,
          message: data.message,
          timestamp: data.timestamp
        }
        setState(prev => ({
          ...prev,
          chatMessages: [...prev.chatMessages, newMessage]
        }))
      },

      onRoomClosed: (data) => {
        updateState({ 
          error: data.message,
          currentRoom: null,
          currentPlayer: null
        })
        stopTurnTimer()
      },

      onRoomClosedSuccess: (data) => {
        updateState({ 
          currentRoom: null,
          currentPlayer: null,
          error: 'Room closed successfully'
        })
        stopTurnTimer()
      }
    }

    socketManager.on(events)

    return () => {
      // Cleanup event listeners
      Object.keys(events).forEach(eventName => {
        socketManager.off(eventName as keyof MultiplayerEvents)
      })
    }
  }, [updateState, startTurnTimer, stopTurnTimer])

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && !state.isConnected) {
      connect()
    }

    return () => {
      stopTurnTimer()
    }
  }, [autoConnect, state.isConnected, connect, stopTurnTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTurnTimer()
    }
  }, [stopTurnTimer])

  return {
    // State
    ...state,
    
    // Room management
    connect,
    disconnect,
    createRoom,
    joinRoom,
    leaveRoom,
    closeRoom,
    getRoomInfo,
    resetRoomState,
    identifyCurrentPlayer,
    startGame,
    makeMove,
    
    // Chat
    sendChatMessage,
    
    // Sharing
    copyRoomLink,
    shareRoomLink,
    getRoomShareLink,
    
    // Utilities
    isMyTurn,
    getMyPlayerIndex,
    canStartGame,
    isGameCompleted,
    canCloseRoom,
    
    // Current player info
    myPlayerId: currentPlayerIdRef.current,
    isLeader: state.currentPlayer?.isLeader || false,
    myPlayerIndex: getMyPlayerIndex()
  }
}
