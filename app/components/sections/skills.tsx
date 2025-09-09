'use client'

import { motion } from 'framer-motion'
import { Code, Database, Globe, Smartphone, Server } from 'lucide-react'
import { fadeIn, staggerContainer, textVariant } from '../../lib/utils'

const skillCategories = [
  {
    category: 'Frontend',
    icon: <Globe className="h-8 w-8" />,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    skills: ['React.js', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5/CSS3', 'Tailwind CSS']
  },
  {
    category: 'Backend',
    icon: <Server className="h-8 w-8" />,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    skills: ['Node.js', 'Express.js', 'Python', 'REST APIs', 'GraphQL']
  },
  {
    category: 'Database',
    icon: <Database className="h-8 w-8" />,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    skills: ['MongoDB']
  },
  {
    category: 'Mobile',
    icon: <Smartphone className="h-8 w-8" />,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    skills: ['React Native']
  },
  {
    category: 'DevOps & Tools',
    icon: <Code className="h-8 w-8" />,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    skills: ['Git/GitHub', 'Docker', 'CI/CD']
  }
]

export default function Skills() {
  return (
    <section id="skills" className="py-20 bg-gray-50 dark:bg-dark-bg">
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
              Skills & Expertise
            </h2>
            <p className="text-xl text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              Technologies and tools I've mastered throughout my journey as a full-stack developer
            </p>
            <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full mt-4"></div>
          </motion.div>

          {/* Skills Grid - New Card Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skillCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                variants={fadeIn('up', categoryIndex * 0.1)}
                className="group"
              >
                <div className={`${category.bgColor} ${category.borderColor} border-2 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 group-hover:scale-105 relative overflow-hidden`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-r ${category.color} rounded-full -translate-y-16 translate-x-16`}></div>
                    <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r ${category.color} rounded-full translate-y-12 -translate-x-12`}></div>
                  </div>
                  
                  {/* Category Header */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-6">
                      <div className={`bg-gradient-to-r ${category.color} p-4 rounded-2xl text-white group-hover:rotate-12 transition-transform duration-300 shadow-lg`}>
                        {category.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary text-center mb-6">
                      {category.category}
                    </h3>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      {category.skills.map((skill, skillIndex) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            delay: categoryIndex * 0.1 + skillIndex * 0.1,
                            type: 'spring',
                            stiffness: 300
                          }}
                          viewport={{ once: true }}
                          whileHover={{ scale: 1.1 }}
                          className="inline-flex items-center px-4 py-2 bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-dark-border cursor-default"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            variants={fadeIn('up', 0.5)}
            className="text-center bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Always Learning, Always Growing
            </h3>
            <p className="text-lg text-gray-600 dark:text-dark-text-secondary mb-6">
              The tech world evolves rapidly, and I'm committed to staying current with the latest technologies and best practices.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Learning AI/ML', 'Exploring Web3', 'Cloud Architecture', 'Microservices'].map((learning) => (
                <span
                  key={learning}
                  className="px-4 py-2 bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary rounded-full text-sm font-medium shadow-md"
                >
                  {learning}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
