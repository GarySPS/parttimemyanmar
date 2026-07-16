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
    <main className={`w-full min-h-screen bg-[#f3f4f6] text-slate-900 antialiased pb-12 ${notoSans.className}`}>
      
      {/* Universal Navigation Bar */}
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-6 md:pt-10">
        
        {/* Closed Banner */}
        {isClosed && (
          <div className="mb-6 w-full bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl font-medium flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            This position has been closed by the employer and is no longer accepting applicants.
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Header Section */}
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">
                  {job.title}
                </h1>
                <p className="text-lg text-slate-500 capitalize">
                  {job.category ? (CATEGORY_MAP[job.category] || job.category) : 'Private Advertiser'}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                {userRole === 'seeker' && !isClosed && (
                  <BookmarkButton jobId={job.id} initialIsBookmarked={isBookmarked} />
                )}
                {user?.id === job.employer_id && !isClosed && (
                  <Link href={`/complete/${job.id}`} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors">
                    Close Job
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📍</span>
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Location</p>
                <p className="font-medium text-slate-800">{job.township}, {job.city}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-3">💰</span>
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Salary / Pay</p>
                <p className="font-medium text-slate-800">
                  {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Price Negotiable'}
                  {job.pay_period && ` per ${job.pay_period}`}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-2xl mr-3">⏱️</span>
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Posted On</p>
                <p className="font-medium text-slate-800">{postDate}</p>
              </div>
            </div>

            {daysLeft !== null && !isClosed && (
              <div className="flex items-start">
                <span className="text-2xl mr-3">⏳</span>
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Expires In</p>
                  <p className={`font-medium ${daysLeft < 0 ? 'text-rose-600' : 'text-orange-600'}`}>
                    {daysLeft < 0 ? 'Expired' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Full Description & Image */}
          <div className="p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Job Description</h3>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
              {job.description}
            </div>

            {job.image_url && (
              <div className="mt-8 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={job.image_url} alt="Task Attachment" className="w-full h-auto max-h-[500px] object-contain" />
              </div>
            )}
          </div>

          {/* Application / Contact Section */}
          <div className="p-6 md:p-8 bg-teal-50 border-t border-teal-100">
            <h3 className="text-lg font-bold text-teal-900 mb-4">How to Apply</h3>
            
            {isClosed ? (
              <p className="text-teal-700 font-medium">Contact information is hidden because this job is closed.</p>
            ) : contactApp && contactUser ? (
              <div className="bg-white border border-teal-200 rounded-xl p-5 shadow-sm inline-block w-full md:w-auto">
                <p className="text-sm text-slate-500 mb-2">Reach out to the employer via:</p>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-teal-100 text-teal-800 font-bold rounded-lg uppercase tracking-wide text-sm">
                    {contactApp}
                  </span>
                  <span className="text-lg font-mono font-bold text-slate-800 select-all border-b-2 border-dashed border-teal-300 pb-1">
                    {contactUser}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 italic">No contact information provided for this listing.</p>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}