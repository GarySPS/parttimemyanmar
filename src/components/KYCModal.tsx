// src/components/KYCModal.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';

// Using the local AI-generated Myanmar girl sample
const SAMPLE_VERIFY_IMAGE = "/images/id-sample.png";

export default function KYCModal({ isOpen, onClose, profile, submitKyc }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [tier, setTier] = useState<'personal' | 'business'>('personal');

  // State for handling file previews
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const TELEGRAM_LINK = "https://t.me/parttimemmofficial";

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (idPreview) URL.revokeObjectURL(idPreview);
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    };
  }, [idPreview, selfiePreview]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (type === 'id') {
      setIdPreview(previewUrl);
    } else {
      setSelfiePreview(previewUrl);
    }
  };

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    
    try {
      if (tier === 'business') {
        const businessData = new FormData();
        businessData.append('tier', 'business');
        await submitKyc(businessData);
        window.open(TELEGRAM_LINK, '_blank');
      } else {
        const idCardFile = formData.get('id_card') as File;
        const selfieFile = formData.get('selfie') as File;

        if (!idCardFile || idCardFile.size === 0 || !selfieFile || selfieFile.size === 0) {
          throw new Error("Please upload both required images.");
        }

        setLoadingText("Compressing images...");
        await new Promise(resolve => setTimeout(resolve, 50)); 

        const options = { maxSizeMB: 0.4, maxWidthOrHeight: 1280, useWebWorker: false };
        const safeFormData = new FormData();
        safeFormData.append('tier', tier);
        
        const compressedId = await imageCompression(idCardFile, options);
        safeFormData.append('id_card', compressedId, compressedId.name || 'id_card.jpg');

        const compressedSelfie = await imageCompression(selfieFile, options);
        safeFormData.append('selfie', compressedSelfie, compressedSelfie.name || 'selfie.jpg');

        setLoadingText("Securing upload...");
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
        await submitKyc(safeFormData);
      }
      onClose();
    } catch (error: any) {
      console.error("KYC Submission Error:", error);
      alert(`Upload failed: ${error?.message || "Please check your connection and try again"}`);
    } finally {
      setIsSubmitting(false);
      setLoadingText("");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-[440px] overflow-hidden relative my-auto border border-gray-100"
          >
            {/* Header Area */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShieldIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Get Verified</h2>
                  <p className="text-xs text-gray-500 font-medium">Build trust with a verified badge</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* iOS-style Segmented Control Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 relative">
                <button 
                  type="button" 
                  onClick={() => setTier('personal')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all z-10 ${tier === 'personal' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Personal 
                </button>
                <button 
                  type="button" 
                  onClick={() => setTier('business')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all z-10 ${tier === 'business' ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Business
                </button>
                {/* Active Pill Background */}
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-transform duration-300 ease-in-out ${tier === 'personal' ? 'translate-x-0' : 'translate-x-[calc(100%+2px)]'}`} 
                />
              </div>

              <form action={handleSubmit} className="space-y-5">
                
                {/* ================= PERSONAL TIER ================= */}
                {tier === 'personal' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
                    
                    {/* LEFT COLUMN: Upload Buttons */}
                    <div className="flex-[1.2] flex flex-col gap-4">
                      
                      {/* 1. ID Card Upload */}
                      <div>
                        <label className="flex items-center justify-between text-[11px] font-bold text-gray-700 uppercase mb-2">
                          <span>1. ID (NRC) Front</span>
                          {idPreview && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                        </label>
                        <input type="file" name="id_card" ref={idInputRef} accept="image/*" onChange={(e) => handleFileSelect(e, 'id')} className="hidden" />
                        <div onClick={() => idInputRef.current?.click()} className={`relative w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${idPreview ? 'border-blue-500' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                          {idPreview ? (
                            <>
                              <img src={idPreview} alt="ID Preview" className="w-full h-full object-cover opacity-60" />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><span className="bg-white/90 text-gray-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">Change</span></div>
                            </>
                          ) : (
                            <>
                              <CameraIcon className="w-6 h-6 text-gray-400 mb-1" />
                              <span className="text-xs font-semibold text-gray-600">Upload ID</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 2. Selfie Upload */}
                      <div>
                        <label className="flex items-center justify-between text-[11px] font-bold text-gray-700 uppercase mb-2">
                          <span>2. Selfie with ID</span>
                          {selfiePreview && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                        </label>
                        <input type="file" name="selfie" ref={selfieInputRef} accept="image/*" onChange={(e) => handleFileSelect(e, 'selfie')} className="hidden" />
                        <div onClick={() => selfieInputRef.current?.click()} className={`relative w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${selfiePreview ? 'border-blue-500' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                          {selfiePreview ? (
                            <>
                              <img src={selfiePreview} alt="Selfie Preview" className="w-full h-full object-cover opacity-60" />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><span className="bg-white/90 text-gray-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">Change</span></div>
                            </>
                          ) : (
                            <>
                              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-1"><UploadIcon className="w-4 h-4 text-blue-500" /></div>
                              <span className="text-xs font-semibold text-gray-600">Upload Selfie</span>
                            </>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: Example Image */}
                    <div className="flex-[0.8] w-full mt-6">
                      <div className="w-full h-[calc(100%-8px)] relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={SAMPLE_VERIFY_IMAGE} alt="Example" className="w-full h-full object-cover absolute inset-0" />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-center">
                          <span className="text-[9px] font-bold text-white tracking-wider uppercase">Example</span>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* ================= BUSINESS TIER (TELEGRAM) ================= */}
                {tier === 'business' && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-center py-2">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-100/50">
                      <VideoIcon className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-gray-900 font-extrabold text-xl mb-2">Live Verification</h3>
                    <p className="text-sm text-gray-500 px-4 leading-relaxed font-medium">
                      To protect our community, business accounts require a brief video call to verify your workspace.
                    </p>
                    <div className="bg-amber-50/50 rounded-2xl p-4 mt-6 text-left border border-amber-100/50">
                      <p className="text-xs font-bold text-amber-800/60 uppercase mb-3 flex items-center gap-1.5">
                        <InfoIcon className="w-4 h-4" />
                        Next Steps
                      </p>
                      <ul className="text-sm text-amber-900/80 space-y-2.5 font-medium ml-1">
                        <li className="flex gap-2 items-start"><span className="text-amber-500 font-bold">1.</span> Click connect below.</li>
                        <li className="flex gap-2 items-start"><span className="text-amber-500 font-bold">2.</span> Message official Telegram (@parttimemmofficial).</li>
                        <li className="flex gap-2 items-start"><span className="text-amber-500 font-bold">3.</span> Schedule your quick call.</li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* Footer Buttons */}
                <div className="flex gap-3 mt-8 pt-4">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    disabled={isSubmitting} 
                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200 active:scale-[0.98] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || (tier === 'personal' && (!idPreview || !selfiePreview))} 
                    className={`flex-[1.5] py-3.5 text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                      ${tier === 'personal' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'}
                    `}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <SpinnerIcon className="animate-spin h-4 w-4 text-white" />
                        {loadingText || 'Processing...'}
                      </span>
                    ) : (tier === 'business' ? 'Connect Telegram' : 'Submit Verify')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- Inline SVGs for Premium Feel without requiring extra dependencies ---

const ShieldIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CameraIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const UploadIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
);

const VideoIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const InfoIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const SpinnerIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);