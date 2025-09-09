# Himanshu Portfolio v2 🚀

A modern, responsive portfolio website built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. This is an enhanced version of the original portfolio with improved animations, better UX, and mobile-first design.

## ✨ Features

- **🌙 Dark/Light Theme Toggle** - Beautiful dark theme by default with smooth transitions
- **📱 Mobile-First & PWA Ready** - App-like experience on mobile devices
- **🎨 Smooth Animations** - Powered by Framer Motion for 60fps animations
- **⚡ Performance Optimized** - Fast loading with Next.js optimizations
- **📧 Contact Form Integration** - Direct contact with API integration
- **🎯 SEO Optimized** - Meta tags, Open Graph, and structured data
- **♿ Accessibility** - WCAG 2.1 AA compliant
- **📱 Responsive Design** - Looks great on all devices

## 🛠️ Tech Stack

- **Framework:** Next.js 13+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Theme:** Next Themes
- **API Integration:** Axios
- **Scrolling:** React Scroll

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pellucidhims/know-himanshu-v2.git
cd know-himanshu-v2
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

## 📁 Project Structure

```
know-himanshu-v2/
├── app/
│   ├── components/
│   │   ├── navigation/
│   │   │   └── navbar.tsx
│   │   ├── sections/
│   │   │   ├── hero.tsx
│   │   │   ├── about.tsx
│   │   │   ├── skills.tsx
│   │   │   ├── education.tsx
│   │   │   ├── experience.tsx
│   │   │   ├── projects.tsx
│   │   │   └── contact.tsx
│   │   └── ui/
│   │       └── theme-toggle.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   └── api.ts
│   ├── providers/
│   │   └── theme-provider.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   ├── images/
│   └── manifest.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🎨 Design System

### Color Palette
- **Primary:** Blue gradient (#0ea5e9 to #0284c7)
- **Secondary:** Orange/Yellow gradient (#f59e0b to #d97706)
- **Dark Theme:** Custom dark palette with proper contrast ratios

### Typography
- **Primary Font:** Inter (Google Fonts)
- **Monospace:** JetBrains Mono (Google Fonts)

### Animations
- **Entrance:** Fade-in with directional slides
- **Hover:** Scale and color transitions
- **Loading:** Smooth skeleton loaders
- **Scroll:** Reveal animations on viewport entry

## 📱 Mobile Optimization

- **Touch Targets:** Minimum 44px for accessibility
- **Font Scaling:** Responsive typography scale
- **Viewport:** Proper viewport meta tags
- **PWA Features:** Web app manifest for installation
- **Performance:** Optimized images and lazy loading

## 🌐 API Integration

The portfolio includes API integration for:
- Contact form submissions
- Blog posts (future feature)
- Project data (future feature)

API endpoints are configured in `app/lib/api.ts` with fallbacks for offline use.

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## 📊 Performance Features

- **Image Optimization:** Next.js Image component with WebP/AVIF
- **Code Splitting:** Automatic route-based splitting
- **Font Optimization:** Google Fonts with display swap
- **Compression:** Gzip compression enabled
- **Caching:** Optimized cache headers

## 🔧 Configuration

### Environment Variables
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.knowhimanshu.in
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_SITE_URL=https://knowhimanshu.in
```

### Customization
- Colors: Update `tailwind.config.js`
- Content: Modify section components
- Animations: Adjust Framer Motion variants in `lib/utils.ts`

## 📈 Analytics & SEO

- Google Analytics ready
- Open Graph meta tags
- Twitter Card support
- Structured data for rich snippets
- Sitemap generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Himanshu**
- Portfolio: [knowhimanshu.in](https://knowhimanshu.in)
- LinkedIn: [@pellucidhimanshu](https://linkedin.com/in/pellucidhimanshu)
- GitHub: [@pellucidhims](https://github.com/pellucidhims)
- Twitter: [@pelucidhimanshu](https://twitter.com/pelucidhimanshu)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first approach
- Framer Motion for smooth animations
- Vercel for hosting and deployment

---

Made with ❤️ and passion by Himanshu