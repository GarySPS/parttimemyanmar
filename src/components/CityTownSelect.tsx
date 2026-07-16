// src/components/CityTownSelect.tsx

'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

// Assumed data structure: Record<string, string[]>
export default function CityTownSelect({ 
  defaultCity = '', 
  defaultTown = '',
  locationMap = {}
}: { 
  defaultCity?: string; 
  defaultTown?: string;
  locationMap?: Record<string, string[]>;
}) {
  const [city, setCity] = useState(defaultCity);
  const [town, setTown] = useState(defaultTown);
  
  const [cityOpen, setCityOpen] = useState(false);
  const [townOpen, setTownOpen] = useState(false);
  
  // Track active descendant for accessibility (keyboard nav)
  const [cityActiveIndex, setCityActiveIndex] = useState(-1);
  const [townActiveIndex, setTownActiveIndex] = useState(-1);

  const cityRef = useRef<HTMLDivElement>(null);
  const townRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const townInputRef = useRef<HTMLInputElement>(null);

  // Filter existing cities based on typing
  const availableCities = Object.keys(locationMap);
  const filteredCities = city.trim() === '' 
    ? availableCities.slice(0, 8) 
    /* FIX: Removed '&& c !== city' so exact matches stay in list for selection */
    : availableCities.filter(c => c.toLowerCase().includes(city.toLowerCase())).slice(0, 8);

  // Filter existing towns based on the current typed city
  const availableTowns = locationMap[city] || [];
  const filteredTowns = town.trim() === ''
    ? availableTowns.slice(0, 8)
    /* FIX: Removed '&& t !== town' so exact matches stay in list for selection */
    : availableTowns.filter(t => t.toLowerCase().includes(town.toLowerCase())).slice(0, 8);

  // Close custom dropdowns if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) setCityOpen(false);
      if (townRef.current && !townRef.current.contains(event.target as Node)) setTownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation for City
  const handleCityKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
  // 🚨 ALWAYS block Enter from submitting form
  if (e.key === 'Enter') {
    e.preventDefault();
  }

  if (!cityOpen || filteredCities.length === 0) {
    if (e.key === 'ArrowDown') setCityOpen(true);
    return;
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setCityActiveIndex(prev => (prev + 1 >= filteredCities.length ? 0 : prev + 1));
      break;
    case 'ArrowUp':
      e.preventDefault();
      setCityActiveIndex(prev => (prev - 1 < 0 ? filteredCities.length - 1 : prev - 1));
      break;
    case 'Enter':
      if (cityActiveIndex >= 0) {
        const selected = filteredCities[cityActiveIndex];
        setCity(selected);
        setTown('');
        setCityOpen(false);
        townInputRef.current?.focus();
      }
      break;
    case 'Escape':
      setCityOpen(false);
      setCityActiveIndex(-1);
      break;
    case 'Tab':
      setCityOpen(false);
      break;
  }
};

  // Handle keyboard navigation for Town
  const handleTownKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!townOpen || filteredTowns.length === 0) {
      if (e.key === 'ArrowDown') setTownOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setTownActiveIndex(prev => (prev + 1 >= filteredTowns.length ? 0 : prev + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setTownActiveIndex(prev => (prev - 1 < 0 ? filteredTowns.length - 1 : prev - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (townActiveIndex >= 0) {
          const selected = filteredTowns[townActiveIndex];
          setTown(selected);
          setTownOpen(false);
        }
        break;
      case 'Escape':
        setTownOpen(false);
        setTownActiveIndex(-1);
        break;
    }
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-full sm:rounded-xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-slate-900 placeholder:text-slate-400 transition-colors";
  const dropdownClass = "absolute w-full mt-1.5 bg-white border border-slate-100 rounded-xl max-h-60 overflow-y-auto p-1 shadow-xl animate-in fade-in zoom-in-95 duration-200";

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      
      {/* CITY INPUT */}
      <div className="flex-1 relative z-50" ref={cityRef}>
        <input 
          ref={cityInputRef}
          type="text"
          name="city" 
          value={city}
          onChange={(e) => { 
            setCity(e.target.value); 
            setTown(''); 
            setCityOpen(true); 
            setCityActiveIndex(-1); // Reset active index on type
          }}
          onFocus={() => setCityOpen(true)}
          onKeyDown={handleCityKeyDown}
          placeholder="City (ဥပမာ - ရန်ကုန်)"
          autoComplete="off"
          className={inputClass}
          // Accessibility
          role="combobox"
          aria-expanded={cityOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="city-listbox"
          aria-activedescendant={cityActiveIndex >= 0 ? `city-option-${cityActiveIndex}` : undefined}
        />
        {/* Custom Dropdown */}
        {cityOpen && filteredCities.length > 0 && (
          <div className={`${dropdownClass}`} id="city-listbox" role="listbox">
            {filteredCities.map((c, index) => (
              <div 
                key={c} 
                id={`city-option-${index}`}
                role="option"
                aria-selected={index === cityActiveIndex || c === city}
                // onMouseDown with preventDefault is correct for pre-blur selection
                onMouseDown={(e) => { 
                  e.preventDefault(); 
                  setCity(c); 
                  setTown(''); 
                  setCityOpen(false); 
                  townInputRef.current?.focus(); // Helper UX
                }}
                onMouseEnter={() => setCityActiveIndex(index)} // Visual sync
                className={`px-4 py-2.5 text-sm cursor-pointer rounded-lg transition-colors text-slate-700 font-medium 
                  ${index === cityActiveIndex ? 'bg-teal-50 text-teal-900' : ''}
                  ${c === city ? 'bg-slate-100' : ''}
                `}
              >
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOWNSHIP INPUT */}
      <div className="flex-1 relative z-40" ref={townRef}>
        <input 
          ref={townInputRef}
          type="text"
          name="township"
          value={town}
          onChange={(e) => { 
            setTown(e.target.value); 
            setTownOpen(true); 
            setTownActiveIndex(-1); // Reset active index on type
          }}
          onFocus={() => { if(city) setTownOpen(true); }}
          onKeyDown={handleTownKeyDown}
          disabled={!city}
          placeholder="Township (ဥပမာ - စမ်းချောင်း)"
          autoComplete="off"
          className={`${inputClass} ${!city ? 'bg-slate-50 opacity-60 cursor-not-allowed' : ''}`}
          // Accessibility
          role="combobox"
          aria-expanded={townOpen && !!city}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="town-listbox"
          aria-activedescendant={townActiveIndex >= 0 ? `town-option-${townActiveIndex}` : undefined}
        />
        {/* Custom Dropdown */}
        {townOpen && city && filteredTowns.length > 0 && (
          <div className={`${dropdownClass}`} id="town-listbox" role="listbox">
            {filteredTowns.map((t, index) => (
              <div 
                key={t} 
                id={`town-option-${index}`}
                role="option"
                aria-selected={index === townActiveIndex || t === town}
                onMouseDown={(e) => { 
                  e.preventDefault(); 
                  setTown(t); 
                  setTownOpen(false); 
                }}
                onMouseEnter={() => setTownActiveIndex(index)} // Visual sync
                className={`px-4 py-2.5 text-sm cursor-pointer rounded-lg transition-colors text-slate-700 font-medium 
                  ${index === townActiveIndex ? 'bg-teal-50 text-teal-900' : ''}
                  ${t === town ? 'bg-slate-100' : ''}
                `}
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