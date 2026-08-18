//src/app/jobs/[id]/page.tsx

import { createClient } from '../../utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BookmarkButton from '../../../components/BookmarkButton';
import Navbar from '../../../components/Navbar';
import { Noto_Sans_Myanmar } from 'next/font/google';
import { getLang } from '../../utils/getLang';
import { dictionaries } from '../../utils/dictionaries';
import ShareButtons from '../../../components/ShareButtons';
import ReportModal from '../../../components/ReportModal';
import { revalidatePath } from 'next/cache';
import CloseJobModal from '../../../components/CloseJobModal';

const notoSans = Noto_Sans_Myanmar({ 
  weight: ['400', '500', '700', '900'],
  subsets: ['myanmar'],
  display: 'swap',
});

function getContactDetails(app: string, username: string) {
  const normalizedApp = app.toLowerCase();
  
  // 1. TELEGRAM: Clean up "@", "t.me/", "https://"
  let rawTg = username.replace(/https?:\/\/(www\.)?(t\.me|telegram\.me)\//i, '');
  rawTg = rawTg.replace('@', '').trim();

  // 2. FACEBOOK/MESSENGER: Clean up full URLs
  let rawFb = username.replace(/https?:\/\/(www\.)?(facebook\.com|m\.me)\//i, '');
  rawFb = rawFb.split('?')[0]; // Removes extra tracking text like ?mibextid=...
  rawFb = rawFb.trim();

  // 3. VIBER/PHONE: Remove spaces, dashes, brackets. Convert "09" to "959"
  let rawPhone = username.replace(/[\s\(\)\-]/g, '');
  if (rawPhone.startsWith('09')) {
    rawPhone = '959' + rawPhone.substring(2); // Turns 09123 into 959123
  } else if (rawPhone.startsWith('+')) {
    rawPhone = rawPhone.substring(1); // Removes '+' so Viber doesn't break
  }
  
  switch (normalizedApp) {
    case 'viber': 
      return { link: `viber://chat?number=${rawPhone}`, color: 'bg-[#7360f2] hover:bg-[#5c4ce0]', icon: <svg className="w-6 h-6 mr-2 fill-current" viewBox="0 0 24 24"><path d="M17.51 14.83c-.85-.05-1.68-.2-2.48-.44-.32-.1-.66-.02-.91.22l-1.57 1.57c-2.3-1.17-4.17-3.04-5.34-5.34l1.57-1.57c.24-.25.32-.59.22-.91-.24-.8-.39-1.63-.44-2.48-.05-.51-.48-.91-1-.91H4.51c-.53 0-.96.44-.91.97.28 2.8 1.44 5.38 3.22 7.49 2 2.37 4.7 3.99 7.71 4.54.51.09.96-.32.96-.84v-3.04c0-.52-.4-.95-.91-1l-.07-.27zM18.8 8.16A5.4 5.4 0 0013.44 2.8v1.66c2.06 0 3.74 1.68 3.74 3.74h1.62zm1.62 0c0-3.86-3.14-7-7-7v1.66c2.94 0 5.34 2.4 5.34 5.34h1.66z"/></svg> };
    case 'telegram': 
      return { link: `https://t.me/${rawTg}`, color: 'bg-[#229ED9] hover:bg-[#1e8cc0]', icon: <svg className="w-6 h-6 mr-2 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg> };
    case 'facebook': 
      return { link: `https://m.me/${rawFb}`, color: 'bg-[#0084FF] hover:bg-[#0073e6]', icon: <svg className="w-6 h-6 mr-2 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.36 2 1.8 6.13 1.8 11.22c0 2.9 1.45 5.48 3.74 7.23V22l3.41-1.88c.98.27 2 .42 3.05.42 5.64 0 10.2-4.13 10.2-9.22S17.64 2 12 2zm1.04 12.3l-2.65-2.83-5.18 2.83 5.67-6.03 2.74 2.83 5.09-2.83-5.67 6.03z"/></svg> };
    case 'phone': 
      return { link: `tel:+${rawPhone}`, color: 'bg-emerald-600 hover:bg-emerald-700', icon: <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> };
    case 'email': 
      return { link: `mailto:${username.trim()}`, color: 'bg-slate-800 hover:bg-slate-900', icon: <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> };
    default: 
      return { link: '#', color: 'bg-teal-600 hover:bg-teal-700', icon: null };
  }
}
export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  
  // Add these two lines to get the translations
  const lang = await getLang();
  const t = dictionaries[lang].jobDetail;
  const tHome = dictionaries[lang].home;
  const tNav = dictionaries[lang].nav;
  const tReport = dictionaries[lang].reportModal;
  const tComplete = dictionaries[lang].completeJob; // <-- ADD THIS

  // <-- ADD THIS SERVER ACTION -->
  async function closeJobAction(id: string) {
    'use server';
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from('jobs')
      .update({ status: 'closed' })
      .eq('id', id)
      .eq('employer_id', user.id); 

    if (error) return { error: error.message };
    revalidatePath(`/jobs/${id}`);
    revalidatePath('/');
    return { success: true };
  }

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
  const canViewContact = userRole !== 'employer' || user?.id === job.employer_id;
  const appInfo = canViewContact && contactApp && contactUser ? getContactDetails(contactApp, contactUser) : null;

  return (
    <main className={`relative w-full min-h-screen bg-[#F4F6F8] text-slate-900 antialiased pb-24 ${notoSans.className}`}>
      
      {/* SEO BOOST: Google Jobs JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": job.title,
            "description": job.description,
            "datePosted": job.created_at,
            "validThrough": job.expires_at || undefined,
            "employmentType": "PART_TIME",
            "hiringOrganization": {
    "@type": "Organization",
    "name": job.profiles?.contact_username || "Private Employer",
    "sameAs": "https://parttimemm.com",
    "logo": employerAvatar || "https://parttimemm.com/icon.png"
  },
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": job.township,
                "addressRegion": job.city,
                "addressCountry": "MM"
              }
            },
            ...(job.price ? {
              "baseSalary": {
                "@type": "MonetaryAmount",
                "currency": "MMK",
                "value": {
                  "@type": "QuantitativeValue",
                  "value": job.price,
                  "unitText": job.pay_period === 'hourly' ? 'HOUR' : 
                              job.pay_period === 'daily' ? 'DAY' : 
                              job.pay_period === 'monthly' ? 'MONTH' : 'YEAR'
                }
              }
            } : {})
          })
        }}
      />

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
                  {job.category ? ((tHome.cats as any)[job.category] || job.category) : tHome.privateAdvertiser}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {job.title}
              </h1>
              <div className="flex items-center gap-3 mt-4">
  <ShareButtons jobTitle={job.title} jobId={job.id} />
  <ReportModal jobId={job.id} buttonText="Report" t={tReport} />
</div>
            </div>

            {user?.id === job.employer_id && !isClosed && (
              <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                <CloseJobModal 
                  jobId={job.id} 
                  jobTitle={job.title} 
                  closeAction={closeJobAction} 
                  t={t} 
                  tComplete={tComplete} 
                />
              </div>
            )}
          </div>

          {/* Key Details Grid */}
          <div className="p-6 sm:p-8 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 bg-white">
            
            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600 shadow-sm border border-indigo-100/50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <div className="pt-1">
                <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.location}</p>
                <p className="text-[1rem] font-semibold text-slate-800 leading-snug">{job.township}, {job.city}</p>
              </div>
            </div>
            
            {/* Salary / Pay */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600 shadow-sm border border-emerald-100/50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="pt-1">
                <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.compensation}</p>
                <p className="text-[1rem] font-semibold text-slate-800 leading-snug">
  {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : t.priceNegotiable}
  {job.pay_period && <span className="font-medium text-slate-500 text-sm ml-1">{tHome.per}{(tHome.pays as any)[job.pay_period] || job.pay_period}</span>}
</p>
              </div>
            </div>

            {/* Posted On */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center shrink-0 text-sky-600 shadow-sm border border-sky-100/50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="pt-1">
                <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.postedOn}</p>
                <p className="text-[1rem] font-semibold text-slate-800 leading-snug">{postDate}</p>
              </div>
            </div>

            {/* Expires In & Bookmark */}
            <div className="flex items-center justify-between w-full">
              {daysLeft !== null && !isClosed ? (
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${daysLeft < 3 ? 'bg-rose-50 text-rose-600 border-rose-100/50' : 'bg-amber-50 text-amber-600 border-amber-100/50'}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="pt-1">
                    <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.status}</p>
                    <p className={`text-[1rem] font-semibold leading-snug ${daysLeft < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {daysLeft < 0 ? t.expired : `${daysLeft} ${t.daysLeft}`}
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
              {t.jobDescription}
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
                  <svg className="w-8 h-8 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
              </div>
              <div>
    <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.postedBy}</p>
    <div className="flex items-center gap-1.5">
      <p className="text-lg font-bold text-slate-900">{job.profiles?.contact_username || t.anonymousEmployer}</p>
      {job.profiles?.is_verified && (
                    <svg className="w-5 h-5 text-[#e3b23c]" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                  )}
                </div>
              </div>
            </div>
            
            <Link 
              href={`/user/${job.employer_id}`} 
              className="w-full sm:w-auto px-6 py-3 bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-[0.97] text-center text-sm shadow-sm"
            >
              {t.viewProfile}
            </Link>
          </div>

          {/* Premium Application CTA & Safety Protocol */}
          <div className="p-6 sm:p-8 bg-slate-50 flex flex-col gap-5 sm:gap-6">
            
            {/* 1. Application Status / Contact */}
            {isClosed ? (
              <div className="w-full bg-rose-50 border-2 border-rose-100 text-rose-700 px-6 py-5 rounded-2xl font-semibold flex items-start sm:items-center text-sm shadow-sm">
                <svg className="w-6 h-6 mr-3 text-rose-500 shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {t.jobClosed}
              </div>
            ) : canViewContact && contactApp && contactUser && appInfo ? (
              <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-slate-900 tracking-tight">{t.readyToApply}</h3>
                <p className="text-slate-500 text-sm sm:text-base font-medium mb-6 max-w-lg">
                  {t.reachOut1} {contactApp} {t.reachOut2}
                </p>
                
                <a 
                  href={appInfo.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 ${appInfo.color} text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] text-lg`}
                >
                  {appInfo.icon}
                  Connect on {contactApp}
                </a>
                
                <p className="mt-5 text-xs font-semibold text-slate-400 select-all">
                  Username / Number: {contactUser}
                </p>
              </div>
            ) : (
              <div className="w-full bg-slate-100 border-2 border-dashed border-slate-300 text-slate-500 px-6 py-8 rounded-2xl flex flex-col items-center justify-center text-center">
                 <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <p className="font-semibold">{t.contactHidden}</p>
                 <p className="text-sm mt-1">{t.noContactDesc}</p>
              </div>
            )}

            {/* 2. Safety Protocol Card */}
            <div className="w-full p-4 sm:p-5 bg-orange-50/60 rounded-2xl border border-orange-100/80 shadow-sm">
              <h3 className="text-[#f97316] font-bold text-[11px] sm:text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Safety Protocol
              </h3>
              <p className="text-orange-900/80 text-[13px] sm:text-sm leading-relaxed font-medium">
                {tNav.safetyAlert}
              </p>
            </div>
            
          </div>

        </div>
      </div>
      
    </main>
  );
}