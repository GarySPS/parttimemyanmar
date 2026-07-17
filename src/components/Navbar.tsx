// src/components/Navbar.tsx

import { createClient } from '../app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function Navbar() {
  const supabase = await createClient();
  
  // Fetch user data for the navbar
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role;
  }

  // Server Actions for auth
  async function signInAnonymously(formData: FormData) {
    'use server';
    const role = formData.get('role') as string;
    const supabase = await createClient();
    await supabase.auth.signInAnonymously({ options: { data: { role } } });
    revalidatePath('/');
  }

  async function signOut() {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/');
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0f4c5c] px-4 py-3 md:px-8 flex justify-between items-center shadow-lg shadow-[#0f4c5c]/20 border-b border-white/10">
      <div className="flex items-center">
        <Link href="/">
          <img src="/logo/logo.png" alt="PartTimeMM Logo" className="h-8 md:h-10 w-auto object-contain" />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <details className="group">
              <summary className="list-none cursor-pointer p-2.5 rounded-2xl transition-all duration-300 bg-white/5 hover:bg-white/15 border border-white/10 shadow-sm animate-heartbeat hover:scale-105 active:scale-95 [&::-webkit-details-marker]:hidden flex items-center justify-center">
                <svg className="w-7 h-7 text-white group-open:hidden transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                <svg className="w-7 h-7 text-white hidden group-open:block transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </summary>
              
              {/* Dropdown Menu Container */}
              <div className="absolute top-[calc(100%+1px)] left-0 w-full h-[calc(100vh-70px)] bg-[#0f4c5c]/95 backdrop-blur-2xl z-50 flex flex-col overflow-y-auto">
                <div className="w-full max-w-3xl mx-auto flex flex-col min-h-full pb-8">
                  
                  {/* Action Items */}
                  <div className="px-4 pt-6 pb-2 space-y-2">
                    {userRole === 'employer' && (
                      <Link href="/create" className="flex items-center justify-between px-5 py-4 mb-4 bg-gradient-to-r from-[#e3b23c]/10 to-transparent border border-[#e3b23c]/30 rounded-2xl hover:from-[#e3b23c]/20 transition-all group/post shadow-inner">
                        <span className="font-bold text-[#e3b23c] text-lg tracking-wide">Post a Job</span>
                        <span className="bg-[#e3b23c] text-[#0f4c5c] w-8 h-8 rounded-full flex items-center justify-center text-xl font-black shadow-lg shadow-[#e3b23c]/20 group-hover/post:scale-110 group-hover/post:rotate-90 transition-transform duration-300">+</span> 
                      </Link>
                    )}

                    {/* Standard Links - Pill Hover Design */}
                    
                    <Link href="/profile" className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[#a4c3d2] font-medium hover:bg-white/10 hover:text-white transition-colors group/link">
                      <svg className="w-5 h-5 opacity-70 group-hover/link:opacity-100 group-hover/link:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Profile
                    </Link>

                    {userRole === 'seeker' && (
                      <Link href="/saved" className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[#a4c3d2] font-medium hover:bg-white/10 hover:text-white transition-colors group/link">
                        <svg className="w-5 h-5 opacity-70 group-hover/link:opacity-100 group-hover/link:text-[#e3b23c] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        Saved Jobs
                      </Link>
                    )}

                    <Link href="/following" className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[#a4c3d2] font-medium hover:bg-white/10 hover:text-white transition-colors group/link">
                      <svg className="w-5 h-5 opacity-70 group-hover/link:opacity-100 group-hover/link:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      Following
                    </Link>
                    
                    <Link href="/history" className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[#a4c3d2] font-medium hover:bg-white/10 hover:text-white transition-colors group/link">
                      <svg className="w-5 h-5 opacity-70 group-hover/link:opacity-100 group-hover/link:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      History
                    </Link>
                    
                    <Link href="/settings" className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[#a4c3d2] font-medium hover:bg-white/10 hover:text-white transition-colors group/link">
                      <svg className="w-5 h-5 opacity-70 group-hover/link:opacity-100 group-hover/link:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Settings
                    </Link>
                  </div>
                  
                  <div className="mt-auto px-4">
                    {/* Refined Safety Box */}
                    <div className="bg-orange-500/5 border border-orange-500/20 p-5 rounded-3xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500/80 rounded-l-3xl"></div>
                      <h3 className="text-orange-400/90 font-extrabold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Safety Protocol
                      </h3>
                      <p className="text-[#a4c3d2] text-sm leading-relaxed font-medium">
                        100% anonymous directory. We do not verify identities. <strong className="text-orange-300 font-bold">Always meet in public daylight within your immediate ward.</strong> Never share real names or NRC.
                      </p>
                    </div>

                    <form action={signOut} className="w-full mt-6 pb-6">
                      <button className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300 transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Log out
                      </button>
                    </form>
                  </div>
                  
                </div>
              </div>
            </details>
          </>
        ) : (
          <form action={signInAnonymously} className="flex gap-2">
            <button name="role" value="employer" className="px-5 py-2.5 bg-[#e3b23c] text-[#0f4c5c] rounded-xl text-sm font-bold shadow-lg shadow-[#e3b23c]/20 hover:bg-[#f0c254] hover:-translate-y-0.5 transition-all">Employer</button>
            <button name="role" value="seeker" className="px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors">Seeker</button>
          </form>
        )}
      </div>
    </nav>
  );
}