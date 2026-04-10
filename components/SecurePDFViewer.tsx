"use client";
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

export default function SecurePDF({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

        // Sequential rendering for mobile stability
        for (let i = 1; i <= pdf.numPages; i++) {
          if (!isMounted) break;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: window.devicePixelRatio > 1 ? 1.5 : 2.0 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          // Security: pointer-events-none prevents interaction with the canvas content
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
        setError("Failed to load secure document. Please refresh.");
        setLoading(false);
      }
    };

    if (url) {
      loadPDF();
    }
    return () => { isMounted = false; };
  }, [url]);

  // Global Security Listeners
  useEffect(() => {
    // Disable right click and selection
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventDefault = (e: any) => e.preventDefault();
    
    // Block shortcuts (Desktop)
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" || e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && ["p", "s", "c", "u", "a", "x"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C", "K"].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Mobile: Prevent long-press selection menu globally
    const handleTouchStart = (e: TouchEvent) => {
       // Allow natural scrolling but block persistent touches that trigger menus
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", preventDefault);
    document.addEventListener("cut", preventDefault);
    document.addEventListener("dragstart", preventDefault);
    window.addEventListener("keydown", handleKey);
    // iOS specific touch protection prefix
    (document.body.style as any).webkitTouchCallout = "none";
    (document.body.style as any).webkitUserSelect = "none";

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("cut", preventDefault);
      document.removeEventListener("dragstart", preventDefault);
      window.removeEventListener("keydown", handleKey);
      (document.body.style as any).webkitTouchCallout = "default";
      (document.body.style as any).webkitUserSelect = "text";
    };
  }, []);

  return (
    <div 
      className="min-h-screen bg-[#1A1A1A] flex flex-col items-center py-4 sm:py-8 w-full overflow-y-auto"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        touchAction: "pan-y" // Allow vertical scrolling but block other touch actions
      }}
    >
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
           <p className="text-[#C5A059] font-bold animate-pulse text-sm uppercase tracking-widest">Securing Document...</p>
        </div>
      )}
      {error && <p className="text-red-400 mt-10">{error}</p>}
      <div ref={containerRef} className="flex flex-col items-center w-full max-w-screen-lg px-2 sm:px-4" />
    </div>
  );
}
