"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, Loader2, ChevronLeft, ShieldCheck, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Section {
  id: number;
  title: string;
  subtitle: string;
}

interface PDF {
  id: number;
  title: string;
  price: number;
}

export default function CurriculumPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<{ section: Section; pdfs: PDF[]; isPurchased: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const res = await fetch(`/api/sections/${id}`, { cache: 'no-store' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        
        // Security: If not purchased, redirect back to section page
        if (!result.isPurchased) {
          router.replace(`/sections/${id}`);
          return;
        }

        setData(result);
      } catch (err: any) {
        toast.error(err.message);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetchSection();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#C5A059] mb-4" size={40} />
        <p className="text-[#A1887F] font-bold uppercase tracking-widest text-xs">Accessing Library...</p>
      </div>
    );
  }

  if (!data) return null;

  const { section, pdfs } = data;

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Navigation - Minimalist Back Button only */}
        <div className="mb-8 border-b border-gray-100 pb-4">
           <Link href="/" className="inline-flex items-center gap-1 text-[#A1887F] hover:text-[#C5A059] text-sm font-bold uppercase tracking-widest transition-colors">
              <ChevronLeft size={16} /> Back to Library
           </Link>
        </div>

        {/* Content Modules - Redesigned to match Landing Page style */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
             {pdfs.length > 0 ? (
               pdfs.map((pdf, idx) => (
                 <div 
                   key={pdf.id} 
                   className="cursor-pointer"
                   onClick={() => router.push(`/view/${pdf.id}`)}
                 >
                   <div className="bg-[#FFFBF2] rounded-2xl border-2 border-[#C5A059] shadow-sm p-6 text-center transition-all duration-300 hover:border-[#C5A059]/40 hover:shadow-md hover:-translate-y-1 active:scale-[0.98]">
                     <h3 className="text-xl font-bold text-[#3E2723] leading-tight">{pdf.title}</h3>
                     <p className="text-[10px] text-[#A1887F] font-bold uppercase tracking-wider mt-2">Study Material • Unlocked</p>
                   </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-20 bg-[#FDFBF7] rounded-[2.5rem] border-2 border-dashed border-[#C5A059]/20 sm:col-span-2">
                  <p className="text-[#A1887F] font-medium italic">No materials found in this section yet.</p>
               </div>
             )}
          </div>
        </div>

      </main>
    </div>
  );
}
