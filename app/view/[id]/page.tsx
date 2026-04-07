'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ShieldCheck, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';

// Configure Worker using CDN for Next.js compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function SecureViewer() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<{ url: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlurred, setIsBlurred] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`/api/pdf/${id}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        
        // Transform URL to raw format if needed (fixes attachment/preview issues)
        let transformedUrl = result.url;
        if (transformedUrl.includes('image/upload')) {
           transformedUrl = transformedUrl.replace('image/upload', 'raw/upload');
        }
        if (!transformedUrl.includes('fl_attachment:false')) {
           transformedUrl = transformedUrl.replace('upload/', 'upload/fl_attachment:false/');
        }
        result.url = transformedUrl;

        setData(result);
      } catch (err: any) {
        toast.error(err.message);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id, router]);

  // PDF.JS Rendering Engine
  useEffect(() => {
    if (!data || !containerRef.current) return;

    const renderPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: data.url,
          withCredentials: false
        });
        
        const pdf = await loadingTask.promise;
        const container = containerRef.current;
        if (!container) return;
        
        container.innerHTML = ''; // Clear previous renders

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = 'w-full h-auto mb-4 rounded-lg shadow-sm bg-white animate-in zoom-in-95 duration-500';

          container.appendChild(canvas);

          if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport,
              canvas: canvas
            }).promise;
          }
          setRenderProgress(Math.round((i / pdf.numPages) * 100));
        }
      } catch (err: any) {
        console.error('PDF.js Error:', err);
        toast.error('Could not render document. It may be restricted.');
      }
    };

    renderPDF();
  }, [data]);

  // SECURITY: Visibility & Shortcuts
  useEffect(() => {
    const handleLock = () => setIsBlurred(true);
    const handleUnlock = () => setTimeout(() => setIsBlurred(false), 500);

    const handleVisibility = () => {
      if (document.hidden) handleLock();
      else handleUnlock();
    };

    const handleKey = (e: KeyboardEvent) => {
      // Block PrintScreen, Ctrl+P (Print), Ctrl+S (Save), Ctrl+C (Copy), Ctrl+Shift+I (DevTools)
      const forbidden = 
        e.key === 'PrintScreen' || 
        ((e.ctrlKey || e.metaKey) && ['p', 's', 'c', 'u'].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && e.key === 'I');

      if (forbidden) {
        e.preventDefault();
        handleLock();
        toast.error('Security violation detected.');
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#C5A059] mb-4" size={40} />
        <p className="text-[#A1887F] font-bold uppercase tracking-widest text-xs">Initializing Secure Stream...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] select-none no-print overflow-x-hidden">
      <style jsx global>{`
        @media print { body { display: none !important; } }
        canvas {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>

      {/* Persistent Minimal Background Overlay for Blackout */}
      <div className={`fixed inset-0 z-[1000] bg-black transition-opacity duration-300 pointer-events-none flex flex-col items-center justify-center ${isBlurred ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}>
         <div className="text-center px-10">
            <ShieldCheck className="text-[#C5A059] mx-auto mb-6" size={80} />
            <h2 className="text-3xl font-serif font-bold text-white mb-3">Material Protected</h2>
            <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Content hidden during capture attempt</p>
         </div>
      </div>

      <main className={`max-w-4xl mx-auto p-4 md:p-8 transition-all duration-700 ${isBlurred ? 'blur-[80px] grayscale brightness-0' : 'blur-0'}`}>
        {/* Floating Minimal Navigation */}
        <div className="fixed top-6 left-6 z-[100]">
           <button 
             onClick={() => router.back()}
             className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-xl border border-[#C5A059]/20 text-[#5D4037] hover:bg-[#C5A059] hover:text-white transition-all active:scale-90"
             title="Return"
           >
             <ChevronLeft size={24} />
           </button>
        </div>

        {/* Progress Badge if large document */}
        {renderProgress > 0 && renderProgress < 100 && (
          <div className="fixed top-6 right-6 z-[100] bg-[#5D4037] text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg border border-[#C5A059]/20">
            Syncing: {renderProgress}%
          </div>
        )}

        <div 
          ref={containerRef} 
          className="flex flex-col items-center w-full min-h-[90vh] py-10"
        />
      </main>
    </div>
  );
}
