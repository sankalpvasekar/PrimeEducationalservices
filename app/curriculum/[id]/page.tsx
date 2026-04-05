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
        const res = await fetch(`/api/sections/${id}`);
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
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-8">
          <div className="flex flex-col gap-1">
             <Link href="/" className="inline-flex items-center gap-1 text-[#A1887F] hover:text-[#C5A059] text-xs font-bold uppercase tracking-widest transition-colors mb-2">
                <ChevronLeft size={14} /> Back to Library
             </Link>
             <h1 className="text-3xl font-bold text-[#3E2723]">{section.title}</h1>
             <p className="text-sm text-[#A1887F] font-medium">Your Unlocked Materials</p>
          </div>
          <div className="hidden md:flex flex-col items-end">
             <div className="bg-[#C5A059]/10 text-[#C5A059] px-4 py-2 rounded-2xl flex items-center gap-2">
                <ShoppingBag size={18} />
                <span className="text-sm font-bold uppercase tracking-widest">Unlocked</span>
             </div>
          </div>
        </div>

        {/* Content Modules */}
        <div className="space-y-6">
          <div className="grid gap-4">
             {pdfs.length > 0 ? (
               pdfs.map((pdf) => (
                 <div 
                   key={pdf.id} 
                   className="bg-[#FDFBF7] rounded-[2rem] border border-[#C5A059]/10 p-6 flex items-center gap-6 hover:shadow-xl hover:border-[#C5A059]/40 transition-all cursor-pointer group"
                   onClick={() => router.push(`/view/${pdf.id}`)}
                 >
                   <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
                      <FileText className="text-[#C5A059]" size={32} />
                   </div>
                   <div className="flex-1">
                      <h4 className="font-bold text-[#3E2723] text-lg md:text-xl group-hover:text-[#C5A059] transition-colors">{pdf.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                         <span className="text-[10px] text-[#A1887F] font-bold uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-gray-100 italic">Premium Materials</span>
                         <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck size={12} /> Secure Access
                         </span>
                      </div>
                   </div>
                   <button className="bg-[#C5A059] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-[#C5A059]/20 hover:bg-[#A68344] active:scale-95 transition-all">
                      Open Notes
                   </button>
                 </div>
               ))
             ) : (
               <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                  <p className="text-[#A1887F] font-medium">No materials found in this section yet.</p>
               </div>
             )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-16 text-center">
           <p className="text-[9px] text-[#A1887F] uppercase tracking-[0.3em] inline-flex items-center gap-2 bg-[#FDFBF7] px-6 py-2 rounded-full border border-gray-100">
              <ShieldCheck size={12} className="text-[#C5A059]" /> All Materials are watermarked and protected by Prime Educational Services
           </p>
        </div>
      </main>
    </div>
  );
}
