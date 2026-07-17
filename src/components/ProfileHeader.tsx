//src/components/ProfileHeader.tsx

'use client';

import { motion } from 'framer-motion';
import FollowButton from './FollowButton';
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
  onCoverChange
}: any) {
  const displayName = profile?.contact_username || 'Anonymous User';
  const displayBio = profile?.bio || (isOwnProfile 
    ? 'No bio provided yet. Update your profile to tell others about yourself.' 
    : 'This user has not provided a bio yet.');

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName}'s Profile on PartTimeMM`,
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
          /* This uses the default-cover.jpg file from your public/images folder */
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
              <input type="text" name="contact_username" defaultValue={profile?.contact_username || ''} placeholder="Your Name" className="w-full text-2xl font-bold text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:border-[#0f4c5c] bg-transparent pb-1 transition-colors" required />
              <textarea name="bio" defaultValue={profile?.bio || ''} placeholder="Write a short bio..." rows={3} className="w-full text-[0.95rem] text-gray-700 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f4c5c] resize-none" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{displayName}</h1>
                {profile?.is_verified && (
                  <svg className="w-6 h-6 text-[#e3b23c] mt-1" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                )}
              </div>
              
              {!isOwnProfile && (
                <p className="text-sm font-medium text-gray-600 mt-1">
                  <span className="font-bold text-gray-900">{followerCount}</span> {followerCount === 1 ? 'follower' : 'followers'}
                </p>
              )}
              
              <p className="text-[0.95rem] text-gray-700 mt-2 leading-relaxed">{displayBio}</p>
            </>
          )}
        </div>

        {/* 4. Native App Style Buttons */}
        <div className="mt-5 flex gap-2 w-full">
          {isOwnProfile ? (
            isEditing ? (
              <>
                <button type="button" onClick={onCancel} disabled={isSaving} className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-300 active:scale-[0.97] disabled:active:scale-100 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-[#0f4c5c] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#0f4c5c]/90 active:scale-[0.97] disabled:active:scale-100 transition-all shadow-sm disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={onEdit} className="flex-1 bg-gray-200 text-gray-900 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-300 active:scale-[0.97] transition-all shadow-sm flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Edit Profile
                </button>
                <button onClick={handleShare} type="button" className="flex-1 bg-gray-200 text-gray-900 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-300 active:scale-[0.97] transition-all shadow-sm flex items-center justify-center gap-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </>
            )
          ) : (
            <>
              <FollowButton employerId={profile.id} initialIsFollowing={isFollowing} path={`/user/${profile.id}`} />
              <button onClick={handleShare} type="button" className="flex-1 bg-gray-200 text-gray-900 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-300 active:scale-[0.97] transition-all shadow-sm">
                {copied ? 'Copied!' : 'Share'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}