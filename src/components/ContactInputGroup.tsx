// src/components/ContactInputGroup.tsx
'use client';

import { useState } from 'react';
import CustomSelect from './CustomSelect';

export default function ContactInputGroup({ 
  t, 
  profileApp, 
  profileUser, 
  options 
}: { 
  t: any;
  profileApp: string;
  profileUser: string;
  options: any[];
}) {
  const [app, setApp] = useState(profileApp || '');

  // Dynamic Placeholder Logic
  let placeholder = t.usernamePlaceholder; // Default
  if (app === 'Telegram') placeholder = 'e.g., @username';
  if (app === 'Viber' || app === 'Phone') placeholder = 'e.g., +95 9...';
  if (app === 'Facebook') placeholder = 'e.g., facebook.com/username';
  if (app === 'Email') placeholder = 'e.g., mail@example.com';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-0">
      <div className="flex flex-col gap-2">
        <label className="font-bold text-sm text-gray-800">{t.contactMethod} <span className="text-rose-500">*</span></label>
        <CustomSelect 
          name="contact_app"
          placeholder={t.contactPlaceholder}
          defaultValue={profileApp}
          options={options}
          onChange={(val) => setApp(val)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact_username" className="font-bold text-sm text-gray-800">{t.usernamePhone} <span className="text-rose-500">*</span></label>
        <input 
          type="text" 
          id="contact_username" 
          name="contact_username" 
          required 
          defaultValue={profileUser}
          placeholder={placeholder} 
          className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-gray-400 shadow-sm"
        />
      </div>
    </div>
  );
}