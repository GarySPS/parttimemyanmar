// src/app/saved/page.tsx

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import AnimatedCard from '../../components/AnimatedCard';
import BookmarkButton from '../../components/BookmarkButton';
import { getLang } from '../utils/getLang';
import { dictionaries } from '../utils/dictionaries';

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

export default async function SavedJobsPage() {
  const supabase = await createClient();
  
  // Get dictionary translations
  const lang = await getLang();
  const t = dictionaries[lang].saved;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/'); 
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const userRole = profile?.role;

  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *, 
      profiles(contact_app, contact_username), 
      bookmarks!inner(id)
    `)
    .order('created_at', { ascending: false });

  return (
    <main className="w-full min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-teal-200">
      
      <Navbar />

      {/* Header Bar */}
      <div className="w-full bg-teal-900 px-4 pb-8 pt-5 md:px-8 md:pb-10 md:pt-6">
        <div className="max-w-3xl mx-auto px-2">
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-wide drop-shadow-sm leading-snug">
            {t.title}
          </h1>
          <p className="text-teal-100 mt-2 font-medium">{t.subtitle}</p>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 mt-4">
        <section className="w-full pb-12">
          {jobs && jobs.length > 0 ? (
            <div className="flex flex-col gap-5">
              {jobs.map((job, index) => {
                
                const postDate = new Date(job.created_at);
                const now = new Date();
                const isNew = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60) < 24;

                let daysLeft = null;
                if (job.expires_at) {
                  const expDateObj = new Date(job.expires_at);
                  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const expMidnight = new Date(expDateObj.getFullYear(), expDateObj.getMonth(), expDateObj.getDate());
                  const diffTime = expMidnight.getTime() - todayMidnight.getTime();
                  daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }

                const isBookmarked = true; 

                return (
                  <AnimatedCard key={job.id} index={index}>
                    <div className="relative z-0 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 hover:border-teal-300 transition-all duration-300 active:scale-[0.98] group flex flex-col h-full overflow-hidden">
                      
                      <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${job.title}`}></Link>
                      
                      <div className="p-5 md:p-6 flex flex-col flex-grow relative z-10 pointer-events-none">
                        
                        <div className="pr-12">
                          <h2 className="text-xl md:text-[1.35rem] font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                            {job.title}
                          </h2>
                          <p className="text-sm md:text-base text-slate-600 font-medium mt-1.5 capitalize">
                            {job.category ? (CATEGORY_MAP[job.category] || job.category) : t.privateAdvertiser}
                          </p>
                        </div>

                        {isNew && (
                          <div className="mt-3.5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                              {t.newToYou}
                            </span>
                          </div>
                        )}

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
                              {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : t.priceNegotiable}
                              <span className="font-normal text-slate-500">{job.pay_period && `${t.per}${job.pay_period}`}</span>
                            </span>
                          </div>
                        </div>

                      </div>

                      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center relative z-20">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {daysLeft !== null && daysLeft >= 0 
                            ? `${daysLeft} ${t.daysLeft}` 
                            : t.expired
                          }
                        </div>
                        
                        <div className="flex items-center gap-2 pointer-events-auto">
                          {userRole === 'seeker' && (
                            <BookmarkButton jobId={job.id} initialIsBookmarked={isBookmarked} />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{t.noSavedJobs}</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">{t.noSavedJobsDesc}</p>
              <Link href="/" className="px-6 py-2.5 bg-teal-800 text-white rounded-full text-sm font-bold shadow-md hover:bg-teal-700 transition-all active:scale-[0.97]">
                {t.browseJobs}
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}