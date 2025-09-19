'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gift, Star, ExternalLink, Smartphone, CreditCard, ShoppingBag, Zap } from 'lucide-react'
import { fadeIn, staggerContainer, textVariant } from '../../lib/utils'
import { getReferrals } from '../../lib/api'
import { useToast } from '../ui/toast'

interface ReferralApp {
  id: string
  company: string
  code: string
  link: string
  logo: string
  userId?: string
}

const referralApps = [
  {
    id: 1,
    name: 'PayPal',
    description: 'Get $10 when you send, spend, or receive $5 or more',
    icon: <CreditCard className="h-8 w-8" />,
    referralCode: 'HIMANSHU123',
    link: 'https://paypal.com/invite/HIMANSHU123',
    color: 'from-blue-500 to-blue-600',
    category: 'Finance',
    reward: '$10',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgb(120, 119, 198, 0.3), transparent 50%)',
  },
  {
    id: 2,
    name: 'Uber',
    description: 'Get free rides when you invite friends to Uber',
    icon: <Smartphone className="h-8 w-8" />,
    referralCode: 'himanshu123uber',
    link: 'https://uber.com/invite/himanshu123uber',
    color: 'from-black to-gray-800',
    category: 'Transport',
    reward: 'Free Rides',
    bgPattern: 'radial-gradient(circle at 80% 20%, rgb(31, 41, 55, 0.3), transparent 50%)',
  },
  {
    id: 3,
    name: 'Amazon Prime',
    description: 'Share the benefits of Prime membership',
    icon: <ShoppingBag className="h-8 w-8" />,
    referralCode: 'PRIMEHIM',
    link: 'https://amazon.com/prime/refer/PRIMEHIM',
    color: 'from-orange-500 to-yellow-500',
    category: 'Shopping',
    reward: '30 Days Free',
    bgPattern: 'radial-gradient(circle at 60% 40%, rgb(251, 146, 60, 0.3), transparent 50%)',
  },
  {
    id: 4,
    name: 'Zomato',
    description: 'Order food and get amazing discounts',
    icon: <Gift className="h-8 w-8" />,
    referralCode: 'ZOMATOHIM',
    link: 'https://zomato.com/invite/ZOMATOHIM',
    color: 'from-red-500 to-pink-500',
    category: 'Food',
    reward: '₹200 Off',
    bgPattern: 'radial-gradient(circle at 40% 60%, rgb(239, 68, 68, 0.3), transparent 50%)',
  },
  {
    id: 5,
    name: 'PhonePe',
    description: 'Digital payments made simple and rewarding',
    icon: <Zap className="h-8 w-8" />,
    referralCode: 'PHONEPE_HIM',
    link: 'https://phonepe.com/refer/PHONEPE_HIM',
    color: 'from-purple-500 to-indigo-500',
    category: 'Finance',
    reward: '₹100',
    bgPattern: 'radial-gradient(circle at 30% 70%, rgb(147, 51, 234, 0.3), transparent 50%)',
  },
  {
    id: 6,
    name: 'Swiggy',
    description: 'Food delivery with great offers for new users',
    icon: <Gift className="h-8 w-8" />,
    referralCode: 'SWIGGY_HIMS',
    link: 'https://swiggy.com/refer/SWIGGY_HIMS',
    color: 'from-orange-600 to-red-500',
    category: 'Food',
    reward: '₹150 Off',
    bgPattern: 'radial-gradient(circle at 70% 30%, rgb(234, 88, 12, 0.3), transparent 50%)',
  }
]

const categories = ['All', 'Finance', 'Transport', 'Shopping', 'Food']

export default function Referral() {
  const [referralApps, setReferralApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    fetchReferrals()
  }, [])

  const getCategoryAndIcon = (company: string) => {
    const companyLower = company.toLowerCase()
    
    if (companyLower.includes('zepto') || companyLower.includes('dunzo') || companyLower.includes('tata')) {
      return { category: 'Shopping', icon: <ShoppingBag className="h-8 w-8" />, color: 'from-green-500 to-emerald-600' }
    }
    if (companyLower.includes('cred') || companyLower.includes('niyo') || companyLower.includes('multipl')) {
      return { category: 'Finance', icon: <CreditCard className="h-8 w-8" />, color: 'from-blue-500 to-blue-600' }
    }
    if (companyLower.includes('ease') || companyLower.includes('goibibo') || companyLower.includes('redbus')) {
      return { category: 'Travel', icon: <Smartphone className="h-8 w-8" />, color: 'from-purple-500 to-indigo-500' }
    }
    if (companyLower.includes('urban') || companyLower.includes('yulu')) {
      return { category: 'Services', icon: <Zap className="h-8 w-8" />, color: 'from-orange-500 to-yellow-500' }
    }
    if (companyLower.includes('railway')) {
      return { category: 'Tech', icon: <Star className="h-8 w-8" />, color: 'from-gray-500 to-gray-600' }
    }
    if (companyLower.includes('mygate') || companyLower.includes('gate')) {
      return { category: 'Security', icon: <Gift className="h-8 w-8" />, color: 'from-indigo-500 to-purple-500' }
    }
    
    return { category: 'Other', icon: <Gift className="h-8 w-8" />, color: 'from-pink-500 to-rose-500' }
  }

  const transformApiData = (apiData: ReferralApp[]) => {
    return apiData.map((item, index) => {
      const categoryInfo = getCategoryAndIcon(item.company)
      return {
        id: index + 1,
        name: item.company,
        description: `Get exclusive benefits with ${item.company} referral code`,
        icon: categoryInfo.icon,
        referralCode: item.code,
        link: item.link,
        color: categoryInfo.color,
        category: categoryInfo.category,
        reward: 'Exclusive Offer',
        bgPattern: `radial-gradient(circle at ${20 + (index * 20) % 80}% ${80 - (index * 15) % 60}%, rgba(${100 + index * 30}, ${150 - index * 10}, ${200 + index * 20}, 0.3), transparent 50%)`,
        logo: item.logo
      }
    })
  }

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      const response = await getReferrals()
      if (response && response.content) {
        const transformedData = transformApiData(response.content)
        setReferralApps(transformedData)
      }
    } catch (error) {
      // console.error('Failed to fetch referrals, using fallback data:', error)
      // Keep using the original fallback data
      setReferralApps(referralApps)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        showToast(`Referral code "${code}" copied to clipboard!`, 'success')
      }).catch(err => {
        // console.error('Failed to copy code:', err)
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = code
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        showToast(`Referral code "${code}" copied to clipboard!`, 'success')
      })
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showToast(`Referral code "${code}" copied to clipboard!`, 'success')
    }
  }

  return (
    <section id="referral" className="py-20 bg-gray-50 dark:bg-dark-bg relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-secondary-400/20 to-primary-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-16"
        >
          {/* Section Title */}
          <motion.div variants={textVariant()} className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-6">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              App Referrals & Rewards
            </h2>
            <p className="text-xl text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              Save money and earn rewards with these amazing app referral codes. 
              Help each other grow while getting exclusive benefits!
            </p>
            <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full mt-4"></div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeIn('up', 0.2)}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {loading ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="text-center p-6 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border animate-pulse">
                  <div className="h-6 w-6 bg-gray-300 dark:bg-dark-border rounded mx-auto mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-dark-border rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-dark-border rounded"></div>
                </div>
              ))
            ) : (
              [
                { label: 'Total Referrals', value: `${referralApps.length}+`, icon: <Gift className="h-6 w-6" /> },
                { label: 'Categories', value: `${Array.from(new Set(referralApps.map(app => app.category))).length}`, icon: <Star className="h-6 w-6" /> },
                { label: 'Potential Savings', value: '₹1000+', icon: <CreditCard className="h-6 w-6" /> },
                { label: 'Active Codes', value: '100%', icon: <Zap className="h-6 w-6" /> },
              ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-6 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border"
              >
                <div className="text-primary-500 mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  {stat.label}
                </div>
              </div>
              ))
            )}
          </motion.div>

          {/* Loading State for Cards */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-dark-border animate-pulse">
                  <div className="h-16 w-16 bg-gray-300 dark:bg-dark-border rounded-2xl mb-4"></div>
                  <div className="h-6 bg-gray-300 dark:bg-dark-border rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-dark-border rounded mb-4"></div>
                  <div className="h-10 bg-gray-300 dark:bg-dark-border rounded mb-4"></div>
                  <div className="h-12 bg-gray-300 dark:bg-dark-border rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* Referral Cards */}
          {!loading && (
            <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8">
              {/* Mobile: Horizontal scroll */}
              <div className="md:hidden flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {referralApps.map((app, index) => (
              <motion.div
                key={`mobile-${app.id}`}
                variants={fadeIn('up', index * 0.1)}
                className="group flex-shrink-0 w-80"
              >
                <div
                  className="relative bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-dark-border hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, white 0%, transparent 50%), ${app.bgPattern}`,
                    isolation: 'isolate',
                  }}
                >
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-2 py-1 bg-white/80 dark:bg-dark-elevated/80 backdrop-blur-sm text-xs font-medium rounded-full text-gray-700 dark:text-dark-text-secondary">
                      {app.category}
                    </span>
                  </div>

                  {/* Reward Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1 bg-gradient-to-r ${app.color} text-white text-sm font-bold rounded-full shadow-lg`}>
                      {app.reward}
                    </span>
                  </div>

                  <div className="p-6 pt-16 relative z-10">
                    {/* App Icon/Logo */}
                    {app.logo ? (
                      <div className="w-16 h-16 mb-4 overflow-hidden rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <img 
                          src={app.logo} 
                          alt={`${app.name} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                        <div className={`hidden inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${app.color} rounded-2xl text-white shadow-lg`}>
                          {app.icon}
                        </div>
                      </div>
                    ) : (
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${app.color} rounded-2xl text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {app.icon}
                      </div>
                    )}

                    {/* App Info */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
                      {app.name}
                    </h3>
                    <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4 leading-relaxed">
                      {app.description}
                    </p>

                    {/* Referral Code */}
                    <div className="bg-gray-50 dark:bg-dark-elevated rounded-lg p-3 mb-4 border border-gray-200 dark:border-dark-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-dark-text-muted mb-1">
                            Referral Code
                          </div>
                          <div className="font-mono font-bold text-primary-600 dark:text-primary-400">
                            {app.referralCode}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyCode(app.referralCode)
                          }}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-xs font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors cursor-pointer relative z-20"
                        >
                          Copy
                        </motion.button>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.a
                      href={app.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        // Let the default link behavior happen
                      }}
                      className={`inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r ${app.color} text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer relative z-20`}
                    >
                      Use Referral Code
                      <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  </div>

                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${app.color} opacity-20`}></div>
                  </div>
                </div>
              </motion.div>
              ))}
              </div>

              {/* Desktop: Grid layout */}
              <div className="hidden md:contents">
              {referralApps.map((app, index) => (
              <motion.div
                key={`desktop-${app.id}`}
                variants={fadeIn('up', index * 0.1)}
                className="group"
              >
                <motion.div
                  whileHover={{ 
                    rotateY: 5,
                    rotateX: 5,
                    scale: 1.02,
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-dark-border"
                  style={{
                    background: `linear-gradient(135deg, white 0%, transparent 50%), ${app.bgPattern}`,
                  }}
                >
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-2 py-1 bg-white/80 dark:bg-dark-elevated/80 backdrop-blur-sm text-xs font-medium rounded-full text-gray-700 dark:text-dark-text-secondary">
                      {app.category}
                    </span>
                  </div>

                  {/* Reward Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium rounded-full shadow-md">
                      {app.reward}
                    </span>
                  </div>

                  <div className="p-6 pt-16 relative z-10">
                    {/* App Icon/Logo */}
                    {app.logo ? (
                      <div className="w-16 h-16 mb-4 overflow-hidden rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <img 
                          src={app.logo} 
                          alt={`${app.name} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                        <div className={`hidden inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${app.color} rounded-2xl text-white shadow-lg`}>
                          {app.icon}
                        </div>
                      </div>
                    ) : (
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${app.color} rounded-2xl text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {app.icon}
                      </div>
                    )}

                    {/* App Info */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
                      {app.name}
                    </h3>
                    <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4 leading-relaxed">
                      {app.description}
                    </p>

                    {/* Referral Code */}
                    <div className="bg-gray-100 dark:bg-dark-elevated rounded-lg p-3 mb-4 border border-gray-200 dark:border-dark-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-1">Referral Code</p>
                          <p className="font-mono font-bold text-gray-900 dark:text-dark-text-primary">
                            {app.referralCode}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopyCode(app.referralCode)}
                          className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.a
                      href={app.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        // Let the default link behavior happen
                      }}
                      className={`inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r ${app.color} text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer relative z-20`}
                    >
                      Use Referral Code
                      <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  </div>

                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${app.color} opacity-20`}></div>
                  </div>
                </motion.div>
              </motion.div>
              ))}
              </div>
            </div>
          )}

          {/* View More CTA */}
          <motion.div
            variants={fadeIn('up', 0.8)}
            className="text-center bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Want More Referral Codes?
            </h3>
            <p className="text-lg text-gray-600 dark:text-dark-text-secondary mb-6 max-w-2xl mx-auto">
              Visit my dedicated referral website for more exclusive codes and deals. Help each other save money and earn rewards!
            </p>
            <motion.a
              href="https://www.appreferral.in/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-glow transition-all duration-300"
            >
              <Gift className="mr-2 h-5 w-5" />
              View All Referrals
              <ExternalLink className="ml-2 h-5 w-5" />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
