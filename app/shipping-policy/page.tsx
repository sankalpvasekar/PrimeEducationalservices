'use client';
import { Truck, Clock, MapPin, Search } from 'lucide-react';
import Link from 'next/link';

export default function ShippingPolicyPage() {
  return (
    <div className="flex-1 bg-[#FDFBF7] py-16 px-6 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 border-b border-[#C5A059]/10 pb-8 text-left">
           <div className="flex items-center gap-3 text-[#C5A059] mb-4">
              <Truck size={32} />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Delivery Logistics</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723]">Shipping Policy</h1>
           <p className="text-[#A1887F] mt-4 font-medium italic">Our commitment to ensuring your study books reach you reliably and swiftly.</p>
        </header>

        <div className="prose prose-brown max-w-none text-[#5D4037] space-y-12">
          
          <section className="bg-white rounded-3xl border border-[#C5A059]/10 p-8 shadow-sm">
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4 flex items-center gap-3 underline decoration-[#C5A059]/20">
                <Clock className="text-[#C5A059]" size={20} /> 1. Shipping Timelines
             </h2>
             <p className="leading-relaxed">
               Orders are typically processed and handed over to our shipping partners within **2-3 business days** of successful payment confirmation. Digital PDF modules are available for instant viewing after purchase.
             </p>
          </section>

          <section>
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4 flex items-center gap-3">
                <Search className="text-[#C5A059]" size={20} /> 2. Order Tracking
             </h2>
             <p className="leading-relaxed mb-4">
               Once your order is dispatched, you will receive a tracking number via email or SMS. You can use this number to track your package on the shipping provider's website.
             </p>
             <div className="bg-[#FFFBF2] p-6 rounded-2xl border border-[#C5A059]/10 flex items-center gap-4">
                <MapPin className="text-[#C5A059] shrink-0" size={24} />
                <p className="text-sm font-bold text-[#3E2723]">
                  We primarily ship via **India Post** for rural and nationwide reach.
                  <Link href="https://www.indiapost.gov.in/" className="ml-2 text-[#C5A059] underline hover:text-[#5D4037] transition-colors">Track on India Post</Link>
                </p>
             </div>
          </section>

          <section>
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4 flex items-center gap-3 text-red-700">
                <AlertCircle className="text-red-700" size={20} /> 3. Shipping Charges
             </h2>
             <p className="leading-relaxed">
               Shipping charges are calculated based on the weight of the books and the destination pincode. Total shipping costs will be displayed at checkout.
             </p>
          </section>

          <section className="bg-[#3E2723] text-white rounded-3xl p-8 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-xl font-bold mb-3">Delivery Issues?</h3>
               <p className="text-white/70 text-sm">If you experience any delay beyond the estimated timeline or receive a damaged package, please contact us within **24 hours** at <span className="text-[#C5A059] font-bold">primeeducationalservices515@gmail.com</span>.</p>
             </div>
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Truck size={100} />
             </div>
          </section>

        </div>
      </div>
    </div>
  );
}

import { AlertCircle } from 'lucide-react';
