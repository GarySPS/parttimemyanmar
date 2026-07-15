// src/components/CityTownSelect.tsx

'use client';
import { useState, useRef, useEffect } from 'react';

export default function CityTownSelect({ 
  defaultCity = '', 
  defaultTown = '',
  locationMap = {} // The self-learning data from your DB
}: { 
  defaultCity?: string; 
  defaultTown?: string;
  locationMap?: Record<string, string[]>;
}) {
  const [city, setCity] = useState(defaultCity);
  const [town, setTown] = useState(defaultTown);
  
  const [cityOpen, setCityOpen] = useState(false);
  const [townOpen, setTownOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const townRef = useRef<HTMLDivElement>(null);

  // Close custom dropdowns if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) setCityOpen(false);
      if (townRef.current && !townRef.current.contains(event.target as Node)) setTownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter existing cities based on typing
  const availableCities = Object.keys(locationMap);
  const filteredCities = city.trim() === '' 
    ? availableCities.slice(0, 15) 
    : availableCities.filter(c => c.toLowerCase().includes(city.toLowerCase()) && c !== city).slice(0, 15);

  // Filter existing towns based on the current typed city
  const availableTowns = locationMap[city] || [];
  const filteredTowns = town.trim() === ''
    ? availableTowns.slice(0, 15)
    : availableTowns.filter(t => t.toLowerCase().includes(town.toLowerCase()) && t !== town).slice(0, 15);

  const inputClass = "w-full bg-white border border-gray-200 rounded-full sm:rounded-xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-gray-900 placeholder:text-gray-400";

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      
      {/* CITY INPUT */}
      <div className="flex-1 relative" ref={cityRef}>
        <input 
          type="text"
          name="city" // Standard name for FormData extraction
          value={city}
          onChange={(e) => { setCity(e.target.value); setTown(''); setCityOpen(true); }}
          onFocus={() => setCityOpen(true)}
          placeholder="City (ဥပမာ - ရန်ကုန်)"
          autoComplete="off"
          className={inputClass}
        />
        {/* Custom Dropdown */}
        {cityOpen && filteredCities.length > 0 && (
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-200">
            {filteredCities.map(c => (
              <div 
                key={c} 
                onMouseDown={(e) => { e.preventDefault(); setCity(c); setTown(''); setCityOpen(false); }}
                className="px-4 py-2.5 text-sm cursor-pointer rounded-lg transition-colors text-gray-700 hover:bg-teal-50 font-medium"
              >
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOWNSHIP INPUT */}
      <div className="flex-1 relative" ref={townRef}>
        <input 
          type="text"
          name="township"
          value={town}
          onChange={(e) => { setTown(e.target.value); setTownOpen(true); }}
          onFocus={() => setTownOpen(true)}
          disabled={!city}
          placeholder="Township (ဥပမာ - စမ်းချောင်း)"
          autoComplete="off"
          className={`${inputClass} ${!city ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
        />
        {/* Custom Dropdown */}
        {townOpen && filteredTowns.length > 0 && (
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-200">
            {filteredTowns.map(t => (
              <div 
                key={t} 
                onMouseDown={(e) => { e.preventDefault(); setTown(t); setTownOpen(false); }}
                className="px-4 py-2.5 text-sm cursor-pointer rounded-lg transition-colors text-gray-700 hover:bg-teal-50 font-medium"
              >
                {t}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}