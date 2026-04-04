'use client';
import { Phone, Mail, MapPin, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="flex-1 bg-[#FDFBF7] py-16 px-6 lg:py-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Headline */}
        <div>
           <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C5A059] mb-4 block">Connect with our support team</span>
           <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-8">Get Your Study Notes Delivered to Your Doorstep</h1>
           <p className="text-lg text-[#A1887F] font-medium leading-relaxed mb-12">
             Have questions about our premium notes, or need help with your order? Our support team in Pandharpur is ready to assist you.
           </p>

           <div className="bg-[#FFFBF2] rounded-3xl border border-[#C5A059]/20 p-8 shadow-xl">
              <div className="flex items-center gap-2 text-[#C5A059] font-bold text-sm uppercase tracking-widest mb-4">
                 <ShieldCheck size={20} /> Official Assistance
              </div>
              <h3 className="text-xl font-bold text-[#3E2723] mb-6 underline decoration-[#C5A059] underline-offset-8">Quick Support Channels</h3>
              <div className="space-y-6">
                 {[
                   { icon: <MessageSquare />, label: 'Chat on WhatsApp', action: 'Chat Now', value: '+91 9765269550', link: 'https://wa.me/919765269550' },
                   { icon: <Phone />, label: 'Call Support', action: 'Call Now', value: '9765269550', link: 'tel:+919765269550' },
                   { icon: <Mail />, label: 'Support Email', action: 'Send Mail', value: 'nehabookindustries@gmail.com', link: 'mailto:nehabookindustries@gmail.com' },
                   { icon: <MapPin />, label: 'Visit Us', action: 'View Map', value: 'Pandharpur, Maharashtra', link: '#' }
                 ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#C5A059]/5 shadow-sm hover:border-[#C5A059]/30 transition-all">
                       <div className="flex gap-4 items-center">
                          <div className="text-[#C5A059]">{item.icon}</div>
                          <div>
                             <p className="text-[10px] font-bold text-[#A1887F] uppercase tracking-widest leading-none">{item.label}</p>
                             <p className="text-sm font-bold text-[#3E2723] mt-1">{item.value}</p>
                          </div>
                       </div>
                       <Link 
                          href={item.link} 
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#C5A059] hover:text-[#5D4037] transition-colors"
                        >
                          {item.action} <ExternalLink size={12} />
                       </Link>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Side: Visual Section */}
        <div className="relative group">
           <div className="absolute inset-0 bg-[#C5A059]/5 rounded-[4rem] -rotate-3 scale-105 transition-transform group-hover:rotate-0 duration-700"></div>
           <div className="relative bg-[#3E2723] h-[550px] rounded-[4rem] overflow-hidden flex flex-col items-center justify-center p-12 text-center text-white shadow-2xl">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 border border-white/20">
                 <ShieldCheck className="text-[#C5A059]" size={48} />
              </div>
              <h2 className="text-3xl font-[family-name:var(--font-playfair)] font-bold mb-6">Verified Educators & Secure Delivery</h2>
              <p className="text-white/60 text-lg font-medium leading-relaxed mb-8">
                Your trust is our priority. Every order is tracked and every module is verified before it leaves our library.
              </p>
              <div className="flex gap-4">
                 <div className="inline-block px-6 py-2 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-white/5">Pandharpur Base</div>
                 <div className="inline-block px-6 py-2 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-white/5">Nationwide Tracking</div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
