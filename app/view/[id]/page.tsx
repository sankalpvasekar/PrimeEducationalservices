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

  if (!url) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <p className="text-white/50 text-sm font-medium animate-pulse">
        Loading Document...
      </p>
    </div>
  );

  const isPpt = url.toLowerCase().includes('.ppt') || url.toLowerCase().includes('.pptx');

  // Use Office Apps Viewer for robust PPT/PPTX rendering.
  // Use native browser rendering for PDFs.
  const viewerUrl = isPpt 
    ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}` 
    : url;

  return (
    <div className="w-full h-screen bg-white">
      <iframe 
        src={viewerUrl} 
        className="w-full h-full border-none"
        title="Document Viewer"
      />
    </div>
  );
}
