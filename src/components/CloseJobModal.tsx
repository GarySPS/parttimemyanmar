// src/components/CloseJobModal.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CloseJobModal({ jobId, jobTitle, closeAction, t, tComplete }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleClose = async () => {
    setStatus('loading');
    const result = await closeAction(jobId);

    if (result?.error) {
      setStatus('error');
      setMessage(result.error);
    } else {
      setStatus('success');
      setMessage(tComplete.success);
      setTimeout(() => {
        setIsOpen(false);
        router.push('/'); // Or use router.refresh() to stay on page
      }, 1500);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="block w-full text-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all active:scale-[0.97] whitespace-nowrap shadow-sm"
      >
        {t.closeJob}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{tComplete.title}</h2>
            <p className="text-sm text-slate-500 font-medium mb-6">
              {jobTitle} - {tComplete.description}
            </p>

            {status === 'error' && <p className="text-red-500 mb-3 text-sm text-center font-medium">{tComplete.failed} {message}</p>}
            {status === 'success' && <p className="text-teal-600 mb-3 text-sm text-center font-bold">{message}</p>}

            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setIsOpen(false)}
                disabled={status === 'loading' || status === 'success'}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold transition-colors disabled:opacity-50"
              >
                {tComplete.cancel}
              </button>
              <button 
                onClick={handleClose}
                disabled={status === 'loading' || status === 'success'}
                className="flex-1 bg-[#0a473e] hover:bg-[#07362f] text-white py-3 rounded-full font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? tComplete.closing : status === 'success' ? tComplete.closed : tComplete.closeTask}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}