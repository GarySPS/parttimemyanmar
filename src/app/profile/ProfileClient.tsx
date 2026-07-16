// src/app/profile/ProfileClient.tsx
'use client';

import { useState } from 'react';
import CityTownSelect from '../../components/CityTownSelect';

const CATEGORY_MAP: Record<string, string> = {
  'delivery': 'Delivery & Logistics',
  'manual': 'Manual Labor & Cleaning',
  'tech': 'Tech & Digital',
  'events': 'Events & Hospitality',
  'education': 'Education & Tutoring',
  'admin': 'Admin & Office',
  'retail': 'Retail & Sales',
  'other': 'Other'
};

export default function ProfileClient({ profile, locationMap, saveProfile }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

// Previews for instant UI updates when selecting photos
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null);
  const [coverPreview, setCoverPreview] = useState(profile?.cover_url || null);
  
  // Dynamic Platforms State (List of Links)
  const [platforms, setPlatforms] = useState<any[]>(
    profile?.platforms?.length ? profile.platforms : []
  );

  // Dependent location dropdowns
  const [selectedCity, setSelectedCity] = useState(profile?.city || '');
  const [selectedTownship, setSelectedTownship] = useState(profile?.township || '');

  const availableCities = Object.keys(locationMap);
  const availableTownships = selectedCity ? locationMap[selectedCity] : [];

  const handleAvatarChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  // Dynamic Array Handlers
  const addPlatform = () => {
    setPlatforms([...platforms, { id: Date.now(), url: '', screenshot_url: null, preview: null }]);
  };

  const removePlatform = (index: number) => {
    setPlatforms(platforms.filter((_, i) => i !== index));
  };

  const handlePlatformScreenshot = (e: any, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newPlatforms = [...platforms];
      newPlatforms[index].preview = URL.createObjectURL(file);
      setPlatforms(newPlatforms);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(profile?.avatar_url || null);
    setCoverPreview(profile?.cover_url || null);
    setPlatforms(profile?.platforms?.length ? profile.platforms : []);
    setSelectedCity(profile?.city || '');
    setSelectedTownship(profile?.township || '');
  };
  
  async function handleSubmit(formData: FormData) {
  if (!isEditing) return; // 🚨 prevent auto submit

  setIsSaving(true);
  await saveProfile(formData);
  setIsSaving(false);
  setIsEditing(false);
}

  const displayCategory = profile?.category ? (CATEGORY_MAP[profile.category] || profile.category) : 'Not specified';
  const displayLocation = (profile?.township && profile?.city) ? `${profile.township}, ${profile.city}` : 'Location not set';
  const displayName = profile?.contact_username || 'Anonymous User';
  const displayBio = profile?.bio || 'No bio provided yet. Update your profile to tell others about yourself.';

  return (
    <form
  action={handleSubmit}
  onSubmit={(e) => {
    if (!isEditing) e.preventDefault();
  }}
  className="w-full"
>
      {/* Top Profile Section */}
      <section className="bg-white shadow-sm border-b border-slate-200 pb-5">
        
        {/* Cover Photo Area */}
        <div className="w-full h-48 bg-slate-200 relative group">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">Cover Photo Space</div>
          )}
          
          {isEditing && (
            <label className="absolute bottom-3 right-3 bg-slate-900/70 p-2.5 rounded-full cursor-pointer text-white hover:bg-slate-900 transition-colors shadow-lg z-10">
              <input type="file" name="cover" className="hidden" accept="image/*" onChange={handleCoverChange} />
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
          )}
        </div>

        <div className="px-4 md:px-8 max-w-3xl mx-auto relative">
          
          {/* Profile Photo (Avatar) */}
          <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 -mt-16 relative shadow-sm flex items-center justify-center z-10 group">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <svg className="w-16 h-16 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
            
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-slate-200 p-2 rounded-full cursor-pointer text-slate-700 hover:bg-slate-300 border-2 border-white shadow-sm">
                <input type="file" name="avatar" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </label>
            )}
          </div>

          {/* Name & Bio Area */}
          <div className="mt-3">
            {isEditing ? (
              <div className="space-y-3">
                <input 
                  type="text" 
                  name="contact_username" 
                  defaultValue={profile?.contact_username || ''} 
                  placeholder="Your Name" 
                  className="w-full text-2xl font-extrabold text-slate-900 border-b-2 border-teal-500 focus:outline-none focus:border-teal-700 bg-transparent pb-1 placeholder-slate-400" 
                  required 
                />
                <textarea 
                  name="bio" 
                  defaultValue={profile?.bio || ''} 
                  placeholder="Write a short bio..." 
                  rows={3} 
                  className="w-full text-[0.95rem] text-slate-700 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" 
                />
              </div>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{displayName}</h1>
                <p className="text-[0.95rem] text-slate-600 font-medium mt-1 leading-snug max-w-md">{displayBio}</p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex gap-2.5 w-full">
            {isEditing ? (
              <>
                <button type="submit" disabled={isSaving} className="flex-1 bg-teal-900 text-white py-2 rounded-lg text-sm font-bold shadow-md hover:bg-teal-800 transition-colors disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={handleCancel} disabled={isSaving} className="flex-1 bg-rose-50 text-rose-700 py-2 rounded-lg text-sm font-bold shadow-sm border border-rose-200 hover:bg-rose-100 transition-colors">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    setIsEditing(true); 
                  }} 
                  className="flex-1 bg-teal-900 text-white py-2 rounded-lg text-sm font-bold shadow-md hover:bg-teal-800 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Profile
                </button>
                <button type="button" className="flex-1 bg-slate-100 text-slate-800 py-2 rounded-lg text-sm font-bold shadow-sm border border-slate-200 hover:bg-slate-200 transition-colors">
                  Share Profile
                </button>
              </>
            )}
          </div>

        </div>
      </section>

      {/* Details & Info Section */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 mt-4 space-y-4">
        
        {/* Dynamic Details Card */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Details</h2>
          
          {isEditing ? (
            <div className="space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Category</label>
                <select name="category" defaultValue={profile?.category || ''} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-700">
                  <option value="">Select a category</option>
                  {Object.entries(CATEGORY_MAP).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              
              {/* Custom Location Component */}
              <div className="flex flex-col gap-2 relative z-20">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">City & Township</label>
                <CityTownSelect 
                  locationMap={locationMap} 
                  defaultCity={profile?.city || ''} 
                  defaultTown={profile?.township || ''} 
                />
              </div>

            </div>
          ) : (
            <div className="space-y-4 text-[0.95rem] text-slate-700">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Category: <span className="font-semibold text-slate-900 capitalize">{displayCategory}</span></span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>Location: <span className="font-semibold text-slate-900">{displayLocation}</span></span>
              </div>
            </div>
          )}
        </section>
{/* Dynamic Platforms Section */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">Linked Platforms</h2>
            {isEditing && (
              <button type="button" onClick={addPlatform} className="text-xs font-bold bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors">
                + Add Platform
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-6">
              <input type="hidden" name="platform_count" value={platforms.length} />
              
              {platforms.length === 0 && (
                <p className="text-sm text-slate-500 italic text-center py-4 border-2 border-dashed border-slate-100 rounded-xl">Click "+ Add Platform" to add your first link.</p>
              )}

              {platforms.map((p, index) => (
                <div key={p.id || index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                  <button type="button" onClick={() => removePlatform(index)} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-rose-200 text-rose-500 rounded-full flex items-center justify-center shadow-sm hover:bg-rose-50 hover:text-rose-600 transition-colors z-10">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  <input type="hidden" name={`platform_existing_screenshot_${index}`} value={p.screenshot_url || ''} />
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Link URL</label>
                      <input type="text" name={`platform_url_${index}`} defaultValue={p.url || ''} placeholder="www.youtube.com or t.me/yourchannel" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-700" required />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Platform Screenshot</label>
                      <div className="relative w-full h-32 bg-white rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden hover:border-teal-400 transition-colors cursor-pointer">
                        {(p.preview || p.screenshot_url) ? (
                          <img src={p.preview || p.screenshot_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-2">
                            <svg className="w-6 h-6 text-slate-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-slate-500 text-xs font-medium">Upload Screenshot</span>
                          </div>
                        )}
                        <input type="file" name={`platform_screenshot_${index}`} accept="image/*" onChange={(e) => handlePlatformScreenshot(e, index)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {platforms.length > 0 ? platforms.map((p, index) => (
                <a key={index} href={p.url?.startsWith('http') ? p.url : `https://${p.url}`} target="_blank" rel="noopener noreferrer" className="block relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group border border-slate-200">
                  {p.screenshot_url ? (
                    <img src={p.screenshot_url} alt="Platform" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400 font-medium text-sm">No Screenshot</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-full p-4 flex items-center justify-between">
                    <div className="overflow-hidden pr-2">
                      <p className="text-white font-bold text-sm flex items-center gap-2 drop-shadow-md truncate">
                        <svg className="w-4 h-4 text-teal-600 bg-white rounded-full p-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        Visit Page
                      </p>
                      <p className="text-slate-200 text-[10px] mt-0.5 truncate w-full">{p.url.replace(/^https?:\/\//, '')}</p>
                    </div>
                    <div className="w-8 h-8 shrink-0 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-teal-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </a>
              )) : (
                <div className="col-span-full py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-500 font-medium">No platforms linked yet.</p>
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </form>
  );
}