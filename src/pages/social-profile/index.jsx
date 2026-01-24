import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Settings, Share2, UserPlus, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getUserProfile, followUser, unfollowUser, getPosts } from '../../services/socialService';
import { getProfile } from '../../services/authServices';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

const SocialProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('email');
  
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userEmail]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const currentUserRes = await getProfile();
      setCurrentUser(currentUserRes.data.user);

      const profileRes = await getUserProfile(userEmail || currentUserRes.data.user.email);
      setProfile(profileRes.data.user);
      setIsFollowing(profileRes.data.user.isFollowing);

      // Load user's posts
      const postsRes = await getPosts(0, 30, true);
      const filtered = postsRes.data.posts.filter(p => p.author.email === (userEmail || currentUserRes.data.user.email));
      setUserPosts(filtered);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(profile.email);
        setIsFollowing(false);
        setProfile(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await followUser(profile.email);
        setIsFollowing(true);
        setProfile(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
      toast.success(isFollowing ? 'Unfollowed' : 'Followed');
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to follow user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  const isOwnProfile = profile.isOwnProfile;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="border-b border-gray-200">
          <div className="p-6 md:p-8">
            {/* Profile Info Row */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div className="flex gap-6 md:gap-8 mb-6 md:mb-0">
                {/* Profile Picture */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-5xl font-bold flex-shrink-0">
                  {profile.fullName.charAt(0)}
                </div>

                {/* Profile Stats - Mobile */}
                <div className="flex gap-8 md:hidden">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userPosts.length}</p>
                    <p className="text-xs text-gray-600 mt-1">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{profile.followers}</p>
                    <p className="text-xs text-gray-600 mt-1">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{profile.following}</p>
                    <p className="text-xs text-gray-600 mt-1">Following</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <>
                    <Button 
                      variant="outline"
                      className="flex-1 md:flex-none"
                      onClick={() => navigate('/settings')}
                    >
                      Edit Profile
                    </Button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                      <Settings size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <Button 
                      className={isFollowing ? 'flex-1 md:flex-none' : 'flex-1 md:flex-none bg-blue-500 hover:bg-blue-600'}
                      variant={isFollowing ? 'outline' : 'default'}
                      onClick={handleFollow}
                    >
                      {isFollowing ? (
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
                      <MessageCircle size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div>
              <div className="mb-4">
                <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                <p className="text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {profile.role === 'landlord' ? 'Agent' : 'Customer'}
                  </span>
                </p>
              </div>

              {profile.bio && (
                <p className="text-sm mb-4">{profile.bio}</p>
              )}

              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                  {profile.website}
                </a>
              )}
            </div>

            {/* Profile Stats - Desktop */}
            <div className="hidden md:grid grid-cols-3 gap-8 mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-3xl font-bold">{userPosts.length}</p>
                <p className="text-sm text-gray-600 mt-2">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{profile.followers}</p>
                <p className="text-sm text-gray-600 mt-2">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{profile.following}</p>
                <p className="text-sm text-gray-600 mt-2">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="p-6 md:p-8">
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{isOwnProfile ? 'You haven\'t posted yet' : 'No posts yet'}</p>
              {isOwnProfile && (
                <Button 
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => navigate('/create-post')}
                >
                  Create your first post
                </Button>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-6">Posts</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2">
                {userPosts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="aspect-square bg-gray-100 cursor-pointer group relative overflow-hidden rounded-lg"
                  >
                    {post.imageUrl && (
                      <img 
                        src={post.imageUrl} 
                        alt="Post" 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-6">
                      <div className="text-white text-center">
                        <Heart size={24} className="fill-white mx-auto mb-2" />
                        <p className="text-sm font-semibold">{post.likeCount}</p>
                      </div>
                      <div className="text-white text-center">
                        <MessageCircle size={24} className="mx-auto mb-2" />
                        <p className="text-sm font-semibold">{post.commentCount}</p>
                      </div>
                    </div>

                    {/* No Image Fallback */}
                    {!post.imageUrl && (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100">
                        <p className="text-xs font-semibold text-gray-700 text-center px-2">{post.caption?.substring(0, 20)}...</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialProfilePage;
