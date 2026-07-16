// app/history/page.tsx
import Navbar from '@/components/Navbar';
import { createClient } from '../utils/supabase/server';
import Link from 'next/link';

export default async function HistoryPage() {
  // 1. Added 'await' here
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return (
      <>
        {/* 2. Added Navbar here */}
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Please log in to view your history.</p>
        </div>
      </>
    );
  }

  const userId = session.user.id;

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  const isEmployer = profile?.role === 'employer';
  let jobs = [];

  // Fetch data based on role
  if (isEmployer) {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', userId)
      .order('created_at', { ascending: false });
    jobs = data || [];
  } else {
    const { data } = await supabase
      .from('bookmarks')
      .select('jobs(*)')
      .eq('seeker_id', userId)
      .order('created_at', { ascending: false });
    
    // Extract nested job objects from the join
    jobs = data?.map((bookmark: any) => bookmark.jobs).filter(Boolean) || [];
  }

  return (
    <>
      {/* 3. Added Navbar here */}
      <Navbar />
      <div className="max-w-3xl mx-auto p-4 py-8">
        <h1 className="text-2xl font-bold text-teal-900 mb-6">
          {isEmployer ? 'My Posted Jobs' : 'My Saved Jobs'}
        </h1>

        {jobs.length === 0 ? (
          <div className="bg-gray-100 p-8 text-center rounded-md border border-gray-200">
            <p className="text-gray-600">No jobs found.</p>
            <Link href="/" className="text-teal-700 font-medium mt-4 inline-block hover:underline">
              Go to Feed
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: any) => (
              <div key={job.id} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Link href={`/jobs/${job.id}`} className="text-lg font-semibold text-teal-800 hover:underline">
                    {job.title}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">
                    {job.category} • {job.township}, {job.city}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-sm ${
                    job.status === 'open' 
                      ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {job.status}
                  </span>
                  
                  {isEmployer && job.status === 'open' && (
                    <Link 
                      href={`/complete/${job.id}`}
                      className="bg-teal-700 text-white px-4 py-2 text-sm rounded-md hover:bg-teal-800 transition-colors"
                    >
                      Mark Filled
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}