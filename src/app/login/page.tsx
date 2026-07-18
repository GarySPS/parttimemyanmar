// src/app/login/page.tsx

import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoginForm from './LoginForm';
import { getLang } from '../utils/getLang';
import { dictionaries } from '../utils/dictionaries';

export default async function LoginPage() {
  // Fetch Language safely on the server
  const lang = await getLang();
  const t = dictionaries[lang].login;

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center transform scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2187&auto=format&fit=crop')" }} />
      <div className="absolute inset-0 bg-[#BBD2D8]/30 backdrop-blur-[12px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF7]/40 to-[#045D5D]/20" />

      <div className="relative z-10 w-full max-w-[440px] mx-4 bg-[#FDFBF7]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_24px_60px_-12px_rgba(4,93,93,0.3)] border border-white/60 overflow-hidden">
        
        <div className="bg-[#045D5D] p-10 flex flex-col items-center justify-center">
          <div className="relative w-48 h-12">
            <Image src="/logo/logo.png" alt="PartTimeMM Logo" fill sizes="192px" className="object-contain" priority />
          </div>
          <h1 className="text-white/90 text-lg font-medium mt-6">{t.welcomeBack}</h1>
        </div>

        <div className="p-10 pt-8">
          <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#045D5D]/30 border-t-[#045D5D] rounded-full animate-spin" /></div>}>
            {/* Pass the dictionary to the client component */}
            <LoginForm t={t} />
          </Suspense>
          
          <div className="mt-8 pt-6 border-t border-gray-200/60">
            <p className="text-sm text-gray-500 text-center mb-4">
              {t.noAccount}
            </p>
            <Link 
              href="/register"
              className="w-full flex items-center justify-center py-3.5 bg-white border-2 border-[#D4AF37] text-[#B5952F] hover:bg-[#D4AF37] hover:text-white rounded-2xl font-semibold tracking-wide transition-all shadow-sm hover:shadow-md active:scale-[0.97]"
            >
              {t.createAccount}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}