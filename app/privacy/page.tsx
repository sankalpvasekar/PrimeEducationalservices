'use client';
import { Eye, ShieldCheck, Lock, Database } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-[#FDFBF7] py-16 px-6 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 border-b border-[#C5A059]/10 pb-8 text-left">
           <div className="flex items-center gap-3 text-[#C5A059] mb-4">
              <Eye size={32} />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Privacy Framework</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723]">Privacy Policy</h1>
           <p className="text-[#A1887F] mt-4 font-medium italic">Your data security is our highest priority at Prime Educational Services.</p>
        </header>

        <div className="prose prose-brown max-w-none text-[#5D4037] space-y-12">
          
          <section className="bg-white rounded-3xl border border-[#C5A059]/10 p-8 shadow-sm">
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4 flex items-center gap-3">
                <Database className="text-[#C5A059]" size={20} /> 1. Information We Collect
             </h2>
             <p className="leading-relaxed mb-4">
                To provide you with our study modules and physical delivery, we collect the following:
             </p>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0">
                <li className="flex items-center gap-2 text-sm font-bold bg-[#FDFBF7] p-3 rounded-xl border border-[#C5A059]/5">
                   <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full"></div> Name & Email
                </li>
                <li className="flex items-center gap-2 text-sm font-bold bg-[#FDFBF7] p-3 rounded-xl border border-[#C5A059]/5">
                   <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full"></div> Phone Number
                </li>
                <li className="flex items-center gap-2 text-sm font-bold bg-[#FDFBF7] p-3 rounded-xl border border-[#C5A059]/5">
                   <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full"></div> Delivery Address
                </li>
                <li className="flex items-center gap-2 text-sm font-bold bg-[#FDFBF7] p-3 rounded-xl border border-[#C5A059]/5">
                   <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full"></div> Payment Details (via Razorpay)
                </li>
             </ul>
          </section>

          <section>
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4 flex items-center gap-3">
                <ShieldCheck className="text-[#C5A059]" size={20} /> 2. Use of Information
             </h2>
             <p className="leading-relaxed mb-4">
               We use your information solely for the following purposes:
             </p>
             <ul className="space-y-3 list-none pl-0">
                <li className="flex gap-3 text-[#5D4037]/80 italic">
                  <span className="text-[#C5A059]">✔</span> Processing and delivering your orders.
                </li>
                <li className="flex gap-3 text-[#5D4037]/80 italic">
                  <span className="text-[#C5A059]">✔</span> Providing technical support for PDF access.
                </li>
                <li className="flex gap-3 text-[#5D4037]/80 italic">
                  <span className="text-[#C5A059]">✔</span> Sending critical account or order updates.
                </li>
             </ul>
          </section>

          <section>
             <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4 flex items-center gap-3">
                <Lock className="text-[#C5A059]" size={20} /> 3. Data Protection
             </h2>
             <p className="leading-relaxed">
               We implement robust security measures to protect your data. We do not sell your personal information to third parties. We share data only with third-party service providers (like Razorpay for payments or India Post for shipping) essential to fulfill your service requests.
             </p>
          </section>

        </div>
      </div>
    </div>
  );
}
