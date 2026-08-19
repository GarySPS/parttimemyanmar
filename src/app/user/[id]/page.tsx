// src/app/user/[id]/page.tsx

import { createClient } from '../../utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import ProfileHeader from '../../../components/ProfileHeader';
import { Noto_Sans_Myanmar } from 'next/font/google';
import JobCard from '../../../components/JobCard';
import { getLang } from '../../utils/getLang';
import { dictionaries } from '../../utils/dictionaries';

const notoSans = Noto_Sans_Myanmar({ 
  weight: ['400', '500', '700', '900'],
  subsets: ['myanmar'],
  display: 'swap',
});

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  
  const lang = await getLang();
  const tHeader = dictionaries[lang].profileHeader;
  const t = dictionaries[lang].userProfile || dictionaries[lang].profile; // Fallback
  const tHome = dictionaries[lang].home;
  const tReport = dictionaries[lang].reportModal;
  const supabase = await createClient();

  // Fetch Profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Determine Role
  const isSeeker = profile?.role === 'seeker';
  
  // Fetch Employer's Jobs ONLY if they are an employer
  let jobs: any[] = [];
  if (!isSeeker) {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', resolvedParams.id)
      .order('created_at', { ascending: false });
    if (data) jobs = data;
  }

  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', resolvedParams.id);

  const { data: { user } } = await supabase.auth.getUser();
  
  // If user visits their own public link, redirect to private dashboard
  if (user && user.id === resolvedParams.id) {
    redirect('/profile');
  }

  let isFollowing = false;
  if (user) {
    const { data: followData } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', resolvedParams.id)
      .single();
    if (followData) isFollowing = true;
  }

  const platforms = profile?.platforms || [];
  const skills = profile?.skills || [];

  // Format Details Card Variables
  const displayCategory = profile?.category ? ((tHome as any).cats?.[profile.category] || profile.category) : ((t as any).notSpecified || "Not specified");
  const hasLocation = profile?.township && profile?.city;
  const displayLocation = hasLocation ? `${profile.township}, ${profile.city}` : ((t as any).locationNotSet || "Location not set");

  return (
    <main className={`w-full min-h-screen bg-[#F0F2F5] text-gray-900 antialiased selection:bg-teal-200 pb-12 ${notoSans.className}`}>
      <Navbar />

      <div className="w-full max-w-4xl mx-auto flex flex-col">
        
        {/* 1. Header Section */}
        <div className="bg-white shadow-sm pb-4">
          <ProfileHeader 
            profile={profile}
            isOwnProfile={false}
            followerCount={followerCount || 0}
            isFollowing={isFollowing}
            t={tHeader}
            tReport={tReport}
          />
        </div>

        <div className="w-full h-2 bg-[#F0F2F5]"></div>

        {/* 2. Details Section */}
        <section className="bg-white p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {(t as any).details || "Details"}
            </h2>
          </div>
          <div className="space-y-4 text-[0.95rem] text-gray-800">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <span>{profile?.contact_app && profile?.contact_username ? `${profile.contact_app}: ${profile.contact_username}` : ((t as any).noContact || 'No contact provided')}</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span>{(t as any).category || "Category"}: <span className="font-semibold text-gray-900 capitalize ml-1">{displayCategory}</span></span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="break-words whitespace-normal">
                Location: <span className="font-semibold text-gray-900 capitalize ml-1">
                  {hasLocation ? displayLocation : ((t as any).locationNotSet || "Location not set")}
                </span>
              </span>
            </div>
          </div>
        </section>

        <div className="w-full h-2 bg-[#F0F2F5]"></div>

        {/* CONDITIONALLY RENDER BASED ON ROLE */}
        {isSeeker ? (
          <>
            {/* SEEKER: About Me */}
            <section className="bg-white p-4 md:p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">{(t as any).aboutMe || 'About Me'}</h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {profile?.bio || (t as any).noBio || 'No professional summary provided yet.'}
              </p>
            </section>

            <div className="w-full h-2 bg-[#F0F2F5]"></div>

            {/* SEEKER: Work Experience */}
            <section className="bg-white p-4 md:p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-gray-900">{(t as any).workExperience || 'Work Experience'}</h2>
              {profile?.experience?.length > 0 ? (
                <div className="space-y-6 border-l-2 border-gray-200 ml-3 pl-5">
                  {profile.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="relative group">
                      <span className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></span>
                      <div>
                        <h3 className="font-bold text-gray-900">{exp.title}</h3>
                        <p className="text-sm text-blue-600 font-medium">{exp.company}</p>
                        <p className="text-xs text-gray-500 mt-1">{exp.startDate || (t as any).unknown || 'Unknown'} - {exp.endDate || (t as any).present || 'Present'}</p>
                      </div>
                      {exp.description && <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-medium">{(t as any).buildTimeline || 'No professional timeline added.'}</p>
              )}
            </section>

            <div className="w-full h-2 bg-[#F0F2F5]"></div>

            {/* SEEKER: Education */}
            <section className="bg-white p-4 md:p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-gray-900">{(t as any).education || 'Education'}</h2>
              {profile?.education?.length > 0 ? (
                <div className="space-y-6 border-l-2 border-gray-200 ml-3 pl-5">
                  {profile.education.map((edu: any, idx: number) => (
                    <div key={idx} className="relative group">
                      <span className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></span>
                      <div>
                        <h3 className="font-bold text-gray-900">{edu.school}</h3>
                        <p className="text-sm text-blue-600 font-medium">{edu.degree}</p>
                        <p className="text-xs text-gray-500 mt-1">{edu.startDate || (t as any).unknown || 'Unknown'} - {edu.endDate || (t as any).present || 'Present'}</p>
                      </div>
                      {edu.description && <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-medium">{(t as any).buildEdu || 'No educational background added.'}</p>
              )}
            </section>

            <div className="w-full h-2 bg-[#F0F2F5]"></div>

            {/* SEEKER: Skills Section */}
            <section className="bg-white p-4 md:p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">{(t as any).skills || 'Skills'}</h2>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill: string, index: number) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 font-medium">{(t as any).noSkills || 'No skills provided yet.'}</p>
                )}
              </div>
            </section>

            <div className="w-full h-2 bg-[#F0F2F5]"></div>

            {/* SEEKER: CV / Resume Section */}
            <section className="bg-white p-4 md:p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{(t as any).cvResume || "CV / Resume"}</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {profile?.resume_url ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{(t as any).resumeUploaded || "Resume available"}</p>
                      </div>
                    </div>
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto text-center bg-gray-200 text-gray-900 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-300 active:scale-[0.97] transition-all">
                      {(t as any).viewCv || "View CV"}
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 font-medium w-full text-center py-2">{(t as any).noCv || "No CV/Resume uploaded yet."}</p>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* EMPLOYER: Linked Platforms Section */}
            <section className="bg-white p-4 md:p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                {(t as any).linkedPlatforms || "Linked Platforms"}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {platforms.length > 0 ? platforms.map((p: any, index: number) => (
                  <a 
                    key={index} 
                    href={p.url?.startsWith('http') ? p.url : `https://${p.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.97] border border-gray-200 bg-gray-50 group"
                  >
                    {p.screenshot_url ? (
                      <img src={p.screenshot_url} alt="Platform" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center text-gray-400 font-medium text-sm bg-gray-100">{(t as any).noScreenshot || "No Screenshot"}</div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f4c5c]/95 via-[#0f4c5c]/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute bottom-0 left-0 w-full p-4 flex items-center justify-between">
                      <div className="overflow-hidden pr-3">
                        <p className="text-white font-bold text-sm flex items-center gap-2 drop-shadow-md truncate">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e3b23c] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e3b23c]"></span>
                          </span>
                          {(t as any).visitPage || "Visit"}
                        </p>
                        <p className="text-[#a4c3d2] text-xs mt-1 truncate w-full font-medium">{p.url.replace(/^https?:\/\//, '')}</p>
                      </div>
                      <div className="w-10 h-10 shrink-0 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#e3b23c] transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                    </div>
                  </a>
                )) : (
                  <div className="col-span-full py-8 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50">
                    <p className="text-sm text-gray-500 font-medium">{(t as any).noPlatforms || "No platforms linked yet."}</p>
                  </div>
                )}
              </div>
            </section>

            <div className="w-full h-2 bg-[#F0F2F5]"></div>

            {/* EMPLOYER: Public Job Posts Section */}
            <section className="bg-white p-4 md:p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                {(t as any).myPostedJobs || "Posted Jobs"}
              </h2>

              {!jobs || jobs.length === 0 ? (
                <div className="bg-gray-50 p-6 text-center rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 text-sm">{(t as any).noActivity || "No jobs posted yet."}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {jobs.map((job) => {
                    const postDate = new Date(job.created_at);
                    const now = new Date();
                    const isNew = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60) < 24;
                    const isClosed = job.status !== 'open';

                    let daysLeft = null;
                    if (job.expires_at) {
                      const expDateObj = new Date(job.expires_at);
                      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const expMidnight = new Date(expDateObj.getFullYear(), expDateObj.getMonth(), expDateObj.getDate());
                      const diffTime = expMidnight.getTime() - todayMidnight.getTime();
                      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }

                    return (
                      <div key={job.id} className="h-full">
                        <JobCard 
                          job={job}
                          t={tHome}
                          isClosed={isClosed}
                          isNew={isNew}
                          daysLeft={daysLeft}
                          actionButtons={null} 
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}