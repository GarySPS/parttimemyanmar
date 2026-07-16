//src/components/CloseJobButton.tsx

'use client';
import { useRouter } from 'next/navigation';

export default function CloseJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();

  return (
    <button 
      onClick={(e) => { 
        e.preventDefault(); 
        router.push(`/complete/${jobId}`); 
      }}
      className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-semibold transition-colors border border-slate-200"
    >
      Close
    </button>
  );
}