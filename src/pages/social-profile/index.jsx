import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Settings, UserPlus, UserCheck, Loader2, AlertCircle, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getUserProfile, followUser, unfollowUser, getPosts } from '../../services/socialService';
import { getProfile } from '../../services/authServices';
import Button from '../../components/ui/Button';
import SocialNavBar from '../../components/ui/SocialNavBar';
import { RoleBadge } from '../../components/ui/Badge';
import { toast } from 'react-toastify';

const PostGridItem = ({ post, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ delay: index * 0.05 }}
    className="aspect-square bg-gray-100 cursor-pointer group relative overflow-hidden rounded-xl border border-gray-100 hover:shadow-lg transition-all"
  >
    {post?.imageUrl && (
      <img
        src={post.imageUrl}
        alt="Post thumbnail"
        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        loading="lazy"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    )}

    {/* Hover Overlay */}
    <motion.div
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col items-center justify-center gap-4"
    >
      <motion.div whileHover={{ scale: 1.1 }} className="text-white text-center">
        <div className="flex items-center gap-2 justify-center mb-2">
          <Heart size={20} className="fill-white" />
          <span className="text-sm font-semibold">{post?.likeCount || 0}</span>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <MessageCircle size={20} />
          <span className="text-sm font-semibold">{post?.commentCount || 0}</span>
        </div>
      </motion.div>
      {post?.author?.role && (
        <RoleBadge role={post.author.role} />
      )}
    </motion.div>

    {/* No Image Fallback */}
    {!post?.imageUrl && (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100 p-2">
        <p className="text-xs font-semibold text-gray-800 text-center line-clamp-3">
          {post?.caption?.substring(0, 40)}...
        </p>
        {post?.author?.role && (
          <div className="mt-2">
            <RoleBadge role={post.author.role} />
          </div>
        )}
      </div>
    )}
  </motion.div>
);

const SocialProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');

  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [savedPosts, setSavedPosts] = useState([]);
  const [repostedPosts, setRepostedPosts] = useState([]);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUserRes = await getProfile();
      if (currentUserRes?.data?.user) {
        setCurrentUser(currentUserRes.data.user);
      }

      const profileRes = await getUserProfile(userId || currentUserRes?.data?.user?.userId || currentUserRes?.data?.user?._id);
      if (profileRes?.data?.user) {
        setProfile(profileRes.data.user);
        setIsFollowing(profileRes.data.user.isFollowing || false);
      }

      // Load user's posts
      const finalUserId = userId || currentUserRes?.data?.user?.userId || currentUserRes?.data?.user?._id;
      const postsRes = await getUserPosts(finalUserId);
      if (postsRes?.data?.posts && Array.isArray(postsRes.data.posts)) {
        const filtered = postsRes.data.posts;
        setUserPosts(filtered);

        // Simulate saved posts (in real app, would come from API)
        // Ensure role information is preserved
        const savedCount = Math.max(1, Math.ceil(filtered.length / 2));
        const saved = filtered.slice(0, savedCount).map(post => ({
          ...post,
          author: {
            ...post.author,
            role: post.author?.role
          }
        }));
        setSavedPosts(saved);

        // Simulate reposted posts (in real app, would come from API)
        // Ensure role information is preserved
        const reposts = filtered.slice(savedCount).map(post => ({
          ...post,
          author: {
            ...post.author,
            role: post.author?.role
          }
        }));
        setRepostedPosts(reposts);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile. Please try again.');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile?.email) return;

    try {
      setFollowing(true);
      if (isFollowing) {
        await unfollowUser(profile.email);
        setIsFollowing(false);
        setProfile(prev => ({
          ...prev,
          followers: Math.max(0, (prev.followers || 1) - 1)
        }));
        toast.success('Unfollowed');
      } else {
        await followUser(profile.email);
        setIsFollowing(true);
        setProfile(prev => ({
          ...prev,
          followers: (prev.followers || 0) + 1
        }));
        toast.success('Followed');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to follow user');
    } finally {
      setFollowing(false);
    }
  };

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SocialNavBar />
        <div className="max-w-2xl mx-auto md:ml-72 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadProfile}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SocialNavBar />
        <div className="max-w-2xl mx-auto md:ml-72 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SocialNavBar />
        <div className="max-w-2xl mx-auto md:ml-72 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Profile not found</p>
            <Button onClick={() => navigate('/explore')}>Go to Explore</Button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = profile.isOwnProfile;

  return (
    <div className="min-h-screen bg-gray-50">
      <SocialNavBar />

      <div className="max-w-2xl mx-auto md:ml-72">
        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="p-6 md:p-8">
            {/* Profile Info Row */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex gap-6">
                {/* Profile Picture */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-5xl md:text-6xl font-bold flex-shrink-0"
                >
                  {profile?.fullName?.charAt(0) || 'U'}
                </motion.div>

                {/* Profile Stats - Mobile */}
                <div className="flex gap-8 md:hidden flex-1">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{userPosts.length}</p>
                    <p className="text-xs text-gray-600 mt-1">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{profile?.followers || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{profile?.following || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">Following</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <>
                    <Button
                      onClick={() => navigate('/account-profile')}
                      className="flex-1 md:flex-none bg-blue-500 hover:bg-blue-600"
                    >
                      Edit Profile
                    </Button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                      <Settings size={20} className="text-gray-600" />
                    </button>
                  </>
                ) : (
                  <>
                    <Button
                      className={`flex-1 md:flex-none ${
                        isFollowing
                          ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      onClick={handleFollow}
                      disabled={following}
                    >
                      {following ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserCheck size={16} className="mr-2" /> Following
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} className="mr-2" /> Follow
                        </>
                      )}
                    </Button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                      <MessageCircle size={20} className="text-gray-600" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.fullName || profile.username || 'User'}</h1>
              <div className="flex items-center gap-2 mb-3">
                <RoleBadge role={profile.role} />
                {profile.username && (
                  <span className="text-sm text-gray-600">@{profile.username}</span>
                )}
              </div>

              {profile.bio && (
                <p className="text-sm text-gray-700 mb-3">{profile.bio}</p>
              )}

              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline font-medium"
                >
                  {profile.website}
                </a>
              )}
            </div>

            {/* Profile Stats - Desktop */}
            <div className="hidden md:grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{userPosts.length}</p>
                <p className="text-sm text-gray-600 mt-2">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{profile?.followers || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{profile?.following || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section with Tabs */}
        <div className="border-t border-gray-200">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-white sticky top-14 md:top-0 z-20">
            {[
              { id: 'posts', label: 'Posts', count: userPosts.length },
              { id: 'saved', label: 'Saved', count: savedPosts.length },
              { id: 'reposts', label: 'Reposts', count: repostedPosts.length }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                className={`flex-1 py-4 px-6 font-semibold border-b-2 transition-all text-center ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-2 text-sm font-normal text-gray-500">({tab.count})</span>
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'posts' && (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {userPosts.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mb-4 text-5xl">📸</div>
                      <p className="text-gray-600 mb-4">
                        {isOwnProfile ? "You haven't posted yet" : 'No posts yet'}
                      </p>
                      {isOwnProfile && (
                        <Button
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => navigate('/create-post')}
                        >
                          Create your first post
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 mb-6">
                        <AnimatePresence>
                          {userPosts.map((post, index) => (
                            <PostGridItem key={post?._id || index} post={post} index={index} />
                          ))}
                        </AnimatePresence>
                      </div>
                      <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-200">
                        {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
                        {profile.role && (
                          <>
                            {' '}• <RoleBadge role={profile.role} />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {savedPosts.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mb-4 text-5xl">💾</div>
                      <p className="text-gray-600 mb-4">
                        {isOwnProfile ? "You haven't saved any posts yet" : 'No saved posts'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 mb-6">
                        <AnimatePresence>
                          {savedPosts.map((post, index) => (
                            <PostGridItem key={post?._id || index} post={post} index={index} />
                          ))}
                        </AnimatePresence>
                      </div>
                      <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-200">
                        {savedPosts.length} {savedPosts.length === 1 ? 'post' : 'posts'} saved
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'reposts' && (
                <motion.div
                  key="reposts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {repostedPosts.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mb-4 text-5xl">🔄</div>
                      <p className="text-gray-600 mb-4">
                        {isOwnProfile ? "You haven't reposted yet" : 'No reposts'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 mb-6">
                        <AnimatePresence>
                          {repostedPosts.map((post, index) => (
                            <PostGridItem key={post?._id || index} post={post} index={index} />
                          ))}
                        </AnimatePresence>
                      </div>
                      <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-200">
                        {repostedPosts.length} {repostedPosts.length === 1 ? 'post' : 'posts'} reposted
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Padding */}
        <div className="pb-20 md:pb-8" />
      </div>
    </div>
  );
};

export default SocialProfilePage;
