//src/app/complete/[id]/CloseJobClient.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CloseJobClient({ closeAction }: { closeAction: () => Promise<{ error?: string, success?: boolean }> }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleClose = async () => {
    setStatus('loading');
    const result = await closeAction();

    // If there's an error (e.g., RLS blocked it), show it
    if (result?.error) {
      setStatus('error');
      setMessage(result.error);
    } else {
      setStatus('success');
      setMessage('Task closed successfully!');
      setTimeout(() => {
        router.push('/');
      }, 1500); // 1.5 second delay before redirecting
    }
  };

  return (
    <div className="flex flex-col w-full">
      {status === 'error' && <p className="text-red-500 mb-3 text-sm text-center font-medium">Failed: {message}</p>}
      {status === 'success' && <p className="text-teal-600 mb-3 text-sm text-center font-bold">{message}</p>}
      
      <button 
        onClick={handleClose}
        disabled={status === 'loading' || status === 'success'}
        className="w-full bg-[#0a473e] hover:bg-[#07362f] text-white py-3.5 rounded-full font-bold text-base shadow-sm transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? 'Closing...' : status === 'success' ? 'Closed' : 'Close Task'}
      </button>
    </div>
  );
}