//src/app/create/page.tsx

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CustomSelect from '../../components/CustomSelect';
import CityTownSelect from '../../components/CityTownSelect';
import PriceInput from '../../components/PriceInput';
import Navbar from '../../components/Navbar';
import { getLang } from '../utils/getLang';
import { dictionaries } from '../utils/dictionaries';

export default async function CreateJobPage() {
  const lang = await getLang();
  const t = dictionaries[lang].createJob;
  const tCityTown = dictionaries[lang].cityTownSelect;
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

  // Fetch clean, standardized locations from your dedicated table
  const { data: locData } = await supabase.from('locations').select('city, township');
  const locationMap: Record<string, string[]> = {};
  
  if (locData) {
    locData.forEach(loc => {
      if (loc.city && loc.township) {
        if (!locationMap[loc.city]) locationMap[loc.city] = [];
        if (!locationMap[loc.city].includes(loc.township)) {
          locationMap[loc.city].push(loc.township);
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

    // 1. Insert job and return the created job ID
    const { data: newJob, error } = await supabase.from('jobs').insert({
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
    }).select('id').single();

    if (!error && newJob) {
      // 2. Automatically trigger Telegram Channel Notification
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://parttimemm.com';
        await fetch(`${siteUrl}/api/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            company: contact_username || 'Employer',
            location: `${township}, ${city.split(' ')[0]}`,
            salary: price ? `${new Intl.NumberFormat('en-MM').format(price)} MMK` : 'Negotiable',
            jobId: newJob.id,
          }),
        });
      } catch (telegramErr) {
        console.error("Telegram Notification Error:", telegramErr);
      }

      redirect('/');
    } else {
      console.error("Database Insert Error:", error);
    }

    if (!error) {
      redirect('/');
    } else {
      console.error("Database Insert Error:", error);
    }
  }

  return (
    <main className="w-full min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-teal-200 flex flex-col items-center">
      <Navbar />

      <div className="w-full max-w-2xl p-4 md:p-8 mt-2 mb-12">
        <div className="mb-6 px-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-teal-950">
              {t.title}
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">{t.subtitle}</p>
          </div>
          
          <Link href="/" className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-sm font-bold text-gray-700 shadow-sm transition-all active:scale-[0.95]">
            {t.cancel}
          </Link>
        </div>

        <section className="w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
          <form action={submitJob} className="flex flex-col gap-8 w-full">
            
            {/* SECTION 1 */}
            <div className="space-y-5">
              <h2 className="text-sm font-extrabold text-teal-900 uppercase tracking-widest border-b border-gray-100 pb-2">{t.section1}</h2>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="title" className="font-bold text-sm text-gray-800">{t.taskTitle} <span className="text-rose-500">*</span></label>
                <input 
                  type="text" id="title" name="title" required 
                  placeholder={t.titlePlaceholder} 
                  className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2 relative z-20">
                  <label className="font-bold text-sm text-gray-800">{t.category} <span className="text-rose-500">*</span></label>
                  <CustomSelect 
                    name="category"
                    placeholder={t.categoryPlaceholder}
                    options={[
                      { value: 'delivery', label: t.cats.delivery },
                      { value: 'manual', label: t.cats.manual },
                      { value: 'tech', label: t.cats.tech },
                      { value: 'events', label: t.cats.events },
                      { value: 'education', label: t.cats.education },
                      { value: 'admin', label: t.cats.admin },
                      { value: 'retail', label: t.cats.retail },
                      { value: 'freelancer', label: t.cats.freelancer },
                      { value: 'other', label: t.cats.other },
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 relative z-10 mt-5">
                <label className="font-bold text-sm text-gray-800">
                  {t.cityTown} <span className="text-rose-500">*</span>
                </label>
                <CityTownSelect locationMap={locationMap} t={tCityTown} />
              </div>
            </div>

            {/* SECTION 2 */}
            <div className="space-y-5">
              <h2 className="text-sm font-extrabold text-teal-900 uppercase tracking-widest border-b border-gray-100 pb-2">{t.section2}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-0">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-gray-800">{t.payType} <span className="text-rose-500">*</span></label>
                  <CustomSelect 
                    name="pay_period"
                    placeholder={t.payPlaceholder}
                    options={[
                      { value: 'fixed', label: t.pays.fixed },
                      { value: 'hourly', label: t.pays.hourly },
                      { value: 'daily', label: t.pays.daily },
                      { value: 'monthly', label: t.pays.monthly },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="price" className="font-bold text-sm text-gray-800">{t.amount} <span className="text-rose-500">*</span></label>
                  <PriceInput />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="task_date" className="font-bold text-sm text-gray-800">{t.taskDate}</label>
                  <input 
                    type="date" id="task_date" name="task_date" 
                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-700 shadow-sm cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="expires_at" className="font-bold text-sm text-gray-800">{t.expireDate} <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" id="expires_at" name="expires_at" required
                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-700 shadow-sm cursor-pointer border-rose-200/50 bg-rose-50/10"
                  />
                  <p className="text-xs text-gray-500 font-medium">{t.expireDesc}</p>
                </div>
              </div>
            </div>

            {/* SECTION 3 */}
            <div className="space-y-5">
              <h2 className="text-sm font-extrabold text-teal-900 uppercase tracking-widest border-b border-gray-100 pb-2">{t.section3}</h2>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="description" className="font-bold text-sm text-gray-800">{t.desc} <span className="text-rose-500">*</span></label>
                <textarea 
                  id="description" name="description" required rows={4}
                  placeholder={t.descPlaceholder} 
                  className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400 resize-none shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="image" className="font-bold text-sm text-gray-800">{t.attachPhoto}</label>
                <div className="relative">
                  <input 
                    type="file" id="image" name="image" accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer border border-gray-200 rounded-xl p-2 shadow-sm"
                  />
                </div>
                <p className="text-xs text-gray-400 font-medium">{t.attachDesc}</p>
              </div>
            </div>

            {/* SECTION 4 */}
            <div className="space-y-5">
              <h2 className="text-sm font-extrabold text-teal-900 uppercase tracking-widest border-b border-gray-100 pb-2">{t.section4}</h2>
              <p className="text-xs text-gray-500 font-medium mb-2">{t.contactDesc}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-0">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-gray-800">{t.contactMethod} <span className="text-rose-500">*</span></label>
                  <CustomSelect 
                    name="contact_app"
                    placeholder={t.contactPlaceholder}
                    defaultValue={profile?.contact_app || ''}
                    options={[
                      { value: 'Viber', label: 'Viber' },
                      { value: 'Telegram', label: 'Telegram' },
                      { value: 'Phone', label: t.apps.phone },
                      { value: 'Facebook', label: t.apps.facebook },
                      { value: 'Email', label: 'Email' }
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact_username" className="font-bold text-sm text-gray-800">{t.usernamePhone} <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" id="contact_username" name="contact_username" required 
                    defaultValue={profile?.contact_username || ''}
                    placeholder={t.usernamePlaceholder} 
                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-teal-900 text-white py-4 rounded-full font-bold text-lg shadow-lg hover:bg-teal-800 active:scale-[0.97] active:shadow-sm transition-all"
              >
                {t.publishBtn}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}