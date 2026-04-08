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
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'p' || e.key === 's' || e.key === 'x')) {
        e.preventDefault();
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
  const pdfViewerUrl = `${url}#toolbar=0&navpanes=0&scrollbar=0`;
  const viewerUrl = isPpt 
    ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}` 
    : pdfViewerUrl;

  return (
    <div 
      className="fixed inset-0 w-full h-[100dvh] bg-white z-[9999] select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      <iframe 
        src={viewerUrl} 
        className="w-full h-full border-none absolute inset-0 max-w-full m-0 p-0 overflow-hidden"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Document Viewer"
      />
    </div>
  );
}
