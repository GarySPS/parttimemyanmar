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
    <main className={`w-full min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-teal-200`}>
      
      <Navbar />

      {/* Job Search Bar */}
      <div className="w-full bg-teal-900 px-4 pb-8 pt-5 md:px-8 md:pb-10 md:pt-6">
        <div className="max-w-3xl mx-auto mb-5 px-2">
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-wide drop-shadow-sm leading-snug">
           Part Time Jobs in Myanmar
          </h1>
        </div>
        <form method="GET" action="/" className="max-w-3xl mx-auto flex items-center bg-white rounded-full p-2 shadow-lg border border-teal-700/50">
          <div className="pl-4 pr-2 text-slate-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
          <input type="text" name="q" defaultValue={searchTerm} placeholder="Search job title..." className="flex-1 w-full bg-transparent border-none text-base font-medium text-slate-900 focus:outline-none focus:ring-0 placeholder-slate-500 py-3" />
          <button type="submit" className="px-5 py-2.5 bg-teal-800 text-white rounded-full text-sm font-bold shadow-md hover:bg-teal-700 transition-colors">Search</button>
        </form>
      </div>

      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        {/* Change: Add relative positioning and a z-index (z-30) to create a higher stacking context */}
        <section className="w-full relative z-30">
          <form method="GET" action="/" className="flex flex-col gap-3">
            {searchTerm && <input type="hidden" name="q" value={searchTerm} />}
            
            <div className="flex flex-col sm:flex-row gap-3 relative z-40">
              <Link 
                href="/" 
                className={`shrink-0 text-center px-5 py-3 rounded-full text-sm font-bold transition-all border ${!selectedCity && !selectedCategory && !selectedPayPeriod ? 'bg-teal-900 text-white border-teal-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm'}`}
              >
                Clear Filters
              </Link>
              <div className="flex-1">
                <CityTownSelect defaultCity={selectedCity} defaultTown={selectedTownship} locationMap={locationMap} />
              </div>
            </div>

            {/* Changed: Increased z-index from z-10 to z-30 to stack dropdowns over job cards */}
            <div className="flex flex-col sm:flex-row gap-3 relative z-30">
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
              <button type="submit" className="px-8 py-3 bg-teal-900 text-white rounded-full text-sm font-bold hover:bg-teal-800 transition-colors shadow-sm">
                Apply
              </button>
            </div>
          </form>
        </section>

        <section className="w-full pb-12">
          {jobs && jobs.length > 0 ? (
            <div className="flex flex-col gap-5">
              {jobs.map((job, index) => {
                
                // 1. Calculate status and age
                const postDate = new Date(job.created_at);
                const now = new Date();
                const isNew = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60) < 24;
                const isClosed = job.status !== 'open';

                // 2. Format the Task Date (e.g., 16.7.2026)
                const taskDateObj = job.task_date ? new Date(job.task_date) : null;
                const taskDateFormatted = taskDateObj ? `${taskDateObj.getDate()}.${taskDateObj.getMonth() + 1}.${taskDateObj.getFullYear()}` : null;

                // 3. Calculate Days Left until Expiration
                let daysLeft = null;
                if (job.expires_at) {
                  const expDateObj = new Date(job.expires_at);
                  // Reset times to midnight to get clean day counts
                  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const expMidnight = new Date(expDateObj.getFullYear(), expDateObj.getMonth(), expDateObj.getDate());
                  
                  const diffTime = expMidnight.getTime() - todayMidnight.getTime();
                  daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }

                const isBookmarked = job.bookmarks && job.bookmarks.length > 0;

                return (
                  <AnimatedCard key={job.id} index={index}>
                    {/* Changed: Added z-0 to explicitly lower the job card's stacking order relative to the filter dropdowns */}
                    <div className="relative z-0 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 hover:border-teal-300 transition-all duration-300 group flex flex-col h-full overflow-hidden">
                      
                      {/* Invisible Absolute Link covering entire card for clickability */}
                      <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${job.title}`}></Link>
                      
                      <div className="p-5 md:p-6 flex flex-col flex-grow relative z-10 pointer-events-none">
                        
                        {/* Header: Title & Category */}
                        <div className="pr-12">
                          <h2 className="text-xl md:text-[1.35rem] font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                            {job.title}
                          </h2>
                          <p className="text-sm md:text-base text-slate-600 font-medium mt-1.5 capitalize">
                            {job.category ? (CATEGORY_MAP[job.category] || job.category) : 'Private Advertiser'}
                          </p>
                        </div>

                        {/* Badges */}
                        {(isClosed || isNew) && (
                          <div className="mt-3.5">
                            {isClosed ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100/50">
                                Closed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                                New to you
                              </span>
                            )}
                          </div>
                        )}

                        {/* Details List (Icons restored & polished) */}
                        <div className="mt-5 space-y-3">
                          {job.city && job.township && (
                            <div className="flex items-center text-slate-600">
                              <svg className="w-5 h-5 mr-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span className="text-[0.95rem]">{job.township}, {job.city.split(' ')[0]}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-slate-600">
                            <svg className="w-5 h-5 mr-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[0.95rem] font-medium text-slate-700">
                              {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Price Negotiable'}
                              <span className="font-normal text-slate-500">{job.pay_period && ` per ${job.pay_period}`}</span>
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Footer Area with Separator */}
                      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center relative z-20">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {daysLeft !== null && daysLeft >= 0 
                            ? `${daysLeft}d+ left` 
                            : 'Expired'
                          }
                        </div>
                        
                        {/* Interactive Buttons (pointer-events-auto re-enables clicking on top of the background link) */}
                        <div className="flex items-center gap-2 pointer-events-auto">
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
            <div className="w-full py-24 bg-white rounded-2xl border border-slate-200 text-center shadow-sm flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No jobs found</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}