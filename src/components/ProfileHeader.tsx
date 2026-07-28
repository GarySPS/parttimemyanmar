// src/components/ProfileHeader.tsx

'use client';

import { motion } from 'framer-motion';
import FollowButton from './FollowButton';
import ReportModal from './ReportModal';
import { useState } from 'react';

export default function ProfileHeader({
  profile,
  isOwnProfile,
  followerCount = 0,
  isFollowing = false,
  isEditing = false,
  isSaving = false,
  avatarPreview,
  coverPreview,
  onEdit,
  onCancel,
  onAvatarChange,
  onCoverChange,
  onOpenKyc,
  t,
  tReport
}: any) {
  const displayName = profile?.contact_username || t?.anonymousUser || 'Anonymous User';
  const displayBio = profile?.bio || (isOwnProfile 
    ? (t?.noBioOwn || 'No bio provided yet.') 
    : (t?.noBioOther || 'This user has not provided a bio yet.'));

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/user/${profile.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName}${t?.profileOn || "'s Profile"}`,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white w-full">
      
      {/* 1. Full-Bleed Cover Photo Area */}
      <div className="w-full h-48 md:h-64 bg-[#e4e6eb] relative group">
        {isEditing && coverPreview ? (
          <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
        ) : profile?.cover_url ? (
          <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <img src="/images/default-cover.jpg" alt="Default Cover" className="w-full h-full object-cover" />
        )}
        
        {isEditing && (
          <motion.label whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm p-2.5 rounded-full cursor-pointer text-white hover:bg-black/80 transition-colors z-10 shadow-lg">
            <input type="file" name="cover" className="hidden" accept="image/*" onChange={onCoverChange} />
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </motion.label>
        )}
      </div>

      {/* Profile Info Section (Left Aligned) */}
      <div className="px-4 md:px-8 pb-6 relative">
        
        {/* 2. Overlapping Left-Aligned Avatar */}
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-[4px] border-white bg-white -mt-14 md:-mt-20 relative flex items-center justify-center z-10 group overflow-hidden shadow-sm">
          {isEditing && avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          ) : profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <img src="/images/default-avatar.png" alt="Default Avatar" className="w-full h-full rounded-full object-cover" />
          )}
          
          {isEditing && (
            <motion.label whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute bottom-1 right-1 bg-black/70 p-2 rounded-full cursor-pointer text-white border-2 border-white">
              <input type="file" name="avatar" className="hidden" accept="image/*" onChange={onAvatarChange} />
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </motion.label>
          )}
        </div>

        {/* 3. Name & Stats */}
        <div className="mt-3 text-left">
          {isEditing ? (
            <div className="space-y-4 mt-4">
              <input type="text" name="contact_username" defaultValue={profile?.contact_username || ''} placeholder={t?.namePlaceholder || "Your Name"} className="w-full text-2xl font-bold text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:border-[#0f4c5c] bg-transparent pb-1 transition-colors" required />
              <textarea name="bio" defaultValue={profile?.bio || ''} placeholder={t?.bioPlaceholder || "Write a short bio..."} rows={3} className="w-full text-[0.95rem] text-gray-700 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f4c5c] resize-none" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{displayName}</h1>
                {profile?.is_verified && (
                  <svg className={`w-6 h-6 mt-1 ${profile?.kyc_status === 'verified_business' ? 'text-[#e3b23c]' : 'text-blue-500'}`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                )}
              </div>
              
              {!isOwnProfile && (
                <p className="text-sm font-medium text-gray-600 mt-1">
                  <span className="font-bold text-gray-900">{followerCount}</span> {followerCount === 1 ? (t?.follower || 'follower') : (t?.followers || 'followers')}
                </p>
              )}
              
              <p className="text-[0.95rem] text-gray-700 mt-2 leading-relaxed">{displayBio}</p>
            </>
          )}
        </div>

        {/* 4. Action Buttons (Clean & Minimal) */}
        <div className="mt-5 flex gap-2 w-full">
          {isOwnProfile ? (
            isEditing ? (
              <>
                <button type="button" onClick={onCancel} disabled={isSaving} className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-300 active:scale-[0.97] disabled:active:scale-100 transition-all">
                  {t?.cancel || 'Cancel'}
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-[#0f4c5c] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#0f4c5c]/90 active:scale-[0.97] disabled:active:scale-100 transition-all shadow-sm disabled:opacity-50">
                  {isSaving ? (t?.saving || 'Saving...') : (t?.save || 'Save')}
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={onEdit} className="flex-1 bg-gray-200 text-gray-900 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-300 active:scale-[0.97] transition-all shadow-sm flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  {t?.editProfile || 'Edit Profile'}
                </button>
                <button onClick={handleShare} type="button" className="flex-1 bg-gray-200 text-gray-900 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-300 active:scale-[0.97] transition-all shadow-sm flex items-center justify-center gap-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  {copied ? (t?.copied || 'Copied!') : (t?.share || 'Share')}
                </button>
              </>
            )
          ) : (
            <>
              <FollowButton employerId={profile.id} initialIsFollowing={isFollowing} path={`/user/${profile.id}`} />
              
              <button onClick={handleShare} type="button" className="flex-1 bg-gray-200 text-gray-900 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-300 active:scale-[0.97] transition-all shadow-sm">
                {copied ? (t?.copied || 'Copied!') : (t?.share || 'Share')}
              </button>
              
              <ReportModal 
                reportedUserId={profile.id} 
                buttonText="Report User" 
                t={tReport} 
                iconOnly={true} 
              />
            </>
          )}
        </div>

        {/* 5. KYC Contextual Banners (Only visible to the owner when not editing) */}
        {isOwnProfile && !isEditing && (
          <div className="mt-4 w-full space-y-4">
            
            {/* Get Verified Prompt */}
            {profile?.kyc_status === 'none' && (
              <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900">Get Verified</p>
                    {/* Logic: Check if name and avatar exist */}
                    <p className="text-xs text-blue-700 mt-0.5 font-medium">
                      {(!profile?.contact_username || !profile?.avatar_url) 
                        ? "Please add your name and photo first." 
                        : "Build trust with a verified badge."}
                    </p>
                  </div>
                </div>
                
                {/* Logic: Change button behavior based on profile completeness */}
                {(!profile?.contact_username || !profile?.avatar_url) ? (
                  <button type="button" onClick={onEdit} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 active:scale-95 transition-all shadow-sm">
                    Edit Profile
                  </button>
                ) : (
                  <button type="button" onClick={onOpenKyc} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
                    Apply
                  </button>
                )}
              </div>
            )}

            {/* Pending: Personal Verification */}
            {profile?.kyc_status === 'pending_personal' && (
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Verification Pending</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">We are reviewing your details.</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-slate-200 text-slate-600 text-[10px] uppercase tracking-wider font-bold rounded-lg">
                  In Review
                </span>
              </div>
            )}

            {/* Pending: Business Verification (Requires User Action) */}
            {profile?.kyc_status === 'pending_business' && (
              <div className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.33-1.08-.7.02-.19.27-.39.75-.59 2.95-1.28 4.91-2.13 5.89-2.53 2.79-1.16 3.37-1.36 3.75-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900">Action Required</p>
                    <p className="text-[11px] text-amber-700 mt-0.5 font-medium leading-tight max-w-[200px]">Message us on Telegram to schedule your video call.</p>
                  </div>
                </div>
                <a href="https://t.me/parttimemmofficial" target="_blank" rel="noopener noreferrer" className="shrink-0 px-3 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 active:scale-95 transition-all shadow-sm text-center">
                  Telegram
                </a>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}