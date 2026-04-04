'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Globe, MessageCircle, MoreHorizontal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#FDFBF7] border-t border-[#C5A059]/10 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
        
        {/* Column 1: Brand & Bio */}
        <div className="space-y-6">
          <Image src="/footer.png" alt="Footer Logo" width={180} height={60} className="opacity-80 h-10 w-auto" />
          <p className="text-sm text-[#A1887F] font-medium leading-relaxed">
            The vintage haven for premium study notes and expert-curated materials. Master UPSC, MPSC, and 12+ other categories.
          </p>
          <div className="flex gap-4 text-[#C5A059]">
             <Link href="#" className="hover:text-[#5D4037] transition-colors"><Globe size={20} /></Link>
             <Link href="#" className="hover:text-[#5D4037] transition-colors"><MessageCircle size={20} /></Link>
             <Link href="#" className="hover:text-[#5D4037] transition-colors"><MoreHorizontal size={20} /></Link>
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div>
          <h4 className="text-[#3E2723] font-bold uppercase tracking-widest text-xs mb-6">Quick Links</h4>
          <ul className="space-y-4">
            <li><Link href="/" className="text-sm text-[#A1887F] font-medium hover:text-[#C5A059] transition-colors">Home Library</Link></li>
            <li><Link href="/about" className="text-sm text-[#A1887F] font-medium hover:text-[#C5A059] transition-colors">Our Story (About)</Link></li>
            <li><Link href="/contact" className="text-sm text-[#A1887F] font-medium hover:text-[#C5A059] transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Column 3: Policies */}
        <div>
          <h4 className="text-[#3E2723] font-bold uppercase tracking-widest text-xs mb-6">Policies</h4>
          <ul className="space-y-4">
            <li><Link href="/terms" className="text-sm text-[#A1887F] font-medium hover:text-[#C5A059] transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="text-sm text-[#A1887F] font-medium hover:text-[#C5A059] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/shipping-policy" className="text-sm text-[#A1887F] font-medium hover:text-[#C5A059] transition-colors">Shipping Policy</Link></li>
            <li><Link href="/cancellation" className="text-sm text-[#A1887F] font-medium hover:text-[#C5A059] transition-colors">Cancellation & Refund</Link></li>
          </ul>
        </div>

        {/* Column 4: Contact Us */}
        <div className="space-y-4">
          <h4 className="text-[#3E2723] font-bold uppercase tracking-widest text-xs mb-6">Contact Us</h4>
          <div className="flex items-start gap-3">
             <Phone className="text-[#C5A059] shrink-0" size={18} />
             <div className="flex flex-col">
               <span className="text-[10px] text-[#A1887F] font-bold uppercase tracking-widest">Call or WhatsApp</span>
               <Link href="tel:+919765269550" className="text-sm text-[#3E2723] font-bold hover:text-[#C5A059] transition-colors">+91 9765269550</Link>
             </div>
          </div>
          <div className="flex items-start gap-3">
             <Mail className="text-[#C5A059] shrink-0" size={18} />
             <div className="flex flex-col">
               <span className="text-[10px] text-[#A1887F] font-bold uppercase tracking-widest">Email Address</span>
               <Link href="mailto:nehabookindustries@gmail.com" className="text-sm text-[#3E2723] font-bold hover:text-[#C5A059] transition-colors">nehabookindustries@gmail.com</Link>
             </div>
          </div>
          <div className="flex items-start gap-3">
             <MapPin className="text-[#C5A059] shrink-0" size={18} />
             <div className="flex flex-col">
               <span className="text-[10px] text-[#A1887F] font-bold uppercase tracking-widest">Location</span>
               <span className="text-sm text-[#3E2723] font-bold">Pandharpur, Maharashtra</span>
             </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[#C5A059]/10 text-center">
         <p className="text-[10px] text-[#A1887F] font-bold uppercase tracking-[0.3em]">&copy; 2026 Prime Educational Services. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
