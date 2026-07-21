// src/components/Navbar.tsx
import { createClient } from '../app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { getLang } from '../app/utils/getLang';
import { dictionaries } from '../app/utils/dictionaries';
import LanguageToggle from './LanguageToggle';
import InstallAppButton from './InstallAppButton';

export default async function Navbar() {
  const lang = await getLang();
  const t = dictionaries[lang].nav;
  
  // Safely grab translations with fallbacks just in case they aren't in your dictionary yet
  const tInstallTitle = t.installApp || "Install App";
  const tInstallDesc = t.installDesc || "Add to home screen for fast access";
  const tInstallBtn = t.installBtn || "Install";
  const tGuideBtn = t.guideBtn || "Guide";

  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role;
  }

  async function signOut() {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/');
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0f4c5c] px-4 py-3 md:px-8 flex justify-between items-center shadow-md border-b border-white/5">
      
      {/* Logo */}
      <div className="flex items-center">
        <Link href="/" className="group">
          <img src="/logo/logo.png" alt="PartTimeMM Logo" className="h-8 md:h-10 w-auto object-contain group-hover:opacity-90 transition-opacity" />
        </Link>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4 pl-2 ml-auto relative">
        
        {/* Pass translations to Client Component */}
        <InstallAppButton 
          tTitle={tInstallTitle} 
          tDesc={tInstallDesc} 
          tInstall={tInstallBtn} 
          tGuide={tGuideBtn} 
        />

        <LanguageToggle currentLang={lang} />

        {user ? (
          <details className="group relative">
            
            <summary className="animate-heartbeat group-open:animate-none list-none cursor-pointer w-10 h-10 rounded-full bg-gradient-to-tr from-[#e3b23c] to-[#f0c254] shadow-md hover:shadow-lg transition-all flex items-center justify-center active:scale-95 [&::-webkit-details-marker]:hidden">
              <svg className="w-5 h-5 text-[#0f4c5c] group-open:hidden transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              <svg className="w-5 h-5 text-[#0f4c5c] hidden group-open:block transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </summary>
            
            <div className="absolute right-0 top-12 w-72 bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-gray-100 p-2 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
              
              <div className="space-y-1 p-1 mb-1">
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:text-[#0f4c5c] transition-colors active:bg-gray-100">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t.jobs}
                </Link>
                {/* Notice: The install link was removed from here! */}
              </div>

              {userRole === 'employer' && (
                <Link href="/create" className="flex items-center justify-between p-4 mb-2 bg-[#0f4c5c] rounded-2xl hover:bg-[#0a3844] transition-colors group/post">
                  <span className="font-bold text-white text-sm">{t.postJob}</span>
                  <span className="bg-[#e3b23c] text-[#0f4c5c] w-7 h-7 rounded-full flex items-center justify-center text-lg font-black group-hover/post:scale-110 group-hover/post:rotate-90 transition-transform duration-300">+</span> 
                </Link>
              )}

              <div className="space-y-1 p-1">
                <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:text-[#0f4c5c] transition-colors active:bg-gray-100">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {t.profile}
                </Link>

                {userRole === 'seeker' && (
                  <Link href="/saved" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:text-[#e3b23c] transition-colors active:bg-gray-100">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    {t.savedJobs}
                  </Link>
                )}

                <Link href="/following" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:text-[#0f4c5c] transition-colors active:bg-gray-100">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  {t.following}
                </Link>

                {/* MOVED: Now it sits exactly here, under "Following" */}
                <Link href="/install" className="md:hidden flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-[#0f4c5c] font-bold bg-[#0f4c5c]/5 hover:bg-[#0f4c5c]/10 transition-colors active:bg-gray-100">
                  <svg className="w-5 h-5 text-[#e3b23c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {tInstallTitle}
                </Link>
              </div>
              
              <div className="mt-2 p-3 bg-orange-50/50 rounded-2xl border border-orange-100">
                <h3 className="text-orange-600 font-bold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Safety Protocol
                </h3>
                <p className="text-orange-800/80 text-xs leading-relaxed font-medium">
                  {t.safetyAlert}
                </p>
              </div>

              <form action={signOut} className="w-full mt-2">
                <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-rose-600 font-bold hover:bg-rose-50 transition-colors active:scale-[0.98]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  {t.logout}
                </button>
              </form>
            </div>
            
          </details>
        ) : (
          <Link href="/login" className="whitespace-nowrap px-5 py-2 md:px-6 md:py-2.5 bg-[#e3b23c] text-[#0f4c5c] rounded-full text-sm font-extrabold shadow-lg hover:bg-[#f0c254] hover:-translate-y-0.5 active:scale-[0.97] transition-all">
            {t.login}
          </Link>
        )}
      </div>
    </nav>
  );
}