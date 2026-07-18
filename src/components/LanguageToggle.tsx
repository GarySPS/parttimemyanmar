//src/components/LanguageToggle.tsx

'use client';

import { useRouter } from 'next/navigation';
import type { Language } from '../app/utils/dictionaries';

export default function LanguageToggle({ currentLang }: { currentLang: Language }) {
  const router = useRouter();

  const toggleLanguage = () => {
    const newLang = currentLang === 'my' ? 'en' : 'my';
    // Set cookie for 1 year
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    router.refresh(); 
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