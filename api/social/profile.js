const jwt = require('jsonwebtoken');
const { getDb } = require('../lib/mongo');
const { getJwtSecret } = require('../lib/jwt');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const cookies = Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')));
    const token = cookies.auth_token || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, getJwtSecret());

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const users = db.collection('users');
    const posts = db.collection('posts');
    const { userEmail } = req.query || {};
    const targetEmail = userEmail || payload.email;

    if (req.method === 'GET') {
      const user = await users.findOne({ email: targetEmail });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const userPosts = await posts
        .find({ authorEmail: targetEmail })
        .sort({ createdAt: -1 })
        .toArray();

      const isFollowing = (user.followers || []).includes(payload.email);
      const followersCount = (user.followers || []).length;
      const followingCount = (user.following || []).length;

      const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes ? post.likes.length : 0), 0);

      return res.status(200).json({
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          username: user.username || user.email.split('@')[0],
          role: user.role,
          bio: user.bio || '',
          profilePicture: user.profilePicture || '',
          website: user.website || '',
          followers: followersCount,
          following: followingCount,
          posts: userPosts.length,
          totalLikes,
          isFollowing,
          isOwnProfile: targetEmail === payload.email,
        },
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    console.error('Error in profile handler:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
