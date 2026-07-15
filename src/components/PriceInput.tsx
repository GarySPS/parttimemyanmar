// src/components/PriceInput.tsx
'use client';

export default function PriceInput() {
  return (
    <input 
      type="number" 
      id="price" 
      name="price" 
      required 
      min="0"
      placeholder="e.g., 15000" 
      onWheel={(e) => (e.target as HTMLInputElement).blur()}
      className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400 shadow-sm"
    />
  );
}