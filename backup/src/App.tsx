import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, BookOpen, LogIn, ChevronDown, GraduationCap, Star } from 'lucide-react'

interface Category {
  id: number
  title: string
  subtitle: string
  is_premium: boolean
}

const App = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fallback data in case API isn't running yet during dev
        const fallbackData = [
          { id: 1, title: "UPSC", subtitle: "(Prelim + Mains Complete Notes)", is_premium: true },
          { id: 2, title: "MPSC", subtitle: "(Prelim + Mains Complete Notes)", is_premium: true },
          { id: 3, title: "NEET", subtitle: "(Complete Study Notes)", is_premium: true },
          { id: 4, title: "JEE", subtitle: "(Complete Study Notes)", is_premium: true },
          { id: 5, title: "MH-CET", subtitle: "(Complete Study Notes)", is_premium: true },
          { id: 6, title: "पुलिस भरती", subtitle: "(Complete Study Kit)", is_premium: true },
          { id: 7, title: "तलाठी भरती", subtitle: "(Complete Study Kit)", is_premium: true },
          { id: 8, title: "AMVI - RTO", subtitle: "(Pre + Mains Notes)", is_premium: true },
          { id: 9, title: "अग्निवीर", subtitle: "(Complete Study Notes)", is_premium: true },
          { id: 10, title: "SSC", subtitle: "(CGL, CHSL, MTS)", is_premium: true },
          { id: 11, title: "Banking", subtitle: "(IBPS, SBI, RBI)", is_premium: true },
          { id: 12, title: "Railway", subtitle: "(RRB NTPC, Group-D)", is_premium: true },
          { id: 13, title: "Defence", subtitle: "(NDA, CDS, Army, Navy, Airforce)", is_premium: true },
          { id: 14, title: "TET / CTET", subtitle: "/ Teacher Bharti", is_premium: true },
          { id: 15, title: "Speaking English", subtitle: "(Communication Skills)", is_premium: true },
          { id: 16, title: "Business Ideas", subtitle: "(Startup Ideas)", is_premium: true },
        ];

        setCategories(fallbackData);
        setLoading(false);

        // Attempt to fetch from real API
        const res = await fetch('http://localhost:8000/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.log("Using fallback data");
      }
    };
    fetchCategories();
  }, [])

  const visibleCategories = categories

  return (
    <div className="min-h-screen font-sans">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gold/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gold p-1.5 rounded-lg shadow-premium">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-display font-bold text-leather-dark tracking-tight">
              Prime<span className="text-gold">Educational</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="nav-link">Home</a>
            <a href="#" className="nav-link">Courses</a>
            <button className="flex items-center gap-2 bg-leather px-6 py-2 rounded-full text-white font-semibold hover:bg-leather-dark transition-all">
              <LogIn className="w-4 h-4" />
              Login
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-leather" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[73px] left-0 w-full bg-white border-b border-gold/10 z-40 p-6 flex flex-col gap-4 shadow-lg"
          >
            <a href="#" className="text-leather-dark font-medium" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#" className="text-leather-dark font-medium" onClick={() => setIsMenuOpen(false)}>Courses</a>
            <button className="w-full bg-leather text-white py-3 rounded-xl font-bold">Login</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="px-6 py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold text-leather-dark mb-4 leading-tight">
            Premium Study <span className="text-gold">Notes</span>
          </h1>
          <p className="text-leather/60 max-w-2xl mx-auto md:text-lg">
            Master your exams with our expert-curated study material for UPSC, MPSC, NEET, JEE, and more.
          </p>
        </motion.div>
      </header>

      {/* Card Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {visibleCategories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="premium-card group"
              >
                <div className="absolute top-4 right-4">
                  <Star className="w-4 h-4 text-gold/30 group-hover:text-gold transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-leather-dark mb-2 group-hover:text-gold transition-all duration-300">
                  {cat.title}
                </h3>
                <p className="text-sm text-leather/60 font-medium">
                  {cat.subtitle}
                </p>
                <div className="mt-4 pt-4 border-t border-gold/10 w-full flex justify-center">
                  <button className="text-xs font-bold uppercase tracking-widest text-gold hover:text-gold-dark transition-colors">
                    Explore Notes
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Scroll Effect Indication */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center text-gold/40 text-sm font-medium italic underline decoration-gold/20"
        >
          Scroll to explore all 16 collections
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 py-12 border-t border-gold/10 text-center px-6">
        <p className="text-leather/40 text-sm">
          &copy; 2026 Prime Educational Services. All rights reserved.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gold/5 rounded-full border border-gold/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-leather/60 uppercase tracking-widest">
            Powered by FastAPI backend (serverless API design for Vercel deployment)
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App
