'use client'

import { io, Socket } from 'socket.io-client'

export interface Player {
  playerId: string
  socketId: string
  avatarName: string
  isLeader: boolean
  status: 'connected' | 'disconnected' | 'reconnecting'
  joinedAt: string
  lastSeen: string
}

export interface GameRoom {
  roomId: string
  gameType: string
  status: 'waiting' | 'active' | 'completed' | 'abandoned'
  players: Player[]
  gameState: any
  currentPlayerIndex: number
  turnStartTime: string | null
  createdAt: string
  updatedAt: string
  winner?: {
    playerId: string
    avatarName: string
  }
  chatMessages?: {
    playerId: string
    avatarName: string
    message: string
    timestamp: string
  }[]
}

export interface GameConfig {
  name: string
  minPlayers: number
  maxPlayers: number
  turnTimeLimit: number
  gameType: string
  description: string
  initialGameState: any
}

export interface MultiplayerEvents {
  // Room events
  onRoomCreated?: (data: { room: GameRoom; playerId: string; roomLink: string }) => void
  onRoomJoined?: (data: { room: GameRoom; playerId: string }) => void
  onRoomInfo?: (data: { room: GameRoom; playerId?: string }) => void
  onPlayerJoined?: (data: { room: GameRoom; newPlayer: Player }) => void
  onPlayerLeft?: (data: { room: GameRoom; leftPlayer: Player }) => void
  onPlayerReconnected?: (data: { room: GameRoom; playerId: string }) => void
  
  // Game events
  onGameStarted?: (data: { room: GameRoom }) => void
  onMoveMade?: (data: { room: GameRoom; gameState: any; playerId: string }) => void
  onGameEnded?: (data: { room: GameRoom; winner: any }) => void
  onTurnTimeout?: (data: { room: GameRoom }) => void
  onTurnTimerStarted?: (data: { timeLimit: number; startTime: number }) => void
  
  // Error events
  onError?: (data: { message: string }) => void
  onJoinError?: (data: { message: string }) => void
  onMoveError?: (data: { message: string }) => void
  onReconnectError?: (data: { message: string }) => void
  
  // Room management events
  onRoomClosed?: (data: { room: GameRoom; message: string }) => void
  onRoomClosedSuccess?: (data: { room: GameRoom }) => void
  
  // Chat events
  onChatMessage?: (data: { playerId: string; avatarName: string; message: string; timestamp: string }) => void
  
  // Connection events
  onConnect?: () => void
  onDisconnect?: () => void
  onReconnect?: () => void
}

class SocketManager {
  private socket: Socket | null = null
  private events: MultiplayerEvents = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private isReconnecting = false

  connect(apiUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://know-himanshu-api.vercel.app') {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts
    })

    this.setupEventListeners()
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      // console.log('Connected to multiplayer server')
      this.reconnectAttempts = 0
      this.isReconnecting = false
      this.events.onConnect?.()
    })

    this.socket.on('disconnect', (reason) => {
      // console.log('Disconnected from multiplayer server:', reason)
      this.events.onDisconnect?.()
      
      if (reason === 'io server disconnect') {
        // Server disconnected, attempt manual reconnection
        this.handleReconnection()
      }
    })

    this.socket.on('reconnect', () => {
      // console.log('Reconnected to multiplayer server')
      this.reconnectAttempts = 0
      this.isReconnecting = false
      this.events.onReconnect?.()
    })

    // Room events
    this.socket.on('room_created', this.events.onRoomCreated || (() => {}))
    this.socket.on('room_joined', this.events.onRoomJoined || (() => {}))
    this.socket.on('room_info', this.events.onRoomInfo || (() => {}))
    this.socket.on('player_joined', this.events.onPlayerJoined || (() => {}))
    this.socket.on('player_left', this.events.onPlayerLeft || (() => {}))
    this.socket.on('player_reconnected', this.events.onPlayerReconnected || (() => {}))

    // Game events
    this.socket.on('game_started', this.events.onGameStarted || (() => {}))
    this.socket.on('move_made', this.events.onMoveMade || (() => {}))
    this.socket.on('game_ended', this.events.onGameEnded || (() => {}))
    this.socket.on('turn_timeout', this.events.onTurnTimeout || (() => {}))
    this.socket.on('turn_timer_started', this.events.onTurnTimerStarted || (() => {}))

    // Error events
    this.socket.on('error', this.events.onError || (() => {}))
    this.socket.on('join_error', this.events.onJoinError || (() => {}))
    this.socket.on('move_error', this.events.onMoveError || (() => {}))
    this.socket.on('reconnect_error', this.events.onReconnectError || (() => {}))

    // Room management events
    this.socket.on('room_closed', this.events.onRoomClosed || (() => {}))
    this.socket.on('room_closed_success', this.events.onRoomClosedSuccess || (() => {}))

    // Chat events
    this.socket.on('chat_message', this.events.onChatMessage || (() => {}))
  }

  private handleReconnection() {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }

    this.isReconnecting = true
    this.reconnectAttempts++

    setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        this.socket.connect()
      }
    }, 1000 * this.reconnectAttempts)
  }

  // Event subscription methods
  on(events: MultiplayerEvents) {
    this.events = { ...this.events, ...events }
    
    // If already connected, set up the new events
    if (this.socket) {
      this.setupEventListeners()
    }
  }

  off(eventName: keyof MultiplayerEvents) {
    delete this.events[eventName]
  }

  // Room management methods
  createRoom(gameType: string, avatarName: string) {
    if (!this.socket) throw new Error('Not connected to server')
    this.socket.emit('create_room', { gameType, avatarName })
  }

  joinRoom(roomId: string, avatarName: string) {
    if (!this.socket) throw new Error('Not connected to server')
    this.socket.emit('join_room', { roomId, avatarName })
  }

  startGame(roomId: string, playerId: string) {
    if (!this.socket) throw new Error('Not connected to server')
    this.socket.emit('start_game', { roomId, playerId })
  }

  makeMove(roomId: string, playerId: string, moveData: any) {
    if (!this.socket) throw new Error('Not connected to server')
    this.socket.emit('player_move', { roomId, playerId, moveData })
  }

  reconnectPlayer(roomId: string, playerId: string) {
    if (!this.socket) throw new Error('Not connected to server')
    this.socket.emit('reconnect_player', { roomId, playerId })
  }

  getRoomInfo(roomId: string, playerId?: string) {
    if (!this.socket) throw new Error('Not connected to server')
    this.socket.emit('get_room_info', { roomId, playerId })
  }

  closeRoom(roomId: string, playerId: string) {
    if (!this.socket) throw new Error('Not connected to server')
    this.socket.emit('close_room', { roomId, playerId })
  }

  sendChatMessage(roomId: string, playerId: string, message: string, avatarName: string) {
    if (!this.socket) throw new Error('Not connected to server')
    this.socket.emit('chat_message', { roomId, playerId, message, avatarName })
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocketId(): string | undefined {
    return this.socket?.id
  }
}

// Export singleton instance
export const socketManager = new SocketManager()
export default socketManager
