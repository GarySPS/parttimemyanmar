//src/components/TelegramBanner.ts

import { getLang } from '../app/utils/getLang'; // Adjust path if your utils are in src/utils/
import { dictionaries } from '../app/utils/dictionaries';

export default async function TelegramBanner() {
  const lang = await getLang();
  const t = dictionaries[lang].telegram;

  return (
    <div className="w-full bg-[#e8f5fb] border-b border-[#229ED9]/20 shadow-sm py-3 px-4 md:px-8 relative z-20">
      <div className="w-full max-w-3xl mx-auto flex flex-row items-center justify-between gap-3">
        
        {/* Left Side: Small Icon & Text */}
        <div className="flex flex-row items-center gap-3 flex-1 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-[#229ED9] flex items-center justify-center text-white shrink-0 shadow-md">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.68-.55.84-1.12.52l-3.05-2.25-1.47 1.42c-.16.16-.3.3-.61.3l.22-3.11 5.66-5.11c.25-.22-.05-.34-.38-.12l-7 4.41-3.01-.94c-.66-.21-.67-.66.14-.98l11.78-4.54c.55-.2 1.02.13.81.92z"/>
            </svg>
          </div>
          <div className="text-left flex-1 min-w-0">
            <h3 className="text-[0.95rem] font-bold text-[#0f4c5c] leading-tight truncate">
              {t.title}
            </h3>
            <p className="text-[0.75rem] text-[#0f4c5c]/80 font-medium mt-0.5 truncate">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Small Button */}
        <a
          href="https://t.me/parttimemyanmar"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-5 py-2 bg-[#229ED9] hover:bg-[#1d82b3] text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-[0.97]"
        >
          {t.joinBtn}
        </a>
        
      </div>
    </div>
  );
}