'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, ArrowDown } from 'lucide-react'
import Image from 'next/image'
import { INTRO_TEXTS, COLOR_ARRAY, fadeIn, textVariant } from '../../lib/utils'

export default function Hero() {
  const [currentText, setCurrentText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [colorIndex, setColorIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const type = () => {
      const current = INTRO_TEXTS[currentIndex]
      
      if (isDeleting) {
        setCurrentText(current.substring(0, currentText.length - 1))
      } else {
        setCurrentText(current.substring(0, currentText.length + 1))
      }

      let delta = 150 - Math.random() * 100

      if (isDeleting) {
        delta /= 2
      }

      if (!isDeleting && currentText === current) {
        delta = 2000
        setIsDeleting(true)
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false)
        setCurrentIndex((prev) => (prev + 1) % INTRO_TEXTS.length)
        setColorIndex((prev) => (prev + 1) % COLOR_ARRAY.length)
        delta = 500
      }

      timeoutRef.current = setTimeout(type, delta)
    }

    timeoutRef.current = setTimeout(type, 150)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentText, currentIndex, isDeleting])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  const downloadCV = () => {
    const link = document.createElement('a')
    link.href = '/HimanshuResume.pdf'
    link.download = `Himanshu (7 Years, Walmart) - ${new Date().toLocaleDateString()}.pdf`
    link.click()
  }

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about')
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-dark relative overflow-hidden">
      {/* Background particles/effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            variants={fadeIn('right', 0.2)}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            <motion.div
              variants={textVariant(0.5)}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                <span className="text-secondary-500">Hey,</span>
                <br />
                <div className="relative min-h-[7rem] md:min-h-[10rem]">
                  {/* Invisible longest text to reserve space - allows wrapping */}
                  <div 
                    className="invisible text-5xl md:text-7xl font-bold leading-tight"
                    aria-hidden="true"
                  >
                    {INTRO_TEXTS.reduce((a, b) => a.length > b.length ? a : b)}|
                  </div>
                  
                  {/* Visible typewriter text - positioned absolutely */}
                  <div 
                    className="absolute top-0 left-0 w-full transition-colors duration-500 text-5xl md:text-7xl font-bold leading-tight"
                    style={{ color: COLOR_ARRAY[colorIndex] }}
                  >
                    {currentText}
                    <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                      |
                    </span>
                  </div>
                </div>
              </h1>
            </motion.div>

            <motion.p
              variants={textVariant(0.8)}
              className="text-xl md:text-2xl text-gray-600 dark:text-dark-text-secondary mb-8 leading-relaxed"
            >
              Senior Software Engineer at Walmart Global Tech
            </motion.p>

            <motion.div
              variants={fadeIn('up', 1)}
              className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadCV}
                className="inline-flex items-center px-8 py-4 bg-gradient-secondary text-white rounded-lg font-semibold shadow-lg hover:shadow-glow-secondary transition-all duration-300"
              >
                <Download className="mr-2 h-5 w-5" />
                Download CV
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToAbout}
                className="inline-flex items-center px-8 py-4 border-2 border-primary-500 text-primary-500 rounded-lg font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300"
              >
                Learn More
                <ArrowDown className="ml-2 h-5 w-5" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Profile Image */}
          <motion.div
            variants={fadeIn('left', 0.4)}
            initial="hidden"
            animate="show"
            className="relative"
          >
            <div className="relative mx-auto w-80 h-80 lg:w-96 lg:h-96">
              {/* Animated border */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 p-2"
              >
                <div className="w-full h-full rounded-full bg-white dark:bg-dark-surface"></div>
              </motion.div>
              
              {/* Profile Image */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="absolute inset-2 rounded-full overflow-hidden"
              >
                <Image
                  src="/displayProfilePicture.jpg"
                  alt="Himanshu Profile"
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-primary-500 rounded-full opacity-80"
              ></motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 w-8 h-8 bg-secondary-500 rounded-full opacity-80"
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-400 dark:border-dark-text-secondary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 dark:bg-dark-text-secondary rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  )
}
