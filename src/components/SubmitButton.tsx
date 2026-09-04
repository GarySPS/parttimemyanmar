//src>components>SubmitButton.tsx

'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ publishText }: { publishText: string }) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`w-full py-4 rounded-full font-bold text-lg shadow-lg transition-all 
        ${pending ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-900 hover:bg-teal-800 text-white active:scale-[0.97] active:shadow-sm'}`}
    >
      {pending ? 'Publishing...' : publishText}
    </button>
  );
}