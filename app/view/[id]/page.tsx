'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const SecurePDFViewer = dynamic(() => import('@/components/SecurePDFViewer'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <p className="text-white/50 text-sm font-medium tracking-widest uppercase animate-pulse">
        Initializing Secure Stream...
      </p>
    </div>
  )
});

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
      <p className="text-white/50 text-sm font-medium tracking-widest uppercase">
        Verifying Access...
      </p>
    </div>
  );

  return <SecurePDFViewer url={url} />;
}
