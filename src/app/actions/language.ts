//src/app/actions/language.ts

'use server';

import { createClient } from '../utils/supabase/server';
import type { Language } from '../utils/dictionaries';

export async function updateUserLanguage(lang: Language) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from('profiles')
      .update({ language: lang })
      .eq('id', user.id);
  }
}