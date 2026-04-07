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
    const handleBlackout = () => setIsBlurred(true);
    const handleRestore = () => {
       // Minimal delay before unblurring to prevent frame-perfect screenshots
       setTimeout(() => setIsBlurred(false), 500);
    };

    // visibilitychange covers tab switching / task view / app-switching
    const handleVisibilityChange = () => {
       if (document.visibilityState === 'hidden') handleBlackout();
       else handleRestore();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleBlackout); // Critical for mobile
    
    // Prohibit Screenshot/Print-Screen detection logic
    const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === 'PrintScreen' || (e.ctrlKey && (e.key === 'p' || e.key === 's'))) {
          e.preventDefault();
          handleBlackout();
          toast.error('Screenshot / Printing is prohibited.');
       }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleBlackout);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // SECURITY: Disable Right-click & Keyboard Shortcuts
  useEffect(() => {
    const disableActions = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof MouseEvent && e.type === 'contextmenu') {
        e.preventDefault();
      }

      if (e instanceof KeyboardEvent) {
        const forbidden = (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 's' || e.key === 'p');
        if (forbidden) e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', disableActions as any);
    window.addEventListener('keydown', disableActions as any);

    return () => {
      window.removeEventListener('contextmenu', disableActions as any);
      window.removeEventListener('keydown', disableActions as any);
    };
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

  // Use direct Cloudinary URL with flags to hide UI
  const viewerUrl = `${data.url}#toolbar=0&navpanes=0&scrollbar=0`;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-4 animate-in fade-in duration-700 select-none no-print">
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
        #secure-iframe-container {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      {/* Minimal Floating Back Button */}
      <div className="fixed top-6 left-6 z-[200]">
        <button 
          onClick={() => router.back()}
          className="p-3.5 bg-white/90 border border-[#C5A059]/30 shadow-xl hover:bg-[#C5A059] hover:text-white rounded-full transition-all text-[#C5A059] active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#C5A059]/10 shadow-2xl overflow-hidden flex flex-col min-h-[92vh] relative no-select">
        {/* PDF / PPT Container - Purely Normal Presentation */}
        <div id="secure-iframe-container" className="flex-1 relative bg-white overflow-hidden">
          
          {/* The Document Viewer (Iframe) */}
          <div className="w-full h-full relative z-10 overscroll-none">
            <iframe 
              src={viewerUrl}
              className={`w-full h-full border-none transition-all duration-700 min-h-[90vh] ${isBlurred ? 'blur-[120px] grayscale brightness-0 scale-110 opacity-0 pointer-events-none' : ''}`}
              title="Secure Viewer"
              id="secure-iframe"
            />
            {/* 
              Transparency Mask: 
              Allows scrolling via touch-pan-y but blocks context menus.
            */}
            <div 
              className="absolute inset-0 z-20 bg-transparent touch-pan-y"
              onContextMenu={(e) => e.preventDefault()}
            ></div>
          </div>

          {/* Security Overlay (Blocks all interactions during blackout) */}
          {isBlurred && (
            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black animate-in fade-in duration-300">
               <div className="text-center px-10">
                  <ShieldCheck className="text-[#C5A059] mx-auto mb-6" size={64} />
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Security Hardened Screen</h2>
                  <p className="text-white/40 text-sm font-medium">Content hidden to protect from unauthorized capture.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
