// src/components/InstallAppButton.tsx
"use client";
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface InstallProps {
  tTitle: string;
  tDesc: string;
  tInstall: string;
  tGuide: string;
}

export default function InstallAppButton({ tTitle, tDesc, tInstall, tGuide }: InstallProps) {
  const { installPromptEvent, isIOS, isInstalled, triggerInstall } = usePWAInstall();
  const router = useRouter();
  
  // Start as false to prevent UI flashing before checking localStorage
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only show if not installed AND user hasn't dismissed it previously
    const dismissed = localStorage.getItem('pwa_banner_dismissed') === 'true';
    if (!isInstalled && !dismissed) {
      setShowBanner(true);
    }
  }, [isInstalled]);

  const handleDismiss = () => {
    localStorage.setItem('pwa_banner_dismissed', 'true');
    setShowBanner(false);
  };

  return (
    <>
      {/* --- DESKTOP NAVBAR BUTTON (Hidden on Mobile) --- */}
      {installPromptEvent ? (
        <button 
          onClick={triggerInstall}
          className="hidden md:block px-4 py-2 bg-[#e3b23c] text-[#0f4c5c] rounded-xl text-sm font-extrabold shadow-lg shadow-[#e3b23c]/20 hover:bg-[#f0c254] hover:-translate-y-0.5 active:scale-[0.97] transition-all"
        >
          {tInstall}
        </button>
      ) : (
        <button 
          onClick={() => router.push('/install')}
          className="hidden md:block px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-bold border border-white/20 hover:bg-white/20 transition-all active:scale-[0.97]"
        >
          {tGuide}
        </button>
      )}

      {/* --- MOBILE FLOATING POP-UP (Hidden on Desktop) --- */}
      {showBanner && (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#0f4c5c] text-white p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] border border-[#e3b23c]/30 flex items-center justify-between gap-3">
            <div className="flex-1 flex flex-col">
              <span className="font-bold text-[15px]">{tTitle}</span>
              <span className="text-xs text-[#a4c3d2] mt-0.5">{tDesc}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => installPromptEvent ? triggerInstall() : router.push('/install')}
                className="whitespace-nowrap px-4 py-2 bg-[#e3b23c] text-[#0f4c5c] rounded-xl text-sm font-extrabold shadow-lg shadow-[#e3b23c]/20 active:scale-95 transition-all"
              >
                {installPromptEvent ? tInstall : tGuide}
              </button>
              <button 
                onClick={handleDismiss} 
                className="p-1.5 text-white/60 hover:text-white rounded-full bg-white/10 active:scale-95 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}