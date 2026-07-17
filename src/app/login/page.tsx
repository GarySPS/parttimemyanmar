//src>app/login/page.tsx

"use client";

import React, { useState } from 'react';
import { Clock, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  // Simulate network request
  setTimeout(() => {
    setIsLoading(false);
  }, 1500);
};

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">
      {/* Background Image: Desk with potted plant and ceramic mug */}
      <div 
        className="absolute inset-0 bg-cover bg-center transform scale-105"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2187&auto=format&fit=crop')",
        }}
      />
      
      {/* Overlays for pastel blue tint, cream warmth, and blur (out of focus effect) */}
      <div className="absolute inset-0 bg-[#BBD2D8]/30 backdrop-blur-[12px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF7]/40 to-[#045D5D]/20" />

      <div className="relative z-10 w-full max-w-[440px] mx-4 p-10 sm:p-12 bg-[#FDFBF7]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_24px_60px_-12px_rgba(4,93,93,0.3)] border border-white/60">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-9 h-9 text-[#D4AF37]" strokeWidth={2.5} />
            <span className="text-3xl font-extrabold tracking-tight text-[#045D5D]">
              PartTimeMM
            </span>
          </div>
          <h1 className="text-xl font-semibold text-gray-700">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Enter your details to access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#045D5D] ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#045D5D] transition-colors duration-300" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#045D5D]/15 focus:border-[#045D5D] focus:bg-white transition-all duration-300 shadow-sm" 
              />
            </div>
          </div>

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
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 mt-6 bg-[#045D5D] hover:bg-[#034A4A] text-white rounded-2xl font-semibold tracking-wide transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(4,93,93,0.5)] hover:shadow-[0_12px_24px_-6px_rgba(4,93,93,0.6)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </>
            )}
          </button>
        </form>
        
        {/* Registration Link */}
        <div className="mt-8 pt-6 border-t border-gray-200/60 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="font-semibold text-[#045D5D] hover:text-[#D4AF37] transition-colors duration-300">
            Register here
          </a>
        </div>
      </div>
    </div>
  );
}