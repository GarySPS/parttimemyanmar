//src/app/jobs/[id]/page.tsx

import { createClient } from '../../utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BookmarkButton from '../../../components/BookmarkButton';
import Navbar from '../../../components/Navbar';
import { Noto_Sans_Myanmar } from 'next/font/google';

const notoSans = Noto_Sans_Myanmar({ 
  weight: ['400', '500', '700', '900'],
  subsets: ['myanmar'],
  display: 'swap',
});

const CATEGORY_MAP: Record<string, string> = {
  'delivery': 'Delivery & Logistics',
  'manual': 'Manual Labor & Cleaning',
  'tech': 'Tech & Digital',
  'events': 'Events & Hospitality',
  'education': 'Education & Tutoring',
  'admin': 'Admin & Office',
  'retail': 'Retail & Sales',
  'freelancer': 'Freelancer & Independent',
  'other': 'Other'
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  // 1. Get current user & role
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role;
  }

  // 2. Fetch the specific job
  const { data: job, error } = await supabase
    .from('jobs')
    .select(`*, profiles(contact_app, contact_username, avatar_url, is_verified), bookmarks(id)`)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !job) {
    notFound();
  }

  // 3. Format Dates & Data
  const isBookmarked = job.bookmarks && job.bookmarks.length > 0;
  const postDate = new Date(job.created_at).toLocaleDateString('en-GB');

  let daysLeft = null;
  if (job.expires_at) {
    const expDateObj = new Date(job.expires_at);
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expMidnight = new Date(expDateObj.getFullYear(), expDateObj.getMonth(), expDateObj.getDate());
    const diffTime = expMidnight.getTime() - todayMidnight.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const contactApp = job.contact_app || job.profiles?.contact_app;
  const contactUser = job.contact_username || job.profiles?.contact_username;
  const employerAvatar = job.profiles?.avatar_url;
  const isClosed = job.status !== 'open';

  return (
    <main className={`relative w-full min-h-screen bg-[#F4F6F8] text-slate-900 antialiased pb-24 ${notoSans.className}`}>
      
      <Navbar />

      {/* Main Container - Added safe padding (px-4 sm:px-6) so it NEVER touches the screen edges */}
      <div className="max-w-3xl mx-auto pt-6 md:pt-10 px-4 sm:px-6 flex flex-col gap-6 w-full">
        
        {/* BLOCK 1: Job Header & Details (Premium Floating Card) */}
        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden transition-all">
          
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-5 bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 mb-4">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-xs font-bold text-teal-700 tracking-wide uppercase">
                  {job.category ? (CATEGORY_MAP[job.category] || job.category) : 'Private Advertiser'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {job.title}
              </h1>
            </div>

            {user?.id === job.employer_id && !isClosed && (
              <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                <Link 
                  href={`/complete/${job.id}`} 
                  className="block w-full text-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all active:scale-[0.97] whitespace-nowrap shadow-sm"
                >
                  Close Job
                </Link>
              </div>
            )}
          </div>

          {/* Key Details Grid */}
          <div className="p-6 sm:p-8 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 bg-white">
            
            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600 shadow-sm border border-indigo-100/50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div className="pt-1">
                <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                <p className="text-[1rem] font-semibold text-slate-800 leading-snug">{job.township}, {job.city}</p>
              </div>
            </div>
            
            {/* Salary / Pay */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600 shadow-sm border border-emerald-100/50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="pt-1">
                <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Compensation</p>
                <p className="text-[1rem] font-semibold text-slate-800 leading-snug">
                  {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Price Negotiable'}
                  {job.pay_period && <span className="font-medium text-slate-500 text-sm ml-1">/{job.pay_period}</span>}
                </p>
              </div>
            </div>

            {/* Posted On */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center shrink-0 text-sky-600 shadow-sm border border-sky-100/50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="pt-1">
                <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Posted On</p>
                <p className="text-[1rem] font-semibold text-slate-800 leading-snug">{postDate}</p>
              </div>
            </div>

            {/* Expires In & Bookmark */}
            <div className="flex items-center justify-between w-full">
              {daysLeft !== null && !isClosed ? (
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${daysLeft < 3 ? 'bg-rose-50 text-rose-600 border-rose-100/50' : 'bg-amber-50 text-amber-600 border-amber-100/50'}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="pt-1">
                    <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className={`text-[1rem] font-semibold leading-snug ${daysLeft < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {daysLeft < 0 ? 'Expired' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
                    </p>
                  </div>
                </div>
              ) : (
                <div></div>
              )}

              {userRole === 'seeker' && !isClosed && (
                <div className="bg-white border-2 border-slate-100 p-3 rounded-2xl hover:border-slate-300 transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow-md">
                  <BookmarkButton jobId={job.id} initialIsBookmarked={isBookmarked} />
                </div>
              )}
            </div>
          </div>

          {/* Full Description & Image */}
          <div className="p-6 sm:p-8 bg-white">
            <h3 className="text-xl font-bold text-slate-900 mb-5 tracking-tight">
              Job Description
            </h3>
            <div className="text-[1rem] text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
              {job.description}
            </div>

            {job.image_url && (
              <div className="mt-8 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 p-2 shadow-inner">
                <img src={job.image_url} alt="Task Attachment" className="w-full h-auto max-h-[500px] object-contain rounded-xl" />
              </div>
            )}
          </div>
        </div>

        {/* BLOCK 2: Employer Profile & Premium CTA */}
        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col">
          
          {/* Employer Profile Strip */}
          <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-center sm:justify-between gap-6 bg-white">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-14 h-14 rounded-full border-2 border-slate-100 overflow-hidden shrink-0 flex items-center justify-center bg-slate-50 shadow-sm">
                {employerAvatar ? (
                  <img src={employerAvatar} alt="Employer" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Posted By</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-lg font-bold text-slate-900">{contactUser || 'Anonymous Employer'}</p>
                  {job.profiles?.is_verified && (
                    <svg className="w-5 h-5 text-[#e3b23c]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            
            <Link 
              href={`/user/${job.employer_id}`} 
              className="w-full sm:w-auto px-6 py-3 bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-[0.97] text-center text-sm shadow-sm"
            >
              View Profile
            </Link>
          </div>

          {/* Premium Application CTA */}
          <div className="p-6 sm:p-8 bg-slate-50">
            {isClosed ? (
              <div className="w-full bg-rose-50 border-2 border-rose-100 text-rose-700 px-6 py-5 rounded-2xl font-semibold flex items-start sm:items-center text-sm shadow-sm">
                <svg className="w-6 h-6 mr-3 text-rose-500 shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                This position has been closed by the employer and is no longer accepting applicants.
              </div>
            ) : contactApp && contactUser ? (
              <div className="w-full bg-gradient-to-br from-[#0f4c5c] to-[#166073] rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-[#0f4c5c]/20 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#e3b23c]/20 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight">Ready to Apply?</h3>
                  <p className="text-[#a4c3d2] text-sm sm:text-base font-medium mb-6 max-w-lg">
                    Reach out directly to the employer via {contactApp} to discuss this opportunity and secure your position.
                  </p>
                  
                  <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-4 bg-black/20 p-1.5 sm:pr-6 rounded-xl sm:rounded-full border border-white/10 backdrop-blur-md w-full sm:w-auto">
                    <span className="w-full sm:w-auto text-center px-6 py-3 bg-white text-[#0f4c5c] font-black rounded-lg sm:rounded-full uppercase tracking-wider text-xs shadow-md">
                      {contactApp}
                    </span>
                    <span className="w-full sm:w-auto text-center px-4 py-3 sm:py-0 text-xl font-mono font-bold text-white select-all tracking-wide">
                      {contactUser}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full bg-slate-100 border-2 border-dashed border-slate-300 text-slate-500 px-6 py-8 rounded-2xl flex flex-col items-center justify-center text-center">
                 <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <p className="font-semibold">Contact Hidden</p>
                 <p className="text-sm mt-1">The employer did not provide contact information for this listing.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}