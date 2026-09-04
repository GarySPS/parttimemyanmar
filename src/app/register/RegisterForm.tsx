// src/app/register/RegisterForm.tsx
"use client";

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Briefcase, User, Phone } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { signup } from '../auth/actions';

function SubmitButton({ t }: { t: any }) {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 bg-[#045D5D] text-white rounded-2xl font-semibold tracking-wide transition-all shadow-sm hover:shadow-md hover:bg-[#034d4d] active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed group"
    >
      {pending ? (t.loading || 'Creating account...') : t.registerBtn}
      {!pending && <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
    </button>
  );
}

export default function RegisterForm({ t }: { t: any }) {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('seeker');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  return (
    <form action={signup} className="space-y-5">
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

      <div className="flex p-1 bg-gray-100/80 rounded-xl">
        <button 
          type="button" 
          onClick={() => setAuthMethod('email')} 
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${authMethod === 'email' ? 'bg-white text-[#045D5D] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t.useEmail || "Email"}
        </button>
        <button 
          type="button" 
          onClick={() => setAuthMethod('phone')} 
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${authMethod === 'phone' ? 'bg-white text-[#045D5D] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t.usePhone || "Phone"}
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#045D5D] ml-1">
          {authMethod === 'email' ? t.emailLabel : (t.phoneLabel || "Phone Number")}
        </label>
        <div className="relative group">
          {authMethod === 'email' ? (
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#045D5D] transition-colors" />
          ) : (
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#045D5D] transition-colors" />
          )}
          
          {authMethod === 'email' ? (
            <input 
              type="email" name="email" required placeholder="name@example.com"
              className="w-full pl-12 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#045D5D]/15 focus:border-[#045D5D] transition-all shadow-sm" 
            />
          ) : (
            <input 
              type="tel" name="phone" required placeholder="+95 9..."
              className="w-full pl-12 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#045D5D]/15 focus:border-[#045D5D] transition-all shadow-sm" 
            />
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#045D5D] ml-1">{t.passwordLabel}</label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#045D5D] transition-colors" />
          <input 
            type={showPassword ? "text" : "password"} name="password" required placeholder="••••••••"
            minLength={6}
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

      <SubmitButton t={t} />
    </form>
  );
}