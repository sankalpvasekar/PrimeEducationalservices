"use client";
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

const SecurePDF = ({ url }: { url: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBlurred, setIsBlurred] = useState(false);
  
  useEffect(() => {
    // DevTools / Debugger Trap
    const trap = setInterval(() => {
      const startTime = performance.now();
      debugger;
      const endTime = performance.now();
      if (endTime - startTime > 100) {
        // DevTools likely open
        setIsBlurred(true);
      }
    }, 2000);

    return () => clearInterval(trap);
  }, []);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    let isMounted = true;
    const loadPDF = async () => {
      setLoading(true);
      setError(null);
      try {
        const pdf = await pdfjsLib.getDocument({
          url: url,
          withCredentials: false,
        }).promise;

        if (!isMounted) return;
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = ''; 

        for (let i = 1; i <= pdf.numPages; i++) {
          if (!isMounted) break;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: window.devicePixelRatio > 1 ? 1.5 : 2.0 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "mb-4 bg-white shadow-lg mx-auto max-w-full h-auto pointer-events-none select-none touch-none";
          canvas.style.userSelect = "none";
          canvas.style.webkitUserSelect = "none";

          container.appendChild(canvas);

          if (context) {
            await page.render({
              canvasContext: context,
              viewport,
            }).promise;
          }
        }
        setLoading(false);
      } catch (err: any) {
        console.error('PDF.js Error:', err);
        setError("Security verification failed. Please refresh.");
        setLoading(false);
      }
    };

    if (url) {
      loadPDF();
    }
    return () => { isMounted = false; };
  }, [url]);

  // Global Security Listeners & Visibility Shield
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventDefault = (e: any) => e.preventDefault();
    
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setIsBlurred(true);
      } else {
        // Optional: Keep it blacked out until focus returns
      }
    };

    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);

    const handleKey = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" || e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && ["p", "s", "c", "u", "a", "x"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C", "K"].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
        setIsBlurred(true);
        return false;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", preventDefault);
    document.addEventListener("cut", preventDefault);
    document.addEventListener("dragstart", preventDefault);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    (document.body.style as any).webkitTouchCallout = "none";
    (document.body.style as any).webkitUserSelect = "none";

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("cut", preventDefault);
      document.removeEventListener("dragstart", preventDefault);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div 
      className="relative min-h-screen bg-[#1A1A1A] flex flex-col items-center py-4 sm:py-8 w-full overflow-y-auto"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        touchAction: "pan-y"
      }}
    >
      {/* BLACKOUT OVERLAY */}
      {isBlurred && (
        <div className="fixed inset-0 bg-black z-[99999] flex flex-col items-center justify-center text-center p-6 select-none">
           <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <div className="w-8 h-8 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2">Security Shield Active</h2>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                Screen capture or inspection detected. Focus the window to resume protected viewing.
              </p>
           </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
           <p className="text-[#C5A059] font-bold animate-pulse text-sm uppercase tracking-widest">Securing Document...</p>
        </div>
      )}
      
      {error && <p className="text-red-400 mt-10">{error}</p>}
      
      <div 
        ref={containerRef} 
        className={`flex flex-col items-center w-full max-w-screen-lg px-2 sm:px-4 transition-all duration-500 ${isBlurred ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} 
      />
    </div>
  );
};

export default SecurePDF;
