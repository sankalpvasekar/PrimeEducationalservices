"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Lock, FileText, ShoppingCart, Loader2, ChevronLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Script from 'next/script';

interface Section {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  banner_url: string;
}

interface PDF {
  id: number;
  title: string;
  price: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SectionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<{ section: Section; pdfs: PDF[]; isPurchased: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchSection = async () => {
    try {
      const res = await fetch(`/api/sections/${id}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setData(result);
    } catch (err: any) {
      toast.error(err.message);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSection();
  }, [id]);

  const handlePayment = async () => {
    if (!data) return;
    
    // Guard: Redirect to login if user is not authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Please login to continue with your purchase');
      router.push('/login');
      return;
    }

    setProcessingPayment(true);
    try {
      // 1. Create Order
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: data.section.id, action: 'create-order' }),
      });
      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error);

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SZSjK7IcKFXYwj',
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Prime Educational Services',
        description: `Full access to ${data.section.title} library`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              sectionId: data.section.id
            }),
          });
          const verifyResult = await verifyRes.json();
          if (verifyRes.ok) {
            toast.success('Payment Successful! Library Unlocked.');
            fetchSection(); // Refresh to unlock PDFs
          } else {
            toast.error(verifyResult.error || 'Verification failed');
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('user') || '{}').name || '',
          email: JSON.parse(localStorage.getItem('user') || '{}').email || '',
        },
        theme: { color: '#C5A059' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="animate-spin text-[#C5A059] mb-4" size={40} />
        <p className="text-[#A1887F] font-bold uppercase tracking-widest text-xs">Loading Section...</p>
      </div>
    );
  }

  if (!data) return null;

  const { section, pdfs, isPurchased } = data;

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Banner & Header */}
      <div className="relative min-h-[250px] lg:min-h-[350px] w-full flex items-end">
        {section.banner_url ? (
          <Image src={section.banner_url} alt={section.title} fill unoptimized className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[#3E2723] flex items-center justify-center">
             <Image src="/navbar.png" alt="Logo" width={150} height={45} unoptimized className="opacity-20 grayscale brightness-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723] via-transparent/20 to-black/40"></div>
        
        <Link href="/" className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all z-20">
           <ChevronLeft size={24} />
        </Link>

        <div className="relative p-8 md:p-12 text-white z-10 w-full max-w-4xl mx-auto">
           <div className="flex flex-col gap-2">
             <span className="self-start text-[10px] font-black uppercase tracking-[0.2em] bg-[#C5A059] px-3 py-1 rounded-full shadow-xl">Premium Catalog</span>
             <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-black leading-tight drop-shadow-md">{section.title}</h1>
             <p className="text-sm md:text-base text-white/90 font-medium max-w-xl leading-relaxed">{section.subtitle}</p>
           </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 -mt-8 relative z-30">
        {/* Buy Now Section - Visible ONLY if NOT purchased */}
        {!isPurchased ? (
          <div className="bg-white rounded-[2.5rem] border border-[#C5A059]/20 p-8 md:p-10 text-center shadow-2xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723]">Unlock Full Access</h2>
              <p className="text-[#A1887F] text-sm font-medium leading-relaxed">
                Purchase this section to instantly unlock all <b>{pdfs.length} modules</b> and study materials.
              </p>
            </div>

            <button 
               disabled={processingPayment}
               className="w-full py-5 bg-[#C5A059] text-white rounded-2xl font-black text-xl hover:bg-[#A68344] transition-all shadow-[0_10px_40px_-10px_rgba(197,160,89,0.5)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
               onClick={handlePayment}
            >
               {processingPayment ? <Loader2 className="animate-spin" /> : <ShoppingCart size={24} />}
               Buy Now — ₹499
            </button>

            <div className="flex items-center justify-center gap-6 pt-2">
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#A1887F] uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-[#C5A059]" /> Secured
               </div>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#A1887F] uppercase tracking-widest">
                  <FileText size={14} className="text-[#C5A059]" /> Lifetime
               </div>
            </div>
          </div>
        ) : (
          /* PDF List - Visible ONLY if purchased */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between border-b border-[#C5A059]/10 pb-4">
              <h3 className="text-xl font-bold text-[#3E2723] flex items-center gap-3">
                 <FileText className="text-[#C5A059]" size={24} /> Your Curriculum
              </h3>
              <span className="text-[10px] font-black text-[#C5A059] bg-[#C5A059]/5 px-3 py-1 rounded-full uppercase tracking-widest">{pdfs.length} Modules</span>
            </div>

            <div className="grid gap-4">
              {pdfs.map((pdf) => (
                <div 
                  key={pdf.id} 
                  className="bg-white rounded-2xl border border-[#C5A059]/10 p-5 flex items-center gap-5 hover:shadow-xl hover:border-[#C5A059]/30 cursor-pointer transition-all active:scale-[0.99] group"
                  onClick={() => router.push(`/view/${pdf.id}`)}
                >
                  <div className="bg-[#5D4037]/5 p-3.5 rounded-2xl group-hover:bg-[#C5A059]/10 transition-colors">
                     <FileText className="text-[#5D4037] group-hover:text-[#C5A059]" size={28} />
                  </div>
                  <div className="flex-1">
                     <h4 className="font-bold text-[#3E2723] text-lg">{pdf.title}</h4>
                     <p className="text-[10px] text-[#A1887F] font-bold uppercase tracking-widest mt-0.5">Unlocked Material</p>
                  </div>
                  <div className="w-10 h-10 flex items-center justify-center text-[#C5A059]/20 group-hover:text-[#C5A059] transition-colors">
                    <ChevronLeft size={20} className="rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
