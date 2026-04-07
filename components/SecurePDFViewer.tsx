"use client";
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

export default function SecurePDF({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const loadPDF = async () => {
      try {
        const pdf = await pdfjsLib.getDocument({
          url: url,
          withCredentials: false,
        }).promise;

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = ''; // reset on reload

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "mb-2 bg-white shadow-2xl max-w-full h-auto";

          container.appendChild(canvas);

          if (context) {
            await page.render({
              canvasContext: context,
              viewport,
            }).promise;
          }
        }
      } catch (err) {
        console.error('PDF.js Error:', err);
      }
    };

    if (url) {
      loadPDF();
    }
  }, [url]);

  // SECURITY: Visually blur on tab switch
  useEffect(() => {
    const handleVisibility = () => {
      document.body.style.filter = document.hidden ? "blur(20px)" : "none";
    };
    
    // Disable right click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    
    // Block shortcuts
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && ["p", "s", "c", "u"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && e.key === "I")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKey);
      document.body.style.filter = "none";
    };
  }, []);

  return (
    <div 
      className="min-h-screen bg-black flex flex-col items-center py-4 sm:py-8 w-full"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none"
      }}
    >
      <div ref={containerRef} className="flex flex-col items-center w-full max-w-5xl px-2" />
    </div>
  );
}
