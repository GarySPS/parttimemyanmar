//app/actions/bookmark.ts

'use server';
import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache';

export async function toggleBookmark(jobId: string, isBookmarked: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'You must be logged in to save jobs.' };

  if (isBookmarked) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('seeker_id', user.id)
      .eq('job_id', jobId);
    
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from('bookmarks')
      .insert({ seeker_id: user.id, job_id: jobId });

    if (error) return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}