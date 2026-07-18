// src/app/complete/[id]/page.tsx

import CloseJobClient from './CloseJobClient';
import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import Navbar from '../../../components/Navbar';
import { getLang } from '../../utils/getLang';
import { dictionaries } from '../../utils/dictionaries';

export default async function CompleteJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const lang = await getLang();
  const t = dictionaries[lang].completeJob;
  const supabase = await createClient();
  const resolvedParams = await params;
  const jobId = resolvedParams.id;
  
  // 1. Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  // 2. Fetch job and verify ownership
  const { data: job } = await supabase
    .from('jobs')
    .select('id, title, employer_id, status')
    .eq('id', jobId)
    .single();

  // Redirect if job doesn't exist, user isn't the owner, or it's already closed
  if (!job || job.employer_id !== user.id || job.status === 'closed') {
    redirect('/');
  }

  // 3. Server Action for closing the job directly
  async function closeJobAction() {
    'use server';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Update the job status to closed
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'closed' })
      .eq('id', jobId)
      .eq('employer_id', user.id); 

    if (error) return { error: error.message };

    // Refresh the home feed so the new status reflects
    revalidatePath('/');
    return { success: true };
  }

  return (
    <main className="w-full min-h-screen bg-[#f3f4f6] text-slate-900 antialiased font-sans">
      <Navbar />

      <div className="max-w-md mx-auto px-4 pt-8 md:pt-12">
        <section className="w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          
          <header className="mb-6 w-full flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t.title}
            </h1>
            <Link href="/" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-full text-sm font-semibold transition-colors">
              {t.cancel}
            </Link>
          </header>

          <div className="mb-8">
            <h2 className="font-bold text-xl text-slate-900 mb-2 leading-tight">{job.title}</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {t.description}
            </p>
          </div>

          <CloseJobClient closeAction={closeJobAction} t={t} />
          
        </section>
      </div>
    </main>
  );
}