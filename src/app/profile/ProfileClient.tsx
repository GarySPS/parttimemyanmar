// src/app/profile/ProfileClient.tsx
'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
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

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function ProfileClient({ profile, locationMap, saveProfile }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null);
  const [coverPreview, setCoverPreview] = useState(profile?.cover_url || null);
  
  const [platforms, setPlatforms] = useState<any[]>(
    profile?.platforms?.length ? profile.platforms : []
  );

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
    if (!isEditing) return; 

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
    <div className="relative w-full min-h-screen overflow-hidden text-[#0f4c5c]">
      {/* Premium Glassmorphism Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/desk-plant-bg.jpg" 
          alt="Desk Background" 
          className="w-full h-full object-cover opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-[#fdfbf7]/70 backdrop-blur-2xl"></div>
      </div>

      <form
        action={handleSubmit}
        onSubmit={(e) => {
          if (!isEditing) e.preventDefault();
        }}
        className="relative z-10 w-full max-w-4xl mx-auto pt-6 pb-16 px-4 md:px-8 flex flex-col gap-6"
      >
        {/* Top Profile Section */}
        <motion.section 
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white/60 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden"
        >
          {/* Cover Photo Area */}
          <div className="w-full h-56 bg-[#a4c3d2]/30 relative group">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#0f4c5c]/50 font-medium tracking-wide">Cover Photo Space</div>
            )}
            
            {isEditing && (
              <motion.label whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="absolute bottom-4 right-4 bg-[#0f4c5c]/80 backdrop-blur-sm p-3 rounded-full cursor-pointer text-white hover:bg-[#0f4c5c] transition-colors shadow-lg z-10">
                <input type="file" name="cover" className="hidden" accept="image/*" onChange={handleCoverChange} />
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </motion.label>
            )}
          </div>

          <div className="px-6 md:px-10 pb-8 relative">
            {/* Profile Photo (Avatar) */}
            <div className="w-36 h-36 rounded-full border-[6px] border-[#fdfbf7] bg-white -mt-18 relative shadow-lg flex items-center justify-center z-10 group">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <svg className="w-16 h-16 text-[#a4c3d2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              
              {isEditing && (
                <motion.label whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute bottom-1 right-1 bg-[#e3b23c] p-2.5 rounded-full cursor-pointer text-white shadow-md border-2 border-white">
                  <input type="file" name="avatar" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </motion.label>
              )}
            </div>

            {/* Name & Bio Area */}
            <div className="mt-4">
              {isEditing ? (
                <div className="space-y-4">
                  <input 
                    type="text" 
                    name="contact_username" 
                    defaultValue={profile?.contact_username || ''} 
                    placeholder="Your Name" 
                    className="w-full text-3xl font-extrabold text-[#0f4c5c] border-b-2 border-[#e3b23c] focus:outline-none focus:border-[#0f4c5c] bg-transparent pb-1 placeholder-[#a4c3d2] transition-colors" 
                    required 
                  />
                  <textarea 
                    name="bio" 
                    defaultValue={profile?.bio || ''} 
                    placeholder="Write a short bio..." 
                    rows={3} 
                    className="w-full text-[1rem] text-[#0f4c5c]/80 p-4 bg-white/50 backdrop-blur-sm border border-[#a4c3d2]/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a4c3d2] resize-none" 
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{displayName}</h1>
                  <p className="text-[1rem] text-[#0f4c5c]/70 font-medium mt-2 leading-relaxed max-w-2xl">{displayBio}</p>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4 w-full md:w-auto">
              {isEditing ? (
                <>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSaving} className="flex-1 md:flex-none md:px-8 bg-[#0f4c5c] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#0f4c5c]/20 transition-all disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={handleCancel} disabled={isSaving} className="flex-1 md:flex-none md:px-8 bg-white text-[#0f4c5c] py-3 rounded-xl text-sm font-bold shadow-sm border border-[#a4c3d2]/40 hover:bg-[#fdfbf7] transition-all">
                    Cancel
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="button" 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }} 
                    className="flex-1 md:flex-none md:px-8 bg-[#0f4c5c] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#0f4c5c]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 text-[#e3b23c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" className="flex-1 md:flex-none md:px-8 bg-white/80 backdrop-blur-sm text-[#0f4c5c] py-3 rounded-xl text-sm font-bold shadow-sm border border-[#a4c3d2]/40 hover:bg-white transition-all">
                    Share Profile
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.section>

        {/* Dynamic Details Card */}
        <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="bg-white/60 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#e3b23c] rounded-full inline-block"></span>
            Details
          </h2>
          
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-[#0f4c5c]/60 uppercase tracking-wider mb-2 block">Category</label>
                <select name="category" defaultValue={profile?.category || ''} className="w-full p-4 bg-white/50 backdrop-blur-sm border border-[#a4c3d2]/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a4c3d2] text-sm font-medium text-[#0f4c5c]">
                  <option value="">Select a category</option>
                  {Object.entries(CATEGORY_MAP).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-2 relative z-20">
                <label className="text-xs font-bold text-[#0f4c5c]/60 uppercase tracking-wider mb-1 block">City & Township</label>
                <CityTownSelect locationMap={locationMap} defaultCity={profile?.city || ''} defaultTown={profile?.township || ''} />
              </div>
            </div>
          ) : (
            <div className="space-y-5 text-[1rem] text-[#0f4c5c]/80">
              <div className="flex items-center gap-4 bg-white/40 p-4 rounded-2xl border border-white/40">
                <div className="p-2 bg-[#a4c3d2]/20 rounded-xl text-[#0f4c5c]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>Category: <span className="font-bold text-[#0f4c5c] capitalize ml-1">{displayCategory}</span></span>
              </div>
              <div className="flex items-center gap-4 bg-white/40 p-4 rounded-2xl border border-white/40">
                 <div className="p-2 bg-[#a4c3d2]/20 rounded-xl text-[#0f4c5c]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <span>Location: <span className="font-bold text-[#0f4c5c] ml-1">{displayLocation}</span></span>
              </div>
            </div>
          )}
        </motion.section>

        {/* Dynamic Platforms Section */}
        <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="bg-white/60 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-6 bg-[#e3b23c] rounded-full inline-block"></span>
              Linked Platforms
            </h2>
            {isEditing && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={addPlatform} className="text-xs font-bold bg-[#0f4c5c] text-white px-4 py-2 rounded-xl shadow-md">
                + Add Platform
              </motion.button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-6">
              <input type="hidden" name="platform_count" value={platforms.length} />
              
              {platforms.length === 0 && (
                <p className="text-sm text-[#0f4c5c]/50 italic text-center py-6 border-2 border-dashed border-[#a4c3d2]/40 rounded-2xl">Click "+ Add Platform" to add your first link.</p>
              )}

              {platforms.map((p, index) => (
                <div key={p.id || index} className="p-5 bg-white/40 rounded-2xl border border-white/60 relative group shadow-sm">
                  <button type="button" onClick={() => removePlatform(index)} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-rose-100 text-rose-500 rounded-full flex items-center justify-center shadow-md hover:bg-rose-50 hover:text-rose-600 transition-colors z-10">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  <input type="hidden" name={`platform_existing_screenshot_${index}`} value={p.screenshot_url || ''} />
                  
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-[#0f4c5c]/60 uppercase tracking-wider mb-2 block">Link URL</label>
                      <input type="text" name={`platform_url_${index}`} defaultValue={p.url || ''} placeholder="www.youtube.com or t.me/yourchannel" className="w-full p-4 bg-white/60 border border-[#a4c3d2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a4c3d2] text-sm font-medium text-[#0f4c5c]" required />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-[#0f4c5c]/60 uppercase tracking-wider mb-2 block">Platform Screenshot</label>
                      <div className="relative w-full h-40 bg-white/30 rounded-xl border-2 border-dashed border-[#a4c3d2]/60 flex flex-col items-center justify-center overflow-hidden hover:border-[#0f4c5c]/40 transition-colors cursor-pointer">
                        {(p.preview || p.screenshot_url) ? (
                          <img src={p.preview || p.screenshot_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-2 text-[#0f4c5c]/60">
                            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-xs font-bold uppercase tracking-wider">Upload Screenshot</span>
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
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {platforms.length > 0 ? platforms.map((p, index) => (
                <motion.a variants={fadeInUp} key={index} href={p.url?.startsWith('http') ? p.url : `https://${p.url}`} target="_blank" rel="noopener noreferrer" className="block relative rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform hover:-translate-y-1 transition-all duration-300 group border border-white/60 bg-white/40">
                  {p.screenshot_url ? (
                    <img src={p.screenshot_url} alt="Platform" className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-44 flex items-center justify-center text-[#0f4c5c]/40 font-medium text-sm bg-[#a4c3d2]/10">No Screenshot</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f4c5c]/95 via-[#0f4c5c]/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-full p-5 flex items-center justify-between">
                    <div className="overflow-hidden pr-3">
                      <p className="text-white font-bold text-sm flex items-center gap-2 drop-shadow-md truncate">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e3b23c] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e3b23c]"></span>
                        </span>
                        Visit Page
                      </p>
                      <p className="text-[#a4c3d2] text-xs mt-1 truncate w-full font-medium">{p.url.replace(/^https?:\/\//, '')}</p>
                    </div>
                    <div className="w-10 h-10 shrink-0 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#e3b23c] group-hover:text-white transition-all shadow-sm">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </motion.a>
              )) : (
                <div className="col-span-full py-10 bg-white/30 border-2 border-dashed border-[#a4c3d2]/40 rounded-3xl flex flex-col items-center justify-center">
                  <p className="text-sm text-[#0f4c5c]/60 font-medium">No platforms linked yet.</p>
                </div>
              )}
            </motion.div>
          )}
        </motion.section>
      </form>
    </div>
  );
}