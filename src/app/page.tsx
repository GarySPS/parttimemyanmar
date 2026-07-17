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

// Map database category values to full display labels
const CATEGORY_MAP: Record<string, string> = {
  'delivery': 'Delivery & Logistics',
  'manual': 'Manual Labor & Cleaning',
  'tech': 'Tech & Digital',
  'events': 'Events & Hospitality',
  'education': 'Education & Tutoring',
  'admin': 'Admin & Office',
  'retail': 'Retail & Sales',
  'other': 'Other'
};

export default async function Home({
  searchParams,
}: {
 searchParams: Promise<{ city?: string, township?: string, q?: string, category?: string, pay_period?: string }>;
}) {
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
    .gte('expires_at', today)
    .order('created_at', { ascending: false });

  if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);
  if (selectedCategory) query = query.eq('category', selectedCategory);
  if (selectedPayPeriod) query = query.eq('pay_period', selectedPayPeriod);
  if (selectedCity) query = query.eq('city', selectedCity);
  if (selectedTownship) query = query.eq('township', selectedTownship);
  
  const { data: jobs } = await query;

  return (
    <main className={`relative w-full min-h-screen text-[#0f4c5c] antialiased selection:bg-[#a4c3d2]/40`}>
      
      <div className="relative z-10 flex flex-col h-full">
        <Navbar />

        {/* Full-width Search Hero */}
        <div className="w-full bg-[#0f4c5c] px-4 pb-8 pt-5 md:px-8 md:pb-10 md:pt-6 relative z-10 shadow-md">
          <div className="max-w-3xl mx-auto mb-5 px-2">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Part Time Jobs 
              <span className="text-[#a4c3d2] font-medium text-lg md:text-2xl">in Myanmar</span>
            </h1>
          </div>
          
          <form method="GET" action="/" className="max-w-3xl mx-auto relative z-10 flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 focus-within:border-[#e3b23c] focus-within:bg-white/15 transition-all shadow-inner">
            <div className="pl-4 pr-2 text-[#a4c3d2]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              name="q" 
              defaultValue={searchTerm} 
              placeholder="Search job title..." 
              className="flex-1 w-full bg-transparent border-none text-base font-medium text-white focus:outline-none focus:ring-0 placeholder-[#a4c3d2]/70 py-3" 
            />
            <button type="submit" className="px-6 py-3 bg-[#e3b23c] text-[#0f4c5c] rounded-xl text-sm font-bold shadow-lg hover:bg-[#f0c254] hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 active:shadow-sm transition-all">
              Search
            </button>
          </form>
        </div>

        <div className="px-4 md:px-8 pb-12 max-w-3xl mx-auto w-full space-y-6">
          
          {/* Glassmorphism Filters Area */}
          <section className="w-full relative z-30">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <form method="GET" action="/" className="flex flex-col gap-4">
                {searchTerm && <input type="hidden" name="q" value={searchTerm} />}
                
                <div className="flex flex-col sm:flex-row gap-4 relative z-40">
                  <Link 
                    href="/" 
                    className={`shrink-0 text-center px-6 py-3 rounded-2xl text-sm font-bold transition-all border active:scale-[0.97] active:shadow-sm ${!selectedCity && !selectedCategory && !selectedPayPeriod ? 'bg-[#0f4c5c] text-white border-[#0f4c5c] shadow-md' : 'bg-white/50 text-[#0f4c5c]/70 border-white/60 hover:bg-white hover:text-[#0f4c5c] shadow-sm'}`}
                  >
                    Clear Filters
                  </Link>
                  <div className="flex-1">
                    <CityTownSelect defaultCity={selectedCity} defaultTown={selectedTownship} locationMap={locationMap} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 relative z-30">
                  <CustomSelect 
                    name="category"
                    defaultValue={selectedCategory}
                    placeholder="All Categories"
                    options={[
                      { value: 'delivery', label: 'Delivery & Logistics' },
                      { value: 'manual', label: 'Manual Labor & Cleaning' },
                      { value: 'tech', label: 'Tech & Digital' },
                      { value: 'events', label: 'Events & Hospitality' },
                      { value: 'education', label: 'Education & Tutoring' },
                      { value: 'admin', label: 'Admin & Office' },
                      { value: 'retail', label: 'Retail & Sales' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                  <CustomSelect 
                    name="pay_period"
                    defaultValue={selectedPayPeriod}
                    placeholder="Any Pay Type"
                    options={[
                      { value: 'hourly', label: 'Hourly' },
                      { value: 'daily', label: 'Daily' },
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'fixed', label: 'Fixed Price' },
                    ]}
                  />
                  <button type="submit" className="px-8 py-3 bg-[#0f4c5c] text-white rounded-2xl text-sm font-bold hover:bg-[#0f4c5c]/90 hover:shadow-lg active:scale-[0.97] active:translate-y-0 active:shadow-sm transition-all shadow-sm">
                    Apply
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Job Feed */}
          <section className="w-full relative z-20">
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
                      {/* Premium Glass Job Card */}
                      <div className="relative z-0 bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:border-[#a4c3d2]/60 transition-all duration-300 group flex flex-col h-full overflow-hidden">
                        
                        <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${job.title}`}></Link>
                        
                        <div className="p-6 md:p-8 flex flex-col flex-grow relative z-10 pointer-events-none">
                          
                          {/* Header: Title & Category */}
                          <div className="pr-12">
                            <h2 className="text-xl md:text-[1.35rem] font-bold text-[#0f4c5c] leading-snug group-hover:text-[#e3b23c] transition-colors">
                              {job.title}
                            </h2>
                            <p className="text-sm md:text-base text-[#0f4c5c]/60 font-medium mt-1.5 capitalize flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#a4c3d2]"></span>
                              {job.category ? (CATEGORY_MAP[job.category] || job.category) : 'Private Advertiser'}
                            </p>
                          </div>

                          {/* Badges */}
                          {(isClosed || isNew) && (
                            <div className="mt-4">
                              {isClosed ? (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                  Closed
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-[#a4c3d2]/20 text-[#0f4c5c] border border-[#a4c3d2]/30 shadow-sm">
                                  New to you
                                </span>
                              )}
                            </div>
                          )}

                          {/* Details List */}
                          <div className="mt-6 space-y-4">
                            {job.city && job.township && (
                              <div className="flex items-center text-[#0f4c5c]/80">
                                <div className="p-2 bg-white/50 rounded-xl mr-3 shadow-sm border border-white/40">
                                  <svg className="w-5 h-5 text-[#a4c3d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                </div>
                                <span className="text-[0.95rem] font-medium">{job.township}, {job.city.split(' ')[0]}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-[#0f4c5c]/80">
                              <div className="p-2 bg-white/50 rounded-xl mr-3 shadow-sm border border-white/40">
                                <svg className="w-5 h-5 text-[#e3b23c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="text-[0.95rem] font-bold text-[#0f4c5c]">
                                {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Price Negotiable'}
                                <span className="font-medium text-[#0f4c5c]/60">{job.pay_period && ` per ${job.pay_period}`}</span>
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Card Footer Area */}
                        <div className="px-6 py-4 border-t border-white/40 bg-white/30 flex justify-between items-center relative z-20">
                          <div className="text-xs font-bold text-[#0f4c5c]/50 uppercase tracking-wider flex items-center gap-1.5">
                            {daysLeft !== null && daysLeft >= 0 ? (
                               <>
                                <svg className="w-4 h-4 text-[#a4c3d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {`${daysLeft}d+ left`}
                               </>
                            ) : 'Expired'}
                          </div>
                          
                          {/* Interactive Buttons */}
                          <div className="flex items-center gap-3 pointer-events-auto">
                            {userRole === 'seeker' && (
                              <BookmarkButton jobId={job.id} initialIsBookmarked={isBookmarked} />
                            )}
                            
                            {user?.id === job.employer_id && (
                              <CloseJobButton jobId={job.id} />
                            )}
                          </div>
                        </div>

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
                <h3 className="text-xl font-extrabold text-[#0f4c5c] mb-2">No jobs found</h3>
                <p className="text-[#0f4c5c]/60 text-sm max-w-xs mx-auto font-medium">Try adjusting your filters or search terms to find what you're looking for.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}