// src/app/auth/actions.ts

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
  
  // 1. Pass the role into user_metadata. 
  // If your Supabase trigger is configured to read metadata, it will apply it instantly.
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        role: role,
      }
    }
  });

  if (error) {
    return redirect('/register?error=Could not create user');
  }

  // 2. Wait for the user to be returned, then manually UPDATE the row 
  // that the database trigger just automatically created.
  if (data.user) {
    const handle = `user_${Math.random().toString(16).slice(2, 10)}`;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: role,
        handle: handle,
      })
      .eq('id', data.user.id); // Force update the specific user's row

    if (profileError) {
      console.error("Profile update error:", profileError.message);
    }
  }

  redirect('/');
}