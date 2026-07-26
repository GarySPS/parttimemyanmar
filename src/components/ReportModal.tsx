//src/components/ReportModal.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { submitReport } from '../app/actions/reportAction';

export default function ReportModal({ 
  jobId = null, 
  reportedUserId = null,
  buttonText,
  t,
  iconOnly = false // <-- Add this
}: { 
  jobId?: string | null, 
  reportedUserId?: string | null,
  buttonText: string,
  t: any,
  iconOnly?: boolean // <-- Add this
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState(''); // <-- Added state for the error message
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  
  const selectRef = useRef<HTMLDivElement>(null);

  const options = [
    { id: 'scam', label: t.options.scam },
    { id: 'spam', label: t.options.spam },
    { id: 'inappropriate', label: t.options.inappropriate },
    { id: 'other', label: t.options.other },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReport = async () => {
    if (!reason) return;
    setStatus('loading');
    setErrorMessage(''); // Clear any previous errors
    
    const result = await submitReport(jobId, reportedUserId, reason);
    
    if (result.error) {
      // Replaced alert() with in-modal UI state
      setErrorMessage(result.error);
      setStatus('error');
    } else {
      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
        setReason('');
      }, 2000);
    }
  };

  const closeAndReset = () => {
    setIsOpen(false);
    setReason('');
    setIsSelectOpen(false);
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        title={buttonText}
        className={iconOnly 
          ? "flex items-center justify-center w-11 h-11 bg-gray-200 hover:bg-rose-100 text-rose-500 rounded-lg transition-all active:scale-95 shrink-0 shadow-sm" 
          : "flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"}
      >
        <svg className={iconOnly ? "w-[22px] h-[22px]" : "w-[18px] h-[18px] shrink-0"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        {!iconOnly && <span>{buttonText}</span>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-5">{t.title}</h3>
            
            {status === 'success' ? (
              <div className="text-emerald-600 font-bold text-center py-4">{t.success}</div>
            ) : (
              <>
                {/* Beautiful Inline Error Banner */}
                {status === 'error' && errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-600 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm font-medium leading-snug">{errorMessage}</span>
                  </div>
                )}

                <div className="relative mb-6" ref={selectRef}>
                  <button
                    type="button"
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className={`w-full flex items-center justify-between p-3.5 bg-gray-50 border rounded-xl text-sm font-medium outline-none transition-all ${
                      isSelectOpen ? 'border-rose-400 ring-4 ring-rose-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={reason ? 'text-gray-900' : 'text-gray-500'}>
                      {reason ? options.find(o => o.id === reason)?.label : t.placeholder}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isSelectOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isSelectOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2">
                      {options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setReason(opt.id);
                            setIsSelectOpen(false);
                            // Clear error when they select a new option
                            if (status === 'error') {
                              setStatus('idle');
                              setErrorMessage('');
                            }
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                            reason === opt.id 
                              ? 'bg-rose-50 text-rose-700 font-bold' 
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={closeAndReset} 
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-95"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={handleReport} 
                    disabled={!reason || status === 'loading'}
                    className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 disabled:opacity-50 transition-all active:scale-95 shadow-sm"
                  >
                    {status === 'loading' ? t.sending : t.submit}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}