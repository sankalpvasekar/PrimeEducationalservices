'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const SecurePDF = dynamic(() => import('@/components/SecurePDFViewer'), { ssr: false });

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
    return () => {
      window.removeEventListener('keydown', preventShortcuts);
    };
  }, []);

  if (!url) return (
    <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center select-none">
      <p className="text-white/50 text-sm font-medium animate-pulse">
        Loading Document...
      </p>
    </div>
  );

  const isPpt = url.toLowerCase().includes('.ppt') || url.toLowerCase().includes('.pptx');
  const isPdf = url.toLowerCase().includes('.pdf');

  if (isPdf) {
    return <SecurePDF url={url} />;
  }

  // Use Office Apps Viewer for robust PPT/PPTX rendering.
  const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;

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
      <div className="absolute inset-0 z-10 bg-transparent pointer-events-none" />
      <iframe 
        src={viewerUrl} 
        className="w-full h-full border-none absolute inset-0"
        title="Document Viewer"
      />
    </div>
  );
}
