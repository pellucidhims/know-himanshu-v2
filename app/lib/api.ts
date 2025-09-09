import axios from 'axios'

// API base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://know-himanshu-api.vercel.app',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      typeof window !== 'undefined' && localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

// Contact form submission
export const submitContactForm = async (formData: {
  name: string
  email: string
  subject: string
  message: string
}) => {
  try {
    const response = await api.post('/visitor/postMessage', formData)
    return response.data
  } catch (error) {
    console.error('Error submitting contact form:', error)
    throw error
  }
}

// Get blog posts (for future implementation)
export const getBlogPosts = async () => {
  try {
    const response = await api.get('/blog/posts')
    return response.data
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    throw error
  }
}

// Get projects (for future implementation)
export const getProjects = async () => {
  try {
    const response = await api.get('/projects')
    return response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
}

// Get experience data
export const getExperience = async () => {
  try {
    const response = await api.get('/resource?type=EXPERIENCE')
    return response.data
  } catch (error) {
    console.error('Error fetching experience:', error)
    throw error
  }
}

// Get referral data
export const getReferrals = async () => {
  try {
    const response = await api.get('/resource?type=REFERRAL')
    return response.data
  } catch (error) {
    console.error('Error fetching referrals:', error)
    throw error
  }
}

// Get education data
export const getEducation = async () => {
  try {
    const response = await api.get('/education')
    return response.data
  } catch (error) {
    console.error('Error fetching education:', error)
    throw error
  }
}

// Get skills data
export const getSkills = async () => {
  try {
    const response = await api.get('/skills')
    return response.data
  } catch (error) {
    console.error('Error fetching skills:', error)
    throw error
  }
}
