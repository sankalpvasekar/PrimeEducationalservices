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
  cloudinary_url: string;
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

        {/* Content Modules - Single Strip Design */}
        <div className="space-y-3">
             {pdfs.length > 0 ? (
               pdfs.map((pdf) => (
                 <div 
                   key={pdf.id} 
                   onClick={() => router.push(`/view/${pdf.id}`)}
                   className="group relative bg-[#075E54] hover:bg-[#128C7E] rounded-xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer flex items-center p-4 gap-4"
                 >
                    {/* Icon Section (Red Box) */}
                    <div className="bg-[#FF1744] p-3 rounded-xl flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                       <FileText className="text-white" size={24} />
                    </div>

                    {/* Metadata Section */}
                    <div className="flex-1 min-w-0">
                         <h3 className="text-white text-base font-bold truncate tracking-tight">{pdf.title}</h3>
                         <p className="text-white/75 text-[10px] font-black uppercase tracking-[0.1em] mt-1">PDF • Unlocked • Study Material</p>
                    </div>

                    {/* Security Visual */}
                    <div className="flex-shrink-0 opacity-20 group-hover:opacity-100 transition-opacity pr-2">
                       <ShieldCheck className="text-white" size={20} />
                    </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-20 bg-[#FDFBF7] rounded-[2.5rem] border-2 border-dashed border-[#C5A059]/20">
                  <p className="text-[#A1887F] font-medium italic">No materials found in this section yet.</p>
               </div>
             )}
        </div>

      </main>
    </div>
  );
}
