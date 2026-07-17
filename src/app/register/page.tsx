//src>app>register/page.tsx

"use client";

import React, { useState } from 'react';
import { UserPlus, Mail, Lock, Eye, EyeOff, ArrowRight, Briefcase, User } from 'lucide-react';
import { signup } from '../auth/actions';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('seeker');

  const handleSubmit = (e: React.FormEvent) => {
    setIsLoading(true);
    // The form will proceed to the signup action after this
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">
      {/* Background Image: Matching the Login Page */}
      <div 
        className="absolute inset-0 bg-cover bg-center transform scale-105"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2187&auto=format&fit=crop')",
        }}
      />
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-[#BBD2D8]/30 backdrop-blur-[12px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF7]/40 to-[#045D5D]/20" />

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[440px] mx-4 p-8 sm:p-10 bg-[#FDFBF7]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_24px_60px_-12px_rgba(4,93,93,0.3)] border border-white/60">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#045D5D] rounded-full flex items-center justify-center shadow-lg mb-4">
            <UserPlus className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#045D5D]">
            Create Account
          </h1>
          <p className="text-sm text-gray-500 mt-1">Join our community today.</p>
        </div>

        <form action={signup} onSubmit={handleSubmit} className="space-y-5">
          
          {/* Role Selection Component */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#045D5D] ml-1">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['seeker', 'employer'].map((r) => (
                <label key={r} className="cursor-pointer">
                  <input 
                    type="radio" 
                    name="role" 
                    value={r} 
                    className="hidden" 
                    checked={role === r}
                    onChange={() => setRole(r)}
                  />
                  <div className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                    role === r 
                      ? 'border-[#045D5D] bg-[#045D5D]/5 text-[#045D5D]' 
                      : 'border-gray-200 bg-white/50 text-gray-400 hover:border-[#BBD2D8]'
                  }`}>
                    {r === 'seeker' ? <User className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                    <span className="text-xs font-semibold capitalize">{r}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#045D5D] ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#045D5D] transition-colors" />
              <input 
                type="email" name="email" required placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#045D5D]/15 focus:border-[#045D5D] transition-all shadow-sm" 
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#045D5D] ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#045D5D] transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} name="password" required placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#045D5D]/15 focus:border-[#045D5D] transition-all shadow-sm" 
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#045D5D]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" disabled={isLoading}
            className="w-full py-4 mt-2 bg-[#045D5D] hover:bg-[#034A4A] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
              <>Register <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200/60 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-[#045D5D] hover:text-[#D4AF37] transition-colors">Log in</a>
        </div>
      </div>
    </div>
  );
}