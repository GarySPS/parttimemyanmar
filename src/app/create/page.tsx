//src/app/create/page.tsx

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CustomSelect from '../../components/CustomSelect';
import CityTownSelect from '../../components/CityTownSelect';
import PriceInput from '../../components/PriceInput';
import Navbar from '../../components/Navbar';

export default async function CreateJobPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, contact_app, contact_username')
    .eq('id', user.id)
    .single();

  if (profile && profile.role !== 'employer') {
    redirect('/');
  }

  const { data: locData } = await supabase.from('jobs').select('city, township').eq('status', 'open');
  const locationMap: Record<string, string[]> = {};
  
  if (locData) {
    locData.forEach(job => {
      if (job.city && job.township) {
        if (!locationMap[job.city]) locationMap[job.city] = [];
        if (!locationMap[job.city].includes(job.township)) {
          locationMap[job.city].push(job.township);
        }
      }
    });
  }

  async function submitJob(formData: FormData) {
    'use server';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const city = formData.get('city') as string;
    const township = formData.get('township') as string;
    const pay_period = formData.get('pay_period') as string;
    const priceStr = formData.get('price') as string;
    const price = priceStr ? parseInt(priceStr.replace(/,/g, ''), 10) : null;
    const task_date = formData.get('task_date') as string;
    const expires_at = formData.get('expires_at') as string;
    const description = formData.get('description') as string;
    
    const contact_app = formData.get('contact_app') as string;
    const contact_username = formData.get('contact_username') as string;

    const imageFile = formData.get('image') as File | null;
    let image_url = null;

    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('job_images')
        .upload(fileName, buffer, { contentType: imageFile.type, upsert: true });
      
      if (uploadData && !uploadError) {
        const { data } = supabase.storage.from('job_images').getPublicUrl(fileName);
        image_url = data.publicUrl;
      } else {
        console.error("Storage Error:", uploadError);
      }
    }

    if (contact_app && contact_username) {
      await supabase.from('profiles').upsert({
        id: user.id,
        role: profile?.role || 'employer',
        contact_app,
        contact_username
      });
    }

    const { error } = await supabase.from('jobs').insert({
      employer_id: user.id,
      title,
      category,
      city,
      township,
      pay_period,
      price,
      task_date: task_date || null,
      expires_at: expires_at || null,
      description,
      image_url,
      contact_app,      
      contact_username, 
      status: 'open'
    });

    if (!error) {
      redirect('/');
    } else {
      console.error("Database Insert Error:", error);
    }
  }

  return (
    <main className="w-full min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-teal-200 flex flex-col items-center">
      
      {/* Universal Navigation Bar */}
      <Navbar />

      <div className="w-full max-w-2xl p-4 md:p-8 mt-2 mb-12">
        
        <div className="mb-6 px-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-teal-950">
              Post a Task
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Fill out the details to find local help.</p>
          </div>
          
          {/* Moved the Cancel button here so it's still accessible */}
          <Link href="/" className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-sm font-bold text-gray-700 shadow-sm transition-all">
            Cancel
          </Link>
        </div>

        <section className="w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
          <form action={submitJob} className="flex flex-col gap-8 w-full">
            
            <div className="space-y-5">
              <h2 className="text-sm font-extrabold text-teal-900 uppercase tracking-widest border-b border-gray-100 pb-2">1. The Basics</h2>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="title" className="font-bold text-sm text-gray-800">Task Title <span className="text-rose-500">*</span></label>
                <input 
                  type="text" id="title" name="title" required 
                  placeholder="e.g., Need help carrying 5 rice bags to 3rd floor" 
                  className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2 relative z-20">
                  <label className="font-bold text-sm text-gray-800">Category <span className="text-rose-500">*</span></label>
                  <CustomSelect 
                    name="category"
                    placeholder="Select a category"
                    options={[
                      { value: 'delivery', label: 'Delivery & Logistics' },
                      { value: 'manual', label: 'Manual Labor & Cleaning' },
                      { value: 'tech', label: 'Tech & Digital' },
                      { value: 'events', label: 'Events & Hospitality' },
                      { value: 'education', label: 'Education & Tutoring' },
                      { value: 'admin', label: 'Admin & Office' },
                      { value: 'retail', label: 'Retail & Sales' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 relative z-10 mt-5">
                <label className="font-bold text-sm text-gray-800">
                  City & Township <span className="text-rose-500">*</span>
                </label>
                <CityTownSelect locationMap={locationMap} />
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="text-sm font-extrabold text-teal-900 uppercase tracking-widest border-b border-gray-100 pb-2">2. Payment & Schedule</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-0">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-gray-800">Pay Type <span className="text-rose-500">*</span></label>
                  <CustomSelect 
                    name="pay_period"
                    placeholder="How are you paying?"
                    options={[
                      { value: 'fixed', label: 'Fixed Price (One-time Task)' },
                      { value: 'hourly', label: 'Hourly' },
                      { value: 'daily', label: 'Daily' },
                      { value: 'monthly', label: 'Monthly' },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="price" className="font-bold text-sm text-gray-800">Amount (MMK) <span className="text-rose-500">*</span></label>
                  <PriceInput />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="task_date" className="font-bold text-sm text-gray-800">Task Date (Optional)</label>
                  <input 
                    type="date" id="task_date" name="task_date" 
                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-700 shadow-sm cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="expires_at" className="font-bold text-sm text-gray-800">Expiration Date <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" id="expires_at" name="expires_at" required
                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-700 shadow-sm cursor-pointer border-rose-200/50 bg-rose-50/10"
                  />
                  <p className="text-xs text-gray-500 font-medium">Post will automatically close after this date.</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="text-sm font-extrabold text-teal-900 uppercase tracking-widest border-b border-gray-100 pb-2">3. Details & Media</h2>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="description" className="font-bold text-sm text-gray-800">Description & Requirements <span className="text-rose-500">*</span></label>
                <textarea 
                  id="description" name="description" required rows={4}
                  placeholder="Explain exactly what needs to be done, any tools required, etc..." 
                  className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400 resize-none shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="image" className="font-bold text-sm text-gray-800">Attach a Photo (Optional)</label>
                <div className="relative">
                  <input 
                    type="file" id="image" name="image" accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer border border-gray-200 rounded-xl p-2 shadow-sm"
                  />
                </div>
                <p className="text-xs text-gray-400 font-medium">Upload a picture of the items, location, or task context.</p>
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="text-sm font-extrabold text-teal-900 uppercase tracking-widest border-b border-gray-100 pb-2">4. Contact Information</h2>
              <p className="text-xs text-gray-500 font-medium mb-2">How should seekers reach out to you? (We will save this for your next post).</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-0">
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact_app" className="font-bold text-sm text-gray-800">Contact Method <span className="text-rose-500">*</span></label>
                  <select 
                    id="contact_app"
                    name="contact_app"
                    required
                    defaultValue={profile?.contact_app || ''}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-700 shadow-sm"
                  >
                    <option value="" disabled>Select an app...</option>
                    <option value="Viber">Viber</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Phone">Phone Call / SMS</option>
                    <option value="Facebook">Facebook / Messenger</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact_username" className="font-bold text-sm text-gray-800">Username / Phone Number <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" id="contact_username" name="contact_username" required 
                    defaultValue={profile?.contact_username || ''}
                    placeholder="e.g., +95 9..." 
                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-teal-900 text-white py-4 rounded-full font-bold text-lg shadow-lg hover:bg-teal-800 active:scale-[0.98] transition-all"
              >
                Publish Job Post
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}