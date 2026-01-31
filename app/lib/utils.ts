import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for animations and interactions
export const fadeIn = (direction: 'up' | 'down' | 'left' | 'right' = 'up', delay: number = 0) => {
  return {
    hidden: {
      y: direction === 'up' ? 80 : direction === 'down' ? -80 : 0,
      x: direction === 'left' ? 80 : direction === 'right' ? -80 : 0,
      opacity: 0,
    },
    show: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        type: 'tween' as const,
        duration: 1.2,
        delay: delay,
        ease: [0.25, 0.25, 0.25, 0.75] as const,
      },
    },
  }
}

export const staggerContainer = (staggerChildren: number = 0.1, delayChildren: number = 0) => {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: staggerChildren,
        delayChildren: delayChildren || 0,
      },
    },
  }
}

export const slideIn = (direction: 'left' | 'right' | 'up' | 'down', type: 'tween' | 'spring', delay: number, duration: number) => {
  return {
    hidden: {
      x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
      y: direction === 'up' ? '100%' : direction === 'down' ? '100%' : 0,
    },
    show: {
      x: 0,
      y: 0,
      transition: {
        type: type,
        delay: delay,
        duration: duration,
        ease: 'easeOut' as const,
      },
    },
  }
}

export const textVariant = (delay: number = 0) => {
  return {
    hidden: {
      y: -50,
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        duration: 1.25,
        delay: delay,
      },
    },
  }
}

export const zoomIn = (delay: number, duration: number) => {
  return {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'tween' as const,
        delay: delay,
        duration: duration,
        ease: 'easeOut' as const,
      },
    },
  }
}

// Constants from original portfolio
export const LINKS = [
  { id: 'home', label: 'Home', to: 'home' },
  { id: 'about', label: 'About', to: 'about' },
  { id: 'skills', label: 'Skills', to: 'skills' },
  { id: 'education', label: 'Education', to: 'education' },
  { id: 'experience', label: 'Experience', to: 'experience' },
  { id: 'project', label: 'Projects', to: 'project' },
  { id: 'games', label: 'Games', to: 'games' },
  { id: 'blog', label: 'Blog', to: 'blog' },
  { id: 'referral', label: 'Referrals', to: 'referral' },
  { id: 'contact', label: 'Contact', to: 'contact' },
]

export const INTRO_TEXTS = [
  "I'm Himanshu",
  'Firstly, thank you for heading over here',
  "I'm a Fullstack developer by profession",
  'Since you have already made till here..',
  'Do take some time to explore my profile',
  'I would love to hear from you :)',
]

export const COLOR_ARRAY = [
  '#7C4DFF',
  '#009688',
  '#673AB7',
  '#CDDC39',
  '#283593',
  '#ffb300',
]

/**
 * Detects user's country code from their IP address
 * Returns 'TH' for Thailand, or null if detection fails (defaults to IND)
 */
export async function detectUserCountry(): Promise<string | null> {
  try {
    // Using ipapi.co free service (supports CORS for client-side requests)
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch location')
    }
    
    const data = await response.json()
    // ipapi.co returns 'country_code' field (e.g., 'TH', 'IN')
    return data.country_code || null
  } catch (error) {
    console.error('Error detecting user country:', error)
    // Fallback: try alternative service
    try {
      const fallbackResponse = await fetch('https://ipinfo.io/json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        return fallbackData.country || null
      }
    } catch (fallbackError) {
      console.error('Fallback location detection also failed:', fallbackError)
    }
    
    return null
  }
}

export const EXPERIENCES = [
  {
    id: '2026',
    duration: '2026-Present',
    institute: 'Agoda',
    degree: 'Staff Software Engineer',
    stream: '',
    description: "As part of accommodation price display team, drive initiative to maintain consistency of pricing for users and improving the user experience to drive booking.",
    icon: 'web',
    iconColor: 'primary',
  },
  {
    id: '2023',
    duration: '2023-2025',
    institute: 'Walmart Global Tech',
    degree: 'Senior Software Engineer',
    stream: '',
    description: "Driving product discussions and solution design to develop and scale Subscription and Membership for Walmart Mexico and Canada users.",
    icon: 'web',
    iconColor: 'primary',
  },
  {
    id: '2020',
    duration: '2020-2023',
    institute: 'Walmart Global Tech',
    degree: 'Software Engineer III',
    stream: '',
    description:
      "At Walmart responsibilities include designing and developing product which helps to provide insights into sourcing and procurement data to drive business results. Along with BAU tasks also involved with doing POC's, participating actively in various ih-house hackathons, mentoring young talent and contributing to hire the best talent for Walmart.",
    icon: 'web',
    iconColor: 'secondary',
  },
  {
    id: '2019',
    duration: '2019-2020',
    institute: 'Ernst and Young GDS',
    degree: 'Senior Associate',
    stream: '',
    description: `Task involved design discussion and implementation of efficient and scalable solutions to business problems. Worked with frontend technologies like Javascript (ReactJS), CSS along with backend technologies like Nodejs, MongoDB to develop products for varied business requirements. Worked in an agile manner so as to effectively meet development and deployment timelines.`,
    icon: 'web',
    iconColor: 'primary',
  },
  {
    id: '2016',
    duration: '2016-2019',
    institute: 'HSBC Software Development India Ltd.',
    degree: 'Software Engineer | Senior Software Engineer',
    stream: '',
    description: `Developed an online portal by the name 'Solution Hub'  where users can actively register and ask/answer questions along with many other functionalities like upvote, edit, delete answers and questions, maintain and update his/her profile.Technologies used include - ReactJS, NodeJS, ExpressJS, Multer, MongoDB etc. Developed a portal for HSBCNet users to download reports with an enhanced UI, built using ReactJS. Developed UI screens for on-boarding HSBC's commercial customers. The customer approaches the bank RM's who then guide bank's staff to onboard the customer by creating a case. Bank staff feeds in customer details and attaches relevant services to the customer. At the end PDF is generated which will be signed by the customer. The customer, once a case is created for them can also login via customer portal and edit details by a responsive Ui.`,
    icon: 'business',
    iconColor: 'secondary',
  },
  {
    id: '2015',
    duration: 'June 2015 - July 2015',
    institute: 'Truly Madly Matchmakers Pvt. Ltd.',
    degree: 'Undergraduate Intern',
    stream: '',
    description: `Interaction with EC2 machines or Elastic Compute Cloud machines on which 'Not only' (No) SQL such as REDIS (Remote Dictionary Server) was to be installed along with setting up of master-slave configuration and monitoring the same with the help of another tool called Sentinel that is used to monitor the proper functioning of the master-slave configuration and send mails in case of failure. All this was done using Boto Fabric. Setting up of alarms (using Boto Fabric) to monitor a particular instance with respect to various metrics viz. CPU utilization, Memory utilization, Disk utilization, Network threshold etc. was done to send alert mails to specified mail id's whenever the respective values crossed the set threshold values.`,
    icon: 'computer',
    iconColor: 'primary',
  },
]
