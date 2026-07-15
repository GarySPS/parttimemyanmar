//src/components/LocationInput.tsx

'use client';
import { useState, useRef, useEffect } from 'react';

export default function LocationInput({ 
  name, 
  defaultValue = '', 
  locations = [], 
  isRoundedFull = false 
}: { 
  name: string, 
  defaultValue?: string, 
  locations: string[], 
  isRoundedFull?: boolean 
}) {
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // If empty, show up to 15 existing locations to guide them. 
  // If typing, filter by what they type.
  const filtered = value.trim() === '' 
    ? locations.slice(0, 15) 
    : locations.filter(loc => loc.toLowerCase().includes(value.toLowerCase()) && loc !== value).slice(0, 15);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inputClass = isRoundedFull
    ? "w-full px-5 py-3 rounded-full text-sm font-medium text-gray-700 border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder:text-gray-400"
    : "w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400 shadow-sm";

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => { setValue(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        placeholder="City & Town (ဥပမာ - ရန်ကုန်၊ စမ်းချောင်း)"
        autoComplete="off"
        className={inputClass}
      />
      
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-200">
           {/* Helper text at the top of the dropdown */}
           <div className="px-4 py-2 text-xs font-bold text-teal-800 bg-teal-50/50 rounded-t-xl border-b border-teal-100/50 mb-1">
             Select or type a location
           </div>
           
           {filtered.map(loc => (
             <div
               key={loc}
               onMouseDown={(e) => { e.preventDefault(); setValue(loc); setIsOpen(false); }}
               className="px-4 py-2.5 text-sm cursor-pointer rounded-xl transition-colors text-gray-700 hover:bg-teal-50 font-medium"
             >
               {loc}
             </div>
           ))}
        </div>
      )}
    </div>
  );
}