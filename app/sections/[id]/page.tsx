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
      <div className="relative h-[160px] w-full lg:h-[220px]">
        {section.banner_url ? (
          <Image src={section.banner_url} alt={section.title} fill unoptimized className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[#3E2723] flex items-center justify-center">
             <Image src="/navbar.png" alt="Logo" width={150} height={45} unoptimized className="opacity-20 grayscale brightness-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723] via-transparent to-black/30"></div>
        
        <Link href="/" className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all z-10">
           <ChevronLeft size={20} />
        </Link>

        <div className="absolute bottom-4 left-6 right-6 text-white z-10 flex flex-col justify-end">
           <div className="self-start">
             <span className="text-[10px] font-bold uppercase tracking-widest bg-[#C5A059] px-2.5 py-0.5 rounded-full mb-1.5 inline-block shadow-lg">Premium Section</span>
           </div>
           <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-playfair)] font-bold leading-tight">{section.title}</h1>
           <p className="text-xs text-white/80 font-medium mt-0.5">{section.subtitle}</p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 mt-6">
        {/* Buy Now Section */}
        {!isPurchased && (
          <div className="bg-[#FFFBF2] rounded-3xl border-2 border-[#C5A059]/20 p-6 text-center mb-8 shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#C5A059]/5 rounded-full blur-2xl"></div>
            <h2 className="text-xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-2">Unlock This Section</h2>
            <p className="text-[#A1887F] text-xs font-medium mb-6 leading-relaxed">
              Get full lifetime access to all {pdfs.length} premium PDF study modules in the {section.title} category.
            </p>
            <button 
               disabled={processingPayment}
               className="w-full py-4 bg-[#C5A059] text-white rounded-2xl font-bold text-lg hover:bg-[#A68344] transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
               onClick={handlePayment}
            >
               {processingPayment ? <Loader2 className="animate-spin" /> : <ShoppingCart size={22} />}
               Buy Full Catalog Now
            </button>
            <div className="mt-4 flex items-center justify-center gap-4 text-[#A1887F]/60">
               <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} /> Secure Payment
               </div>
               <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                  <FileText size={14} /> Global Access
               </div>
            </div>
          </div>
        )}

        {/* PDF List */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-[#3E2723] mb-6 flex items-center gap-2">
             <FileText className="text-[#C5A059]" size={20} /> Course Curriculum
          </h3>

          {pdfs.map((pdf, idx) => (
            <div key={pdf.id} className="relative group">
              <div className={`bg-white rounded-2xl border border-[#C5A059]/10 p-6 flex items-center gap-5 transition-all duration-300 ${!isPurchased ? 'opacity-80' : 'hover:shadow-lg hover:border-[#C5A059]/40 cursor-pointer'}`} onClick={() => isPurchased && router.push(`/view/${pdf.id}`)}>
                <div className="bg-[#5D4037]/5 p-3 rounded-xl">
                   <FileText className="text-[#5D4037]" size={24} />
                </div>
                <div className="flex-1">
                   <h4 className="font-bold text-[#3E2723] group-hover:text-[#C5A059] transition-colors">{pdf.title}</h4>
                   <p className="text-[10px] text-[#A1887F] font-bold uppercase tracking-widest mt-1">Prime Study Material</p>
                </div>
                
                {!isPurchased && (
                  <div className="p-2 rounded-full bg-red-100 text-red-500 shadow-inner">
                    <Lock size={18} />
                  </div>
                )}
              </div>

              {!isPurchased && (
                <div className="absolute inset-0 bg-[#FDFBF7]/30 backdrop-blur-[2px] rounded-2xl pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
