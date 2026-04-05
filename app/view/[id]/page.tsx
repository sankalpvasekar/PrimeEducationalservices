'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShieldCheck, Loader2, ChevronLeft, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PDFViewer() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<{ url: string; title: string; user: { name: string; email: string } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const res = await fetch(`/api/pdf/${id}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        setData(result);
      } catch (err: any) {
        toast.error(err.message);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPDF();
  }, [id, router]);

  // SECURITY: Focus/Blur Protection
  useEffect(() => {
    const handleBlur = () => {
       setIsBlurred(true);
       toast.error('Content blurred for security.', { id: 'blur-toast' });
    };
    const handleFocus = () => setIsBlurred(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) handleBlur();
      else handleFocus();
    });

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // SECURITY: Disable Right-click & Keyboard Shortcuts
  useEffect(() => {
    const disableActions = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof MouseEvent && e.type === 'contextmenu') {
        e.preventDefault();
        toast.error('Right-click is restricted.', { id: 'ctx-toast' });
      }

      if (e instanceof KeyboardEvent) {
        const forbidden = (
          (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 's' || e.key === 'p') ||
          e.key === 'PrintScreen' || e.key === 'F12'
        );
        if (forbidden) {
          e.preventDefault();
          toast.error('This action is restricted.', { id: 'key-toast' });
        }
      }
    };

    window.addEventListener('contextmenu', disableActions as any);
    window.addEventListener('keydown', disableActions as any);

    return () => {
      window.removeEventListener('contextmenu', disableActions as any);
      window.removeEventListener('keydown', disableActions as any);
    };
  }, []);

  // SECURITY: Detect Screen Recording (Window Resize/Inspect)
  useEffect(() => {
    const handleResize = () => {
       if (window.outerWidth - window.innerWidth > 100 || window.outerHeight - window.innerHeight > 100) {
          setIsBlurred(true);
          toast.error('Detection: Potential recording or inspection.', { id: 'detect-toast' });
       }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#3E2723] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C5A059]" size={40} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-700 select-none">
      <div className="bg-white rounded-3xl border border-[#C5A059]/20 shadow-2xl overflow-hidden flex flex-col min-h-[85vh] relative">
        
        {/* Top Title Bar */}
        <div className="px-6 py-4 bg-[#FDFBF7] border-b border-[#C5A059]/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-[#C5A059]/10 rounded-full transition-colors text-[#A1887F]">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="font-bold text-[#3E2723] text-sm md:text-base">{data.title}</h1>
              <p className="text-[10px] text-[#A1887F] font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <ShieldCheck size={12} className="text-[#C5A059]" /> Secured for {data.user.email}
              </p>
            </div>
          </div>
        </div>

        {/* PDF Container */}
        <div className="flex-1 relative bg-gray-50 overflow-hidden">
          {/* THE WATERMARK LAYER */}
          <div className="absolute inset-0 z-40 pointer-events-none opacity-[0.07] flex flex-wrap gap-x-48 gap-y-48 rotate-[-30deg] scale-150 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
               <div key={i} className="text-[#3E2723] font-bold text-sm whitespace-nowrap">
                  Prime Educational Services
               </div>
            ))}
          </div>

          {/* The PDF Viewer (Iframe) */}
          <div className="w-full h-full relative z-10">
            <iframe 
              src={`${data.url}#toolbar=0&navpanes=0&scrollbar=0`}
              className={`w-full h-full border-none transition-all duration-700 min-h-[75vh] ${isBlurred ? 'blur-[80px] grayscale brightness-50 scale-110' : ''}`}
              style={{ pointerEvents: 'none' }}
            />
            {/* Click Protection Overlay */}
            <div className="absolute inset-0 z-20"></div>
          </div>

          {/* Blur Warning Overlay */}
          {isBlurred && (
            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 backdrop-blur-3xl animate-in fade-in duration-500">
               <AlertTriangle className="text-[#C5A059] mb-4" size={56} />
               <h2 className="text-xl font-bold text-[#3E2723]">Security Interruption</h2>
               <p className="text-sm text-[#A1887F] mt-2 font-medium">Please stay on this tab to view content</p>
            </div>
          )}
        </div>

        {/* Bottom Lock Bar */}
        <div className="px-6 py-3 bg-[#5D4037] text-white/50 text-[9px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          <ShieldCheck size={12} /> Encrypted Digital Access — Unauthorized sharing is prohibited
        </div>
      </div>
    </div>
  );
}
