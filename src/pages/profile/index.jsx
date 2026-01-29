import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleBasedNavBar from '../../components/ui/RoleBasedNavBar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Image from '../../components/AppImage';
import { getProfile } from '../../services/authServices';
import { getPosts } from '../../services/socialService';
import { RoleBadge } from '../../components/ui/Badge';

const mockActivity = [
  { id: 1, text: 'Applied to Modern Downtown Apartment', time: '2 days ago' },
  { id: 2, text: 'Saved Garden View Complex', time: '1 week ago' },
  { id: 3, text: 'Message from Sarah Johnson', time: '2 weeks ago' }
];

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
      className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center gap-6"
    >
      <motion.div whileHover={{ scale: 1.1 }} className="text-white text-center">
        <div className="flex items-center gap-2 justify-center mb-2">
          <Heart size={18} />
          <span className="text-sm font-semibold">{post?.likeCount || 0}</span>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <MessageCircle size={18} />
          <span className="text-sm font-semibold">{post?.commentCount || 0}</span>
        </div>
      </motion.div>
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

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [repostedPosts, setRepostedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('account');
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getProfile();
        const u = res?.data?.user || {};
        if (!mounted) return;
        setProfile(prev => ({
          ...prev,
          name: u.fullName || u.name || '',
          email: u.email || '',
          role: u.role || 'tenant',
        }));

        // Load user's posts
        try {
          setLoadingPosts(true);
          const postsRes = await getPosts(0, 50, true);
          if (postsRes?.data?.posts && Array.isArray(postsRes.data.posts)) {
            const filtered = postsRes.data.posts.filter(
              p => p?.author?.email === u.email
            );
            setUserPosts(filtered);

            // Simulate saved posts - use first half of posts as saved
            // In a real app, this would come from a saved_posts collection or user.savedPosts array
            const savedCount = Math.max(1, Math.ceil(filtered.length / 2));
            const saved = filtered.slice(0, savedCount).map(post => ({
              ...post,
              author: {
                ...post.author,
                role: post.author?.role || u.role
              }
            }));
            setSavedPosts(saved);

            // Simulate reposted posts - use second half of posts as reposts
            // In a real app, this would come from a reposts collection
            const reposts = filtered.slice(savedCount).map(post => ({
              ...post,
              author: {
                ...post.author,
                role: post.author?.role || u.role
              }
            }));
            setRepostedPosts(reposts);
          }
        } catch (postError) {
          console.error('Error loading posts:', postError);
        } finally {
          setLoadingPosts(false);
        }
      } catch (e) {
        if (!mounted) return;
        setError('Unable to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile(prev => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const name = String(profile.name || '').trim();
      if (!name) return alert('Name is required');
      const { updateProfile } = await import('../../services/authServices');
      try {
        const res = await updateProfile({ fullName: name }, { headers: { 'Content-Type': 'application/json' } });
        const u = res?.data?.user;
        if (u) {
          setProfile(prev => ({ ...prev, name: u.fullName || name }));
          try { localStorage.setItem('userEmail', u.email || ''); } catch {}
          alert('Profile updated');
          return;
        }
      } catch (err) {
        // Fallback: some proxies block PUT; try POST
        const api = (await import('../../utils/api')).default;
        const res2 = await api.post('/auth/profile', { fullName: name }, { headers: { 'Content-Type': 'application/json' } });
        const u2 = res2?.data?.user;
        if (u2) {
          setProfile(prev => ({ ...prev, name: u2.fullName || name }));
          try { localStorage.setItem('userEmail', u2.email || ''); } catch {}
          alert('Profile updated');
          return;
        }
        throw err;
      }
      alert('Unexpected response updating profile');
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update profile';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    if (!passwords.newPassword || passwords.newPassword !== passwords.confirm) {
      alert('Passwords do not match');
      return;
    }
    // In a real app, call change-password API
    alert('Password updated');
    setPasswords({ current: '', newPassword: '', confirm: '' });
  };

  const handleSignOut = () => {
    // Clear session and navigate to login
    try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    const ok = window.confirm('Delete your account? This action cannot be undone.');
    if (!ok) return;
    // Call API to delete account - mocked
    alert('Account deleted');
    handleSignOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleBasedNavBar userRole={profile.role} isAuthenticated={true} />

      <div className="mt-20 max-w-6xl mx-auto">
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
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-5xl md:text-6xl font-bold flex-shrink-0 overflow-hidden"
                >
                  {profile.avatar ? (
                    <Image src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    profile.name?.charAt(0) || 'U'
                  )}
                </motion.div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name || 'Unknown'}</h1>
                  <p className="text-sm text-gray-600 mb-3">{profile.email || '—'}</p>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={profile.role} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-col sm:flex-row">
                <Button variant="outline" onClick={() => navigate('/settings')}>Settings</Button>
                <Button variant="danger" onClick={handleSignOut}>Sign out</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-gray-200">
          <div className="flex border-b border-gray-200 bg-white sticky top-20 z-20">
            {[
              { id: 'account', label: 'Account', icon: '⚙️' },
              { id: 'posts', label: 'Posts', count: userPosts.length, icon: '📸' },
              { id: 'saved', label: 'Saved', count: savedPosts.length, icon: '💾' },
              { id: 'reposts', label: 'Reposts', count: repostedPosts.length, icon: '🔄' }
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
                <span className="mr-1">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({tab.count})</span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8 bg-white">
            <AnimatePresence mode="wait">
              {/* Account Tab */}
              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-4xl space-y-6"
                >
                  {loading && <p className="text-sm text-muted-foreground">Loading profile…</p>}
                  {error && <p className="text-sm text-error">{error}</p>}

                  <div>
                    <h3 className="text-lg font-medium mb-4">Account details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Full name</label>
                        <Input
                          value={profile.name}
                          onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Email</label>
                        <Input
                          value={profile.email}
                          onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-medium mb-2 block">Change avatar</label>
                      <input type="file" accept="image/*" onChange={handleFile} className="block" />
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button onClick={handleSaveProfile} loading={saving}>Save profile</Button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium mb-4">Security</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Current password</label>
                        <Input
                          type="password"
                          value={passwords.current}
                          onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">New password</label>
                        <Input
                          type="password"
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Confirm password</label>
                        <Input
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button onClick={handleChangePassword}>Change password</Button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="danger" onClick={handleDeleteAccount}>Delete account</Button>
                      <Button variant="ghost" onClick={() => alert('Export account data (mock)')}>Export data</Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {loadingPosts ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                  ) : userPosts.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mb-4 text-5xl">📸</div>
                      <p className="text-gray-600 mb-4">You haven't posted yet</p>
                      <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => navigate('/create-post')}
                      >
                        Create your first post
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
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

              {/* Saved Tab */}
              {activeTab === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {loadingPosts ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                  ) : savedPosts.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mb-4 text-5xl">💾</div>
                      <p className="text-gray-600">You haven't saved any posts yet</p>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
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

              {/* Reposts Tab */}
              {activeTab === 'reposts' && (
                <motion.div
                  key="reposts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {loadingPosts ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                  ) : repostedPosts.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mb-4 text-5xl">🔄</div>
                      <p className="text-gray-600">You haven't reposted yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      <AnimatePresence>
                        {repostedPosts.map((post, index) => (
                          <PostGridItem key={post?._id || index} post={post} index={index} />
                        ))}
                      </AnimatePresence>
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

export default Profile;
