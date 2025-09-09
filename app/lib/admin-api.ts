import axios from 'axios'

// API Configuration - using the same base URL as the original
const apiBaseUri = process.env.NODE_ENV !== 'production'
  ? process.env.NEXT_PUBLIC_API_BASE_URI_DEV || 'https://know-himanshu-api.vercel.app'
  : process.env.NEXT_PUBLIC_API_BASE_URI || 'https://know-himanshu-api.vercel.app'

// Token management utilities
export const setToken = (key: string, value: string) => {
  try {
    if (key) {
      sessionStorage.setItem(key, JSON.stringify(value))
      return true
    }
    return false
  } catch (error) {
    console.error('Something went wrong while setting token:', error)
    return false
  }
}

export const getToken = (key: string = '') => {
  try {
    if (key) {
      const fetchData = sessionStorage.getItem(key)
      return fetchData ? JSON.parse(fetchData) : null
    }
    return null
  } catch (error) {
    console.error('Something went wrong while getting token:', error)
    return null
  }
}

export const removeToken = (key: string = '') => {
  try {
    if (key) {
      sessionStorage.removeItem(key)
      return true
    }
    return false
  } catch (error) {
    console.error('Something went wrong while removing token:', error)
    return false
  }
}

// Create API instance
export const adminApi = axios.create({
  baseURL: apiBaseUri,
  timeout: 10000,
})

// Add request interceptor for authentication
adminApi.interceptors.request.use(
  async (config) => {
    if (config.baseURL === apiBaseUri && !config.headers.Authorization) {
      let token = getToken('token')
      if (token) {
        // Handle double JSON parsing issue from original
        if (typeof token === 'string') {
          try {
            token = JSON.parse(token)
          } catch {
            // Token is already parsed
          }
        }
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      removeToken('token')
    }
    return Promise.reject(error)
  }
)

// API functions
export const adminLogin = async (credentials: { userName: string; password: string }) => {
  try {
    const response = await adminApi.post('/admin/login', credentials)
    if (response.status === 200 && response.data.token) {
      setToken('token', response.data.token)
    }
    return response
  } catch (error) {
    throw error
  }
}

export const getVisitorMessages = async () => {
  try {
    const response = await adminApi.get('/visitor/getMessages')
    return response.data
  } catch (error) {
    throw error
  }
}

export const markMessageAsRead = async (messageId: string) => {
  try {
    const response = await adminApi.put(`/visitor/message/${messageId}/read`)
    return response.data
  } catch (error) {
    throw error
  }
}
