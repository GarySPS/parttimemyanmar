//src/app/complete/[id]/CloseJobClient.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CloseJobClient({ closeAction, t }: { closeAction: () => Promise<{ error?: string, success?: boolean }>, t: any }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleClose = async () => {
    setStatus('loading');
    const result = await closeAction();

    if (result?.error) {
      setStatus('error');
      setMessage(result.error);
    } else {
      setStatus('success');
      setMessage(t.success);
      setTimeout(() => {
        router.push('/');
      }, 1500); 
    }
  };

  return (
    <div className="flex flex-col w-full">
      {status === 'error' && <p className="text-red-500 mb-3 text-sm text-center font-medium">{t.failed}{message}</p>}
      {status === 'success' && <p className="text-teal-600 mb-3 text-sm text-center font-bold">{message}</p>}
      
      <button 
        onClick={handleClose}
        disabled={status === 'loading' || status === 'success'}
        className="w-full bg-[#0a473e] hover:bg-[#07362f] text-white py-3.5 rounded-full font-bold text-base shadow-sm transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? t.closing : status === 'success' ? t.closed : t.closeTask}
      </button>
    </div>
  );
}