//src/app/page.tsx

import { createClient } from './utils/supabase/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import AnimatedCard from '../components/AnimatedCard';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role;
  }
  const resolvedParams = await searchParams;
  const selectedLocation = resolvedParams?.location || '';

  const { data: locations } = await supabase.from('locations').select('*');

  let query = supabase
    .from('jobs')
    .select(`*, locations(city, township, ward), profiles(contact_app, contact_username)`)
    .order('created_at', { ascending: false });

  if (selectedLocation) {
    query = query.eq('location_id', selectedLocation);
  }
  
  const { data: jobs } = await query;

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
    <main className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 text-gray-900 font-sans selection:bg-blue-200">
      
    {/* Deep Teal Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-teal-900 px-4 py-5 md:py-7 md:px-8 flex justify-between items-center transition-all">
        {/* Logo & Brand Lockup */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo/logo.png" 
            alt="PartTimeMM Logo" 
            className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-md"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-none">
              PartTimeMM
            </h1>
            <span className="text-xs md:text-sm font-medium text-teal-200/90 tracking-wide mt-1.5 leading-none">
              အချိန်ပိုင်းအလုပ်အကိုင်များ
            </span>
          </div>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Profile Icon */}
              <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-100 flex items-center justify-center font-bold text-lg border border-emerald-500/30 shadow-sm">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>

              {/* Full Page Hamburger Dropdown (CSS Only) */}
              <details className="group">
                <summary className="list-none cursor-pointer p-2 hover:bg-teal-800 rounded-lg transition-colors [&::-webkit-details-marker]:hidden">
                  {/* Hamburger Icon */}
                  <svg className="w-8 h-8 text-teal-50 group-open:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  {/* Close (X) Icon */}
                  <svg className="w-8 h-8 text-teal-50 hidden group-open:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </summary>
                
                {/* Full Width Menu Container */}
                <div className="absolute top-full left-0 w-full h-[calc(100vh-80px)] bg-teal-950/95 backdrop-blur-xl border-t border-teal-900 z-50 flex flex-col">
                  <div className="w-full flex flex-col">
                    {userRole === 'employer' && (
                      <Link href="/create" className="px-6 py-5 text-base font-bold text-teal-50 border-b border-teal-900/50 flex items-center gap-3 hover:bg-teal-900 transition-colors">
                        <span className="bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xl leading-none pb-0.5 shadow-lg shadow-emerald-500/20">+</span> 
                        Post a Job
                      </Link>
                    )}
                    <Link href="/history" className="px-6 py-5 text-base font-medium text-teal-100 border-b border-teal-900/50 hover:bg-teal-900 transition-colors">
                      History
                    </Link>
                    <Link href="/profile" className="px-6 py-5 text-base font-medium text-teal-100 border-b border-teal-900/50 hover:bg-teal-900 transition-colors">
                      Settings
                    </Link>
                    <form action={signOut} className="w-full mt-8 px-6">
                      <button className="w-full text-center px-5 py-3.5 rounded-full text-base font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors">
                        Log out
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            </>
          ) : (
            <form action={signInAnonymously} className="flex gap-2">
              <button name="role" value="employer" className="px-5 py-3 bg-emerald-500 text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-400 transition-colors">
                Employer
              </button>
              <button name="role" value="seeker" className="px-5 py-3 bg-teal-800 text-teal-50 border border-teal-700 rounded-full text-sm font-bold hover:bg-teal-700 transition-colors">
                Seeker
              </button>
            </form>
          )}
        </div>
      </nav>

      {/* Integrated Search Bar */}
      <div className="w-full bg-teal-900 px-4 pb-6 pt-2 md:px-8 md:pb-8 shadow-lg">
        <form method="GET" action="/" className="max-w-3xl mx-auto flex items-center bg-white rounded-full p-2 shadow-inner border border-teal-800">
          
          <div className="pl-4 pr-2 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input 
            type="text" 
            name="q" 
            placeholder="All jobs" 
            className="flex-1 w-full bg-transparent border-none text-base md:text-lg font-medium text-gray-900 focus:outline-none focus:ring-0 placeholder-gray-500 py-3"
          />
          
          <div className="text-gray-300 font-bold px-2 text-lg">•</div>
          
          <select 
            name="location" 
            defaultValue={selectedLocation}
            className="bg-transparent border-none text-base md:text-lg font-medium text-gray-700 focus:outline-none focus:ring-0 cursor-pointer appearance-none py-3 pr-4 truncate max-w-[140px] md:max-w-[220px]"
          >
            <option value="">All Locations</option>
            {locations?.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.city ? `${loc.city}, ` : ''}{loc.township}
              </option>
            ))}
          </select>

          <button type="submit" className="hidden" aria-hidden="true"></button>
        </form>
      </div>

      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        
        {/* Soft Safety Warning */}
        <section className="w-full">
          <div className="bg-orange-50/80 backdrop-blur-md border border-orange-100/50 p-5 rounded-3xl shadow-[0_8px_30px_rgb(251,146,60,0.08)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-400 to-red-400 rounded-l-3xl"></div>
            <h3 className="text-orange-800 font-extrabold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="text-lg">⚠️</span> Safety Protocol
            </h3>
            <p className="text-orange-900/80 text-sm leading-relaxed font-medium">
              100% anonymous directory. We do not verify identities. <strong className="text-orange-900">Always meet in public daylight within your immediate ward.</strong> Never share real names or NRC.
            </p>
          </div>
        </section>

        {/* Horizontal Pill Filters */}
        <section className="w-full overflow-hidden">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Link 
              href="/"
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold snap-start transition-all border ${
                !selectedLocation 
                  ? 'bg-teal-900 text-white border-teal-900 shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
              }`}
            >
              🌎 All Locations
            </Link>
            {locations?.map((loc) => {
              const isSelected = selectedLocation === loc.id.toString();
              return (
                <Link
                  key={loc.id}
                  href={`/?location=${loc.id}`}
                  className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold snap-start transition-all border ${
                    isSelected 
                      ? 'bg-teal-900 text-white border-teal-900 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                  }`}
                >
                  {loc.township} - {loc.ward}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Floating Job Cards */}
        <section className="w-full pb-12">
          {jobs && jobs.length > 0 ? (
            <div className="flex flex-col gap-5">
              {jobs.map((job, index) => (
                <AnimatedCard key={job.id} index={index}>
                  <div className={`relative p-6 rounded-[2rem] transition-all duration-300 ${job.status === 'closed' ? 'bg-gray-50/50 border border-gray-200/50 opacity-75' : 'bg-white/80 backdrop-blur-lg border border-white/60 shadow-[0_8px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_60px_rgb(0,0,0,0.08)] hover:-translate-y-1'}`}>
                  
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h2 className={`font-bold text-xl tracking-tight ${job.status === 'closed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {job.title}
                    </h2>
                    {job.status === 'closed' && (
                      <span className="px-3 py-1 bg-emerald-100/80 text-emerald-700 text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-sm">
                        Closed
                      </span>
                    )}
                  </div>
                  
                  {job.locations && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100/80 text-gray-600 text-xs font-semibold rounded-full mb-4">
                      <span className="text-sm">📍</span> {job.locations.township}, {job.locations.ward}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium">{job.description}</p>
                  
                  {job.status === 'open' && user?.id === job.employer_id && (
                    <div className="mb-2">
                      <Link href={`/complete/${job.id}`} className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-full text-sm font-bold transition-colors">
                        ✓ Mark as Complete
                      </Link>
                    </div>
                  )}

                  {job.status === 'closed' && job.receipt_url && (
                    <div className="mt-6 pt-6 border-t border-gray-100/80">
                      <p className="text-[10px] text-gray-400 font-bold mb-3 uppercase tracking-widest">Payment Validated</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={job.receipt_url} alt="Receipt" className="w-full max-w-sm h-auto rounded-2xl border border-gray-200/50 shadow-md" loading="lazy" />
                    </div>
                  )}

                  {job.status === 'open' && (
                    <div className="mt-6 pt-5 border-t border-gray-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {job.profiles?.contact_app && job.profiles?.contact_username ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                            {job.profiles.contact_app}
                          </span>
                          <span className="text-sm font-mono font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 select-all">
                            {job.profiles.contact_username}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">No contact method linked</span>
                      )}
                    </div>
                  )}
                </div>
              </AnimatedCard>
              ))}
            </div>
          ) : (
            <div className="w-full py-20 bg-white/50 backdrop-blur-md rounded-[3rem] border border-white/60 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <span className="text-4xl block mb-4">🍃</span>
              <p className="text-gray-500 font-medium">No tasks found in this area.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}