'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { id } = useParams();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`/api/pdf/${id}`);
        const result = await res.json();
        
        if (result.url) {
            setUrl(result.url);      
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoc();
  }, [id]);

  useEffect(() => {
    const preventShortcuts = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+P, Ctrl+S, Ctrl+X, Ctrl+U, F12, Ctrl+Shift+I
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'p' || e.key === 's' || e.key === 'x' || e.key === 'u' || e.key === 'i' || e.key === 'j')) ||
        (e.key === 'F12') ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        e.preventDefault();
        return false;
      }
    };
    window.addEventListener('keydown', preventShortcuts);
    return () => window.removeEventListener('keydown', preventShortcuts);
  }, []);

  if (!url) return (
    <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center select-none">
      <p className="text-white/50 text-sm font-medium animate-pulse">
        Loading Document...
      </p>
    </div>
  );

  const isPpt = url.toLowerCase().includes('.ppt') || url.toLowerCase().includes('.pptx');

  // Use Office Apps Viewer for robust PPT/PPTX rendering.
  // Use native browser rendering for PDFs with hidden toolbars to block download UI.
  const pdfViewerUrl = `${url}#toolbar=0&navpanes=0&scrollbar=1`; // Keep scrollbar for usability
  const viewerUrl = isPpt 
    ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}` 
    : pdfViewerUrl;

  return (
    <div 
      className="fixed inset-0 w-full h-[100dvh] bg-white z-[9999] select-none overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* Invisible overlay to deter some direct clicks/selection while keeping scroll functionality if possible */}
      <div className="absolute inset-0 z-10 bg-transparent pointer-events-none" />
      
      <iframe 
        src={viewerUrl} 
        className="w-full h-full border-none absolute inset-0 max-w-full m-0 p-0"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Document Viewer"
      />
    </div>
  );
}
