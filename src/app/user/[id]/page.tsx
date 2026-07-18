//src/app/user/[id]/page.tsx

import { createClient } from '../../utils/supabase/server';
import { notFound } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import ProfileHeader from '../../../components/ProfileHeader';
import { Noto_Sans_Myanmar } from 'next/font/google';

// 1. Add these imports
import { getLang } from '../../utils/getLang';
import { dictionaries } from '../../utils/dictionaries';

const notoSans = Noto_Sans_Myanmar({ 
  weight: ['400', '500', '700', '900'],
  subsets: ['myanmar'],
  display: 'swap',
});

export default async function EmployerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  
  // 2. Fetch dictionary
  const lang = await getLang();
  const tHeader = dictionaries[lang].profileHeader;
  const t = dictionaries[lang].userProfile;

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', resolvedParams.id);

  const { data: { user } } = await supabase.auth.getUser();
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

  return (
    <main className={`w-full min-h-screen bg-[#F0F2F5] text-gray-900 antialiased selection:bg-teal-200 pb-12 ${notoSans.className}`}>
      <Navbar />

      <div className="w-full max-w-4xl mx-auto flex flex-col">
        
        <div className="bg-white shadow-sm pb-4">
          <ProfileHeader 
            profile={profile}
            isOwnProfile={false}
            followerCount={followerCount || 0}
            isFollowing={isFollowing}
            t={tHeader} // 3. Pass t here
          />
        </div>

        <div className="w-full h-2 bg-[#F0F2F5]"></div>

        <section className="bg-white p-4 md:p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            {t.linkedPlatforms}
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
                  <div className="w-full h-40 flex items-center justify-center text-gray-400 font-medium text-sm bg-gray-100">{t.noScreenshot}</div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f4c5c]/95 via-[#0f4c5c]/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-4 flex items-center justify-between">
                  <div className="overflow-hidden pr-3">
                    <p className="text-white font-bold text-sm flex items-center gap-2 drop-shadow-md truncate">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e3b23c] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e3b23c]"></span>
                      </span>
                      {t.visitPage}
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
                <p className="text-sm text-gray-500 font-medium">{t.noPlatforms}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}