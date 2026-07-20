//src/components/LanguageToggle.tsx

'use client';

import { useRouter } from 'next/navigation';
import type { Language } from '../app/utils/dictionaries';
import { updateUserLanguage } from '../app/actions/language';

export default function LanguageToggle({ currentLang }: { currentLang: Language }) {
  const router = useRouter();

  const toggleLanguage = async () => {
    const newLang = currentLang === 'my' ? 'en' : 'my';
    
    // 1. Instantly set the cookie for the UI
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    
    // 2. Refresh the page so server components re-render with the new language
    router.refresh(); 

    // 3. Save to Supabase in the background (won't block the UI refresh)
    await updateUserLanguage(newLang);
  };

  // src/components/LanguageToggle.tsx
  return (
    <button 
      onClick={toggleLanguage}
      className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center"
      aria-label="Toggle Language"
    >
      {currentLang === 'my' ? (
        // UK Flag SVG
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-7 h-[20px] rounded-[2px] shadow-sm">
          <clipPath id="t"><path d="M30,15 h30 v15 z v-15 h-30 z h-30 v-15 z v15 h30 z"/></clipPath>
          <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
        </svg>
      ) : (
        // Myanmar Flag SVG
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className="w-7 h-[20px] rounded-[2px] shadow-sm">
          <rect width="1200" height="800" fill="#ea2839"/>
          <rect width="1200" height="533.33" fill="#34b233"/>
          <rect width="1200" height="266.67" fill="#fecb00"/>
          <polygon fill="#ffffff" points="600,186 658,367 847,367 694,478 753,659 600,548 447,659 506,478 353,367 542,367"/>
        </svg>
      )}
    </button>
  );
}