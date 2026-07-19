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

  return (
    <button 
      onClick={toggleLanguage}
      className="px-3 py-1.5 mr-2 rounded-xl border border-white/20 bg-white/5 text-[#a4c3d2] text-sm font-bold hover:bg-white/10 transition-all active:scale-95"
    >
      {currentLang === 'my' ? 'EN' : 'မြန်မာ'}
    </button>
  );
}