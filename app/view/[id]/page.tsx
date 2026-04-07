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

  // SECURITY: Focus/Blur Protection (Android & Desktop)
  useEffect(() => {
    const handleBlur = () => {
       setIsBlurred(true);
       toast.error('Content hidden for security.', { id: 'blur-toast' });
    };
    const handleFocus = () => setIsBlurred(false);

    // visibilitychange covers task switching / screenshot attempts on many mobile OSs
    const handleVisibilityChange = () => {
       if (document.visibilityState === 'hidden') {
          handleBlur();
       } else {
          // Add a slight delay before unblurring to deter rapid screenshotting
          setTimeout(handleFocus, 500);
       }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleBlur); // Critical for mobile

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleBlur);
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

  // Proactive Screen Record/Capture Protection
  useEffect(() => {
    const handleMouseLeave = () => {
       setIsBlurred(true);
       toast.error('Content hidden: Mouse exited secure zone.', { id: 'ctx-toast' });
    };
    const handleBeforePrint = () => {
       setIsBlurred(true);
       toast.error('Printing is prohibited.', { id: 'print-toast' });
    };

    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeprint', handleBeforePrint);
    
    return () => {
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, []);

  // Detect Screen Recording (Window Resize/Inspect)
  useEffect(() => {
    const handleResize = () => {
       // Detecting if DevTools opened or window size changed significantly (often happens when starting recording software)
       if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
          setIsBlurred(true);
          toast.error('Security alert: Screen capture or inspection detected.', { id: 'detect-toast' });
       }
    };
    window.addEventListener('resize', handleResize);
    // Initial check
    setTimeout(handleResize, 1000);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#C5A059] mb-4" size={40} />
        <p className="text-[#A1887F] font-bold uppercase tracking-widest text-xs">Preparing Secure Document...</p>
      </div>
    );
  }

  if (!data) return null;

  // Use Google Docs Viewer for robust PPT and PDF support
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(data.url)}&embedded=true`;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-700 select-none no-print">
      <style jsx global>{`
        @media print {
          body { display: none !important; }
        }
        .no-select {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
      <div className="bg-white rounded-[2.5rem] border-2 border-[#C5A059]/10 shadow-2xl overflow-hidden flex flex-col min-h-[88vh] relative no-select">
        
        {/* Top Title Bar */}
        <div className="px-8 py-5 bg-[#FDFBF7] border-b border-[#C5A059]/10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href={`/curriculum/${id}`} className="p-2.5 bg-white border border-gray-100 shadow-sm hover:bg-[#C5A059]/10 rounded-full transition-colors text-[#A1887F]">
              <ChevronLeft size={22} />
            </Link>
            <div>
              <h1 className="font-bold text-[#3E2723] text-lg md:text-xl">{data.title}</h1>
              <p className="text-[10px] text-[#A1887F] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 mt-1">
                <ShieldCheck size={14} className="text-[#C5A059]" /> Secured Environment • {data.user.email}
              </p>
            </div>
          </div>
        </div>

        {/* PDF / PPT Container */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {/* THE WATERMARK LAYER - REMOVED AS REQUESTED */}
          
          {/* The Document Viewer (Iframe) */}
          <div className="w-full h-full relative z-10 overscroll-none">
            <iframe 
              src={viewerUrl}
              className={`w-full h-full border-none transition-all duration-700 min-h-[80vh] ${isBlurred ? 'blur-[100px] grayscale brightness-0 scale-110 opacity-0' : ''}`}
              title="Secure Viewer"
              id="secure-iframe"
            />
            {/* 
              Transparency Mask: 
              We remove the pointer-events: none to allow scrolling, 
              but we use an invisible overlay that only permits scrolling 
              while blocking "long press" or "touch-hold" menus on mobile.
            */}
            <div 
              className="absolute inset-0 z-20 bg-transparent touch-pan-y shadow-inner"
              onContextMenu={(e) => e.preventDefault()}
            ></div>
          </div>

          {/* Security Overlay (Blocks all interactions) */}
          {isBlurred && (
            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-3xl animate-in fade-in duration-500">
               <div className="bg-red-50 p-6 rounded-full mb-6">
                  <AlertTriangle className="text-red-500" size={64} />
               </div>
               <h2 className="text-2xl font-bold text-[#3E2723]">Security Interruption Detected</h2>
               <p className="text-base text-[#A1887F] mt-3 font-medium max-w-sm text-center">
                 Content has been protected. Please switch back to this tab and ensure no recording tools are active.
               </p>
               <button 
                 onClick={() => setIsBlurred(false)}
                 className="mt-8 px-8 py-3 bg-[#C5A059] text-white rounded-full font-bold shadow-lg hover:bg-[#A68344] transition-all"
               >
                 Resume Viewing
               </button>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-8 py-4 bg-[#3E2723] text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-between">
           <span className="flex items-center gap-2"><ShieldCheck size={14} /> Encrypted Session</span>
           <span>DO NOT SHARE • SCREEN RECORDING PROHIBITED</span>
        </div>
      </div>
    </div>
  );
}
