//src/utils/getLang.ts

import { cookies } from 'next/headers';
import { Language } from './dictionaries';

export async function getLang(): Promise<Language> {
  const cookieStore = await cookies();
  const lang = cookieStore.get('NEXT_LOCALE')?.value as Language;
  
  // Default to Burmese if cookie is missing or invalid
  return (lang === 'en' || lang === 'my') ? lang : 'my';
}