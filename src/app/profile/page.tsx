//src/app/profile/page.tsx

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import Navbar from '../../components/Navbar';

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
    <main className="w-full min-h-screen bg-[#f3f4f6] text-slate-900 antialiased font-sans">
      
      {/* Universal Navigation Bar */}
      <Navbar />

      <div className="max-w-md mx-auto px-4 pt-8 md:pt-12">
        
        {/* Main Card */}
        <section className="w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          
          <header className="mb-6 w-full flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Settings
            </h1>
            <Link href="/" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-full text-sm font-semibold transition-colors">
              Back to Feed
            </Link>
          </header>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 border border-teal-100 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
              Role: {profile?.role || 'Seeker'}
            </span>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Update your out-of-band contact methods so users can reach you.
            </p>
          </div>

          <form action={updateProfile} className="flex flex-col gap-6 w-full">
            
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="contact_app" className="font-bold text-sm text-slate-800">Contact App</label>
              <select
                id="contact_app"
                name="contact_app"
                defaultValue={profile?.contact_app || ''}
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-700 shadow-sm"
              >
                <option value="" disabled>Select an app...</option>
                <option value="Viber">Viber</option>
                <option value="Telegram">Telegram</option>
                <option value="Messenger">Messenger</option>
                <option value="Phone">Phone / SMS</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="contact_username" className="font-bold text-sm text-slate-800">Username or Phone</label>
              <input
                type="text"
                id="contact_username"
                name="contact_username"
                defaultValue={profile?.contact_username || ''}
                placeholder="e.g., @yourusername or 09xxxxxxxxx"
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-[#0a473e] hover:bg-[#07362f] text-white py-3.5 rounded-full font-bold text-base shadow-sm transition-colors"
            >
              Save Profile
            </button>
            
          </form>
        </section>
      </div>
    </main>
  );
}