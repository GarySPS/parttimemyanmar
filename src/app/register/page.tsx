// src/app/register/page.tsx

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import RegisterForm from './RegisterForm';
import { getLang } from '../utils/getLang';
import { dictionaries } from '../utils/dictionaries';

export default async function RegisterPage() {
  const lang = await getLang();
  const t = dictionaries[lang].register;

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center transform scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2187&auto=format&fit=crop')" }}
      />
      
      <div className="absolute inset-0 bg-[#BBD2D8]/30 backdrop-blur-[12px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF7]/40 to-[#045D5D]/20" />

      <div className="relative z-10 w-full max-w-[440px] mx-4 bg-[#FDFBF7]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_24px_60px_-12px_rgba(4,93,93,0.3)] border border-white/60 overflow-hidden">
        
        <div className="bg-[#045D5D] p-10 flex flex-col items-center justify-center">
          <div className="relative w-48 h-12">
            <Image src="/logo/logo.png" alt="PartTimeMM Logo" fill sizes="192px" className="object-contain" priority />
          </div>
          <h1 className="text-white/90 text-lg font-medium mt-6">{t.createAccount}</h1>
        </div>

        <div className="p-8 pt-6">
          
          {/* Inject translated Client Form here */}
          <RegisterForm t={t} />

          <div className="mt-8 pt-6 border-t border-gray-200/60 text-center text-sm text-gray-600">
            {t.alreadyHaveAccount}{' '}
            <Link href="/login" className="font-semibold text-[#045D5D] hover:text-[#D4AF37] transition-colors">
              {t.logInText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}