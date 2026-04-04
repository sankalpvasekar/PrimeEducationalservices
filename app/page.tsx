'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SECTION_1 = [
  { id: 1, title: 'UPSC', sub: '(Prelim + Mains Complete Notes)' },
  { id: 2, title: 'MPSC', sub: '(Prelim + Mains Complete Notes)' },
  { id: 3, title: 'NEET', sub: '(Complete Study Notes)' },
  { id: 4, title: 'JEE', sub: '(Complete Study Notes)' },
  { id: 5, title: 'MH-CET', sub: '(Complete Study Notes)' },
  { id: 6, title: 'Police Bharti', sub: '(Complete Study Kit)' },
  { id: 7, title: 'Talathi Bharti', sub: '(Complete Study Kit)' },
  { id: 8, title: 'AMVI - RTO', sub: '(Pre + Mains Notes)' },
];

const SECTION_2 = [
  { id: 9, title: 'Agniveer', sub: '(Complete Study Notes)' },
  { id: 10, title: 'SSC', sub: '(CGL, CHSL, MTS)' },
  { id: 11, title: 'Banking', sub: '(IBPS, SBI, RBI)' },
  { id: 12, title: 'Railway', sub: '(RRB NTPC, Group-D)' },
  { id: 13, title: 'Defence', sub: '(NDA, CDS, Army, Navy, Airforce)' },
  { id: 14, title: 'TET / CTET / Teacher Bharti', sub: '' },
  { id: 15, title: 'Speaking English', sub: '' },
  { id: 16, title: 'Business Ideas', sub: '(Startup Ideas)' },
];

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.isAdmin) {
          router.push('/admin');
        }
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, [router]);

  return (
    <div className="flex-1 selection:bg-[#C5A059]/30">
      <main className="max-w-xl mx-auto py-12 px-6">
        
        {/* SECTION 1: Top 8 */}
        <section className="min-h-[calc(100vh-200px)] flex flex-col justify-start gap-4">

          <div className="grid gap-3">
            {SECTION_1.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.03 }}
                viewport={{ once: true, margin: "-50px" }}
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
        </section>

        {/* SECTION 2: Bottom 8 */}
        <section className="grid gap-3 mt-4">
          {SECTION_2.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.03 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <Link href={`/sections/${cat.id}`} className="block">
                <div className="bg-[#FFFBF2] rounded-2xl border-2 border-[#C5A059] shadow-sm p-4 text-center transition-all duration-300 hover:border-[#C5A059]/40 hover:shadow-md hover:-translate-y-1 active:scale-[0.98]">
                  <h3 className="text-xl font-bold text-[#3E2723] leading-tight">{cat.title}</h3>
                  {cat.sub && <p className="text-[10px] text-[#A1887F] font-bold uppercase tracking-wider mt-1">{cat.sub}</p>}
                </div>
              </Link>
            </motion.div>
          ))}
        </section>

      </main>
    </div>
  );
}
