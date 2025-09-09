'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Calendar, MapPin, Award, Star } from 'lucide-react'
import { fadeIn, staggerContainer, textVariant } from '../../lib/utils'

const educationData = [
  {
    id: 1,
    degree: 'Bachelor of Technology',
    field: 'Information Technology',
    institution: 'National Institute of Technology Durgapur',
    location: 'Durgapur, West Bengal',
    duration: '2012 - 2016',
    grade: 'First Class',
    achievements: [
      'Graduated in Information Technology',
      'Headed college Radio Station - Radio Nitroz',
      'Led NSS Unit activities',
      'Active in technical societies'
    ],
    description: 'Education consisted of curriculum having subjects like - C/C++ programming, Shell scripting, TCP/IP Networking, SQL, Microprocessor, Web development, Digital Signal Processing and more! Apart from academics, was heading the college Radio Station - Radio Nitroz and NSS Unit.',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 2,
    degree: 'Senior Secondary Certificate',
    field: 'Science',
    institution: 'Kendriya Vidyalaya No.2',
    location: 'Port Blair, Andaman and Nicobar Islands',
    duration: '2010 - 2012',
    grade: 'Distinction',
    achievements: [
      'Science stream with focus on Mathematics and Biology',
      'Strong foundation in computer science',
      'Developed interest in websites and internet technology',
      'Excellent academic performance'
    ],
    description: 'I graduated high school, where I enjoyed studying science, along with mathematics and biology. Initially, had an inclination towards biology and was pretty good at it. But then turned my gaze towards computers and got fascinated with internet and websites allowing us to do some amazing things.',
    color: 'from-green-500 to-emerald-600'
  }
]


export default function Education() {
  return (
    <section id="education" className="py-20 bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="space-y-16"
        >
          {/* Section Title */}
          <motion.div variants={textVariant()} className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Education & Learning
            </h2>
            <p className="text-xl text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              My academic journey and continuous learning path in technology
            </p>
            <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full mt-4"></div>
          </motion.div>

          {/* Education Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary-500 to-secondary-500"></div>

            {/* Education items */}
            <div className="space-y-12">
              {educationData.map((education, index) => (
                <motion.div
                  key={education.id}
                  variants={fadeIn(index % 2 === 0 ? 'right' : 'left', index * 0.2)}
                  className={`relative flex items-center ${
                    index % 2 === 0 
                      ? 'md:flex-row' 
                      : 'md:flex-row-reverse'
                  } flex-col md:space-x-8`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 -translate-y-1/2 top-1/2">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${education.color} border-4 border-white dark:border-dark-bg shadow-lg flex items-center justify-center`}>
                      <GraduationCap className="h-3 w-3 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ml-16 md:ml-0 ${
                    index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'
                  }`}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-dark-border"
                    >
                      {/* Header */}
                      <div className="mb-4">
                        <div className={`inline-block px-3 py-1 bg-gradient-to-r ${education.color} text-white text-sm font-medium rounded-full mb-3`}>
                          {education.degree}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
                          {education.field}
                        </h3>
                        
                        <div className="space-y-1 text-sm text-gray-600 dark:text-dark-text-secondary">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            <span className="font-medium">{education.institution}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{education.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{education.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            <span className="font-semibold">{education.grade}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 dark:text-dark-text-secondary mb-4 leading-relaxed">
                        {education.description}
                      </p>

                      {/* Achievements */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary mb-2 flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          Key Achievements
                        </h4>
                        <ul className="space-y-1">
                          {education.achievements.map((achievement, i) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-dark-text-secondary flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </div>

                  {/* Spacer for mobile */}
                  <div className="hidden md:block flex-1"></div>
                </motion.div>
              ))}
            </div>
          </div>


          {/* Learning Philosophy */}
          <motion.div
            variants={fadeIn('up', 0.8)}
            className="text-center bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Continuous Learning Philosophy
            </h3>
            <p className="text-lg text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              "Education is not preparation for life; education is life itself. In the rapidly evolving world of technology, 
              I believe in continuous learning and staying updated with the latest trends, frameworks, and best practices."
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
