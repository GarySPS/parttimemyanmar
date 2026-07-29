// src/components/KYCModal.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';

export default function KYCModal({ isOpen, onClose, profile, submitKyc }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tier, setTier] = useState<'personal' | 'business'>('personal');

  const TELEGRAM_LINK = "https://t.me/parttimemmofficial"; 

  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    
    try {
      if (tier === 'business') {
        const businessData = new FormData();
        businessData.append('tier', 'business');
        await submitKyc(businessData);
        window.open(TELEGRAM_LINK, '_blank');
      } else {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        
        const idCardFile = formData.get('id_card') as File;
        if (idCardFile && idCardFile.size > 0) {
          const compressedId = await imageCompression(idCardFile, options);
          formData.set('id_card', compressedId, compressedId.name);
        }

        const selfieFile = formData.get('selfie') as File;
        if (selfieFile && selfieFile.size > 0) {
          const compressedSelfie = await imageCompression(selfieFile, options);
          formData.set('selfie', compressedSelfie, compressedSelfie.name);
        }

        formData.append('tier', tier);
        await submitKyc(formData);
      }
      onClose();
    } catch (error) {
      console.error("KYC Submission Error:", error);
      alert("Upload failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative my-auto"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Account Verification</h2>

              {/* Type Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button 
                  type="button" 
                  onClick={() => setTier('personal')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tier === 'personal' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Personal (Blue)
                </button>
                <button 
                  type="button" 
                  onClick={() => setTier('business')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tier === 'business' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Business (Yellow)
                </button>
              </div>

              <form action={handleSubmit} className="space-y-4">
                
                {/* ================= PERSONAL TIER ================= */}
                {tier === 'personal' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ID Card (Front)</label>
                      <input type="file" name="id_card" accept="image/*" required className="w-full text-sm p-2.5 border border-gray-200 rounded-xl bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Selfie holding ID</label>
                      <input type="file" name="selfie" accept="image/*" required className="w-full text-sm p-2.5 border border-gray-200 rounded-xl bg-gray-50" />
                    </div>
                  </motion.div>
                )}

                {/* ================= BUSINESS TIER (TELEGRAM) ================= */}
                {tier === 'business' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center py-2">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.33-1.08-.7.02-.19.27-.39.75-.59 2.95-1.28 4.91-2.13 5.89-2.53 2.79-1.16 3.37-1.36 3.75-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/></svg>
                    </div>
                    <h3 className="text-gray-900 font-bold text-lg mb-2">Live Video Verification</h3>
                    <p className="text-sm text-gray-600 px-2 leading-relaxed">
                      To protect our community, Business Verification requires a brief live video call with an admin to verify your workspace.
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4 mt-4 text-left border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Steps to verify:</p>
                      <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside ml-2 font-medium">
                        <li>Click the button below to start.</li>
                        <li>Redirect to Official Telegram (@parttimemmofficial).</li>
                        <li>Send us your registered Phone Number.</li>
                        <li>Wait for an Admin to schedule a video call.</li>
                      </ol>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 active:scale-[0.98] transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center">
                    {isSubmitting ? 'Processing...' : (tier === 'business' ? 'Connect via Telegram' : 'Submit Application')}
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