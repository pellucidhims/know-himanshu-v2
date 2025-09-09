'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  MailOpen, 
  User, 
  Calendar, 
  Lock, 
  Eye, 
  EyeOff, 
  LogOut,
  Shield,
  Loader,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search
} from 'lucide-react'
import { adminLogin, getVisitorMessages, markMessageAsRead, removeToken } from '../../lib/admin-api'
import { useToast } from '../ui/toast'

interface Message {
  postedAt: string
  subject: string
  message: string
  read: boolean
  _id?: string
}

interface Visitor {
  name: string
  email: string
  messages: Message[]
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [credentials, setCredentials] = useState({ userName: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all')
  const { showToast } = useToast()

  useEffect(() => {
    // Check if already logged in
    const token = sessionStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
      fetchMessages()
    }
  }, [])

  const fetchMessages = async () => {
    setMessagesLoading(true)
    try {
      const response = await getVisitorMessages()
      setVisitors(response.visitorMessages || [])
    } catch (error: any) {
      showToast('Failed to fetch messages. Please try again.', 'error')
      console.error('Error fetching messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!credentials.userName.trim() || !credentials.password.trim()) {
      showToast('Username and password are required', 'error')
      return
    }

    setIsLoading(true)
    try {
      await adminLogin(credentials)
      setIsLoggedIn(true)
      showToast('Login successful!', 'success')
      await fetchMessages()
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Login failed. Please check your credentials.',
        'error'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    removeToken('token')
    setIsLoggedIn(false)
    setVisitors([])
    setCredentials({ userName: '', password: '' })
    showToast('Logged out successfully', 'info')
  }

  const handleMarkAsRead = async (visitorEmail: string, messageIndex: number) => {
    try {
      const visitor = visitors.find(v => v.email === visitorEmail)
      if (!visitor) return

      const message = visitor.messages[messageIndex]
      if (!message || message.read) return

      // Optimistically update UI
      const updatedVisitors = visitors.map(v => {
        if (v.email === visitorEmail) {
          const updatedMessages = [...v.messages]
          updatedMessages[messageIndex] = { ...message, read: true }
          return { ...v, messages: updatedMessages }
        }
        return v
      })
      setVisitors(updatedVisitors)

      // Make API call (if endpoint exists)
      if (message._id) {
        await markMessageAsRead(message._id)
      }
      
      showToast('Message marked as read', 'success')
    } catch (error) {
      // Revert optimistic update on error
      await fetchMessages()
      showToast('Failed to mark message as read', 'error')
    }
  }

  // Filter and search logic
  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.messages.some(msg => 
                           msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           msg.message.toLowerCase().includes(searchTerm.toLowerCase())
                         )

    if (!matchesSearch) return false

    if (filterRead === 'all') return true
    if (filterRead === 'read') return visitor.messages.some(msg => msg.read)
    if (filterRead === 'unread') return visitor.messages.some(msg => !msg.read)
    
    return true
  })

  const totalMessages = visitors.reduce((acc, visitor) => acc + visitor.messages.length, 0)
  const unreadMessages = visitors.reduce((acc, visitor) => 
    acc + visitor.messages.filter(msg => !msg.read).length, 0
  )

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Sign in to access visitor messages
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={credentials.userName}
                  onChange={(e) => setCredentials({ ...credentials, userName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-elevated text-gray-900 dark:text-dark-text-primary"
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-elevated text-gray-900 dark:text-dark-text-primary"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !credentials.userName.trim() || !credentials.password.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Manage visitor messages and inquiries
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-dark-text-secondary">
                    Total: {totalMessages}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-gray-600 dark:text-dark-text-secondary">
                    Unread: {unreadMessages}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search messages, names, or emails..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-elevated text-gray-900 dark:text-dark-text-primary"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value as 'all' | 'read' | 'unread')}
                className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-elevated text-gray-900 dark:text-dark-text-primary"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {messagesLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader className="h-6 w-6 animate-spin text-primary-500" />
              <span className="text-gray-600 dark:text-dark-text-secondary">Loading messages...</span>
            </div>
          </div>
        )}

        {/* Messages */}
        {!messagesLoading && (
          <AnimatePresence>
            <div className="space-y-6">
              {filteredVisitors.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-dark-text-secondary text-lg">
                    {searchTerm || filterRead !== 'all' ? 'No messages found matching your criteria' : 'No messages yet'}
                  </p>
                </motion.div>
              ) : (
                filteredVisitors.map((visitor, visitorIndex) => (
                  <motion.div
                    key={visitor.email}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: visitorIndex * 0.1 }}
                    className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg overflow-hidden"
                  >
                    {/* Visitor Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 p-6 border-b border-gray-200 dark:border-dark-border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                            {visitor.name}
                          </h3>
                          <p className="text-gray-600 dark:text-dark-text-secondary">
                            {visitor.email}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                            {visitor.messages.length} message{visitor.messages.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="divide-y divide-gray-200 dark:divide-dark-border">
                      {visitor.messages.map((message, messageIndex) => (
                        <motion.div
                          key={`${message.postedAt}-${messageIndex}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-6 hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors ${
                            !message.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row gap-4">
                            {/* Message Header */}
                            <div className="lg:w-1/3">
                              <div className="flex items-center gap-2 mb-2">
                                {message.read ? (
                                  <MailOpen className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Mail className="h-4 w-4 text-blue-500" />
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  message.read 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                }`}>
                                  {message.read ? 'Read' : 'Unread'}
                                </span>
                              </div>
                              
                              <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                                {message.subject}
                              </h4>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                                <Calendar className="h-4 w-4" />
                                <time dateTime={message.postedAt}>
                                  {new Date(message.postedAt).toLocaleString()}
                                </time>
                              </div>
                            </div>

                            {/* Message Content */}
                            <div className="lg:w-2/3">
                              <p className="text-gray-700 dark:text-dark-text-secondary leading-relaxed mb-4">
                                {message.message}
                              </p>
                              
                              {!message.read && (
                                <button
                                  onClick={() => handleMarkAsRead(visitor.email, messageIndex)}
                                  className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Mark as Read
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
