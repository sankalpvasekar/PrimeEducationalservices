'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, LogOut, Star, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { title: 'UPSC', sub: '(Prelim + Mains Complete Notes)' },
  { title: 'MPSC', sub: '(Prelim + Mains Complete Notes)' },
  { title: 'NEET', sub: '(Complete Study Notes)' },
  { title: 'JEE', sub: '(Complete Study Notes)' },
  { title: 'MH-CET', sub: '(Complete Study Notes)' },
  { title: 'पुलिस भरती', sub: '(Complete Study Kit)' },
  { title: 'तलाठी भरती', sub: '(Complete Study Kit)' },
  { title: 'AMVI - RTO', sub: '(Pre + Mains Notes)' },
  { title: 'अग्निवीर', sub: '(Complete Study Notes)' },
  { title: 'SSC', sub: '(CGL, CHSL, MTS)' },
  { title: 'Banking', sub: '(IBPS, SBI, RBI)' },
  { title: 'Railway', sub: '(RRB NTPC, Group-D)' },
  { title: 'Defence', sub: '(NDA, CDS, Army, Navy, Airforce)' },
  { title: 'TET / CTET', sub: '/ Teacher Bharti' },
  { title: 'Speaking English', sub: '(Communication Skills)' },
  { title: 'Business Ideas', sub: '(Startup Ideas)' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    if (!stored || !token) { router.push('/login'); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#C5A059]/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-[#C5A059] p-1.5 rounded-lg shadow-md">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723]">
              Prime<span className="text-[#C5A059]">Educational</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-[#A1887F]">👋 {user.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-[#5D4037] hover:text-red-500 transition-colors font-medium">
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-3">
          Premium Study <span className="text-[#C5A059]">Notes</span>
        </h1>
        <p className="text-[#A1887F] max-w-xl mx-auto">
          Master your exams with expert-curated study material. All 16 categories available below.
        </p>
      </header>

      {/* Cards Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat, idx) => (
            <div key={idx} className="premium-card group relative">
              <Star className="absolute top-3 right-3 w-4 h-4 text-[#C5A059]/30 group-hover:text-[#C5A059] transition-colors" />
              <div className="bg-[#5D4037]/10 p-3 rounded-xl mb-3">
                <BookOpen className="text-[#5D4037] w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#3E2723] mb-1 group-hover:text-[#C5A059] transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs text-[#A1887F] font-medium">{cat.sub}</p>
              <div className="mt-4 pt-3 border-t border-[#C5A059]/10 w-full">
                <button className="text-xs font-bold uppercase tracking-widest text-[#C5A059] hover:text-[#A68344] transition-colors">
                  Explore Notes →
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 py-8 border-t border-[#C5A059]/10 text-center px-6">
        <p className="text-[#A1887F] text-sm">&copy; 2026 Prime Educational Services. All rights reserved.</p>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#C5A059]/5 rounded-full border border-[#C5A059]/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-[#A1887F] uppercase tracking-widest">
            Powered by Next.js + Neon DB + Vercel
          </span>
        </div>
      </footer>
    </div>
  );
}
