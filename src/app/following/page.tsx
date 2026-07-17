//src/app/following/page.tsx

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default async function FollowingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || '';
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  let profiles: any[] = [];
  const isSearching = searchQuery.length > 0;

  if (isSearching) {
    // 1. GLOBAL SEARCH MODE: Query across all profiles matching the name structure
    // Leveraging relational count aggregations on the fly to gauge popularity
    const { data } = await supabase
      .from('profiles')
      .select(`
        id, contact_username, avatar_url, bio, is_verified, role,
        followers:follows!following_id(count)
      `)
      .ilike('contact_username', `%${searchQuery}%`);

    if (data) {
      // Map properties cleanly and sort from most popular to least popular
      profiles = data
        .map((p: any) => ({
          ...p,
          followerCount: p.followers[0]?.count || 0
        }))
        .sort((a, b) => b.followerCount - a.followerCount);
    }
  } else {
    // 2. DEFAULT LIST MODE: Maintain your current follow records pull
    const { data: followRecords } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    const followingIds = followRecords?.map(f => f.following_id) || [];

    if (followingIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('id, contact_username, avatar_url, bio, is_verified, role')
        .in('id', followingIds);
      profiles = data || [];
    }
  }

  return (
    <main className="w-full min-h-screen bg-[#F0F2F5] text-[#0f4c5c] antialiased pb-12">
      <Navbar />
      
      <div className="max-w-4xl mx-auto pt-8 px-4 md:px-8">
        
        {/* Flat App-style Search & Header Wrapper Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <h1 className="text-2xl font-extrabold mb-4 flex items-center gap-3 text-[#0f4c5c]">
            <span className="w-2 h-6 bg-[#e3b23c] rounded-full inline-block"></span>
            {isSearching ? 'Search Results' : 'Following'}
          </h1>

          <form method="GET" action="/following" className="relative flex items-center w-full">
            <div className="absolute left-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              name="q" 
              defaultValue={searchQuery}
              placeholder="Search profiles by name (e.g. Mg Mg)..." 
              className="w-full pl-12 pr-24 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f4c5c] focus:bg-white transition-all font-medium text-gray-900"
            />
            <button type="submit" className="absolute right-2 px-4 py-2 bg-[#0f4c5c] text-white font-bold text-sm rounded-lg hover:bg-[#0f4c5c]/90 transition-colors">
              Search
            </button>
          </form>

          {isSearching && (
            <div className="mt-4 flex justify-between items-center text-sm">
              <p className="text-gray-500 font-medium">Found {profiles.length} results for "{searchQuery}"</p>
              <Link href="/following" className="text-blue-600 font-bold hover:underline">
                Clear Search
              </Link>
            </div>
          )}
        </div>

        {/* Profiles Feed Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profiles.length === 0 ? (
            <div className="col-span-full py-12 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-gray-900 font-bold text-lg mb-1">No accounts found</p>
              <p className="text-gray-500 text-sm">
                {isSearching ? "Check your spelling or look for alternative variants." : "You are not following anyone yet."}
              </p>
            </div>
          ) : (
            profiles.map((p) => (
              <Link key={p.id} href={`/user/${p.id}`} className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-full border-[3px] border-white bg-white shadow-sm shrink-0 overflow-hidden flex items-center justify-center">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <img src="/images/default-avatar.png" alt="Default Avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                
                <div className="flex-1 overflow-hidden text-left">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h2 className="font-bold text-gray-900 text-lg truncate group-hover:text-[#0f4c5c] transition-colors">
                      {p.contact_username || 'Anonymous User'}
                    </h2>
                    {p.is_verified && (
                      <svg className="w-4 h-4 text-[#e3b23c] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    )}
                  </div>
                  
                  {isSearching && p.followerCount !== undefined && (
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                      <span className="text-gray-900">{p.followerCount}</span> {p.followerCount === 1 ? 'follower' : 'followers'}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-600 truncate">{p.bio || 'No bio provided.'}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}