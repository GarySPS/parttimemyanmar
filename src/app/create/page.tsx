//src/app/create/page.tsx

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CreateJobPage() {
  const supabase = await createClient();
  
  // Ensure user is authenticated and holds the employer role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'employer') {
    redirect('/');
  }

  const { data: locations } = await supabase.from('locations').select('*');

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
    }
  }

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 text-gray-900 font-sans selection:bg-blue-200 p-4 md:p-8 flex justify-center items-start">
      
      <div className="w-full max-w-xl mt-4 md:mt-12">
        <header className="mb-8 w-full flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Post a Task
          </h1>
          <Link href="/" className="px-5 py-2 bg-white/60 hover:bg-white border border-gray-200 rounded-full text-sm font-semibold shadow-sm transition-all hover:shadow-md">
            Cancel
          </Link>
        </header>

        <section className="w-full bg-white/80 backdrop-blur-lg p-6 md:p-8 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white/60">
          <form action={submitJob} className="flex flex-col gap-6 w-full">
            
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="title" className="font-bold text-sm text-gray-700 ml-2">Task Title</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                required 
                placeholder="e.g., Need help carrying rice bags" 
                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="location_id" className="font-bold text-sm text-gray-700 ml-2">Location</label>
              <select 
                id="location_id" 
                name="location_id" 
                required
                defaultValue=""
                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all cursor-pointer appearance-none"
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
              <label htmlFor="description" className="font-bold text-sm text-gray-700 ml-2">Details & Requirements</label>
              <textarea 
                id="description" 
                name="description" 
                required 
                rows={5}
                placeholder="Describe the task, time required, and any other important details..." 
                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-gray-400 resize-none"
              />
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-full font-bold text-base shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Post to Local Feed
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}