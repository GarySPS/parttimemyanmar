// src/app/auth/actions.ts

'use server';

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string | null;
  const phone = formData.get('phone') as string | null;
  const password = formData.get('password') as string;

  const credentials: any = { password };
  if (email) credentials.email = email;
  if (phone) credentials.phone = phone;

  const { error } = await supabase.auth.signInWithPassword(credentials);
  
  if (error) {
    return redirect('/login?error=Invalid login credentials');
  }
  return redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string | null;
  const phone = formData.get('phone') as string | null;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  
  // 1. Pass the role into user_metadata. 
  const credentials: any = {
    password,
    options: {
      data: {
        role: role,
      }
    }
  };
  
  if (email) credentials.email = email;
  if (phone) credentials.phone = phone;

  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) {
    return redirect('/register?error=Could not create user');
  }

  // 2. Wait for the user to be returned, then manually UPDATE the row 
  if (data.user) {
    const handle = `user_${Math.random().toString(16).slice(2, 10)}`;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: role,
        handle: handle,
      })
      .eq('id', data.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError.message);
    }
  }

  redirect('/');
}