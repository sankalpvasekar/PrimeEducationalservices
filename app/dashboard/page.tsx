'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 1, title: 'UPSC', sub: '(Prelim + Mains Complete Notes)' },
  { id: 2, title: 'MPSC', sub: '(Prelim + Mains Complete Notes)' },
  { id: 3, title: 'NEET', sub: '(Complete Study Notes)' },
  { id: 4, title: 'JEE', sub: '(Complete Study Notes)' },
  { id: 5, title: 'MH-CET', sub: '(Complete Study Notes)' },
  { id: 6, title: 'Police Bharti', sub: '(Complete Study Kit)' },
  { id: 7, title: 'Talathi Bharti', sub: '(Complete Study Kit)' },
  { id: 8, title: 'AMVI - RTO', sub: '(Pre + Mains Notes)' },
  { id: 9, title: 'Agniveer', sub: '(Complete Study Notes)' },
  { id: 10, title: 'SSC', sub: '(CGL, CHSL, MTS)' },
  { id: 11, title: 'Banking', sub: '(IBPS, SBI, RBI)' },
  { id: 12, title: 'Railway', sub: '(RRB NTPC, Group-D)' },
  { id: 13, title: 'Defence', sub: '(NDA, CDS, Army, Navy, Airforce)' },
  { id: 14, title: 'TET / CTET / Teacher Bharti', sub: '' },
  { id: 15, title: 'Speaking English', sub: '' },
  { id: 16, title: 'Business Ideas', sub: '(Startup Ideas)' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const handleFatalAuth = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
        toast.error('Session expired or unauthorized');
        router.push('/login');
    });
  }, [router]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    if (!stored || !token) { 
      handleFatalAuth();
      return; 
    }
    try {
      setUser(JSON.parse(stored));
    } catch (e) {
      handleFatalAuth();
    }
  }, [router, handleFatalAuth]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#C5A059]/20 border-t-[#C5A059] rounded-full animate-spin" />
          <p className="text-[#A1887F] text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FDFBF7] selection:bg-[#C5A059]/30">
      <main className="max-w-xl mx-auto py-12 px-6">
        
        <header className="mb-8 text-center">
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723]">Welcome back, {user.name.split(' ')[0]}</h2>
             <p className="text-sm text-[#A1887F] font-medium mt-1 uppercase tracking-widest text-[10px]">Your Premium Library is Ready</p>
        </header>

        <div className="grid gap-3">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Link href={`/sections/${cat.id}`} className="block">
                <div className="bg-[#FFFBF2] rounded-2xl border-2 border-[#C5A059] shadow-sm p-4 text-center transition-all duration-300 hover:border-[#C5A059]/40 hover:shadow-md hover:-translate-y-1 active:scale-[0.98]">
                  <h3 className="text-xl font-bold text-[#3E2723] leading-tight">{cat.title}</h3>
                  {cat.sub && <p className="text-[10px] text-[#A1887F] font-bold uppercase tracking-wider mt-1">{cat.sub}</p>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </main>
    </div>
  );
}
