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
    <main className={`relative w-full min-h-screen text-[#0f4c5c] antialiased pb-20 ${notoSans.className}`}>
      
      {/* Premium Glassmorphism Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src="/images/desk-plant-bg.jpg" 
          alt="Desk Background" 
          className="w-full h-full object-cover opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-[#fdfbf7]/80 backdrop-blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Universal Navigation Bar */}
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-12 w-full">
          
          {/* Main Content Glass Card */}
          <div className="relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden z-10">
            
            {/* Header Section with Integrated Actions */}
            <div className="p-6 md:p-10 border-b border-white/40 bg-white/20">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-4xl font-extrabold text-[#0f4c5c] leading-tight mb-3 drop-shadow-sm">
                    {job.title}
                  </h1>
                  <p className="text-base md:text-lg text-[#0f4c5c]/70 font-medium capitalize flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#e3b23c]"></span>
                    {job.category ? (CATEGORY_MAP[job.category] || job.category) : 'Private Advertiser'}
                  </p>
                </div>

                {/* Beautifully Aligned Action Buttons */}
                {user?.id === job.employer_id && !isClosed && (
                  <div className="shrink-0 flex items-center gap-3 z-20 w-full md:w-auto">
                    <Link 
                      href={`/complete/${job.id}`} 
                      className="flex-1 md:flex-none text-center px-6 py-3.5 bg-white/50 text-[#0f4c5c] hover:bg-white hover:shadow-md border border-white/60 rounded-2xl text-sm font-bold transition-all whitespace-nowrap"
                    >
                      Close Job
                    </Link>
                  </div>
                )}

              </div>
            </div>

            {/* Key Details Grid */}
            <div className="p-6 md:p-10 bg-white/30 border-b border-white/40 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              
              {/* Location */}
              <div className="flex items-start">
                <div className="p-3 bg-white/60 rounded-2xl border border-white/60 shadow-sm mr-4 shrink-0 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#0f4c5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[0.7rem] font-extrabold text-[#0f4c5c]/50 uppercase tracking-widest mb-1.5">Location</p>
                  <p className="text-lg font-bold text-[#0f4c5c]">{job.township}, {job.city}</p>
                </div>
              </div>
              
              {/* Salary / Pay */}
              <div className="flex items-start">
                <div className="p-3 bg-white/60 rounded-2xl border border-white/60 shadow-sm mr-4 shrink-0 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#e3b23c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[0.7rem] font-extrabold text-[#0f4c5c]/50 uppercase tracking-widest mb-1.5">Salary / Pay</p>
                  <p className="text-lg font-bold text-[#0f4c5c]">
                    {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Price Negotiable'}
                    <span className="font-medium text-[#0f4c5c]/60"> {job.pay_period && `per ${job.pay_period}`}</span>
                  </p>
                </div>
              </div>

              {/* Posted On */}
              <div className="flex items-start">
                <div className="p-3 bg-white/60 rounded-2xl border border-white/60 shadow-sm mr-4 shrink-0 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#a4c3d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[0.7rem] font-extrabold text-[#0f4c5c]/50 uppercase tracking-widest mb-1.5">Posted On</p>
                  <p className="text-lg font-bold text-[#0f4c5c]">{postDate}</p>
                </div>
              </div>

              {/* Expires In & Bookmark Button */}
              <div className="flex items-center justify-between w-full pr-2">
                {daysLeft !== null && !isClosed ? (
                  <div className="flex items-start">
                    <div className="p-3 bg-white/60 rounded-2xl border border-white/60 shadow-sm mr-4 shrink-0 flex items-center justify-center">
                      <svg className="w-7 h-7 text-[#a4c3d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[0.7rem] font-extrabold text-[#0f4c5c]/50 uppercase tracking-widest mb-1.5">Expires In</p>
                      <p className={`text-lg font-bold ${daysLeft < 0 ? 'text-rose-500' : 'text-[#0f4c5c]'}`}>
                        {daysLeft < 0 ? 'Expired' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div></div>
                )}

                {userRole === 'seeker' && !isClosed && (
                  <div className="bg-white/60 hover:bg-white/90 border border-white/80 p-3.5 rounded-2xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center cursor-pointer z-20">
                    <BookmarkButton jobId={job.id} initialIsBookmarked={isBookmarked} />
                  </div>
                )}
              </div>
            </div>

            {/* Full Description & Image */}
            <div className="p-6 md:p-10">
              <h3 className="text-2xl font-extrabold text-[#0f4c5c] mb-6 flex items-center gap-3">
                Job Description
                <span className="h-0.5 flex-1 bg-gradient-to-r from-[#a4c3d2]/30 to-transparent rounded-full"></span>
              </h3>
              <div className="text-[1.05rem] text-[#0f4c5c]/90 leading-relaxed whitespace-pre-wrap font-medium">
                {job.description}
              </div>

              {job.image_url && (
                <div className="mt-10 p-2 bg-white/40 rounded-[2rem] border border-white/60 shadow-inner">
                  <img src={job.image_url} alt="Task Attachment" className="w-full h-auto max-h-[600px] object-contain rounded-3xl" />
                </div>
              )}
            </div>

            {/* Application / Contact Section */}
            <div className="p-6 md:p-10 border-t border-white/40">
              <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#e3b23c]/10 rounded-full blur-2xl"></div>

                <h3 className="text-xl font-extrabold text-[#0f4c5c] mb-5 relative z-10">How to Apply</h3>
                
                {isClosed ? (
                  <div className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-600 px-6 py-5 rounded-2xl font-semibold flex items-start md:items-center shadow-sm relative z-10">
                    <svg className="w-6 h-6 mr-3 text-rose-500 shrink-0 mt-0.5 md:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    This position has been closed by the employer and is no longer accepting applicants.
                  </div>
                ) : contactApp && contactUser ? (
                  <div className="relative z-10">
                    <p className="text-sm text-[#0f4c5c]/70 font-bold mb-3 uppercase tracking-wider">Reach out via:</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <span className="px-6 py-3 bg-[#0f4c5c] text-white font-extrabold rounded-xl uppercase tracking-wider text-sm shadow-md shrink-0">
                        {contactApp}
                      </span>
                      <span className="text-xl md:text-2xl font-mono font-bold text-[#0f4c5c] select-all border-b-2 border-dotted border-[#0f4c5c]/30 pb-1 w-full sm:w-auto text-left sm:text-center">
                        {contactUser}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#0f4c5c]/60 font-medium italic text-lg flex items-center relative z-10">
                     No contact information provided for this listing.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}