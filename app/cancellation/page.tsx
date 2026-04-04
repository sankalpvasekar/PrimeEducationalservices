'use client';
import { XCircle, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function CancellationPage() {
  return (
    <div className="flex-1 bg-[#FDFBF7] py-16 px-6 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 border-b border-[#C5A059]/10 pb-8 text-left">
           <div className="flex items-center gap-3 text-[#C5A059] mb-4">
              <XCircle size={32} />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Policy Transparency</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723]">Cancellation & Refund</h1>
           <p className="text-[#A1887F] mt-4 font-medium italic">Our procedures for order changes, returns, and digital access.</p>
        </header>

        <div className="prose prose-brown max-w-none text-[#5D4037] space-y-12">
          
          <section className="bg-white rounded-3xl border border-[#C5A059]/10 p-8 shadow-sm group">
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4 flex items-center gap-3 decoration-[#3E2723]">
                <XCircle className="text-[#C5A059]" size={20} /> 1. Order Cancellation
             </h2>
             <p className="leading-relaxed">
               Orders for physical books can be cancelled within **24 hours** of purchase, provided they have not yet been dispatched. Once an order is shipped, cancellation is no longer possible.
             </p>
          </section>

          <section className="bg-red-50/30 rounded-3xl border border-red-200 p-8">
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-red-800 mb-4 flex items-center gap-3">
                <AlertTriangle className="text-red-700" size={20} /> 2. Non-Refundable Items
             </h2>
             <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                   <p className="leading-relaxed text-red-900 font-medium">
                     Please note that all **Digital Products** (PDF modules, Video courses) are strictly **non-refundable**. 
                     Due to the nature of digital intellectual property, access cannot be revoked once granted.
                   </p>
                </div>
                <div className="w-full md:w-32 h-32 bg-red-100 rounded-2xl flex items-center justify-center shrink-0 border border-red-200">
                   <Lock size={48} className="text-red-400" />
                </div>
             </div>
          </section>

          <section>
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4 flex items-center gap-3">
                <RefreshCw className="text-[#C5A059]" size={20} /> 3. Refund Eligibility
             </h2>
             <p className="leading-relaxed mb-4">
               For physical books, refund is eligible only in cases of:
             </p>
             <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Receiving a damaged or torn book.</li>
                <li>Receiving the incorrect study module from our side.</li>
             </ul>
             <p className="leading-relaxed italic">
                Refunds will be processed back to the original payment method within **7-10 working days** after the book is returned and verified.
             </p>
          </section>

          <footer className="pt-12 mt-12 border-t border-[#C5A059]/10 flex flex-col items-center justify-center text-center">
             <HelpCircle className="text-[#C5A059] mb-4" size={32} />
             <h3 className="text-xl font-bold text-[#3E2723] mb-3">Questions about your refund?</h3>
             <p className="text-sm text-[#A1887F] font-medium mb-6">Reach out to our Pandharpur support desk via WhatsApp or Email.</p>
             <Link href="/contact" className="px-8 py-3 bg-[#5D4037] text-white rounded-full font-bold text-sm hover:hover:bg-[#4E342E] transition-all shadow-lg active:scale-95"> Contact Support Now </Link>
          </footer>

        </div>
      </div>
    </div>
  );
}

import { Lock } from 'lucide-react';
