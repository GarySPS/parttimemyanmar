//src/components/InstallAppButton.tsx

"use client";
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useRouter } from 'next/navigation';

export default function InstallAppButton() {
  const { installPromptEvent, isIOS, isInstalled, triggerInstall } = usePWAInstall();
  const router = useRouter();

  if (isInstalled) return null; 

  if (isIOS) {
    return (
      <button 
        onClick={() => router.push('/install')}
        className="hidden md:block px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-bold border border-white/20 hover:bg-white/20 transition-all active:scale-[0.97]"
      >
        Get App
      </button>
    );
  }

  if (installPromptEvent) {
    return (
      <button 
        onClick={triggerInstall}
        className="hidden md:block px-4 py-2 bg-[#e3b23c] text-[#0f4c5c] rounded-xl text-sm font-extrabold shadow-lg shadow-[#e3b23c]/20 hover:bg-[#f0c254] hover:-translate-y-0.5 active:scale-[0.97] transition-all"
      >
        Install App
      </button>
    );
  }

  return (
    <button 
      onClick={() => router.push('/install')}
      className="hidden md:block px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-bold border border-white/20 hover:bg-white/20 transition-all active:scale-[0.97]"
    >
      App Guide
    </button>
  );
}