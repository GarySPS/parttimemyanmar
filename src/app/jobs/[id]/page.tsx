//src/app/jobs/[id]/page.tsx

import { createClient } from '../../utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
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
    <main className={`relative w-full min-h-screen bg-[#F0F2F5] text-gray-900 antialiased pb-20 ${notoSans.className}`}>
      
      <Navbar />

      {/* Main Container - Full width on mobile, max-width on desktop */}
      <div className="max-w-3xl mx-auto md:pt-6 flex flex-col gap-2 md:gap-4 w-full">
        
        {/* BLOCK 1: Job Header & Details */}
        <div className="bg-white md:rounded-xl shadow-sm md:border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
                {job.title}
              </h1>
              <p className="text-sm text-gray-600 font-medium capitalize flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {job.category ? (CATEGORY_MAP[job.category] || job.category) : 'Private Advertiser'}
              </p>
            </div>

            {user?.id === job.employer_id && !isClosed && (
              <div className="shrink-0 w-full md:w-auto">
                <Link 
                  href={`/complete/${job.id}`} 
                  className="block w-full text-center px-5 py-2.5 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                >
                  Close Job
                </Link>
              </div>
            )}
          </div>

          {/* Key Details Grid */}
          <div className="p-4 md:p-6 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Location</p>
                <p className="text-[0.95rem] font-semibold text-gray-900">{job.township}, {job.city}</p>
              </div>
            </div>
            
            {/* Salary / Pay */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Salary / Pay</p>
                <p className="text-[0.95rem] font-semibold text-gray-900">
                  {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Price Negotiable'}
                  <span className="font-normal text-gray-500"> {job.pay_period && `per ${job.pay_period}`}</span>
                </p>
              </div>
            </div>

            {/* Posted On */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Posted On</p>
                <p className="text-[0.95rem] font-semibold text-gray-900">{postDate}</p>
              </div>
            </div>

            {/* Expires In */}
            <div className="flex items-center justify-between w-full">
              {daysLeft !== null && !isClosed ? (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Expires In</p>
                    <p className={`text-[0.95rem] font-semibold ${daysLeft < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                      {daysLeft < 0 ? 'Expired' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
                    </p>
                  </div>
                </div>
              ) : (
                <div></div>
              )}

              {userRole === 'seeker' && !isClosed && (
                <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                  <BookmarkButton jobId={job.id} initialIsBookmarked={isBookmarked} />
                </div>
              )}
            </div>
          </div>

          {/* Full Description & Image */}
          <div className="p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Job Description
            </h3>
            <div className="text-[0.95rem] text-gray-800 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>

            {job.image_url && (
              <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <img src={job.image_url} alt="Task Attachment" className="w-full h-auto max-h-[500px] object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* BLOCK 2: Employer Profile & Application */}
        <div className="bg-white md:rounded-xl shadow-sm md:border border-gray-200 overflow-hidden mb-12">
          
          {/* Employer Profile Strip */}
          <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center bg-gray-50">
                {employerAvatar ? (
                  <img src={employerAvatar} alt="Employer" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-7 h-7 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Posted By</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-bold text-gray-900">{contactUser || 'Anonymous Employer'}</p>
                  {job.profiles?.is_verified && (
                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            
            <Link 
              href={`/user/${job.employer_id}`} 
              className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition-colors text-center text-sm"
            >
              View Profile
            </Link>
          </div>

          {/* Application / Contact Section */}
          <div className="p-4 md:p-6 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">How to Apply</h3>
            
            {isClosed ? (
              <div className="w-full bg-red-50 border border-red-100 text-red-600 px-4 py-4 rounded-lg font-medium flex items-start sm:items-center text-sm">
                <svg className="w-5 h-5 mr-2 text-red-500 shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                This position has been closed by the employer and is no longer accepting applicants.
              </div>
            ) : contactApp && contactUser ? (
              <div>
                <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wider">Reach out via:</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span className="px-4 py-2 bg-gray-800 text-white font-bold rounded-md uppercase tracking-wider text-xs">
                    {contactApp}
                  </span>
                  <span className="text-lg font-mono font-bold text-gray-900 select-all border-b border-dashed border-gray-400 pb-0.5">
                    {contactUser}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 font-medium text-sm italic">
                 No contact information provided for this listing.
              </p>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}