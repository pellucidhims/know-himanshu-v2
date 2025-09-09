'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { fadeIn, staggerContainer, textVariant } from '../../lib/utils'
import ProjectModal from '../ui/project-modal'

const projects = [
  {
    id: 1,
    title: 'Solution Hub',
    subtitle: 'Question Answer Forum',
    description: 'An online portal where users can actively register and ask/answer questions with functionalities like upvote, edit, delete answers and questions, maintain and update profiles.',
    fullDescription: `<h4>What is Solution Hub?</h4>
    <p>It is a portal where users can ask (and answer) questions pertaining to system issues, common bugs, technical discussions etc. It enables users to find solution to common technical problems with a simple search thereby reducing the time and efforts to solve rare but recurring issues.</p>
    <h4>How to use Solution Hub?</h4>
    <p>Users first need to register themselves with Solution Hub using their Gmail id. Once registered, user can login to continue.<br />Once logged in, users can edit their profile section which has links to their facebook, linkedin, twitter profiles. In addition users can also upload their profile pictures.</p>
    <h4>What's special about Solution Hub?</h4>
    <p>Features include (but not limited to):</p>
    <ul>
    <li>Ask question by tagging one or more registered users if the user (one asking the question) feels some of the users know the answer to his/her question.</li>
    <li>See pool of questions/answers posted by other users on a common timeline.</li>
    <li>Users can maintain their individual profiles. The user is provided with the facility to edit various fields like Contact, DOB, SocialMedia Links. In addition to this, the user can also upload his/her profile picture</li>
    <li>The user can edit/remove questions and answers posted by him/her anytime.</li>
    <li>Users can also upvote a particular answer to a question which they find helpful which will be displayed as the top voted answer on timeline for that question.</li>
    <li>Users can bookmark their favourite questions which can be easily accessed later under "My Favourites" section.</li>
    </ul>`,
    tech: ['JavaScript', 'HTML', 'CSS', 'React', 'NodeJS', 'MongoDB', 'Heroku'],
    tags: ['QAForum', 'Question', 'Answer', 'Forum', 'Social', 'Solution', 'ReactJS', 'NodeJS', 'MongoDB'],
    image: '/projectSolutionhubIcon.png',
    github: '#',
    live: 'http://www.solutionhub-ui.com',
    category: 'Full Stack',
    author: 'Himanshu',
    published: 'April 2019',
  },
  {
    id: 2,
    title: 'Hazaar Carobar',
    subtitle: 'Buy/Sell refurbished cars',
    description: 'An app(Android) that simplifies the art and commerce of buying and selling refurbished cars. It connects sellers to potential buyers.',
    fullDescription: `<h4>What is Hazaar Carobar?</h4>
    <p>An app(Android) that simplifies the art and commerce of buying and selling refurbished cars. It connects sellers to potential buyers.</p>
    <h4>How to use Hazaar Carobar?</h4>
    <p>Users can download the app and can search, sort and scroll through a list of cars available on the portal. To do additional activities like bookmarking favourites, adding post to sell car, contact seller for buying etc. user needs to register with the App. Once registered, user can login and avail the benifits at large.</p>
    <h4>What's special about Hazaar Carobar?</h4>
    <p>Features include (but not limited to):</p>
    <ul>
    <li>Users can search, sort and scroll through a list of available cars.</li>
    <li>Bookmark favourites.</li>
    <li>Seller(s) can post advertisements to sell cars.</li>
    <li>Buyers can contact the seller via call or texts.</li>
    <li>Users can maintain profiles.</li>
    <li>Seller can mark an advertisement post as draft to be edited and published later point of time.</li>
    <li>Seller can mark respective listed cars as sold once the deal is done, or can reactivate the deal in case the deal is cancelled after initiation.</li>
    <li>Users can share the app with others via text/WhatsApp</li>
    <li>Admin can attach offers with active advertising posts and can mark a post as 'pick-of-the-day'</li>
    </ul>`,
    tech: ['JavaScript', 'HTML', 'CSS', 'React-Native', 'Android', 'NodeJS', 'MongoDB', 'Heroku'],
    tags: ['Buy', 'Sell', 'Used cars', 'Refurbished cars', 'Car selling App', 'Android', 'React Native'],
    image: '/projectHazaarCarobarIcon.png',
    github: '#',
    live: 'https://play.google.com/store/apps/details?id=com.hazaarcarobarui',
    category: 'Mobile App',
    author: 'Himanshu',
    published: 'June 2020',
  },
  {
    id: 3,
    title: 'Movie Buff',
    subtitle: 'Get movie suggestions',
    description: 'A web app where user can search, sort movie(s) by its name and release date. User can add/remove listed movies to their favourites list and can get random movie suggestions to watch.',
    fullDescription: `<h4>What is Movie Buff?</h4>
    <p>A web app where user can search, sort movie(s) by its name and release date. User can add/remove listed movies to their favourites list and can get random movie suggestions to watch.</p>
    <h4>How to use Movie Buff?</h4>
    <p>User just needs to visit the website link. He/She can then just search and sort movies as per requirement.</p>
    <h4>What's special about Movie Buff?</h4>
    <p>This app is solely built using Vanilla(pure) JavaScript, HTML and CSS.</p>
    <p>Features include:</p>
    <ul>
    <li>Searching movies with title.</li>
    <li>Sort movies by name and release date.</li>
    <li>Add/remove listed movies to/from their favourites section.</li>
    <li>Get random movie suggestions.</li>
    </ul>`,
    tech: ['JavaScript', 'HTML', 'CSS', 'Heroku'],
    tags: ['Movies', 'Search', 'Favorites', 'Vanilla JS', 'Entertainment'],
    image: '/projectMovieBuffIcon.png',
    github: '#',
    live: 'https://movie-buffed.herokuapp.com/',
    category: 'Frontend',
    author: 'Himanshu',
    published: 'May 2019',
  },
]

const categories = ['All', 'Full Stack', 'Frontend', 'Mobile App']

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleProjectClick = (project: any) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProject(null)
  }

  return (
    <section id="project" className="py-20 bg-white dark:bg-dark-surface">
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
              Featured Projects
            </h2>
            <p className="text-xl text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              A showcase of projects I've built throughout my career, demonstrating various technologies and solutions
            </p>
            <div className="w-24 h-1 bg-gradient-secondary mx-auto rounded-full mt-4"></div>
          </motion.div>

          {/* Projects Grid */}
          <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {projects.map((project, index) => (
              <motion.div
                key={`mobile-${project.id}`}
                variants={fadeIn('up', index * 0.1)}
                className="group flex-shrink-0 w-80 cursor-pointer"
                onClick={() => handleProjectClick(project)}
              >
                  <div className="bg-gray-50 dark:bg-dark-elevated rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-dark-border h-full">
                    {/* Project Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                        {project.github !== '#' && (
                          <motion.a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                          >
                            <Github className="h-5 w-5" />
                          </motion.a>
                        )}
                        {project.live !== '#' && (
                          <motion.a
                            href={project.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </motion.a>
                        )}
                      </div>
                    </div>

                    {/* Project Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                          {project.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {project.title}
                      </h3>

                      <p className="text-gray-600 dark:text-dark-text-secondary mb-4 leading-relaxed line-clamp-3">
                        {project.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Learn More Button */}
                      <div className="flex items-center justify-center pt-2 border-t border-gray-200 dark:border-dark-border">
                        <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                          <span>Learn more</span>
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden md:contents">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                variants={fadeIn('up', index * 0.1)}
                className="group cursor-pointer"
                onClick={() => handleProjectClick(project)}
              >
                <div className="bg-gray-50 dark:bg-dark-elevated rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-dark-border">
                  {/* Project Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                      {project.github !== '#' && (
                        <motion.a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                        >
                          <Github className="h-5 w-5" />
                        </motion.a>
                      )}
                      {project.live !== '#' && (
                        <motion.a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </motion.a>
                      )}
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                        {project.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-gray-600 dark:text-dark-text-secondary text-sm leading-relaxed mb-4">
                      {project.description}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-dark-text-secondary rounded text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Learn More */}
                    <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            variants={fadeIn('up', 0.8)}
            className="text-center bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Interested in Working Together?
            </h3>
            <p className="text-lg text-gray-600 dark:text-dark-text-secondary mb-6 max-w-2xl mx-auto">
              I'm always open to discussing new opportunities, innovative projects, and collaborative ventures.
            </p>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-glow transition-all duration-300"
            >
              Let's Talk
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        project={selectedProject}
      />
    </section>
  )
}
