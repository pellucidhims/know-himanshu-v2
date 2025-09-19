'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Building2, Award } from 'lucide-react'
import { fadeIn, staggerContainer, textVariant, EXPERIENCES } from '../../lib/utils'
import { getExperience } from '../../lib/api'

interface ExperienceItem {
  id: string
  duration: string
  institute: string
  degree: string
  stream: string
  description: string
  icon: string
  iconColor: string
}

export default function Experience() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(EXPERIENCES)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    try {
      setLoading(true)
      const response = await getExperience()
      if (response && response.content) {
        setExperiences(response.content)
      }
    } catch (error) {
      // console.error('Failed to fetch experiences, using fallback data:', error)
      // Keep using the fallback data from EXPERIENCES
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="experience" className="py-20 bg-white dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-16"
        >
          {/* Section Title */}
          <motion.div variants={textVariant()} className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Professional Experience
            </h2>
            <p className="text-xl text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              My journey through the tech industry, building solutions and growing as a developer
            </p>
            <div className="w-24 h-1 bg-gradient-secondary mx-auto rounded-full mt-4"></div>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary-500 to-secondary-500"></div>

            {/* Loading State */}
            {loading && (
              <div className="space-y-12">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center">
                    <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-gray-300 dark:bg-dark-border rounded-full animate-pulse"></div>
                    <div className="flex-1 ml-16 md:ml-0 md:pr-8">
                      <div className="bg-gray-50 dark:bg-dark-elevated rounded-2xl p-6 animate-pulse">
                        <div className="h-6 bg-gray-300 dark:bg-dark-border rounded mb-4"></div>
                        <div className="h-4 bg-gray-300 dark:bg-dark-border rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 dark:bg-dark-border rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Experience items */}
            {!loading && (
              <div className="space-y-12">
                {experiences.reverse().map((experience, index) => (
                <motion.div
                  key={experience.id}
                  variants={fadeIn(index % 2 === 0 ? 'right' : 'left', index * 0.2)}
                  className={`relative flex items-center ${
                    index % 2 === 0 
                      ? 'md:flex-row' 
                      : 'md:flex-row-reverse'
                  } flex-col md:space-x-8`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 -translate-y-1/2 top-1/2">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                      experience.iconColor === 'primary' 
                        ? 'from-primary-500 to-primary-600' 
                        : 'from-secondary-500 to-secondary-600'
                    } border-4 border-white dark:border-dark-surface shadow-lg`}></div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ml-16 md:ml-0 ${
                    index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'
                  }`}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="bg-gradient-to-br from-white to-gray-50 dark:from-dark-elevated dark:to-dark-surface rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-dark-border"
                    >
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Building2 className="h-5 w-5 text-primary-500" />
                          <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                            {experience.institute}
                          </h3>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-dark-text-secondary mb-3">
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            <span className="font-medium">{experience.degree}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{experience.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="text-gray-700 dark:text-dark-text-secondary leading-relaxed">
                        <p>{experience.description}</p>
                      </div>

                      {/* Tags */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {experience.institute === 'Walmart Global Tech' && (
                          <>
                            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                              Current Role
                            </span>
                            <span className="px-3 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded-full text-xs font-medium">
                              Full Stack
                            </span>
                          </>
                        )}
                        {experience.institute === 'HSBC Software Development India Ltd.' && (
                          <>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                              React.js
                            </span>
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                              Node.js
                            </span>
                          </>
                        )}
                        {experience.institute === 'Ernst and Young GDS' && (
                          <>
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                              Agile
                            </span>
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                              MongoDB
                            </span>
                          </>
                        )}
                        {experience.institute === 'Truly Madly Matchmakers Pvt. Ltd.' && (
                          <>
                            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                              AWS EC2
                            </span>
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                              Redis
                            </span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Spacer for mobile */}
                  <div className="hidden md:block flex-1"></div>
                </motion.div>
              ))}
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <motion.div
            variants={fadeIn('up', 0.6)}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {[
              { label: 'Years of Experience', value: '7+' },
              { label: 'Companies Worked', value: '4' },
              { label: 'Projects Delivered', value: '50+' },
              { label: 'Technologies Mastered', value: '20+' },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-6 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl"
              >
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-dark-text-secondary font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
