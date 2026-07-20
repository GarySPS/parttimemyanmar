//src/components/ShareButtons.tsx

'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Link2, Check } from 'lucide-react';

export default function ShareButtons({ jobTitle, jobId }: { jobTitle: string; jobId: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${window.location.origin}/jobs/${jobId}`);
  }, [jobId]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`Check out this part-time job: ${jobTitle}`);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {/* Viber Share */}
      <a
        href={`viber://forward?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2.5 bg-[#7360f2] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#5c4ce0] transition-all active:scale-95"
      >
        <MessageCircle size={18} />
        Viber
      </a>

      {/* Facebook Share with custom SVG */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2.5 bg-[#1877F2] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#166fe5] transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Share
      </a>

      {/* Copy Link */}
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-200 transition-all active:scale-95"
      >
        {copied ? <Check size={18} className="text-emerald-600" /> : <Link2 size={18} />}
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}