// src/app/actions/reportAction.ts
'use server'

import { createClient } from '../utils/supabase/server';

export async function submitReport(
  jobId: string | null, 
  reportedUserId: string | null, 
  reason: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to report.' };
  }

  const { error } = await supabase.from('reports').insert({
    job_id: jobId,
    reported_user_id: reportedUserId,
    reporter_id: user.id,
    reason: reason
  });

  if (error) return { error: error.message };
  return { success: true };
}