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
import { Noto_Sans_Myanmar } from 'next/font/google';

const notoSans = Noto_Sans_Myanmar({ 
  weight: ['400', '500', '700', '900'],
  subsets: ['myanmar'],
  display: 'swap',
});

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
    .eq('status', 'open') 
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
    <main className={`w-full min-h-screen bg-[#f3f4f6] text-gray-900 antialiased selection:bg-teal-200 ${notoSans.className}`}>
      
      <Navbar />

      {/* Job Search Bar */}
      <div className="w-full bg-teal-900 px-4 pb-8 pt-5 md:px-8 md:pb-10 md:pt-6">
        <div className="max-w-3xl mx-auto mb-5 px-2">
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-wide drop-shadow-sm leading-snug">
           Part Time Jobs in Myanmar
          </h1>
        </div>
        <form method="GET" action="/" className="max-w-3xl mx-auto flex items-center bg-white rounded-full p-2 shadow-lg border border-teal-700/50">
          <div className="pl-4 pr-2 text-gray-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
          <input type="text" name="q" defaultValue={searchTerm} placeholder="Search job title..." className="flex-1 w-full bg-transparent border-none text-base font-medium text-gray-900 focus:outline-none focus:ring-0 placeholder-gray-500 py-3" />
          <button type="submit" className="px-5 py-2.5 bg-teal-800 text-white rounded-full text-sm font-bold shadow-md hover:bg-teal-700 transition-colors">Search</button>
        </form>
      </div>

      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <section className="w-full">
          <form method="GET" action="/" className="flex flex-col gap-3">
            {searchTerm && <input type="hidden" name="q" value={searchTerm} />}
            
            <div className="flex flex-col sm:flex-row gap-3 relative z-20">
              <Link 
                href="/" 
                className={`shrink-0 text-center px-5 py-3 rounded-full text-sm font-bold transition-all border ${!selectedCity && !selectedCategory && !selectedPayPeriod ? 'bg-teal-900 text-white border-teal-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm'}`}
              >
                Clear Filters
              </Link>
              <div className="flex-1">
                <CityTownSelect defaultCity={selectedCity} defaultTown={selectedTownship} locationMap={locationMap} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
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
            <div className="flex flex-col gap-4">
              {jobs.map((job, index) => {
                
                // 1. Calculate if the post is less than 24 hours old
                const postDate = new Date(job.created_at);
                const now = new Date();
                const isNew = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60) < 24;

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
                    <Link 
                      href={`/jobs/${job.id}`} 
                      className="block relative bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-200 group"
                    >
                      {/* Header Area */}
                      <div className="pr-12">
                        <h2 className="text-lg font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-teal-700 transition-colors">
                          {job.title}
                        </h2>
                        <div className="text-sm text-slate-500 mt-1 capitalize">
                          {job.category ? (CATEGORY_MAP[job.category] || job.category) : 'Private Advertiser'}
                        </div>
                        {isNew && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-medium rounded">
                            New to you
                          </span>
                        )}
                      </div>

                      {/* Key Details (Location & Pay) */}
                      <div className="mt-4 space-y-2">
                        {job.city && job.township && (
                          <div className="flex items-center text-slate-600 text-sm">
                            <svg className="w-4 h-4 mr-2 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {job.township}, {job.city.split(' ')[0]}
                          </div>
                        )}
                        
                        <div className="flex items-center text-slate-600 text-sm">
                          <svg className="w-4 h-4 mr-2 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Price Negotiable'}
                          {job.pay_period && ` per ${job.pay_period}`}
                        </div>
                      </div>

                      {/* Footer Area */}
                      <div className="mt-6 flex justify-between items-end">
                        <div className="text-xs text-slate-400 font-medium">
                          {daysLeft !== null && daysLeft >= 0 
                            ? `${daysLeft}d+ ago` 
                            : 'Expired'
                          }
                        </div>
                        
                        {/* Absolute positioned Action Buttons so they don't break flex layout on small screens */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                          {userRole === 'seeker' && (
                            <BookmarkButton jobId={job.id} initialIsBookmarked={isBookmarked} />
                          )}
                          
                          {user?.id === job.employer_id && (
                            <CloseJobButton jobId={job.id} />
                          )}
                        </div>
                      </div>
                    </Link>
                  </AnimatedCard>
                );
              })}
            </div>
          ) : (
            <div className="w-full py-20 bg-white rounded-xl border border-gray-200 text-center shadow-sm">
              <span className="text-4xl block mb-4">🔍</span>
              <p className="text-gray-600 text-base font-medium">No open jobs found matching your filters.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}