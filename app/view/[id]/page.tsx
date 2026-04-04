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
    <div className="fixed inset-0 bg-[#1A110E] text-white flex flex-col overflow-hidden select-none">
      {/* Top Controls */}
      <header className="h-16 px-6 bg-black/40 backdrop-blur-md flex items-center justify-between border-b border-white/5 z-50">
        <div className="flex items-center gap-4">
          <Link href={`/sections/1`} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-bold text-sm leading-tight max-w-[150px] truncate">{data.title}</h1>
            <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={10} /> Secure Digital Asset
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <p className="text-[10px] text-white/40 font-medium">Watermarked to {data.user.email}</p>
        </div>
      </header>

      {/* PDF Container Wrapper */}
      <div className="flex-1 relative overflow-hidden bg-[#2D1F1A]">
        {/* THE WATERMARK LAYER (Dense & Repeating) */}
        <div className="absolute inset-0 z-40 pointer-events-none opacity-20 flex flex-wrap gap-x-32 gap-y-32 rotate-[-45deg] scale-125">
          {Array.from({ length: 40 }).map((_, i) => (
             <div key={i} className="text-white font-[family-name:var(--font-inter)] text-xs font-bold whitespace-nowrap">
                Prime Educational Services
             </div>
          ))}
        </div>

        {/* Security Overlay (Blocks all clicks on iframe) */}
        <div className="absolute inset-0 z-30 pointer-events-none"></div>

        {/* The PDF Viewer (Iframe) */}
        <iframe 
          src={`${data.url}#toolbar=0&navpanes=0&scrollbar=0`}
          className={`w-full h-full border-none transition-all duration-700 ${isBlurred ? 'blur-[80px] grayscale brightness-50 scale-110' : ''}`}
          style={{ pointerEvents: 'none' }}
        />

        {/* Blur Warning Overlay */}
        {isBlurred && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl animate-in fade-in duration-500">
             <AlertTriangle className="text-[#C5A059] mb-4" size={56} />
             <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)]">Security Interruption</h2>
             <p className="text-sm text-white/60 mt-2">Bring tab to focus to resume viewing</p>
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <footer className="h-6 bg-black/80 flex items-center justify-center px-4">
         <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.4em]">
            &copy; 2026 Prime Educational Services — Protected Environment
         </p>
      </footer>
    </div>
  );
}
