// src/app/profile/ProfileClient.tsx

'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import CityTownSelect from '../../components/CityTownSelect';
import ProfileHeader from '../../components/ProfileHeader';

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

export default function ProfileClient({ 
  profile, locationMap, saveProfile, initialPosts = [], isEmployer, t, tHome, tCityTown 
}: any) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length === 5);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null);
  const [coverPreview, setCoverPreview] = useState(profile?.cover_url || null);
  
  const [platforms, setPlatforms] = useState<any[]>(
    profile?.platforms?.length ? profile.platforms : []
  );

  const [selectedCity, setSelectedCity] = useState(profile?.city || '');
  const [selectedTownship, setSelectedTownship] = useState(profile?.township || '');

  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  const handleResumeChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) setResumeFileName(file.name);
  };

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
  
  const loadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    
    // NOTE: You will map this to an API route later: fetch(`/api/posts?page=${nextPage}`)
    const newPosts: any[] = []; 
    
    if (newPosts.length < 5) setHasMore(false);
    setPosts([...posts, ...newPosts]);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  const deletePost = async (postId: string) => {
    if (!confirm(t.confirmDelete)) return;
    
    // Instantly removes the post from the screen
    setPosts(posts.filter((p: any) => p.id !== postId));
    
    // NOTE: You will map this to an API route later: fetch(`/api/posts/${postId}`, { method: 'DELETE' })
  };

  async function handleSubmit(formData: FormData) {
    if (!isEditing) return; 

    setIsSaving(true);
    await saveProfile(formData);
    setIsSaving(false);
    setIsEditing(false);
  }

const displayCategory = profile?.category ? (tHome.cats[profile.category] || profile.category) : t.notSpecified;
const displayLocation = (profile?.township && profile?.city) ? `${profile.township}, ${profile.city}` : t.locationNotSet;
  
  return (
    <div className="relative w-full min-h-screen bg-[#F0F2F5] text-gray-900">
      <form
        action={handleSubmit}
        onSubmit={(e) => {
          if (!isEditing) e.preventDefault();
        }}
        className="w-full max-w-4xl mx-auto flex flex-col pb-16"
      >
        {/* Top Profile Section (Full Bleed) */}
        <motion.section 
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white shadow-sm pb-4"
        >
          <ProfileHeader 
            profile={profile}
            isOwnProfile={true}
            isEditing={isEditing}
            isSaving={isSaving}
            avatarPreview={avatarPreview}
            coverPreview={coverPreview}
            onEdit={(e: any) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
            onCancel={handleCancel}
            onAvatarChange={handleAvatarChange}
            onCoverChange={handleCoverChange}
          />
        </motion.section>

        {/* Thick Divider */}
        <div className="w-full h-2 bg-[#F0F2F5]"></div>

        {/* Details Section (Flat White Container) */}
        <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="bg-white p-4 md:p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            {t.details}
          </h2>
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.category}</label>
                <select name="category" defaultValue={profile?.category || ''} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900">
                  <option value="">{t.selectCategory}</option>
                  {/* Loop through tHome.cats instead of CATEGORY_MAP */}
                  {Object.entries(tHome.cats).map(([val, label]) => (
                    <option key={val} value={val}>{label as string}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-2 relative z-20">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.cityTownship}</label>
                <CityTownSelect locationMap={locationMap} defaultCity={profile?.city || ''} defaultTown={profile?.township || ''} t={tCityTown} />
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-[0.95rem] text-gray-800">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>{t.category}: <span className="font-semibold text-gray-900 capitalize ml-1">{displayCategory}</span></span>
              </div>
              <div className="flex items-center gap-3">
                 <svg className="w-6 h-6 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Location: <span className="font-semibold text-gray-900 ml-1">{displayLocation}</span></span>
              </div>
            </div>
          )}
        </motion.section>

        {/* Thick Divider */}
        <div className="w-full h-2 bg-[#F0F2F5]"></div>

        {/* Conditional Bottom Section: Resume (Seeker) vs Platforms (Employer) */}
        <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="bg-white p-4 md:p-6 shadow-sm">
          
          {profile?.role === 'seeker' ? (
            // ================= SEEKER: CV/RESUME SECTION =================
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">{t.cvResume}</h2>
              </div>

              {isEditing ? (
                <div className="w-full p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center relative hover:border-blue-400 transition-colors">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-sm font-semibold text-gray-800 mb-1">
                    {resumeFileName ? resumeFileName : t.uploadCv}
                  </span>
                  <span className="text-xs text-gray-500">{t.clickDrag}</span>
                  <input type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {profile?.resume_url ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{t.resumeUploaded}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{t.availableToEmployers}</p>
                        </div>
                      </div>
                      <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto text-center bg-gray-200 text-gray-900 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-300 active:scale-[0.97] transition-all">
                        {t.viewCv}
                      </a>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 font-medium w-full text-center py-2">{t.noCv}</p>
                  )}
                </div>
              )}
            </>
          ) : (
            // ================= EMPLOYER: LINKED PLATFORMS =================
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">{t.linkedPlatforms}</h2>
                {isEditing && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={addPlatform} className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg">
                    {t.addBtn}
                  </motion.button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <input type="hidden" name="platform_count" value={platforms.length} />
                  
                  {platforms.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">{t.clickToAdd}</p>
                  )}

                  {platforms.map((p, index) => (
                    <div key={p.id || index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                      <button type="button" onClick={() => removePlatform(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm hover:bg-red-200 active:scale-90 transition-all z-10">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>

                      <input type="hidden" name={`platform_existing_screenshot_${index}`} value={p.screenshot_url || ''} />
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.linkUrl}</label>
                          <input type="text" name={`platform_url_${index}`} defaultValue={p.url || ''} placeholder="www.youtube.com" className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900" required />
                        </div>
                        
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.screenshot}</label>
                          <div className="relative w-full h-32 bg-white rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-colors cursor-pointer">
                            {(p.preview || p.screenshot_url) ? (
                              <img src={p.preview || p.screenshot_url} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-center p-2 text-gray-400">
                                <svg className="w-6 h-6 mx-auto mb-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{t.uploadText}</span>
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
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {platforms.length > 0 ? platforms.map((p, index) => (
                    <motion.a variants={fadeInUp} key={index} href={p.url?.startsWith('http') ? p.url : `https://${p.url}`} target="_blank" rel="noopener noreferrer" className="block relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 bg-gray-50 group">
                      {p.screenshot_url ? (
                        <img src={p.screenshot_url} alt="Platform" className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center text-gray-400 font-medium text-sm bg-gray-100">{t.noScreenshot}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>
                      <div className="absolute bottom-0 left-0 w-full p-4 flex items-center justify-between">
                        <div className="overflow-hidden pr-3">
                          <p className="text-white font-bold text-sm truncate">{t.visitPage}</p>
                          <p className="text-gray-300 text-xs mt-0.5 truncate w-full">{p.url.replace(/^https?:\/\//, '')}</p>
                        </div>
                        <div className="w-8 h-8 shrink-0 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                      </div>
                    </motion.a>
                  )) : (
                    <div className="col-span-full py-8 border border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
                      <p className="text-sm text-gray-500 font-medium">{t.noPlatforms}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </motion.section>

        {/* ================= NEW ACTIVITY / POSTS SECTION (EMPLOYERS ONLY) ================= */}
        {isEmployer && (
          <>
            {/* Thick Divider */}
            <div className="w-full h-2 bg-[#F0F2F5]"></div>
            
            <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="bg-white p-4 md:p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t.myPostedJobs}</h2>

              {posts.length === 0 ? (
                <div className="bg-gray-50 p-6 text-center rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 text-sm">{t.noActivity}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post: any) => (
                    <div key={post.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-gray-900">{post.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{post.category} • {post.township}, {post.city}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                          post.status === 'open' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {post.status === 'open' ? 'Open' : tHome.closed}
                        </span>
                        
                        <button 
                          type="button" 
                          onClick={() => deletePost(post.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg active:scale-90 transition-all"
                          title="Delete Post"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {hasMore && (
                    <button 
                      type="button"
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="w-full py-3 mt-4 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl active:scale-[0.98] disabled:active:scale-100 transition-all border border-gray-200"
                    >
                      {isLoadingMore ? t.loading : t.loadMore}
                    </button>
                  )}
                </div>
              )}
            </motion.section>
          </>
        )}
      </form>
    </div>
  );
}