//src/app/auth/actions.ts

'use server';

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    return redirect('/login?error=Invalid login credentials');
  }
  return redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const phone = formData.get('phone') as string; // Get phone from form

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return redirect('/register?error=Could not create user');
  }

  // Generate a random 8-character hex string for the handle (e.g., user_f954a0ad)
  const handle = `user_${Math.random().toString(16).slice(2, 10)}`;

  // Create the user's profile right after signup
  if (data.user) {
    await supabase.from('profiles').insert([
      { 
        id: data.user.id, 
        role: role,
        handle: handle,
        phone: phone 
      }
    ]);
  }

  return redirect('/login?success=Account created! You can now log in.');
}