//src/app/install/page.tsx

import Link from 'next/link';
import { getLang } from '../utils/getLang';
import { dictionaries } from '../utils/dictionaries';

export default async function InstallGuide() {
  const lang = await getLang();
  const t = dictionaries[lang].installGuide;

  return (
    <main className="min-h-screen bg-[#0f4c5c] text-white flex flex-col items-center py-12 px-4 selection:bg-[#a4c3d2]/40 font-sans">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
        
        <div className="text-center mb-10">
          {/* Added a floating app icon placeholder to make it feel official */}
          <div className="w-20 h-20 bg-white/10 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-white/20 shadow-lg">
            <img src="/icon.png" alt="PartTimeMM App" className="w-12 h-12 rounded-xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#e3b23c] mb-3 tracking-tight">{t.title}</h1>
          <p className="text-[#a4c3d2] font-medium">{t.subtitle}</p>
        </div>

        {/* iOS Section */}
        <div className="mb-8 bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            {/* FIXED: Official Apple Logo */}
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.14 1.36-.59 2.87-1.34 3.73-.76.85-2.12 1.54-3.05 1.43-.16-1.32.72-2.83 1.45-3.66z"/>
            </svg>
            <h2 className="text-2xl font-bold">{t.iosTitle || 'iOS (iPhone / iPad)'}</h2>
          </div>
          <ul className="space-y-5 text-[#a4c3d2] text-sm md:text-base font-medium">
            <li className="flex items-center gap-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#e3b23c] text-[#0f4c5c] font-extrabold text-sm shrink-0">1</span> 
              <span className="flex items-center flex-wrap gap-2">
                {t.iosStep1}
                {/* INLINE SAFARI SHARE ICON */}
                <svg className="w-6 h-6 text-white bg-white/20 p-1 rounded-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v14"/></svg>
              </span>
            </li>
            <li className="flex items-center gap-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#e3b23c] text-[#0f4c5c] font-extrabold text-sm shrink-0">2</span> 
              <span>{t.iosStep2}</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#e3b23c] text-[#0f4c5c] font-extrabold text-sm shrink-0">3</span> 
              <span>{t.iosStep3}</span>
            </li>
          </ul>
        </div>

        {/* Android Section */}
        <div className="mb-10 bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-8 h-8 text-[#a4c3d2]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.3414C17.523 15.3414 16.035 15.3414 14.548 15.3414C13.921 15.3414 13.414 14.8344 13.414 14.2074V12.7214H10.586V14.2074C10.586 14.8344 10.079 15.3414 9.452 15.3414C7.965 15.3414 6.477 15.3414 6.477 15.3414C5.12 15.3414 4 14.2214 4 12.8644V8.65743C4 7.29943 5.12 6.17943 6.477 6.17943H17.523C18.88 6.17943 20 7.29943 20 8.65743V12.8644C20 14.2214 18.88 15.3414 17.523 15.3414ZM16.34 9.42143C15.836 9.42143 15.428 9.01343 15.428 8.50943C15.428 8.00643 15.836 7.59843 16.34 7.59843C16.843 7.59843 17.251 8.00643 17.251 8.50943C17.251 9.01343 16.843 9.42143 16.34 9.42143ZM7.66 9.42143C7.156 9.42143 6.748 9.01343 6.748 8.50943C6.748 8.00643 7.156 7.59843 7.66 7.59843C8.163 7.59843 8.571 8.00643 8.571 8.50943C8.571 9.01343 8.163 9.42143 7.66 9.42143Z"/></svg>
            <h2 className="text-2xl font-bold">{t.androidTitle || 'Android'}</h2>
          </div>
          <ul className="space-y-5 text-[#a4c3d2] text-sm md:text-base font-medium">
            <li className="flex items-center gap-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#a4c3d2] text-[#0f4c5c] font-extrabold text-sm shrink-0">1</span> 
              <span className="flex items-center flex-wrap gap-2">
                {t.androidStep1}
                {/* INLINE CHROME 3-DOTS ICON */}
                <svg className="w-6 h-6 text-white bg-white/20 p-1 rounded-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 5v.01M12 12v.01M12 19v.01"/></svg>
              </span>
            </li>
            <li className="flex items-center gap-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#a4c3d2] text-[#0f4c5c] font-extrabold text-sm shrink-0">2</span> 
              <span>{t.androidStep2}</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#a4c3d2] text-[#0f4c5c] font-extrabold text-sm shrink-0">3</span> 
              <span>{t.androidStep3}</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-center mt-4">
          <Link 
            href="/" 
            className="px-10 py-4 bg-[#e3b23c] text-[#0f4c5c] rounded-xl text-[15px] font-extrabold shadow-lg shadow-[#e3b23c]/20 hover:bg-[#f0c254] hover:-translate-y-0.5 active:scale-[0.97] transition-all w-full md:w-auto text-center"
          >
            {t.backBtn}
          </Link>
        </div>

      </div>
    </main>
  );
}