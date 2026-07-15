//src/app/complete/[id]/page.tsx

import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CompleteJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  // 3. Server Action for handling the file upload
  async function submitReceipt(formData: FormData) {
    'use server';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const file = formData.get('receipt') as File;
    if (!file || file.size === 0) return;

    // Create a unique, safe filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${jobId}-${Date.now()}.${fileExt}`;

    // Upload the file to our new 'receipts' bucket
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return;
    }

    // Retrieve the public URL
    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    // Update the job status to closed and save the receipt URL
    await supabase
      .from('jobs')
      .update({ 
        status: 'closed', 
        receipt_url: publicUrlData.publicUrl 
      })
      .eq('id', jobId)
      .eq('employer_id', user.id); // Extra safety check

    redirect('/');
  }

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 text-gray-900 font-sans selection:bg-blue-200 p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-xl mt-4 md:mt-12">
        
        <header className="mb-8 w-full flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Complete Task
          </h1>
          <Link href="/" className="px-5 py-2 bg-white/60 hover:bg-white border border-gray-200 rounded-full text-sm font-semibold shadow-sm transition-all hover:shadow-md">
            Cancel
          </Link>
        </header>

        <section className="w-full bg-white/80 backdrop-blur-lg p-6 md:p-8 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white/60">
          
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Pending Validation
            </div>
            <h2 className="font-extrabold text-2xl text-gray-900 mb-2 leading-tight">{job.title}</h2>
            <p className="text-sm text-gray-500 font-medium">To permanently close this listing and build your reputation, upload the WavePay or KBZPay transaction screenshot.</p>
          </div>

          <form action={submitReceipt} className="flex flex-col gap-6 w-full">
            
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="receipt" className="font-bold text-sm text-gray-700 ml-2">Payment Screenshot</label>
              
              <div className="relative group w-full">
                {/* Soft glowing effect behind the input */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                
                {/* Highly customized file input */}
                <input 
                  type="file" 
                  id="receipt" 
                  name="receipt" 
                  accept="image/*"
                  required 
                  className="relative w-full bg-white/90 border border-gray-200/80 rounded-2xl p-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gray-900 file:text-white file:shadow-sm hover:file:bg-black hover:file:cursor-pointer cursor-pointer"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-full font-bold text-base shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Upload & Close Task
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}