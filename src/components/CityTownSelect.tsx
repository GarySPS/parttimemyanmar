//src/components/CityTownSelect.tsx

'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

export default function CityTownSelect({ 
  defaultCity = '', 
  defaultTown = '',
  locationMap = {},
  t
}: { 
  defaultCity?: string; 
  defaultTown?: string;
  locationMap?: Record<string, string[]>;
  t?: any;
}) {
  const [city, setCity] = useState(defaultCity);
  const [town, setTown] = useState(defaultTown);
  
  const [cityOpen, setCityOpen] = useState(false);
  const [townOpen, setTownOpen] = useState(false);
  
  const [cityActiveIndex, setCityActiveIndex] = useState(-1);
  const [townActiveIndex, setTownActiveIndex] = useState(-1);

  const cityRef = useRef<HTMLDivElement>(null);
  const townRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const townInputRef = useRef<HTMLInputElement>(null);

  // USE THE DATABASE DATA INSTEAD OF HARDCODED
  const availableCities = Object.keys(locationMap);
  const filteredCities = city.trim() === '' 
    ? availableCities.slice(0, 8) 
    : availableCities.filter(c => c.toLowerCase().includes(city.toLowerCase())).slice(0, 8);

  const availableTowns = locationMap[city] || [];
  const filteredTowns = town.trim() === ''
    ? availableTowns.slice(0, 8)
    : availableTowns.filter(t => t.toLowerCase().includes(town.toLowerCase())).slice(0, 8);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) setCityOpen(false);
      if (townRef.current && !townRef.current.contains(event.target as Node)) setTownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. STRICT VALIDATION ON BLUR
  // If user types "ရန်" and clicks away, it clears the input because it's incomplete.
  const handleCityBlur = () => {
    setTimeout(() => { // Timeout allows the dropdown click to register first
      if (city && !availableCities.includes(city)) {
        setCity('');
        setTown('');
      }
    }, 150);
  };

  const handleTownBlur = () => {
    setTimeout(() => {
      if (town && !availableTowns.includes(town)) {
        setTown('');
      }
    }, 150);
  };

  const handleCityKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.preventDefault();
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
          setCity(filteredCities[cityActiveIndex]);
          setTown('');
          setCityOpen(false);
          townInputRef.current?.focus();
        }
        break;
      case 'Escape':
      case 'Tab':
        setCityOpen(false);
        break;
    }
  };

  const handleTownKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.preventDefault();
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
        if (townActiveIndex >= 0) {
          setTown(filteredTowns[townActiveIndex]);
          setTownOpen(false);
        }
        break;
      case 'Escape':
      case 'Tab':
        setTownOpen(false);
        break;
    }
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-full sm:rounded-xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-slate-900 placeholder:text-slate-400 transition-colors";
  const dropdownClass = "absolute w-full mt-1.5 bg-white border border-slate-100 rounded-xl max-h-60 overflow-y-auto p-1 shadow-xl animate-in fade-in zoom-in-95 duration-200";

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
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
            setCityActiveIndex(-1);
          }}
          onFocus={() => setCityOpen(true)}
          onBlur={handleCityBlur}
          onKeyDown={handleCityKeyDown}
          placeholder={t?.cityPlaceholder || "City (ဥပမာ - ရန်ကုန်)"}
          autoComplete="off"
          className={inputClass}
          role="combobox"
          aria-expanded={cityOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {cityOpen && filteredCities.length > 0 && (
          <div className={dropdownClass} role="listbox">
            {filteredCities.map((c, index) => (
              <div 
                key={c} 
                role="option"
                aria-selected={index === cityActiveIndex || c === city}
                onMouseDown={(e) => { 
                  e.preventDefault(); 
                  setCity(c); 
                  setTown(''); 
                  setCityOpen(false); 
                  townInputRef.current?.focus(); 
                }}
                onMouseEnter={() => setCityActiveIndex(index)}
                className={`px-4 py-2.5 text-sm cursor-pointer rounded-lg transition-colors text-slate-700 font-medium ${index === cityActiveIndex ? 'bg-teal-50 text-teal-900' : ''} ${c === city ? 'bg-slate-100' : ''}`}
              >
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 relative z-40" ref={townRef}>
        <input 
          ref={townInputRef}
          type="text"
          name="township"
          value={town}
          onChange={(e) => { 
            setTown(e.target.value); 
            setTownOpen(true); 
            setTownActiveIndex(-1);
          }}
          onFocus={() => { if(city) setTownOpen(true); }}
          onBlur={handleTownBlur}
          onKeyDown={handleTownKeyDown}
          disabled={!city}
          placeholder={t?.townPlaceholder || "Township (ဥပမာ - စမ်းချောင်း)"}
          autoComplete="off"
          className={`${inputClass} ${!city ? 'bg-slate-50 opacity-60 cursor-not-allowed' : ''}`}
          role="combobox"
          aria-expanded={townOpen && !!city}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {townOpen && city && filteredTowns.length > 0 && (
          <div className={dropdownClass} role="listbox">
            {filteredTowns.map((t, index) => (
              <div 
                key={t} 
                role="option"
                aria-selected={index === townActiveIndex || t === town}
                onMouseDown={(e) => { 
                  e.preventDefault(); 
                  setTown(t); 
                  setTownOpen(false); 
                }}
                onMouseEnter={() => setTownActiveIndex(index)}
                className={`px-4 py-2.5 text-sm cursor-pointer rounded-lg transition-colors text-slate-700 font-medium ${index === townActiveIndex ? 'bg-teal-50 text-teal-900' : ''} ${t === town ? 'bg-slate-100' : ''}`}
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