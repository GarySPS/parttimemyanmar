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
    <nav className="sticky top-0 z-50 w-full bg-teal-900 px-4 py-3 md:px-8 flex justify-between items-center shadow-md border-b border-teal-800/50">
      <div className="flex items-center">
        <Link href="/">
          <img src="/logo/logo.png" alt="PartTimeMM Logo" className="h-8 md:h-10 w-auto object-contain" />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <details className="group">
              <summary className="list-none cursor-pointer p-3 rounded-xl transition-all duration-300 bg-teal-700/60 hover:bg-teal-600 shadow-lg shadow-teal-950/40 animate-heartbeat hover:scale-105 active:scale-95 [&::-webkit-details-marker]:hidden">
                <svg className="w-8 h-8 text-white group-open:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                <svg className="w-8 h-8 text-white hidden group-open:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </summary>
              <div className="absolute top-full left-0 w-full h-[calc(100vh-80px)] bg-teal-950/95 backdrop-blur-xl border-t border-teal-900 z-50 flex flex-col overflow-y-auto">
                <div className="w-full flex flex-col min-h-full">
                  {userRole === 'employer' && (
                    <Link href="/create" className="px-6 py-5 text-base font-bold text-teal-50 border-b border-teal-900/50 flex items-center gap-3 hover:bg-teal-900 transition-colors">
                      <span className="bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xl leading-none pb-0.5 shadow-lg shadow-emerald-500/20">+</span> 
                      Post a Job
                    </Link>
                  )}
                  {userRole === 'seeker' && (
                    <Link href="/saved" className="px-6 py-5 text-base font-medium text-teal-100 border-b border-teal-900/50 hover:bg-teal-900 transition-colors">Saved Jobs</Link>
                  )}
                  <Link href="/history" className="px-6 py-5 text-base font-medium text-teal-100 border-b border-teal-900/50 hover:bg-teal-900 transition-colors">History</Link>
                  <Link href="/profile" className="px-6 py-5 text-base font-medium text-teal-100 border-b border-teal-900/50 hover:bg-teal-900 transition-colors">Settings</Link>
                  
                  <div className="mt-6 px-6">
                    <div className="bg-orange-950/40 backdrop-blur-md border border-orange-500/20 p-5 rounded-3xl relative overflow-hidden shadow-inner">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-500 to-red-500 rounded-l-3xl"></div>
                      <h3 className="text-orange-400 font-extrabold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="text-lg">⚠️</span> Safety Protocol
                      </h3>
                      <p className="text-orange-200/70 text-sm leading-relaxed font-medium">
                        100% anonymous directory. We do not verify identities. <strong className="text-orange-300">Always meet in public daylight within your immediate ward.</strong> Never share real names or NRC.
                      </p>
                    </div>
                  </div>

                  <form action={signOut} className="w-full mt-6 px-6 pb-8">
                    <button className="w-full text-center px-5 py-3.5 rounded-full text-base font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors">Log out</button>
                  </form>
                </div>
              </div>
            </details>
          </>
        ) : (
          <form action={signInAnonymously} className="flex gap-2">
            <button name="role" value="employer" className="px-5 py-3 bg-emerald-500 text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-400 transition-colors">Employer</button>
            <button name="role" value="seeker" className="px-5 py-3 bg-teal-800 text-teal-50 border border-teal-700 rounded-full text-sm font-bold hover:bg-teal-700 transition-colors">Seeker</button>
          </form>
        )}
      </div>
    </nav>
  );
}