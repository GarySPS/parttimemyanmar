//src/components/InstallAppButton.tsx

"use client";
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function InstallAppButton() {
  const { installPromptEvent, isIOS, isInstalled, triggerInstall } = usePWAInstall();

  // Hide button completely if already installed
  if (isInstalled) return null; 

  // Show iOS manual instructions
  if (isIOS) {
    return (
      <button 
        onClick={() => alert("To install on iPhone: Tap the Share button (square with up arrow) at the bottom of your screen, then scroll down and tap 'Add to Home Screen'.")}
        className="hidden md:block px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-bold border border-white/20 hover:bg-white/20 transition-all active:scale-[0.97]"
      >
        Get App
      </button>
    );
  }

  // Show native Android install prompt
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

  return null;
}