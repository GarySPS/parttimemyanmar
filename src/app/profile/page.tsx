//src/app/profile/page.tsx

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('contact_app, contact_username, role')
    .eq('id', user.id)
    .single();

  async function updateProfile(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const contact_app = formData.get('contact_app') as string;
    const contact_username = formData.get('contact_username') as string;

    await supabase
      .from('profiles')
      .update({ contact_app, contact_username })
      .eq('id', user.id);

    revalidatePath('/profile');
    redirect('/');
  }

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 text-gray-900 font-sans selection:bg-blue-200 p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-xl mt-4 md:mt-12">
        
        <header className="mb-8 w-full flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Settings
          </h1>
          <Link href="/" className="px-5 py-2 bg-white/60 hover:bg-white border border-gray-200 rounded-full text-sm font-semibold shadow-sm transition-all hover:shadow-md">
            Back to Feed
          </Link>
        </header>

        <section className="w-full bg-white/80 backdrop-blur-lg p-6 md:p-8 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white/60">
          
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-gray-100/80 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              Role: {profile?.role || 'Seeker'}
            </span>
            <p className="text-sm text-gray-500 font-medium">Update your out-of-band contact methods so users can reach you.</p>
          </div>

          <form action={updateProfile} className="flex flex-col gap-6 w-full">
            
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="contact_app" className="font-bold text-sm text-gray-700 ml-2">Contact App</label>
              <select
                id="contact_app"
                name="contact_app"
                defaultValue={profile?.contact_app || ''}
                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all cursor-pointer appearance-none"
              >
                <option value="" disabled>Select an app...</option>
                <option value="Viber">Viber</option>
                <option value="Telegram">Telegram</option>
                <option value="Messenger">Messenger</option>
                <option value="Phone">Phone / SMS</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="contact_username" className="font-bold text-sm text-gray-700 ml-2">Username or Phone</label>
              <input
                type="text"
                id="contact_username"
                name="contact_username"
                defaultValue={profile?.contact_username || ''}
                placeholder="e.g., @yourusername or 09xxxxxxxxx"
                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-gray-900 text-white py-4 rounded-full font-bold text-base shadow-lg shadow-gray-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Save Profile
            </button>
            
          </form>
        </section>
      </div>
    </main>
  );
}