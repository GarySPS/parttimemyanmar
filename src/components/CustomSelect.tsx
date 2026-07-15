//src/components/CustomSelect.tsx

'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

export default function CustomSelect({ 
  name, 
  options, 
  defaultValue = '', 
  placeholder = 'Select...' 
}: { 
  name: string;
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown if the user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === selected)?.label || placeholder;

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      {/* Hidden input ensures the form still submits the correct data to the URL */}
      <input type="hidden" name={name} value={selected} />
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 rounded-full text-sm font-medium text-gray-700 border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
      >
        <span className="truncate">{selectedLabel}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-60 overflow-auto p-1 animate-in fade-in zoom-in-95 duration-200">
          {/* Default / Reset Option */}
          <div 
            onClick={() => { setSelected(''); setIsOpen(false); }}
            className={`px-4 py-2.5 text-sm cursor-pointer rounded-xl transition-colors ${selected === '' ? 'bg-teal-50 text-teal-900 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {placeholder}
          </div>
          
          {/* Render provided options */}
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { setSelected(opt.value); setIsOpen(false); }}
              className={`px-4 py-2.5 text-sm cursor-pointer rounded-xl transition-colors ${selected === opt.value ? 'bg-teal-50 text-teal-900 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}