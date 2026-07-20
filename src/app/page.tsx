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
  const selectedStatus = resolvedParams?.status || ''; // Added Status

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

  return (
    <main className={`relative w-full min-h-screen bg-[#f8fafc] text-[#0f4c5c] antialiased selection:bg-[#a4c3d2]/40`}>
      
      <div className="relative z-10 flex flex-col h-full">
        <Navbar />

        {/* Full-width Search Hero (Sleek) */}
        <div className="w-full bg-[#0f4c5c] pt-8 pb-12 px-4 md:px-8 relative z-10 overflow-hidden shadow-md">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#e3b23c]/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-8 px-2">
              {/* Visually clean title for humans */}
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                Find <span className="text-[#e3b23c]">Part Time</span> Jobs
              </h1>
              <p className="text-[#a4c3d2] text-sm md:text-base font-medium">
                {t.subtitle}
              </p>
              
              {/* SEO TEXT: Hidden visually, but read perfectly by Google bots */}
              <h2 className="sr-only">
                PartTimeMM Part Time Jobs မြန်မာပြည်. Search the best part time jobs (အချိန်ပိုင်း အလုပ်), freelance work, and student roles in Myanmar on PartTimeMM.
              </h2>
            </div>
            
            <form method="GET" action="/" className="max-w-2xl mx-auto flex items-center bg-white rounded-full p-1.5 pl-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus-within:ring-4 focus-within:ring-[#e3b23c]/30 transition-all">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text" 
                name="q" 
                defaultValue={searchTerm} 
                placeholder={t.searchPlaceholder} 
                className="flex-1 w-full bg-transparent border-none text-base font-medium text-gray-900 focus:outline-none focus:ring-0 placeholder-gray-400 py-3 px-3" 
              />
              <button type="submit" className="px-6 md:px-8 py-3 bg-[#e3b23c] text-[#0f4c5c] rounded-full text-sm font-bold hover:bg-[#f0c254] transition-colors">
                {t.searchBtn}
              </button>
            </form>
          </div>
        </div>

        {/* EDGE-TO-EDGE TELEGRAM BANNER */}
        <TelegramBanner />

        {/* EDGE-TO-EDGE FILTER SECTION */}
        <section className="w-full bg-white border-b border-gray-200 py-5 relative z-30 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <form method="GET" action="/" className="flex flex-col gap-3">
              {searchTerm && <input type="hidden" name="q" value={searchTerm} />}
              
              {/* Stacked on mobile (flex-col), side-by-side on desktop (md:flex-row) */}
              <div className="flex flex-col md:flex-row items-center gap-3 w-full">
                
                <div className="w-full md:flex-1">
                  <CityTownSelect defaultCity={selectedCity} defaultTown={selectedTownship} locationMap={locationMap} />
                </div>
                
                <div className="w-full md:w-[150px]">
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
                      { value: 'other', label: t.cats.other },
                    ]}
                  />
                </div>

                <div className="w-full md:w-[150px]">
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
                </div>

                {/* The New Status Filter */}
                <div className="w-full md:w-[120px]">
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
              <div className="flex items-center gap-3 w-full mt-2">
                <Link 
                  href="/" 
                  className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {t.clearFilters}
                </Link>
                <button type="submit" className="flex-1 px-4 py-3 bg-[#0f4c5c] text-white rounded-xl text-sm font-bold hover:bg-[#0a3844] transition-colors shadow-md">
                  {t.apply}
                </button>
              </div>
            </form>
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
              <div className="w-full py-24 bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 text-center shadow-sm flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-white/80 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <svg className="w-10 h-10 text-[#a4c3d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-[#0f4c5c] mb-2">{t.noJobs}</h3>
                <p className="text-[#0f4c5c]/60 text-sm max-w-xs mx-auto font-medium">{t.noJobsDesc}</p>
              </div>
            )}
         </section>
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