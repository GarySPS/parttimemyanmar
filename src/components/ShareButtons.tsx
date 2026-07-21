//src/components/ShareButtons.tsx

'use client';

import { useState, useEffect } from 'react';
import { Link2, Check } from 'lucide-react';

export default function ShareButtons({ jobTitle, jobId }: { jobTitle: string; jobId: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${window.location.origin}/jobs/${jobId}`);
  }, [jobId]);

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