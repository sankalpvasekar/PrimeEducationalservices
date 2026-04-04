import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F5F2EA] to-[#FFFBF2] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#C5A059] p-4 rounded-2xl shadow-xl mb-6">
        <GraduationCap className="text-white w-12 h-12" />
      </div>
      <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-playfair)] font-bold text-[#3E2723] mb-4">
        Prime<span className="text-[#C5A059]">Educational</span>
      </h1>
      <p className="text-[#A1887F] max-w-md mb-10 text-lg">
        Premium study notes for UPSC, MPSC, NEET, JEE and 12 more exams. Start your preparation today.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/register" className="px-8 py-3 bg-[#5D4037] text-white rounded-xl font-semibold hover:bg-[#4E342E] transition-all shadow-lg">
          Create Account
        </Link>
        <Link href="/login" className="px-8 py-3 bg-[#C5A059] text-white rounded-xl font-semibold hover:bg-[#A68344] transition-all shadow-lg">
          Login
        </Link>
      </div>
    </div>
  );
}
