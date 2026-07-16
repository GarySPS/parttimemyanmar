//components/BookmarkButton.tsx

'use client';
import { useState, useTransition } from 'react';
import { toggleBookmark } from '@/app/actions/bookmark';

interface BookmarkButtonProps {
  jobId: string;
  initialIsBookmarked: boolean;
}

export default function BookmarkButton({ jobId, initialIsBookmarked }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents clicking the card container itself if nested
    if (isPending) return;

    const nextState = !isBookmarked;
    setIsBookmarked(nextState); // Optimistic visual change

    startTransition(async () => {
      const result = await toggleBookmark(jobId, isBookmarked);
      if (result?.error) {
        setIsBookmarked(!nextState); // Revert back if backend fails
      }
    });
  };

return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark job"}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill={isBookmarked ? "currentColor" : "none"} 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={`w-6 h-6 ${isBookmarked ? 'text-yellow-500' : 'text-gray-400'}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
      </svg>
    </button>
  );
}