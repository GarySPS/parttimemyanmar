//src>app/profile/SeekerProfile.tsx

'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { createClient } from '../utils/supabase/client';
import CityTownSelect from '../../components/CityTownSelect';
import ProfileHeader from '../../components/ProfileHeader';
import KYCModal from '../../components/KYCModal';
import imageCompression from 'browser-image-compression';
import CustomSelect from '../../components/CustomSelect';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function SeekerProfile({ 
  profile, locationMap, saveProfile, submitKyc, t, tHome, tCityTown, lang 
}: any) {
  const supabase = createClient();
  
  // UI States
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Image States
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null);
  const [coverPreview, setCoverPreview] = useState(profile?.cover_url || null);

  // Basic Info States (NEW)
  const [bio, setBio] = useState(profile?.bio || '');
  const [contactApp, setContactApp] = useState(profile?.contact_app || '');
  const [contactUsername, setContactUsername] = useState(profile?.contact_username || '');

  // Resume State
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  // Skills State
  const [skills, setSkills] = useState<string[]>(
    profile?.skills?.length ? profile.skills : []
  );
  const [newSkill, setNewSkill] = useState('');

  // Experience State
  const [experiences, setExperiences] = useState<any[]>(
    profile?.experience?.length ? profile.experience : []
  );
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [newExp, setNewExp] = useState({ title: '', company: '', startDate: '', endDate: '', description: '' });

  const saveNewExperience = () => {
    if (newExp.title.trim() && newExp.company.trim()) {
      setExperiences([...experiences, newExp]);
      setNewExp({ title: '', company: '', startDate: '', endDate: '', description: '' });
      setIsAddingExp(false);
    }
  };

  const removeExperience = (indexToRemove: number) => {
    setExperiences(experiences.filter((_, idx) => idx !== indexToRemove));
  };

  // Education State
  const [educations, setEducations] = useState<any[]>(
    profile?.education?.length ? profile.education : []
  );
  const [isAddingEdu, setIsAddingEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ school: '', degree: '', startDate: '', endDate: '', description: '' });

  const saveNewEducation = () => {
    if (newEdu.school.trim() && newEdu.degree.trim()) {
      setEducations([...educations, newEdu]);
      setNewEdu({ school: '', degree: '', startDate: '', endDate: '', description: '' });
      setIsAddingEdu(false);
    }
  };

  const removeEducation = (indexToRemove: number) => {
    setEducations(educations.filter((_, idx) => idx !== indexToRemove));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Handlers
  const handleResumeChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) setResumeFileName(file.name);
  };

  const handleAvatarChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(profile?.avatar_url || null);
    setCoverPreview(profile?.cover_url || null);
    setSkills(profile?.skills?.length ? profile.skills : []);
    setExperiences(profile?.experience?.length ? profile.experience : []);
    setEducations(profile?.education?.length ? profile.education : []);
    setBio(profile?.bio || '');
    setIsAddingExp(false);
    setIsAddingEdu(false);
    setContactApp(profile?.contact_app || '');
    setContactUsername(profile?.contact_username || '');
    setResumeFileName(null);
  };

  async function handleSubmit(formData: FormData) {
    if (!isEditing) return; 

    setIsSaving(true);
    
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };

      const avatarFile = formData.get('avatar') as File;
      if (avatarFile && avatarFile.size > 0) {
        const compressedAvatar = await imageCompression(avatarFile, options);
        formData.set('avatar', compressedAvatar, compressedAvatar.name);
      }

      const coverFile = formData.get('cover') as File;
      if (coverFile && coverFile.size > 0) {
        const compressedCover = await imageCompression(coverFile, options);
        formData.set('cover', compressedCover, compressedCover.name);
      }

      // Add new fields to formData
      formData.append('bio', bio);
      formData.append('contact_app', contactApp);
      formData.append('contact_username', contactUsername);
      formData.append('skills', JSON.stringify(skills));
      formData.append('experience', JSON.stringify(experiences));
      formData.append('education', JSON.stringify(educations)); // Append education array

      await saveProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile Save Error:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  const displayCategory = profile?.category ? (tHome.cats[profile.category] || profile.category) : t.notSpecified;
  const displayLocation = (profile?.township && profile?.city) ? `${profile.township}, ${profile.city}` : t.locationNotSet;
  const hasLocation = profile?.township && profile?.city;

  const contactAppOptions = [
    { value: 'Viber', label: 'Viber' },
    { value: 'Telegram', label: 'Telegram' },
    { value: 'Phone', label: t.apps?.phone || 'Phone' },
    { value: 'Facebook', label: t.apps?.facebook || 'Facebook' },
    { value: 'Email', label: 'Email' }
  ];
  const categoryOptions = Object.entries(tHome.cats).map(([val, label]) => ({
    value: val,
    label: label as string
  }));
  
  return (
    <div className="relative w-full min-h-screen bg-[#F4F6F8] text-gray-900 font-sans">
      <form
        action={handleSubmit}
        onSubmit={(e) => {
          if (!isEditing) e.preventDefault();
        }}
        className="w-full max-w-4xl mx-auto flex flex-col pb-16 md:py-8 md:gap-6"
      >
        {/* Top Profile Section */}
        <motion.section 
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
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
            onOpenKyc={() => setIsKycModalOpen(true)}
          />
        </motion.section>

        {/* 2-Column Layout for Desktop */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-4 md:mt-0 px-0 md:px-0">
          
          {/* Left Column: Contact, Details & Skills */}
          <div className="w-full md:w-1/3 flex flex-col gap-4 md:gap-6">
            
            {/* Contact & Info Section */}
            <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="bg-white p-5 md:rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Personal Info
              </h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="relative z-50">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Contact App</label>
                    <CustomSelect 
                      name="contact_app"
                      options={contactAppOptions}
                      defaultValue={contactApp}
                      onChange={(val: string) => setContactApp(val)}
                      placeholder="Select App"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Username / Number</label>
                    <input type="text" value={contactUsername} onChange={(e) => setContactUsername(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="Username or phone number" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.category}</label>
                    <select name="category" defaultValue={profile?.category || ''} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                      <option value="">{t.selectCategory}</option>
                      {Object.entries(tHome.cats).map(([val, label]) => (
                        <option key={val} value={val}>{label as string}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.cityTownship}</label>
                    <CityTownSelect locationMap={locationMap} defaultCity={profile?.city || ''} defaultTown={profile?.township || ''} t={tCityTown} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <span>{contactApp && contactUsername ? `${contactApp}: ${contactUsername}` : 'No contact provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="capitalize">{displayCategory}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="capitalize">{hasLocation ? displayLocation : t.locationNotSet}</span>
                  </div>
                </div>
              )}
            </motion.section>

            {/* Skills Section */}
            <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="bg-white p-5 md:rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                {t.skills || 'Skills'}
              </h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      placeholder="e.g. Figma, React, Customer Service" 
                      className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={addSkill} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all">Add</button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skills.length === 0 && (
  <p className="text-sm text-gray-400 italic">{t.noSkills || 'No skills added yet.'}</p>
)}
                    {skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                        <span>{skill}</span>
                        <button type="button" onClick={() => removeSkill(skill)} className="w-4 h-4 ml-1 rounded-full hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">{skill}</span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">{t.noSkills || 'No skills added yet.'}</p>
                  )}
                </div>
              )}
            </motion.section>

          </div>

          {/* Right Column: Bio, Experience, CV */}
          <div className="w-full md:w-2/3 flex flex-col gap-4 md:gap-6">
            
            {/* About Me / Bio */}
            <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="bg-white p-5 md:p-6 md:rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-900">{t.aboutMe}</h2>
              {isEditing ? (
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t.aboutMePlaceholder}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {bio || t.noBio}
                </p>
              )}
            </motion.section>

            {/* Work Experience */}
            <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="bg-white p-5 md:p-6 md:rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{t.workExperience}</h2>
                {isEditing && !isAddingExp && (
                  <button type="button" onClick={() => setIsAddingExp(true)} className="text-blue-600 text-sm font-semibold hover:underline">
                    + {t.addExperience}
                  </button>
                )}
              </div>
              
              {isAddingExp && isEditing && (
                <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.jobTitle} *</label>
                    <input type="text" value={newExp.title} onChange={(e) => setNewExp({...newExp, title: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.companyName} *</label>
                    <input type="text" value={newExp.company} onChange={(e) => setNewExp({...newExp, company: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.startDate}</label>
                      <input type="month" value={newExp.startDate} onChange={(e) => setNewExp({...newExp, startDate: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div className="w-1/2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.endDate}</label>
                      <input type="month" value={newExp.endDate} onChange={(e) => setNewExp({...newExp, endDate: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.description}</label>
                    <textarea value={newExp.description} onChange={(e) => setNewExp({...newExp, description: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm min-h-[80px] focus:ring-2 focus:ring-blue-500" placeholder={t.descPlaceholder} />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsAddingExp(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg">{t.cancelBtn}</button>
                    <button type="button" onClick={saveNewExperience} disabled={!newExp.title || !newExp.company} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">{t.saveJob}</button>
                  </div>
                </div>
              )}

              {experiences.length > 0 ? (
                <div className="space-y-6 border-l-2 border-gray-200 ml-3 pl-5">
                  {experiences.map((exp, idx) => (
                    <div key={idx} className="relative group">
                      <span className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></span>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900">{exp.title}</h3>
                          <p className="text-sm text-blue-600 font-medium">{exp.company}</p>
                          <p className="text-xs text-gray-500 mt-1">{exp.startDate || t.unknown} - {exp.endDate || t.present}</p>
                        </div>
                        {isEditing && (
                          <button type="button" onClick={() => removeExperience(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                      {exp.description && <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                !isAddingExp && (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500 mb-2">{t.buildTimeline}</p>
                    {isEditing && (
                      <button type="button" onClick={() => setIsAddingExp(true)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        {t.addFirstJob}
                      </button>
                    )}
                  </div>
                )
              )}
            </motion.section>

            {/* Education Section */}
            <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="bg-white p-5 md:p-6 md:rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{t.education}</h2>
                {isEditing && !isAddingEdu && (
                  <button type="button" onClick={() => setIsAddingEdu(true)} className="text-blue-600 text-sm font-semibold hover:underline">
                    + {t.addEducation}
                  </button>
                )}
              </div>
              
              {isAddingEdu && isEditing && (
                <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.school} *</label>
                    <input type="text" value={newEdu.school} onChange={(e) => setNewEdu({...newEdu, school: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.degree} *</label>
                    <input type="text" value={newEdu.degree} onChange={(e) => setNewEdu({...newEdu, degree: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.startDate}</label>
                      <input type="month" value={newEdu.startDate} onChange={(e) => setNewEdu({...newEdu, startDate: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div className="w-1/2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.endDateExp}</label>
                      <input type="month" value={newEdu.endDate} onChange={(e) => setNewEdu({...newEdu, endDate: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.description}</label>
                    <textarea value={newEdu.description} onChange={(e) => setNewEdu({...newEdu, description: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm min-h-[80px] focus:ring-2 focus:ring-blue-500" placeholder={t.eduDescPlaceholder} />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsAddingEdu(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg">{t.cancelBtn}</button>
                    <button type="button" onClick={saveNewEducation} disabled={!newEdu.school || !newEdu.degree} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">{t.saveEducation}</button>
                  </div>
                </div>
              )}

              {educations.length > 0 ? (
                <div className="space-y-6 border-l-2 border-gray-200 ml-3 pl-5">
                  {educations.map((edu, idx) => (
                    <div key={idx} className="relative group">
                      <span className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></span>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900">{edu.school}</h3>
                          <p className="text-sm text-blue-600 font-medium">{edu.degree}</p>
                          <p className="text-xs text-gray-500 mt-1">{edu.startDate || t.unknown} - {edu.endDate || t.present}</p>
                        </div>
                        {isEditing && (
                          <button type="button" onClick={() => removeEducation(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                      {edu.description && <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                !isAddingEdu && (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500 mb-2">{t.buildEdu}</p>
                    {isEditing && (
                      <button type="button" onClick={() => setIsAddingEdu(true)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        {t.addFirstEdu}
                      </button>
                    )}
                  </div>
                )
              )}
            </motion.section>

            {/* CV/Resume Section */}
            <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="bg-white p-5 md:p-6 md:rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-900">{t.cvResume}</h2>
              {isEditing ? (
                <div className="w-full p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center relative hover:border-blue-400 transition-colors">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-sm font-semibold text-gray-800 mb-1">{resumeFileName ? resumeFileName : t.uploadCv}</span>
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
                      <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto text-center bg-gray-200 text-gray-900 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all">
                        {t.viewCv}
                      </a>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 font-medium w-full text-center py-2">{t.noCv}</p>
                  )}
                </div>
              )}
            </motion.section>

          </div>
        </div>
      </form>

      {/* KYC Modal Component */}
      <KYCModal 
        isOpen={isKycModalOpen} 
        onClose={() => setIsKycModalOpen(false)} 
        profile={profile} 
        submitKyc={submitKyc}
        lang={lang}
      />
    </div>
  );
}