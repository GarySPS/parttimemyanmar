//src/app/register/RegisterForm.tsx

"use client";

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Briefcase, User } from 'lucide-react';
import { signup } from '../auth/actions';
import Button from '@/components/Button';

export default function RegisterForm({ t }: { t: any }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('seeker');

  const handleSubmit = (e: React.FormEvent) => {
    setIsLoading(true);
  };

  return (
    <form action={signup} onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="role" value={role} />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#045D5D] ml-1">{t.accountType}</label>
        <div className="grid grid-cols-2 gap-3">
          {['seeker', 'employer'].map((r) => (
            <label key={r} className="cursor-pointer">
              <input 
                type="radio" value={r} className="hidden" 
                checked={role === r}
                onChange={() => setRole(r)}
              />
              <div className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                role === r 
                  ? 'border-[#045D5D] bg-[#045D5D]/5 text-[#045D5D]' 
                  : 'border-gray-200 bg-white/50 text-gray-400 hover:border-[#BBD2D8]'
              }`}>
                {r === 'seeker' ? <User className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                <span className="text-xs font-semibold capitalize">{r === 'seeker' ? t.seeker : t.employer}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#045D5D] ml-1">{t.emailLabel}</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#045D5D] transition-colors" />
          <input 
            type="email" name="email" required placeholder="name@example.com"
            className="w-full pl-12 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#045D5D]/15 focus:border-[#045D5D] transition-all shadow-sm" 
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#045D5D] ml-1">{t.passwordLabel}</label>
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

      <Button type="submit" isLoading={isLoading} className="w-full mt-2">
        {t.registerBtn} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </form>
  );
}