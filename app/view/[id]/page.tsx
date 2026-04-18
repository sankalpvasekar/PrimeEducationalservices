'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const SecurePDF = dynamic(() => import('@/components/SecurePDFViewer'), { ssr: false });

export default function Page() {
export default function Page() {
  const { id } = useParams();
  const [url, setUrl] = useState<string | null>(null);
  const [isBlurred, setIsBlurred] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`/api/pdf/${id}`);
        const result = await res.json();
        
        if (result.url) {
            setUrl(result.url);      
        } else {
            setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };
    fetchDoc();
  }, [id]);

  useEffect(() => {
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    const handleVisibility = () => {
       if (document.visibilityState === 'hidden') setIsBlurred(true);
    };

    const preventShortcuts = (e: KeyboardEvent) => {
      if (
        ((e.ctrlKey || e.metaKey) && ["c", "p", "s", "x", "u", "i", "j", "k", "a"].includes(e.key.toLowerCase())) ||
        (e.key === 'F12') || (e.key === 'PrintScreen') ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
        setIsBlurred(true);
        return false;
      }
    };

    window.addEventListener('keydown', preventShortcuts);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      window.removeEventListener('keydown', preventShortcuts);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (error) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-bold">
      Access Denied or Session Expired.
    </div>
  );

  if (!url) return (
    <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center select-none">
      <p className="text-[#C5A059] text-sm font-bold uppercase tracking-[0.2em] animate-pulse">
        Securing Environment...
      </p>
    </div>
  );

  const isPpt = url.toLowerCase().includes('.ppt') || url.toLowerCase().includes('.pptx');
  
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* GLOBAL BLACKOUT OVERLAY */}
      {isBlurred && (
        <div className="fixed inset-0 bg-black z-[999999] flex flex-col items-center justify-center text-center p-6 select-none opacity-100 transition-opacity">
           <div className="bg-[#1A1A1A] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                 <ShieldCheck className="text-emerald-500" size={40} />
              </div>
              <h2 className="text-white text-2xl font-black mb-3">ENVIRONMENT PROTECTED</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                Security Shield active. Content hidden during app-switching or inspection. Return focus to resume.
              </p>
           </div>
        </div>
      )}

      <div className={`transition-all duration-700 ${isBlurred ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'}`}>
        {!isPpt ? (
          <SecurePDF url={url} />
        ) : (
          <div 
            className="fixed inset-0 w-full h-[100dvh] bg-white z-[9999] select-none overflow-hidden"
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <iframe 
              src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`} 
              className="w-full h-full border-none"
              title="Document Viewer"
            />
          </div>
        )}
      </div>
    </div>
  );
}
