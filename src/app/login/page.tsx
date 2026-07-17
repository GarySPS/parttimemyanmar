// src/app/login/page.tsx

"use client";

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { login } from '../auth/actions';
import Button from '@/components/Button';

function LoginForm() {
  const searchParams = useSearchParams();
  const successMessage = searchParams.get('success');
  const errorMessage = searchParams.get('error');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="w-full">
      {/* Alert Messages for Success or Errors */}
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

      {/* Linked to actual login server action */}
      <form action={login} onSubmit={() => setIsLoading(true)} className="space-y-5">
        
        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#045D5D] ml-1">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#045D5D] transition-colors duration-300" />
            <input 
              type="email" 
              name="email"
              required 
              placeholder="hello@example.com"
              className="w-full pl-12 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#045D5D]/15 focus:border-[#045D5D] focus:bg-white transition-all duration-300 shadow-sm" 
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="block text-sm font-medium text-[#045D5D]">
              Password
            </label>
            <a href="#" className="text-xs font-medium text-[#D4AF37] hover:text-[#b8952b] transition-colors">
              Forgot password?
            </a>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#045D5D] transition-colors duration-300" />
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              required 
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#045D5D]/15 focus:border-[#045D5D] focus:bg-white transition-all duration-300 shadow-sm" 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#045D5D] transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          isLoading={isLoading}
          className="w-full mt-6"
        >
          Sign In
          <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">
      {/* Background Image: Desk with potted plant and ceramic mug */}
      <div 
        className="absolute inset-0 bg-cover bg-center transform scale-105"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2187&auto=format&fit=crop')",
        }}
      />
      
      {/* Overlays for pastel blue tint, cream warmth, and blur */}
      <div className="absolute inset-0 bg-[#BBD2D8]/30 backdrop-blur-[12px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF7]/40 to-[#045D5D]/20" />

      <div className="relative z-10 w-full max-w-[440px] mx-4 bg-[#FDFBF7]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_24px_60px_-12px_rgba(4,93,93,0.3)] border border-white/60 overflow-hidden">
        
        {/* Logo Section */}
        <div className="bg-[#045D5D] p-10 flex flex-col items-center justify-center">
          <div className="relative w-48 h-12">
            <Image 
              src="/logo/logo.png" 
              alt="PartTimeMM Logo" 
              fill
              sizes="192px"
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-white/90 text-lg font-medium mt-6">Welcome back</h1>
        </div>

        <div className="p-10 pt-8">
          
          <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#045D5D]/30 border-t-[#045D5D] rounded-full animate-spin" /></div>}>
            <LoginForm />
          </Suspense>
          
          {/* Secondary Registration Button */}
          <div className="mt-8 pt-6 border-t border-gray-200/60">
            <p className="text-sm text-gray-500 text-center mb-4">
              Don't have an account?
            </p>
            <Link 
              href="/register"
              className="w-full flex items-center justify-center py-3.5 bg-white border-2 border-[#D4AF37] text-[#B5952F] hover:bg-[#D4AF37] hover:text-white rounded-2xl font-semibold tracking-wide transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.97]"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}