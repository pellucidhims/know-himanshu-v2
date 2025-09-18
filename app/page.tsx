import Navbar from './components/navigation/navbar'
import Hero from './components/sections/hero'
import About from './components/sections/about'
import Skills from './components/sections/skills'
import Education from './components/sections/education'
import Experience from './components/sections/experience'
import Projects from './components/sections/projects'
import Games from './components/sections/games'
import Blog from './components/sections/blog'
import Referral from './components/sections/referral'
import Contact from './components/sections/contact'
import FriendsCharacter from './components/ui/friends-character'
import FloatingGamesButton from './components/ui/floating-games-button'

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
      <Games />
      <Blog />
      <Referral />
      <Contact />
      
      {/* Friends Characters - Scattered across sections */}
      <FriendsCharacter sectionId="skills" character="Ross" position="right" offset={-50} />
      <FriendsCharacter sectionId="education" character="Rachel" position="left" offset={0} />
      <FriendsCharacter sectionId="project" character="Chandler" position="left" offset={30} />
      <FriendsCharacter sectionId="experience" character="Monica" position="right" offset={-30} />
      <FriendsCharacter sectionId="games" character="Joey" position="right" offset={-20} />
      <FriendsCharacter sectionId="contact" character="Phoebe" position="left" offset={20} />
      <FriendsCharacter sectionId="referral" character="Ross" position="right" offset={20} />
      
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

      {/* Floating Games Button */}
      <FloatingGamesButton />
    </main>
  )
}
