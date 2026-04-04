'use client';
import { ShieldCheck, FileText, Gavel, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex-1 bg-[#FDFBF7] py-16 px-6 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 border-b border-[#C5A059]/10 pb-8">
           <div className="flex items-center gap-3 text-[#C5A059] mb-4">
              <Gavel size={32} />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Legal Framework</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723]">Terms & Conditions</h1>
           <p className="text-[#A1887F] mt-4 font-medium">Effective Date: April 2026</p>
        </header>

        <div className="prose prose-brown max-w-none text-[#5D4037] space-y-12">
          
          <section>
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4 flex items-center gap-2">
                <FileText className="text-[#C5A059]" size={20} /> 1. Introduction
             </h2>
             <p className="leading-relaxed">
                Welcome to Prime Educational Services. By accessing our website and purchasing our premium study materials, you agree to comply with and be bound by the following terms and conditions of use.
             </p>
          </section>

          <section>
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4 flex items-center gap-2">
                <Scale className="text-[#C5A059]" size={20} /> 2. Use of Services
             </h2>
             <p className="leading-relaxed mb-4">
                Users are responsible for ensuring the accuracy of their account information. You agree to use our services only for lawful purposes and in a way that does not infringe the rights of others.
             </p>
             <ul className="list-disc pl-6 space-y-2">
                <li>Account security is the sole responsibility of the user.</li>
                <li>Commercial redistribution of our study notes is strictly prohibited.</li>
                <li>Digital content is subject to anti-piracy protections.</li>
             </ul>
          </section>

          <section>
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4 flex items-center gap-2">
                <ShieldCheck className="text-[#C5A059]" size={20} /> 3. Intellectual Property
             </h2>
             <p className="leading-relaxed">
                All content, including text, logos, and digital study modules, is the exclusive intellectual property of Prime Educational Services (Neha Book Industries). No part of this material may be copied or shared without written consent.
             </p>
          </section>

          <section className="bg-[#FFFBF2] p-8 rounded-3xl border border-[#C5A059]/10">
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4 flex items-center gap-2 text-red-700">
                <AlertCircle className="text-red-700" size={20} /> 4. No Refund Policy
             </h2>
             <p className="leading-relaxed font-bold text-[#3E2723]">
                All sales are final. Once a digital study module (PDF) is unlocked or a physical book is shipped, Prime Educational Services does not offer refunds or exchanges, except in cases of proven damage.
             </p>
          </section>

        </div>
      </div>
    </div>
  );
}

import { AlertCircle } from 'lucide-react';
