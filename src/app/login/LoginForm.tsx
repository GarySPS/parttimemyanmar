//src/app/login/LoginForm.tsx

"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { login } from '../auth/actions';
import Button from '@/components/Button';

// FIX 1: Extracted the button to auto-detect the Server Action status
function SubmitButton({ t }: { t: any }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" isLoading={pending} className="w-full mt-6 group">
      {pending ? (t.loading || 'Signing in...') : t.signIn}
      {!pending && <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
    </Button>
  );
}

export default function LoginForm({ t }: { t: any }) {
  const searchParams = useSearchParams();
  const successMessage = searchParams.get('success');
  const errorMessage = searchParams.get('error');

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-[#045D5D]/10 border border-[#045D5D]/20 flex items-start gap-3">
          <div className="text-[#045D5D] font-medium text-sm">{successMessage}</div>
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
          <div className="text-red-600 font-medium text-sm">{errorMessage}</div>
        </div>
      )}

      {/* Removed the manual onSubmit state handler */}
      <form action={login} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#045D5D] ml-1">
            {t.emailLabel}
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#045D5D] transition-colors" />
            <input 
              type="email" name="email" required 
              placeholder="hello@example.com"
              className="w-full pl-12 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#045D5D]/15 focus:border-[#045D5D] focus:bg-white transition-all shadow-sm" 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="block text-sm font-medium text-[#045D5D]">{t.passwordLabel}</label>
            {/* FIX 2: Upgraded to next/link pointing to the real route */}
            <Link href="/forgot-password" className="text-xs font-medium text-[#D4AF37] hover:text-[#b8952b] transition-colors">
              {t.forgotPassword}
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#045D5D] transition-colors" />
            <input 
              type={showPassword ? "text" : "password"} name="password" required 
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#045D5D]/15 focus:border-[#045D5D] focus:bg-white transition-all shadow-sm" 
            />
            <button 
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#045D5D] transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <SubmitButton t={t} />
      </form>
    </div>
  );
}