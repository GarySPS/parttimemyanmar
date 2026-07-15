//src/app/page.tsx

//src/app/page.tsx

import { createClient } from './utils/supabase/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import AnimatedCard from '../components/AnimatedCard';
import CustomSelect from '../components/CustomSelect';
import CityTownSelect from '../components/CityTownSelect';
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
    .select(`*, profiles(contact_app, contact_username)`)
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
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-teal-900 px-4 py-3 md:px-8 flex justify-between items-center shadow-md border-b border-teal-800/50">
        <div className="flex items-center">
          <img src="/logo/logo.png" alt="PartTimeMM Logo" className="h-8 md:h-10 w-auto object-contain" />
        </div>
  
        <div className="flex items-center gap-3">
            {user ? (
            <>
              <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-100 flex items-center justify-center font-bold text-lg border border-emerald-500/30 shadow-sm">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <details className="group">
                <summary className="list-none cursor-pointer p-2 hover:bg-teal-800 rounded-lg transition-colors [&::-webkit-details-marker]:hidden">
                  <svg className="w-8 h-8 text-teal-50 group-open:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  <svg className="w-8 h-8 text-teal-50 hidden group-open:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </summary>
                <div className="absolute top-full left-0 w-full h-[calc(100vh-80px)] bg-teal-950/95 backdrop-blur-xl border-t border-teal-900 z-50 flex flex-col overflow-y-auto">
                  <div className="w-full flex flex-col min-h-full">
                    {userRole === 'employer' && (
                      <Link href="/create" className="px-6 py-5 text-base font-bold text-teal-50 border-b border-teal-900/50 flex items-center gap-3 hover:bg-teal-900 transition-colors">
                        <span className="bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xl leading-none pb-0.5 shadow-lg shadow-emerald-500/20">+</span> 
                        Post a Job
                      </Link>
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

      {/* Job Search Bar */}
      <div className="w-full bg-teal-900 px-4 pb-8 pt-5 md:px-8 md:pb-10 md:pt-6">
        <div className="max-w-3xl mx-auto mb-5 px-2">
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-wide drop-shadow-sm leading-snug">
            အချိန်ပိုင်းအလုပ်အကိုင်များ
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

                return (
                  <AnimatedCard key={job.id} index={index}>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                      
                      <h2 className="font-bold text-lg md:text-xl text-[#0a1930] mb-1.5 uppercase tracking-wide">
                        {job.title}
                      </h2>
                      
                      {/* Pull from Category Dictionary */}
                      <div className="text-base text-gray-700 mb-3 capitalize">
                        {job.category ? (CATEGORY_MAP[job.category] || job.category) : 'Private Advertiser'}
                      </div>
                      
                      {/* Dynamic New Badge */}
                      {isNew && (
                        <div className="inline-block px-3 py-1 bg-[#e6f4ea] text-[#137333] text-xs font-bold rounded mb-4">
                          New
                        </div>
                      )}

                      {/* Display Dates & Days Left */}
                      {(job.task_date || job.expires_at) && (
                        <div className="flex flex-col gap-1 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {job.task_date && (
                            <div className="text-sm font-medium text-slate-800">
                              📅 Task Date: {taskDateFormatted}
                            </div>
                          )}
                          {job.expires_at && daysLeft !== null && daysLeft >= 0 && (
                            <div className="text-sm font-medium text-orange-600">
                              ⏳ Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                            </div>
                          )}
                        </div>
                      )}

                      {job.city && job.township && (
                        <div className="text-base text-gray-700 mb-1">
                          📍 {job.township}, {job.city.split(' ')[0]}
                        </div>
                      )}

                      <div className="text-base text-gray-900 font-medium mb-4">
                        {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Price Negotiable'}
                        {job.pay_period === 'hourly' && ' per hour'}
                        {job.pay_period === 'daily' && ' per day'}
                        {job.pay_period === 'monthly' && ' per month'}
                        {job.pay_period === 'fixed' && ' per task'}
                      </div>

                      <p className="text-base text-gray-600 leading-relaxed mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      {/* Display Attached Photo if it exists */}
                      {job.image_url && (
                        <div className="mb-6 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                          <img src={job.image_url} alt="Task Attachment" className="w-full h-48 md:h-64 object-cover object-center" />
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        {/* Left Side: Contact Info */}
                        {(job.contact_app || job.profiles?.contact_app) && (job.contact_username || job.profiles?.contact_username) ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md">
                              {job.contact_app || job.profiles?.contact_app}
                            </span>
                            <span className="text-sm font-mono font-medium text-gray-800 bg-white px-3 py-1.5 rounded-md border border-gray-200 select-all">
                              {job.contact_username || job.profiles?.contact_username}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-400">No contact linked</span>
                        )}

                        {/* Right Side: Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {/* Save/Bookmark Button for Seekers */}
                          {userRole === 'seeker' && (
                            <button className="p-2.5 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors" title="Save Task">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                            </button>
                          )}
                          
                          {/* Mark Complete Button for the Employer */}
                          {user?.id === job.employer_id && (
                            <Link href={`/complete/${job.id}`} className="px-5 py-2.5 bg-white text-teal-900 border border-teal-800 hover:bg-teal-50 rounded-lg text-sm font-bold transition-colors text-center ml-2">
                              Mark Complete
                            </Link>
                          )}
                        </div>

                      </div>
                    </div>
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