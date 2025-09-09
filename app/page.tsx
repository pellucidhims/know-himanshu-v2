import Navbar from './components/navigation/navbar'
import Hero from './components/sections/hero'
import About from './components/sections/about'
import Skills from './components/sections/skills'
import Education from './components/sections/education'
import Experience from './components/sections/experience'
import Projects from './components/sections/projects'
import Blog from './components/sections/blog'
import Referral from './components/sections/referral'
import Contact from './components/sections/contact'

export default function Home() {
  return (
    <main className="min-h-screen w-full relative">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Education />
      <Experience />
      
      <Projects />
      <Blog />
      <Referral />
      <Contact />
      
      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-dark-bg text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Made with ❤️ and passion by{' '}
            <span className="text-primary-400 font-semibold">Himanshu</span>
            {' '} © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  )
}
