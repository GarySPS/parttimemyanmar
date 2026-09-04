// src/app/saved/page.tsx

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import AnimatedCard from '../../components/AnimatedCard';
import BookmarkButton from '../../components/BookmarkButton';
import JobCard from '../../components/JobCard';
import { getLang } from '../utils/getLang';
import { dictionaries } from '../utils/dictionaries';

export default async function SavedJobsPage() {
  const supabase = await createClient();
  
  // Get dictionary translations
  const lang = await getLang();
  const t = dictionaries[lang].saved;
  const tHome = dictionaries[lang].home; // Needed to pass down to JobCard
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/'); 
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  // CRITICAL FIX: Added .eq('bookmarks.user_id', user.id) to prevent cross-user data leaks
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *, 
      profiles(contact_app, contact_username), 
      bookmarks!inner(id, user_id)
    `)
    .eq('bookmarks.user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100); // Safety limit

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
                
                // UX FIX: Accurate Timezone Math for Expirations
                const mmTime = new Date(new Date().getTime() + (6.5 * 60 * 60 * 1000));
                const postDate = new Date(job.created_at);
                const isNew = (mmTime.getTime() - postDate.getTime()) / (1000 * 60 * 60) < 24;
                const isClosed = job.status !== 'open';

                let daysLeft = null;
                if (job.expires_at) {
                  const expDateObj = new Date(job.expires_at);
                  const todayMidnight = new Date(mmTime.getFullYear(), mmTime.getMonth(), mmTime.getDate());
                  const expMidnight = new Date(expDateObj.getFullYear(), expDateObj.getMonth(), expDateObj.getDate());
                  const diffTime = expMidnight.getTime() - todayMidnight.getTime();
                  daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }

                return (
                  <AnimatedCard key={job.id} index={index}>
                    {/* UI FIX: Reusing the main JobCard component keeps your site uniform */}
                    <JobCard 
                      job={job}
                      t={tHome}
                      isClosed={isClosed}
                      isNew={isNew}
                      daysLeft={daysLeft}
                      actionButtons={
                        <div className="bg-gray-50 hover:bg-[#e3b23c]/10 rounded-full transition-colors border border-gray-100">
                          {/* We know it's bookmarked because it's in the Saved list */}
                          <BookmarkButton jobId={job.id} initialIsBookmarked={true} />
                        </div>
                      }
                    />
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