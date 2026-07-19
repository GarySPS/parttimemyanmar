//src/app/install/page.tsx

import Link from 'next/link';
import { getLang } from '../utils/getLang';
import { dictionaries } from '../utils/dictionaries';

export default async function InstallGuide() {
  const lang = await getLang();
  const t = dictionaries[lang].installGuide;

  return (
    <main className="min-h-screen bg-[#0f4c5c] text-white flex flex-col items-center py-12 px-4 selection:bg-[#a4c3d2]/40">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-xl">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#e3b23c] mb-3">{t.title}</h1>
          <p className="text-[#a4c3d2] font-medium">{t.subtitle}</p>
        </div>

        {/* iOS Section */}
        <div className="mb-10 bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
            <h2 className="text-xl font-bold">{t.iosTitle}</h2>
          </div>
          <ul className="space-y-4 text-[#a4c3d2]">
            <li className="flex items-start gap-3"><span className="text-[#e3b23c] font-bold">•</span> {t.iosStep1}</li>
            <li className="flex items-start gap-3"><span className="text-[#e3b23c] font-bold">•</span> {t.iosStep2}</li>
            <li className="flex items-start gap-3"><span className="text-[#e3b23c] font-bold">•</span> {t.iosStep3}</li>
          </ul>
        </div>

        {/* Android Section */}
        <div className="mb-10 bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-8 h-8 text-[#a4c3d2]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.3414C17.523 15.3414 16.035 15.3414 14.548 15.3414C13.921 15.3414 13.414 14.8344 13.414 14.2074V12.7214H10.586V14.2074C10.586 14.8344 10.079 15.3414 9.452 15.3414C7.965 15.3414 6.477 15.3414 6.477 15.3414C5.12 15.3414 4 14.2214 4 12.8644V8.65743C4 7.29943 5.12 6.17943 6.477 6.17943H17.523C18.88 6.17943 20 7.29943 20 8.65743V12.8644C20 14.2214 18.88 15.3414 17.523 15.3414ZM16.34 9.42143C15.836 9.42143 15.428 9.01343 15.428 8.50943C15.428 8.00643 15.836 7.59843 16.34 7.59843C16.843 7.59843 17.251 8.00643 17.251 8.50943C17.251 9.01343 16.843 9.42143 16.34 9.42143ZM7.66 9.42143C7.156 9.42143 6.748 9.01343 6.748 8.50943C6.748 8.00643 7.156 7.59843 7.66 7.59843C8.163 7.59843 8.571 8.00643 8.571 8.50943C8.571 9.01343 8.163 9.42143 7.66 9.42143Z"/></svg>
            <h2 className="text-xl font-bold">{t.androidTitle}</h2>
          </div>
          <ul className="space-y-4 text-[#a4c3d2]">
            <li className="flex items-start gap-3"><span className="text-[#e3b23c] font-bold">•</span> {t.androidStep1}</li>
            <li className="flex items-start gap-3"><span className="text-[#e3b23c] font-bold">•</span> {t.androidStep2}</li>
            <li className="flex items-start gap-3"><span className="text-[#e3b23c] font-bold">•</span> {t.androidStep3}</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Link 
            href="/" 
            className="px-8 py-3 bg-[#e3b23c] text-[#0f4c5c] rounded-xl text-sm font-extrabold shadow-lg shadow-[#e3b23c]/20 hover:bg-[#f0c254] hover:-translate-y-0.5 active:scale-[0.97] transition-all"
          >
            {t.backBtn}
          </Link>
        </div>

      </div>
    </main>
  );
}