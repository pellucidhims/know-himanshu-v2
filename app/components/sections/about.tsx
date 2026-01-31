'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { fadeIn, staggerContainer, textVariant } from '../../lib/utils'

export default function About() {
  return (
    <section id="about" className="py-20 bg-white dark:bg-dark-surface">
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
              About Me
            </h2>
            <div className="w-24 h-1 bg-gradient-secondary mx-auto rounded-full"></div>
          </motion.div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              variants={fadeIn('right', 0.2)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-secondary-600 dark:text-secondary-400">
                  Who Am I?
                </h3>
                
                <div className="text-lg text-gray-700 dark:text-dark-text-secondary space-y-4 leading-relaxed">
                  <p>
                    Professionally, I am an all round web developer.
                  </p>
                  
                  <p>
                    I am a senior developer with good knowledge of front-end as well
                    as back-end technologies.
                  </p>
                  
                  <p>
                    I love structure and order and stand for quality. I love
                    spending time on fixing little details and optimizing web apps.
                    Also I like working in a team, owing to lively human interaction
                    plus, one learns faster and much more. As the saying goes:{' '}
                    <em className="italic text-primary-600 dark:text-primary-400">
                      "two heads are better than one"
                    </em>.
                  </p>
                  
                  <p>
                    Special mention to the fact that I also have relative experience
                    of working with legacy technologies like Mainframes. And trust
                    me when I say{' '}
                    <strong className="font-bold text-primary-600 dark:text-primary-400">
                      "technology evolved for better"
                    </strong>{' '}
                    from a developers point of view!
                  </p>
                  
                  <p>
                    I also like to support local businesses and as a result,
                    whenever possible, try to build small utility web and mobile
                    apps for them.
                  </p>
                  
                  <p>
                    In my free time I like to read informative blogs, scroll through
                    a lot of Q&A's on Quora, listen to soothing music and
                    sketching.
                  </p>
                </div>
              </div>

              {/* Skills highlights */}
              <motion.div
                variants={fadeIn('up', 0.4)}
                className="grid grid-cols-2 gap-4 mt-8"
              >
                <div className="bg-gradient-primary p-4 rounded-lg text-white text-center">
                  <div className="text-2xl font-bold">9+</div>
                  <div className="text-sm">Years Experience</div>
                </div>
                <div className="bg-gradient-secondary p-4 rounded-lg text-white text-center">
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-sm">Projects Completed</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Image */}
            <motion.div
              variants={fadeIn('left', 0.3)}
              className="relative"
            >
              <div className="relative mx-auto w-full max-w-md">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-3xl transform rotate-6 opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary-400 to-primary-400 rounded-3xl transform -rotate-6 opacity-20"></div>
                
                {/* Main image container */}
                <div className="relative bg-white dark:bg-dark-elevated rounded-3xl p-2 shadow-dark-lg">
                  <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden">
                    <Image
                      src="/aboutIcon.png"
                      alt="About Himanshu"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-20, 20, -20] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 w-16 h-16 bg-primary-500 rounded-full opacity-80 flex items-center justify-center"
                >
                  <span className="text-white font-bold text-lg">💻</span>
                </motion.div>
                
                <motion.div
                  animate={{ y: [20, -20, 20] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -left-6 w-12 h-12 bg-secondary-500 rounded-full opacity-80 flex items-center justify-center"
                >
                  <span className="text-white font-bold">🚀</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
