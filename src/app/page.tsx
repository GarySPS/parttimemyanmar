//src/app/page.tsx

import { createClient } from './utils/supabase/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import AnimatedCard from '../components/AnimatedCard';
import CustomSelect from '../components/CustomSelect';
import CityTownSelect from '../components/CityTownSelect';
import BookmarkButton from '../components/BookmarkButton';
import CloseJobButton from '../components/CloseJobButton';
import { getLang } from './utils/getLang';
import { dictionaries } from './utils/dictionaries';
import TelegramBanner from '../components/TelegramBanner';
import { ShieldCheck, Wallet, Sparkles, Lock } from 'lucide-react';

export default async function Home({
  searchParams,
}: {
 searchParams: Promise<{ city?: string, township?: string, q?: string, category?: string, pay_period?: string, status?: string }>;
}) {
  const lang = await getLang();
  const t = dictionaries[lang].home;

  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role;
  }

  const resolvedParams = await searchParams;
  const selectedCity = resolvedParams?.city || '';
  const selectedTownship = resolvedParams?.township || '';
  const searchTerm = resolvedParams?.q || '';
  const selectedCategory = resolvedParams?.category || '';
  const selectedPayPeriod = resolvedParams?.pay_period || '';
  const selectedStatus = resolvedParams?.status || '';

  const { data: locData } = await supabase.from('jobs').select('city, township').eq('status', 'open');
  const locationMap: Record<string, string[]> = {};
  
  if (locData) {
    locData.forEach(job => {
      if (job.city && job.township) {
        if (!locationMap[job.city]) locationMap[job.city] = [];
        if (!locationMap[job.city].includes(job.township)) {
          locationMap[job.city].push(job.township);
        }
      }
    });
  }

  const today = new Date().toISOString().split('T')[0];

  let query = supabase
    .from('jobs')
    .select(`*, profiles(contact_app, contact_username), bookmarks(id)`)
    .order('created_at', { ascending: false });

  // Handle the new Status Filter
  if (selectedStatus === 'closed') {
    query = query.eq('status', 'closed');
  } else if (selectedStatus === 'new') {
    const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toISOString();
    query = query.gte('created_at', yesterday).gte('expires_at', today);
  } else {
    // Default to hiding expired jobs unless 'closed' is explicitly searched
    query = query.gte('expires_at', today);
  }

  if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);
  if (selectedCategory) query = query.eq('category', selectedCategory);
  if (selectedPayPeriod) query = query.eq('pay_period', selectedPayPeriod);
  if (selectedCity) query = query.eq('city', selectedCity);
  if (selectedTownship) query = query.eq('township', selectedTownship);
  
  const { data: jobs } = await query;

  // Check if any filters are active to show the premium glowing indicator
  const hasActiveFilters = Boolean(selectedCity || selectedCategory || selectedPayPeriod || (selectedStatus && selectedStatus !== 'all'));

  return (
    <main className={`relative w-full min-h-screen bg-[#f8fafc] text-[#0f4c5c] antialiased selection:bg-[#a4c3d2]/40`}>
      
      <div className="relative z-10 flex flex-col h-full">
        <Navbar />

        {/* HIGH-END PREMIUM HERO SECTION */}
        <div className="w-full bg-[#0f4c5c] pt-10 pb-12 px-4 md:px-8 relative z-10 overflow-hidden shadow-md">
          {/* Subtle Claude-style gradient mesh background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-[#e3b23c]/15 via-emerald-500/10 to-[#0f4c5c] blur-[100px] rounded-full pointer-events-none opacity-80"></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-10 px-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm leading-tight whitespace-nowrap">
                {t.heroFind}<span className="text-[#e3b23c]">{t.heroPartTime}</span>{t.heroJobs}
              </h1>
              <h2 className="sr-only">
                PartTimeMM Part Time Jobs မြန်မာပြည်. Search the best part time jobs (အချိန်ပိုင်း အလုပ်), freelance work, and student roles in Myanmar on PartTimeMM.
              </h2>
            </div>
            
            {/* Premium Floating Search Bar */}
            <form method="GET" action="/" className="max-w-2xl mx-auto flex items-center bg-white/95 backdrop-blur-xl rounded-full p-2 pl-6 shadow-[0_15px_35px_rgb(0,0,0,0.2)] focus-within:ring-4 focus-within:ring-[#e3b23c]/40 focus-within:bg-white transition-all duration-300 border border-white/20">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text" 
                name="q" 
                defaultValue={searchTerm} 
                placeholder={t.searchPlaceholder} 
                className="flex-1 w-full bg-transparent border-none text-[15px] font-medium text-gray-900 focus:outline-none focus:ring-0 placeholder-gray-400 py-3 px-3" 
              />
              <button type="submit" className="px-8 py-3.5 bg-[#e3b23c] text-[#0f4c5c] rounded-full text-sm font-bold hover:bg-[#f0c254] hover:shadow-lg hover:shadow-[#e3b23c]/40 transition-all active:scale-95">
                {t.searchBtn}
              </button>
            </form>
          </div>
        </div>

        {/* EDGE-TO-EDGE TELEGRAM BANNER */}
        <TelegramBanner />

        {/* PREMIUM EXPANDABLE FILTER SECTION */}
        <section className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-[64px] z-40 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <details className="group [&_summary::-webkit-details-marker]:hidden">
              
              {/* The "Hamburger" / Filter Toggle Bar */}
              <summary className="flex items-center justify-between py-4 cursor-pointer list-none select-none">
                <div className="flex items-center gap-3 text-[#0f4c5c] font-bold">
                  <div className="w-9 h-9 rounded-full bg-[#0f4c5c]/5 flex items-center justify-center text-[#0f4c5c]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <span className="text-[15px]">Filters / စစ်ထုတ်မည်</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Glowing Indicator if filters are active */}
                  {hasActiveFilters && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e3b23c] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e3b23c]"></span>
                    </span>
                  )}
                  
                  {/* Animated Chevron */}
                  <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center group-open:rotate-180 transition-transform duration-300">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </summary>
              
              {/* The Filter Form (Hidden until clicked) */}
              <div className="pb-6 pt-2 animate-in slide-in-from-top-4 fade-in duration-300">
                <form method="GET" action="/" className="flex flex-col gap-4">
                  {searchTerm && <input type="hidden" name="q" value={searchTerm} />}
                  
                  {/* Filter Grid - 2 columns on tablet/desktop, 1 on mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="md:col-span-2">
                      <CityTownSelect defaultCity={selectedCity} defaultTown={selectedTownship} locationMap={locationMap} />
                    </div>
                    
                    <CustomSelect 
                      name="category"
                      defaultValue={selectedCategory}
                      placeholder={t.allCategories}
                      options={[
                        { value: 'delivery', label: t.cats.delivery },
                        { value: 'manual', label: t.cats.manual },
                        { value: 'tech', label: t.cats.tech },
                        { value: 'events', label: t.cats.events },
                        { value: 'education', label: t.cats.education },
                        { value: 'admin', label: t.cats.admin },
                        { value: 'retail', label: t.cats.retail },
                        { value: 'freelancer', label: t.cats.freelancer },
                        { value: 'other', label: t.cats.other },
                      ]}
                    />

                    <CustomSelect 
                      name="pay_period"
                      defaultValue={selectedPayPeriod}
                      placeholder={t.anyPayType}
                      options={[
                        { value: 'hourly', label: t.pays.hourly },
                        { value: 'daily', label: t.pays.daily },
                        { value: 'monthly', label: t.pays.monthly },
                        { value: 'fixed', label: t.pays.fixed },
                      ]}
                    />

                    <div className="md:col-span-2">
                      <CustomSelect 
                        name="status"
                        defaultValue={selectedStatus}
                        placeholder={t.all}
                        options={[
                          { value: 'all', label: t.all },
                          { value: 'new', label: t.newToYou },
                          { value: 'closed', label: t.closed },
                        ]}
                      />
                    </div>
                  </div>
                  
                  {/* Filter Buttons */}
                  <div className="flex items-center gap-3 w-full mt-2 pt-5 border-t border-gray-100">
                    <Link 
                      href="/" 
                      className="flex-1 text-center px-4 py-3.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      {t.clearFilters}
                    </Link>
                    <button type="submit" className="flex-1 px-4 py-3.5 bg-[#0f4c5c] text-white rounded-xl text-sm font-bold hover:bg-[#0a3844] transition-colors shadow-md active:scale-[0.98]">
                      {t.apply}
                    </button>
                  </div>
                </form>
              </div>
            </details>
          </div>
        </section>

        {/* Job Feed Container (Re-establishing the padding for cards) */}
        <div className="px-4 md:px-8 pb-12 pt-6 max-w-3xl mx-auto w-full space-y-6">
          
          {/* Job Feed */}
          <section className="w-full relative z-20">

            {/* SEO BOOST: Hidden title for screen readers and Google bots */}
            <h2 className="sr-only">Latest အချိန်ပိုင်း အလုပ် (Part Time Jobs) in Myanmar</h2>
            
            {jobs && jobs.length > 0 ? (
              <div className="flex flex-col gap-5">
                {jobs.map((job, index) => {
                  
                  const postDate = new Date(job.created_at);
                  const now = new Date();
                  const isNew = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60) < 24;
                  const isClosed = job.status !== 'open';

                  const taskDateObj = job.task_date ? new Date(job.task_date) : null;
                  const taskDateFormatted = taskDateObj ? `${taskDateObj.getDate()}.${taskDateObj.getMonth() + 1}.${taskDateObj.getFullYear()}` : null;

                  let daysLeft = null;
                  if (job.expires_at) {
                    const expDateObj = new Date(job.expires_at);
                    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const expMidnight = new Date(expDateObj.getFullYear(), expDateObj.getMonth(), expDateObj.getDate());
                    
                    const diffTime = expMidnight.getTime() - todayMidnight.getTime();
                    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  }

                  const isBookmarked = job.bookmarks && job.bookmarks.length > 0;

                  return (
                   <AnimatedCard key={job.id} index={index}>
                      <div className="group bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full overflow-hidden">
                        
                        <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${job.title}`}></Link>
                        
                        {/* Premium Status Badge (Top Right) */}
                        <div className="absolute top-5 right-5 z-10 pointer-events-none">
                          {isClosed ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-rose-500 bg-rose-50 border border-rose-100/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                              {t.closed}
                            </span>
                          ) : isNew ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-teal-600 bg-teal-50 border border-teal-100/50 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5 animate-pulse"></span>
                              {t.newToYou}
                            </span>
                          ) : daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100/50">
                              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {daysLeft} {t.daysLeft}
                            </span>
                          ) : null}
                        </div>

                        {/* Top: Title & Tags (Professional Reading Order) */}
                        <div className="relative z-10 pointer-events-none pr-24 mb-6">
                          <h2 className="text-xl md:text-[22px] font-extrabold text-gray-900 leading-[1.3] group-hover:text-[#0f4c5c] transition-colors mb-3 line-clamp-2">
                            {job.title}
                          </h2>
                          
                          <div className="flex flex-col gap-2.5">
                            {job.city && job.township && (
                              <div className="flex items-center text-[13px] text-gray-500 font-medium">
                                <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center mr-2 border border-gray-100">
                                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                {job.township}, {job.city.split(' ')[0]}
                              </div>
                            )}
                            
                            <div className="flex items-center text-[13px] text-gray-500 font-medium">
                              <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center mr-2 border border-gray-100">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                              </div>
                              {job.category ? ((t.cats as any)[job.category] || job.category) : t.privateAdvertiser}
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Price and Actions (Distinct Footer Zone) */}
                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between relative z-20 bg-white">
                          
                          {/* Price Area */}
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#a4c3d2] mb-0.5">Pay</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl md:text-2xl font-black text-[#0f4c5c] tracking-tight">
                                {job.price ? new Intl.NumberFormat('en-MM').format(job.price) : t.priceNegotiable}
                                {job.price && <span className="text-base font-bold ml-1">MMK</span>}
                              </span>
                              
                              {/* Translated Pay Period */}
                              {job.pay_period && (
                                <span className="text-sm font-semibold text-gray-400 ml-1">
                                  {t.per}{(t.pays as any)[job.pay_period] || job.pay_period}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Interactive Actions */}
                          <div className="flex items-center gap-2 pointer-events-auto">
                            {userRole === 'seeker' && (
                              <div className="bg-gray-50 hover:bg-[#e3b23c]/10 rounded-full transition-colors border border-gray-100">
                                <BookmarkButton jobId={job.id} initialIsBookmarked={isBookmarked} />
                              </div>
                            )}
                            {user?.id === job.employer_id && (
                              <div className="bg-gray-50 hover:bg-rose-50 rounded-full transition-colors border border-gray-100">
                                <CloseJobButton jobId={job.id} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subtle bottom accent line for visual weight */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e3b23c]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </AnimatedCard>
                  );
                })}
              </div>
            ) : (
              /* PREMIUM ANTI-SCAM EMPTY STATE */
              <div className="w-full py-24 px-6 bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-gray-100 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                  <ShieldCheck className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">{t.emptyStateTitle}</h3>
                <p className="text-gray-500 text-base max-w-md mx-auto font-medium leading-relaxed">
                  {t.emptyStateDesc}
                </p>
                {hasActiveFilters && (
                  <Link href="/" className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 active:scale-95">
                    {t.clearFilters}
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>

        {/* PREMIUM COMPACT TRUST FOOTER */}
        <div className="w-full bg-gradient-to-b from-[#f8fafc] to-white border-t border-gray-100 pt-12 pb-16 mt-auto relative overflow-hidden">
          {/* Subtle background flair */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#0f4c5c]/5 to-transparent blur-[80px] rounded-full pointer-events-none"></div>

          <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
            
            {/* Header & Lock Micro-copy */}
            <div className="flex flex-col items-center text-center mb-8">
              <h3 className="text-xl md:text-2xl font-extrabold text-[#0f4c5c] tracking-tight">{t.footerTitle}</h3>
              <div className="flex items-center justify-center gap-1.5 mt-3 px-4 py-1.5 bg-[#e3b23c]/10 rounded-full border border-[#e3b23c]/20">
                <Lock className="w-3.5 h-3.5 text-[#e3b23c]" />
                <span className="text-[#0f4c5c] text-[13px] font-bold tracking-wide">{t.footerSub}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Premium Compact Badge 1 */}
              <div className="group relative bg-white/80 backdrop-blur-md border border-gray-200/60 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(15,76,92,0.06)] hover:border-[#0f4c5c]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900 mb-0.5">{t.badge1Title}</p>
                  <p className="text-[13px] text-gray-500 font-medium leading-relaxed">{t.badge1Desc}</p>
                </div>
              </div>

              {/* Premium Compact Badge 2 */}
              <div className="group relative bg-white/80 backdrop-blur-md border border-gray-200/60 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(15,76,92,0.06)] hover:border-[#0f4c5c]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  <Wallet className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900 mb-0.5">{t.badge2Title}</p>
                  <p className="text-[13px] text-gray-500 font-medium leading-relaxed">{t.badge2Desc}</p>
                </div>
              </div>

              {/* Premium Compact Badge 3 */}
              <div className="group relative bg-white/80 backdrop-blur-md border border-gray-200/60 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(15,76,92,0.06)] hover:border-[#0f4c5c]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900 mb-0.5">{t.badge3Title}</p>
                  <p className="text-[13px] text-gray-500 font-medium leading-relaxed">{t.badge3Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Structured Data: Google Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://parttimemm.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://parttimemm.com/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </div>
    </main>
  );
}