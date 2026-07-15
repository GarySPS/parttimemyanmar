//src/app/create/page.tsx

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CreateJobPage() {
  const supabase = await createClient();
  
  // 1. Ensure user is authenticated and holds the employer role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'employer') {
    redirect('/');
  }

  // 2. Fetch seeded locations for the dropdown
  const { data: locations } = await supabase.from('locations').select('*');

  // 3. Server Action to handle form submission
  async function submitJob(formData: FormData) {
    'use server';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const location_id = formData.get('location_id') as string;

    const { error } = await supabase.from('jobs').insert({
      title,
      description,
      location_id,
      employer_id: user.id,
      status: 'open'
    });

    if (!error) {
      redirect('/');
    } else {
      console.error(error);
      // In a production app, we would handle this error state in the UI
    }
  }

  return (
    <main className="w-full min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <header className="mb-6 w-full border-b pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Post a New Job</h1>
        <Link href="/" className="text-sm text-gray-500 hover:text-black">
          Cancel
        </Link>
      </header>

      <section className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <form action={submitJob} className="flex flex-col gap-6 w-full">
          
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="title" className="font-medium text-sm text-gray-700">Job Title</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required 
              placeholder="e.g., Need help carrying rice bags" 
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="location_id" className="font-medium text-sm text-gray-700">Location (City - Township - Ward)</label>
            <select 
              id="location_id" 
              name="location_id" 
              required
              defaultValue=""
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>Select a hyper-local area</option>
              {locations?.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.city} - {loc.township} - {loc.ward}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="description" className="font-medium text-sm text-gray-700">Description & Details</label>
            <textarea 
              id="description" 
              name="description" 
              required 
              rows={5}
              placeholder="Describe the task, time required, and any other important details..." 
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-4 bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Post Job
          </button>
        </form>
      </section>
    </main>
  );
}