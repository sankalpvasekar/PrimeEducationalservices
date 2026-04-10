'use client';
import Image from 'next/image';
import { BookOpen, Users, Clock, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex-1 bg-[#FDFBF7] py-16 px-6 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
           <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4">Our Story</h1>
           <div className="h-1 w-20 bg-[#C5A059] mx-auto rounded-full"></div>
           <p className="text-[#A1887F] mt-6 text-lg font-medium max-w-2xl mx-auto">
             Empowering students through premium knowledge since 2010. We specialize in expert-curated study material for competitive exams.
           </p>
        </header>

        <div className="prose prose-brown max-w-none text-[#5D4037]">
          <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-6">Our Mission</h2>
          <p className="mb-8 leading-relaxed">
            At Prime Educational Services, we believe that education is the cornerstone of nation-building. Our mission is to provide every aspirant with the most authentic, concise, and high-quality study materials that bridge the gap between hard work and success.
          </p>
          
          <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-6">Why Choose Us?</h2>
          <ul className="space-y-4 mb-4">
             <li className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full mt-2 shrink-0"></div>
                <span><strong>Reliable Service:</strong> Over a decade of consistent support for aspirants across India.</span>
             </li>
             <li className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full mt-2 shrink-0"></div>
                <span><strong>Authentic Quality:</strong> Every note is verified by subject matter experts to ensure accuracy.</span>
             </li>
             <li className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full mt-2 shrink-0"></div>
                <span><strong>Fast Delivery:</strong> We understand the value of time in exam preparation.</span>
             </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
