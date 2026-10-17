'use client';
import { useState, useEffect } from 'react';

export default function DisclaimerPage() {
  const [content, setContent] = useState('');
  useEffect(() => {
    fetch('/api/admin/content?key=disclaimer')
      .then(res => res.json())
      .then(data => setContent(data.content));
  }, []);

  return (
    <div className="flex-1 bg-[#FDFBF7] py-16 px-6 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3E2723] mb-8">Disclaimer</h1>
        <div className="prose prose-brown max-w-none text-[#5D4037]">
          {content ? <pre className="whitespace-pre-wrap">{content}</pre> : <p>No disclaimer content available.</p>}
        </div>
      </div>
    </div>
  );
}
