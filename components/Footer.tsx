'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Globe, MessageCircle, MoreHorizontal } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAbout = pathname === '/about';

  if (!isHome && !isAbout) return null;

  if (isAbout) {
    return (
      <footer className="w-full bg-[#FDFBF7] border-t border-[#C5A059]/10 pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col items-center gap-6">
             <div className="flex items-center font-black text-2xl md:text-3xl tracking-tighter cursor-default">
               <span className="text-blue-600">PRIME</span>
               <span className="text-orange-500 mx-1.5 text-xl md:text-2xl transform scale-y-110">EDUCATIONAL</span>
               <span className="text-green-600">SERVICES</span>
             </div>
             
             <div className="space-y-4">
                <h4 className="text-[#3E2723] font-bold uppercase tracking-widest text-xs">Contact Us</h4>
                <div className="flex items-center gap-3 justify-center">
                   <Mail className="text-[#C5A059]" size={18} />
                   <Link href="mailto:primeeducationalservices515@gmail.com" className="text-sm text-[#3E2723] font-bold hover:text-[#C5A059] transition-colors">
                     primeeducationalservices515@gmail.com
                   </Link>
                </div>
             </div>

             <div className="h-px w-12 bg-[#C5A059]/20"></div>
             
             <p className="text-[10px] text-[#A1887F] font-bold uppercase tracking-widest">
                Premium Study Portal • Prime Educational Services
             </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-[#FDFBF7] border-t border-[#C5A059]/10 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12 text-left">
        
        {/* Column 1: Brand & Bio */}
        <div className="space-y-6 max-w-sm">
          <div className="flex items-center font-black text-2xl md:text-3xl tracking-tighter cursor-default">
            <span className="text-blue-600">PRIME</span>
            <span className="text-orange-500 mx-1.5 text-xl md:text-2xl transform scale-y-110">EDUCATIONAL</span>
            <span className="text-green-600">SERVICES</span>
          </div>
          <p className="text-sm text-[#A1887F] font-medium leading-relaxed">
            The vintage haven for premium study notes and expert-curated materials. Master UPSC, MPSC, and 12+ other categories.
          </p>
          <div className="flex gap-4 text-[#C5A059]">
             <Link href="#" className="hover:text-[#5D4037] transition-colors"><Globe size={20} /></Link>
             <Link href="#" className="hover:text-[#5D4037] transition-colors"><MessageCircle size={20} /></Link>
             <Link href="#" className="hover:text-[#5D4037] transition-colors"><MoreHorizontal size={20} /></Link>
          </div>
        </div>

        {/* Column 2: Contact Us */}
        <div className="space-y-4">
          <h4 className="text-[#3E2723] font-bold uppercase tracking-widest text-xs mb-6">Contact Us</h4>
          <div className="flex items-start gap-3">
             <Mail className="text-[#C5A059] shrink-0" size={18} />
             <div className="flex flex-col">
               <span className="text-[10px] text-[#A1887F] font-bold uppercase tracking-widest">Email Address</span>
               <Link href="mailto:primeeducationalservices515@gmail.com" className="text-sm text-[#3E2723] font-bold hover:text-[#C5A059] transition-colors">primeeducationalservices515@gmail.com</Link>
             </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#C5A059]/10">
             <p className="text-[10px] text-[#A1887F] font-bold uppercase tracking-widest">
                Dedicated to Educational Excellence
             </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
