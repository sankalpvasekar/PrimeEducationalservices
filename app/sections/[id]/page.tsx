"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Lock, FileText, ShoppingCart, Loader2, ChevronLeft, ShieldCheck, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Script from 'next/script';

interface Section {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  banner_url: string;
  price: number;
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
      
      // Remove automatic redirect, let user see the section page
      // if (result.isPurchased) {
      //   router.replace(`/curriculum/${id}`);
      //   return;
      // }

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
            router.push(`/curriculum/${data.section.id}`);
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

  const handleShare = async () => {
    if (!data?.section) return;
    const shareData = {
      title: data.section.title,
      text: `Get full access to ${data.section.title} on Prime Educational Services`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy link');
      }
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
    <div className="min-h-screen bg-white pb-20 select-none">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <main className="max-w-xl mx-auto px-6 pt-10 relative">
        {/* Back Button & Share */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#A1887F] hover:text-[#C5A059] transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Back</span>
          </Link>

          <button 
            onClick={handleShare}
            className="p-3 bg-white border border-[#C5A059]/10 rounded-2xl shadow-sm text-[#C5A059] hover:bg-[#FDFBF7] transition-all"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Section Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#3E2723]">{section.title}</h1>
          {section.subtitle && <p className="text-sm text-[#A1887F] mt-2 font-medium">{section.subtitle}</p>}
        </div>

        {/* Poster Image Container */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-10">
          {section.banner_url ? (
            <div className="w-full flex justify-center bg-white">
              <img 
                src={section.banner_url} 
                alt={section.title} 
                className="w-full h-auto object-contain"
              />
            </div>
          ) : (
            <div className="aspect-video bg-[#FDFBF7] flex items-center justify-center">
               <Image src="/navbar.png" alt="Logo" width={150} height={45} unoptimized className="opacity-20 grayscale" />
            </div>
          )}
        </div>

        {/* Action Area */}
        <div className="flex flex-col items-center gap-8">
          <button 
             disabled={processingPayment}
             className="w-full py-4 md:py-5 bg-[#C5A059] text-white rounded-[2rem] font-bold text-xl md:text-2xl hover:bg-[#A68344] transition-all shadow-[0_15px_35px_-5px_rgba(197,160,89,0.4)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
             onClick={isPurchased ? () => router.push(`/curriculum/${id}`) : handlePayment}
          >
             {processingPayment ? <Loader2 className="animate-spin" /> : null}
             {isPurchased ? 'Go To PDF (Unlocked)' : `Buy Now — ₹${section.price || 499}`}
          </button>

          <div className="flex items-center gap-6 text-[#A1887F]/40">
             <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-[#C5A059]/60" /> Secure
             </div>
             <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                <FileText size={14} className="text-[#C5A059]/60" /> Lifetime
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
