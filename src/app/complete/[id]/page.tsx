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
    <main className="w-full min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <header className="mb-6 w-full border-b pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Complete Job</h1>
        <Link href="/" className="text-sm text-gray-500 hover:text-black">
          Cancel
        </Link>
      </header>

      <section className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="font-semibold text-lg">{job.title}</h2>
          <p className="text-sm text-gray-500 mt-1">Upload the WavePay or KBZPay screenshot to close this listing.</p>
        </div>

        <form action={submitReceipt} className="flex flex-col gap-6 w-full">
          
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="receipt" className="font-medium text-sm text-gray-700">Payment Screenshot (.jpg, .png, .webp)</label>
            <input 
              type="file" 
              id="receipt" 
              name="receipt" 
              accept="image/*"
              required 
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-4 bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            Upload & Close Job
          </button>
        </form>
      </section>
    </main>
  );
}