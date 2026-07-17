//src/app/actions/follow.ts

'use server';

import { createClient } from '../utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFollow(employerId: string, isFollowing: boolean, path: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Must be logged in to follow");

  if (isFollowing) {
    await supabase.from('follows').delete().match({ follower_id: user.id, following_id: employerId });
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: employerId });
  }

  revalidatePath(path);
}