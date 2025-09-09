'use client'

import { Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github, Calendar, User, Tag } from 'lucide-react'
import Image from 'next/image'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: {
    id: number
    title: string
    subtitle: string
    description: string
    fullDescription: string
    tech: string[]
    tags: string[]
    image: string
    github: string
    live: string
    category: string
    author: string
    published: string
  } | null
}

export default function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  if (!project) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-4xl bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary-500 to-secondary-500">
                <div className="absolute inset-0 bg-black/20" />
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover mix-blend-overlay"
                />
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Header Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {project.title}
                  </h2>
                  <p className="text-xl text-white/90 mb-4">
                    {project.subtitle}
                  </p>
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{project.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{project.published}</span>
                    </div>
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                      {project.category}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 max-h-96 overflow-y-auto">
                {/* Live Demo Link */}
                {project.live && project.live !== '#' && (
                  <div className="mb-6">
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                      Project Live Demo - {project.live}
                    </a>
                  </div>
                )}

                {/* Description */}
                <div 
                  className="prose prose-gray dark:prose-invert max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: project.fullDescription }}
                />

                {/* Technology Stack */}
                {project.tech && project.tech.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
                      Technology Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded-lg text-sm font-medium hover:bg-secondary-200 dark:hover:bg-secondary-900/50 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="h-5 w-5 text-primary-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                        Tags
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-primary-600 dark:text-primary-400 text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border">
                <div className="flex flex-col sm:flex-row gap-4">
                  {project.live && project.live !== '#' && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      <ExternalLink className="h-5 w-5" />
                      View Live Demo
                    </a>
                  )}
                  
                  {project.github && project.github !== '#' && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text-primary rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-dark-surface transition-all duration-300"
                    >
                      <Github className="h-5 w-5" />
                      View Source
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
