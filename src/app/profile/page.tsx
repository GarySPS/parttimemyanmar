//src/app/profile/page.tsx

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();
  
  // 1. Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  // 2. Fetch existing profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 3. Server Action to update contact info
  async function updateProfile(formData: FormData) {
    'use server';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const contact_app = formData.get('contact_app') as string;
    const contact_username = formData.get('contact_username') as string;

    const { error } = await supabase
      .from('profiles')
      .update({ contact_app, contact_username })
      .eq('id', user.id);

    if (!error) {
      redirect('/');
    }
  }

  return (
    <main className="w-full min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <header className="mb-6 w-full border-b pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Contact Settings</h1>
          {profile?.role && (
            <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded shadow-sm">
              {profile.role === 'employer' ? 'Employer' : 'Job Seeker'}
            </span>
          )}
        </div>
        <Link href="/" className="text-sm text-gray-500 hover:text-black transition-colors">
          Cancel
        </Link>
      </header>

      <section className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
          <p className="text-sm text-yellow-800 font-medium">Safety Notice</p>
          <p className="text-xs text-yellow-700 mt-1">
            Never use your real name or NRC. Provide only a platform username to organize out-of-band communication. 
            Your anonymous handle is: <strong>{profile?.handle}</strong>
          </p>
        </div>

        <form action={updateProfile} className="flex flex-col gap-6 w-full">
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="contact_app" className="font-medium text-sm text-gray-700">Preferred Chat App</label>
            <select 
              id="contact_app" 
              name="contact_app" 
              required
              defaultValue={profile?.contact_app || ""}
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>Select an app</option>
              <option value="Viber">Viber</option>
              <option value="Telegram">Telegram</option>
              <option value="Messenger">Messenger</option>
              <option value="Signal">Signal</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="contact_username" className="font-medium text-sm text-gray-700">Username / ID (No Phone Numbers)</label>
            <input 
              type="text" 
              id="contact_username" 
              name="contact_username" 
              required 
              defaultValue={profile?.contact_username || ""}
              placeholder="e.g., @my_telegram_handle" 
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-4 bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Save Contact Info
          </button>
        </form>
      </section>
    </main>
  );
}