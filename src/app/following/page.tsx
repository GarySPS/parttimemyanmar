//src/app/following/page.tsx

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default async function FollowingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  // 1. Get all IDs this user is following
  const { data: followRecords } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id);

  const followingIds = followRecords?.map(f => f.following_id) || [];

  // 2. Fetch the profiles for those IDs
  let profiles: any[] = [];
  if (followingIds.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, contact_username, avatar_url, bio, is_verified, role')
      .in('id', followingIds);
    profiles = data || [];
  }

  return (
    <main className="w-full min-h-screen bg-[#f8fafc] text-[#0f4c5c] antialiased pb-12">
      <Navbar />
      
      <div className="max-w-4xl mx-auto pt-10 px-4 md:px-8">
        <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
          <span className="w-2 h-8 bg-[#e3b23c] rounded-full inline-block"></span>
          Following
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profiles.length === 0 ? (
            <p className="text-[#0f4c5c]/60 col-span-full">You are not following anyone yet.</p>
          ) : (
            profiles.map((p) => (
              <Link key={p.id} href={`/user/${p.id}`} className="bg-white/60 backdrop-blur-md border border-white/50 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center gap-4">
                {p.avatar_url ? (
                  <img 
                    src={p.avatar_url} 
                    alt="Avatar" 
                    className="w-14 h-14 rounded-full object-cover border-[3px] border-white shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white border-[3px] border-white shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                    <svg className="w-8 h-8 text-[#a4c3d2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <h2 className="font-bold text-lg truncate">{p.contact_username || 'Anonymous'}</h2>
                    {p.is_verified && (
                      <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                    )}
                  </div>
                  <p className="text-sm text-[#0f4c5c]/60 truncate">{p.bio || 'No bio provided'}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}