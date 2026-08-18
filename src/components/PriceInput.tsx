// src/components/PriceInput.tsx
'use client';
import { useState } from 'react';

export default function PriceInput({ tNegotiable }: { tNegotiable: string }) {
  const [isNegotiable, setIsNegotiable] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <input 
        type="number" 
        id="price" 
        name="price" 
        required={!isNegotiable}
        disabled={isNegotiable}
        min="0"
        placeholder={isNegotiable ? tNegotiable : "e.g., 15000"} 
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
        className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <label className="flex items-center gap-2 cursor-pointer w-max">
        <input 
          type="checkbox" 
          name="is_negotiable" 
          checked={isNegotiable}
          onChange={(e) => setIsNegotiable(e.target.checked)}
          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
        />
        <span className="text-sm font-bold text-gray-600">{tNegotiable}</span>
      </label>
    </div>
  );
}