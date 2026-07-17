//src/components/FollowButton.tsx

'use client';

import { useTransition } from 'react';
import { toggleFollow } from '../app/actions/follow';

export default function FollowButton({ 
  employerId, 
  initialIsFollowing, 
  path 
}: { 
  employerId: string, 
  initialIsFollowing: boolean, 
  path: string 
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button 
      onClick={() => startTransition(() => toggleFollow(employerId, initialIsFollowing, path))}
      disabled={isPending}
      className={`flex-1 md:flex-none md:px-8 py-3 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
        initialIsFollowing 
          ? 'bg-white text-[#0f4c5c] border border-[#0f4c5c] hover:bg-gray-50' 
          : 'bg-[#0f4c5c] text-white hover:bg-[#0f4c5c]/90'
      } ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {!initialIsFollowing && (
        <svg className="w-4 h-4 text-[#e3b23c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      )}
      {isPending ? 'Updating...' : initialIsFollowing ? 'Following' : 'Follow'}
    </button>
  );
}