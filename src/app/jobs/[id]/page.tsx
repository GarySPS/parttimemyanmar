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
    .select(`*, profiles(contact_app, contact_username), bookmarks(id)`)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !job) {
    notFound();
  }

  // Redirect to home feed if the job is already closed
  if (job.status === 'closed') {
    redirect('/');
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
  const isClosed = job.status !== 'open';

  return (
    <main className={`w-full min-h-screen bg-[#f8fafc] text-slate-900 antialiased pb-16 ${notoSans.className}`}>
      
      {/* Universal Navigation Bar */}
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-12">
        
        {/* Closed Banner */}
        {isClosed && (
          <div className="mb-8 w-full bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-2xl font-semibold flex items-center shadow-sm">
            <svg className="w-6 h-6 mr-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            This position has been closed by the employer and is no longer accepting applicants.
          </div>
        )}

        {/* Main Content Card */}
        <div className="relative bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden z-10">
          
          {/* Header Section with Integrated Actions */}
<div className="p-6 md:p-10 border-b border-slate-100">
  <div className="flex justify-between items-start gap-4">
    <div className="flex-1">
      <h1 className="text-2xl md:text-4xl font-extrabold text-slate-950 leading-tight mb-2.5">
        {job.title}
      </h1>
      <p className="text-base md:text-xl text-slate-600 font-medium capitalize">
        {job.category ? (CATEGORY_MAP[job.category] || job.category) : 'Private Advertiser'}
      </p>
    </div>

    {/* Beautifully Aligned Action Buttons */}
    <div className="shrink-0 flex items-center gap-2.5 z-20">
      {userRole === 'seeker' && !isClosed && (
        <div className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-xl transition-all shadow-sm flex items-center justify-center">
          <BookmarkButton jobId={job.id} initialIsBookmarked={isBookmarked} />
        </div>
      )}
      {user?.id === job.employer_id && !isClosed && (
        <Link 
          href={`/complete/${job.id}`} 
          className="px-4 py-2.5 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-xl text-xs md:text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
        >
          Close Job
        </Link>
      )}
    </div>
  </div>
</div>

          {/* Key Details Grid (Reference: image_5.png Icons Grid) */}
          <div className="p-6 md:p-10 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Location */}
            <div className="flex items-start">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm mr-4 mt-0.5 shrink-0">
                <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                <p className="text-lg font-semibold text-slate-900">{job.township}, {job.city}</p>
              </div>
            </div>
            
            {/* Salary / Pay */}
            <div className="flex items-start">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm mr-4 mt-0.5 shrink-0">
                <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Salary / Pay</p>
                <p className="text-lg font-bold text-slate-900">
                  {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Price Negotiable'}
                  <span className="font-normal text-slate-600"> {job.pay_period && `per ${job.pay_period}`}</span>
                </p>
              </div>
            </div>

            {/* Posted On */}
            <div className="flex items-start">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm mr-4 mt-0.5 shrink-0">
                <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Posted On</p>
                <p className="text-lg font-semibold text-slate-900">{postDate}</p>
              </div>
            </div>

            {/* Expires In */}
            {daysLeft !== null && !isClosed && (
              <div className="flex items-start">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm mr-4 mt-0.5 shrink-0">
                  <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Expires In</p>
                  <p className={`text-lg font-bold ${daysLeft < 0 ? 'text-rose-600' : 'text-orange-600'}`}>
                    {daysLeft < 0 ? 'Expired' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Full Description & Image (Reference: image_5.png description area) */}
          <div className="p-6 md:p-10">
            <h3 className="text-2xl font-bold text-slate-950 mb-5 pb-1 border-b-2 border-slate-100 inline-block">Job Description</h3>
            <div className="text-[1.05rem] text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
              {job.description}
            </div>

            {job.image_url && (
              <div className="mt-10 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-inner">
                <img src={job.image_url} alt="Task Attachment" className="w-full h-auto max-h-[600px] object-contain" />
              </div>
            )}
          </div>

          {/* Application / Contact Section (Reference: image_5.png contact box) */}
          <div className="p-6 md:p-10 bg-teal-50 border-t-2 border-teal-100">
            <h3 className="text-xl font-bold text-teal-950 mb-5">How to Apply</h3>
            
            {isClosed ? (
              <p className="text-teal-700 font-medium text-lg flex items-center"> Contact information is hidden because this job is closed.</p>
            ) : contactApp && contactUser ? (
              <div className="bg-white border-2 border-teal-200 rounded-2xl p-6 shadow-sm inline-block w-full md:w-auto">
                <p className="text-sm text-slate-500 font-medium mb-3">Reach out to the employer via:</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <span className="px-5 py-2.5 bg-teal-100 text-teal-900 font-extrabold rounded-xl uppercase tracking-wider text-sm shadow-inner shrink-0">
                    {contactApp}
                  </span>
                  <span className="text-xl font-mono font-bold text-slate-950 select-all border-b-4 border-dotted border-teal-300 pb-1 w-full sm:w-auto text-left sm:text-center">
                    {contactUser}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 font-medium italic text-lg flex items-center"> No contact information provided for this listing.</p>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}