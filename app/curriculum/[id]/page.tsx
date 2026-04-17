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

        {/* Content Modules - Redesigned to match Landing Page style */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
             {pdfs.length > 0 ? (
               pdfs.map((pdf, idx) => (
                 <div 
                   key={pdf.id} 
                   className="group relative bg-[#075E54]/5 rounded-xl border border-[#075E54]/10 overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col"
                 >
                    {/* PDF Thumbnail Preview */}
                    <div className="aspect-[4/3] bg-white relative overflow-hidden flex items-center justify-center p-4">
                        <img 
                          src={pdf.cloudinary_url?.replace('/upload/', '/upload/pg_1,c_fill,h_400,w_600/') + '.jpg'} 
                          alt={pdf.title}
                          className="w-full h-full object-contain shadow-sm rounded-sm border border-gray-100"
                          onError={(e) => {
                             (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/dffu9zh9p/image/upload/v1741168019/kntu3as6qreit7v7uay6.png'; // Placeholder if thumbnail fails
                          }}
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    </div>

                    {/* Metadata Detail Section (WhatsApp Style) */}
                    <div className="bg-[#075E54] p-3 flex items-center gap-3">
                        <div className="bg-[#FF1744] p-2 rounded flex-shrink-0">
                           <FileText className="text-white" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h3 className="text-white text-sm font-semibold truncate leading-tight">{pdf.title}</h3>
                           <p className="text-white/70 text-[10px] uppercase tracking-wider mt-0.5">PDF • Unlocked • Study Material</p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-3 bg-white border-t border-gray-50">
                        <button 
                          onClick={() => router.push(`/view/${pdf.id}`)}
                          className="w-full py-2.5 bg-[#075E54] hover:bg-[#128C7E] text-white rounded-lg text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                        >
                           <ShieldCheck size={16} /> Open Now
                        </button>
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
