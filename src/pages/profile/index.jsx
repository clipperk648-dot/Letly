import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
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
        <p className="text-sm font-semibold">View</p>
      </motion.div>
    </motion.div>

    {/* No Image Fallback */}
    {!post?.imageUrl && (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100 p-2">
        <p className="text-xs font-semibold text-gray-800 text-center line-clamp-3">
          {post?.caption?.substring(0, 40)}...
        </p>
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
    <div className="min-h-screen bg-background">
      <RoleBasedNavBar userRole={profile.role} isAuthenticated={true} />

      <div className="max-w-4xl mx-auto p-6 mt-20 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My Profile</h1>
            <p className="text-muted-foreground">Manage your account, security, and preferences.</p>
            {loading && <p className="text-sm text-muted-foreground mt-2">Loading profile…</p>}
            {error && <p className="text-sm text-error mt-2">{error}</p>}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => navigate('/settings')}>Settings</Button>
            <Button variant="danger" onClick={handleSignOut}>Sign out</Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center md:items-start md:col-span-1">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
              <Image src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <div className="font-semibold text-foreground">{profile.name || '—'}</div>
              <div className="text-sm text-muted-foreground">{profile.email || '—'}</div>
              <div className="text-xs text-muted-foreground mt-2">Role: <span className="font-medium">{profile.role || '—'}</span></div>
            </div>

            <div className="mt-4 w-full">
              <label className="text-sm font-medium mb-1 block">Change avatar</label>
              <input type="file" accept="image/*" onChange={handleFile} />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Account details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Full name" value={profile.name} onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))} />
                <Input label="Email" value={profile.email} onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="flex justify-end mt-3">
                <Button variant="default" onClick={handleSaveProfile} loading={saving}>Save profile</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input label="Current password" type="password" value={passwords.current} onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))} />
                <Input label="New password" type="password" value={passwords.newPassword} onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))} />
                <Input label="Confirm password" type="password" value={passwords.confirm} onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))} />
              </div>
              <div className="flex justify-end mt-3">
                <Button variant="default" onClick={handleChangePassword}>Change password</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Danger Zone</h3>
              <div className="flex items-center space-x-3">
                <Button variant="danger" onClick={handleDeleteAccount}>Delete account</Button>
                <Button variant="ghost" onClick={() => alert('Export account data (mock)')}>Export data</Button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
