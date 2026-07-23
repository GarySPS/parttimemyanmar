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
import JobCard from '../components/JobCard';
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

  // Fetch clean, standardized locations from your dedicated table
  const { data: locData } = await supabase.from('locations').select('city, township');
  const locationMap: Record<string, string[]> = {};
  
  if (locData) {
    locData.forEach(loc => {
      if (loc.city && loc.township) {
        if (!locationMap[loc.city]) locationMap[loc.city] = [];
        if (!locationMap[loc.city].includes(loc.township)) {
          locationMap[loc.city].push(loc.township);
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
  <JobCard 
    job={job}
    t={t}
    isClosed={isClosed}
    isNew={isNew}
    daysLeft={daysLeft}
    actionButtons={
      <>
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
      </>
    }
  />
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

        {/* HYPER-PREMIUM PROFESSIONAL FOOTER */}
        <footer className="w-full bg-white border-t border-gray-200 pt-12 pb-8 mt-auto relative z-10">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            
            {/* Top Section: Brand & Compact Trust Indicators */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-gray-100 gap-6">
              <div className="max-w-xs">
                <h3 className="text-2xl font-extrabold text-[#0f4c5c] tracking-tight mb-2">PartTime<span className="text-[#e3b23c]">MM</span></h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-bold tracking-wide">{t.footerSub}</span>
                </div>
              </div>
              
              {/* Micro-Trust Badges (Indeed style) */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600">
                <div className="flex items-center gap-2 cursor-default group">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[13px] font-bold text-gray-800">{t.badge1Title}</span>
                </div>
                <div className="hidden md:block w-px h-5 bg-gray-200"></div>
                <div className="flex items-center gap-2 cursor-default group">
                  <Wallet className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[13px] font-bold text-gray-800">{t.badge2Title}</span>
                </div>
                <div className="hidden md:block w-px h-5 bg-gray-200"></div>
                <div className="flex items-center gap-2 cursor-default group">
                  <Sparkles className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[13px] font-bold text-gray-800">{t.badge3Title}</span>
                </div>
              </div>
            </div>

            {/* Middle Section: Standard Professional Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-4">Job Seekers</h4>
                <ul className="space-y-3 text-[13px] text-gray-500 font-medium">
                  <li><Link href="/" className="hover:text-[#0f4c5c] hover:underline transition-all">Browse Part-time Jobs</Link></li>
                  <li><Link href="/" className="hover:text-[#0f4c5c] hover:underline transition-all">Student Jobs</Link></li>
                  <li><Link href="/" className="hover:text-[#0f4c5c] hover:underline transition-all">Career Advice</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-4">Employers</h4>
                <ul className="space-y-3 text-[13px] text-gray-500 font-medium">
                  <li><Link href="/" className="hover:text-[#0f4c5c] hover:underline transition-all">Post a Job</Link></li>
                  <li><Link href="/" className="hover:text-[#0f4c5c] hover:underline transition-all">Employer Guidelines</Link></li>
                  <li><Link href="/" className="hover:text-[#0f4c5c] hover:underline transition-all">Pricing & Trust</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-4">About Us</h4>
                <ul className="space-y-3 text-[13px] text-gray-500 font-medium">
                  <li><Link href="/" className="hover:text-[#0f4c5c] hover:underline transition-all">Our Story</Link></li>
                  <li><Link href="/" className="hover:text-[#0f4c5c] hover:underline transition-all">Trust & Safety</Link></li>
                  <li><Link href="/" className="hover:text-[#0f4c5c] hover:underline transition-all">Help Center / Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-4">Legal</h4>
                <ul className="space-y-3 text-[13px] text-gray-500 font-medium">
                  <li><Link href="/" className="hover:text-[#0f4c5c] hover:underline transition-all">Terms of Service</Link></li>
                  <li><Link href="/" className="hover:text-[#0f4c5c] hover:underline transition-all">Privacy Policy</Link></li>
                  <li><Link href="/" className="hover:text-[#0f4c5c] hover:underline transition-all">Scam Prevention</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Section: Copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-100 text-[13px] text-gray-400 gap-4">
              <p>© {new Date().getFullYear()} PartTimeMM. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link href="/" className="hover:text-gray-900 transition-colors">Facebook</Link>
                <Link href="/" className="hover:text-gray-900 transition-colors">Telegram</Link>
                <Link href="/" className="hover:text-gray-900 transition-colors">LinkedIn</Link>
              </div>
            </div>
          </div>
        </footer>

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