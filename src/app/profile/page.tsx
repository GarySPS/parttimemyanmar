// src/app/profile/page.tsx

import Navbar from '../../components/Navbar';
import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/');
  }

  // 1. Fetch current user profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // 1.5 Fetch initial Activity/Posts (Limit to 5)
  const isEmployer = profile?.role === 'employer';
  let initialPosts = [];
  
  if (isEmployer) {
    const { data } = await supabase.from('jobs').select('*').eq('employer_id', user.id).order('created_at', { ascending: false }).limit(5);
    initialPosts = data || [];
  }

  // 2. Fetch dynamic locations from jobs (exactly like your search page)
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

  // Ensure user's current city/township is in the map so the dropdown doesn't break
  if (profile?.city && profile?.township) {
    if (!locationMap[profile.city]) locationMap[profile.city] = [];
    if (!locationMap[profile.city].includes(profile.township)) {
      locationMap[profile.city].push(profile.township);
    }
  }

  // 3. Server Action to handle the form save
  async function saveProfile(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updates: any = {
      contact_username: formData.get('contact_username'),
      bio: formData.get('bio'),
      category: formData.get('category'),
      city: formData.get('city'),
      township: formData.get('township'),
    };

    // Handle Profile Photo Upload
    const avatarFile = formData.get('avatar') as File | null;
    if (avatarFile && avatarFile.size > 0) {
      const fileName = `avatar_${user.id}_${Date.now()}`;
      const { data } = await supabase.storage.from('profiles').upload(fileName, avatarFile, { upsert: true });
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(fileName);
        updates.avatar_url = publicUrl;
    }
    }

    // Handle Cover Photo Upload
    const coverFile = formData.get('cover') as File | null;
    if (coverFile && coverFile.size > 0) {
      const fileName = `cover_${user.id}_${Date.now()}`;
      const { data } = await supabase.storage.from('profiles').upload(fileName, coverFile, { upsert: true });
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(fileName);
        updates.cover_url = publicUrl;
      }
    }

    // Handle Resume/CV Upload (For Seekers)
    const resumeFile = formData.get('resume') as File | null;
    if (resumeFile && resumeFile.size > 0) {
      const ext = resumeFile.name.split('.').pop();
      const fileName = `resume_${user.id}_${Date.now()}.${ext}`;
      const { data } = await supabase.storage.from('profiles').upload(fileName, resumeFile, { upsert: true });
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(fileName);
        updates.resume_url = publicUrl;
      }
    }

    // Handle Dynamic Platforms (Loop through array)
    const platformCount = parseInt(formData.get('platform_count') as string || '0');
    const platforms = [];

    for (let i = 0; i < platformCount; i++) {
      const url = formData.get(`platform_url_${i}`) as string;
      let screenshot_url = formData.get(`platform_existing_screenshot_${i}`) as string;

      const screenshotFile = formData.get(`platform_screenshot_${i}`) as File | null;
      
      // Upload new screenshot if provided
      if (screenshotFile && screenshotFile.size > 0) {
        const fileName = `screenshot_${user.id}_${Date.now()}_${i}`;
        const { data } = await supabase.storage.from('profiles').upload(fileName, screenshotFile, { upsert: true });
        if (data) {
          screenshot_url = supabase.storage.from('profiles').getPublicUrl(fileName).data.publicUrl;
        }
      }

      if (url) {
        platforms.push({ id: Date.now() + i, url, screenshot_url: screenshot_url || null });
      }
    }

    updates.platforms = platforms; // Save array to JSONB column

    // Save all to database
    await supabase.from('profiles').update(updates).eq('id', user.id);
    revalidatePath('/profile');
  }

  return (
    <main className="w-full min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-teal-200 pb-12">
      <Navbar />
      <ProfileClient 
        profile={profile} 
        locationMap={locationMap} 
        saveProfile={saveProfile} 
        initialPosts={initialPosts}
        isEmployer={isEmployer}
      />
    </main>
  );
}