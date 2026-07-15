//src/app/page.tsx

import { createClient } from './utils/supabase/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role;
  }
  const resolvedParams = await searchParams;
  const selectedLocation = resolvedParams?.location || '';

  const { data: locations } = await supabase.from('locations').select('*');

  let query = supabase
    .from('jobs')
    .select(`*, locations(city, township, ward), profiles(contact_app, contact_username)`)
    .order('created_at', { ascending: false });

  if (selectedLocation) {
    query = query.eq('location_id', selectedLocation);
  }
  
  const { data: jobs } = await query;

  async function signInAnonymously(formData: FormData) {
    'use server';
    const role = formData.get('role') as string;
    const supabase = await createClient();
    await supabase.auth.signInAnonymously({ options: { data: { role } } });
    revalidatePath('/');
  }

  async function signOut() {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/');
  }

  return (
    <main className="w-full min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <header className="mb-6 w-full border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">parttimemm</h1>
          <p className="text-sm text-gray-500 mt-1">Hyper-local P2P labor directory</p>
        </div>
        
        <div className="w-full md:w-auto flex justify-between md:justify-end items-center gap-4">
          {user ? (
            <>
              <Link href="/profile" className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors">
                Settings
              </Link>
              {userRole === 'employer' && (
                <Link href="/create" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors">
                  + Post a Job
                </Link>
              )}
              <form action={signOut}>
                <button className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium transition-colors">
                  Log Out
                </button>
              </form>
            </>
          ) : (
            <form action={signInAnonymously} className="flex gap-2">
              <button name="role" value="employer" className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-md text-sm font-medium shadow-sm transition-colors">
                Enter as Employer
              </button>
              <button name="role" value="seeker" className="px-4 py-2 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 rounded-md text-sm font-medium shadow-sm transition-colors">
                Enter as Job Seeker
              </button>
            </form>
          )}
        </div>
      </header>

      <section className="w-full mb-6">
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-md shadow-sm">
          <h3 className="text-red-800 font-bold text-sm uppercase tracking-wide mb-1">⚠️ Safety & Liability Warning</h3>
          <p className="text-red-700 text-xs leading-relaxed">
            This platform is a 100% free, anonymous directory. We do not verify identities, process payments, or guarantee physical safety. 
            <strong> Always meet in public, daylight areas within your immediate ward.</strong> All interactions and transactions are strictly out-of-band and at your own risk. 
            Do not share your NRC or real name with strangers.
          </p>
        </div>
      </section>

      <section className="w-full mb-6">
        <form method="GET" action="/" className="flex gap-2 w-full md:max-w-md">
          <select name="location" defaultValue={selectedLocation} className="flex-1 border border-gray-300 rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Locations</option>
            {locations?.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.township} - {loc.ward}
              </option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-black transition-colors">
            Filter
          </button>
        </form>
      </section>

      <section className="w-full">
        {jobs && jobs.length > 0 ? (
          <ul className="w-full flex flex-col gap-4">
            {jobs.map((job) => (
              <li key={job.id} className={`p-4 rounded-lg shadow-sm w-full border ${job.status === 'closed' ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-start gap-4">
                  <h2 className={`font-semibold text-lg ${job.status === 'closed' ? 'line-through text-gray-500' : ''}`}>
                    {job.title}
                  </h2>
                  {job.status === 'closed' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider rounded">
                      Completed
                    </span>
                  )}
                </div>
                
                {job.locations && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded mt-2 mb-1">
                    📍 {job.locations.township}, {job.locations.ward}
                  </div>
                )}
                
                <p className="text-sm text-gray-600 mt-2 mb-4">{job.description}</p>
                
                {/* Employer Controls */}
                {job.status === 'open' && user?.id === job.employer_id && (
                  <div className="mb-4">
                    <Link href={`/complete/${job.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded text-sm font-medium transition-colors">
                      ✓ Mark as Complete
                    </Link>
                  </div>
                )}

                {/* Display Receipt if Closed */}
                {job.status === 'closed' && job.receipt_url && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 font-medium mb-2 uppercase">Payment Validated Out-of-Band</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={job.receipt_url} alt="Payment Receipt" className="w-full max-w-sm h-auto rounded border border-gray-300 shadow-sm" loading="lazy" />
                  </div>
                )}

                {/* Hide Contact Info if Closed */}
                {job.status === 'open' && (
                  <div className="pt-4 border-t border-gray-200 bg-gray-50 -mx-4 -mb-4 p-4 rounded-b-lg flex flex-col gap-1">
                    {job.profiles?.contact_app && job.profiles?.contact_username ? (
                      <>
                        <span className="text-xs font-medium text-gray-500 uppercase">Direct Contact:</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                            {job.profiles.contact_app}
                          </span>
                          <span className="text-sm font-mono text-gray-800 select-all">
                            {job.profiles.contact_username}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs italic text-gray-400">Employer has not linked a contact method yet.</span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="w-full p-8 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-gray-500">No jobs found in this area.</p>
          </div>
        )}
      </section>
    </main>
  );
}