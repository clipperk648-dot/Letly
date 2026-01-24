const jwt = require('jsonwebtoken');
const { getDb } = require('../lib/mongo');
const { getJwtSecret } = require('../lib/jwt');
const { ObjectId } = require('mongodb');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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
    const { userId, userEmail } = req.query || {};
    const targetEmail = userEmail;

    if (!targetEmail) return res.status(400).json({ error: 'userEmail required' });
    if (targetEmail === payload.email) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    if (req.method === 'POST') {
      // Follow a user
      const targetUser = await users.findOne({ email: targetEmail });
      if (!targetUser) return res.status(404).json({ error: 'User not found' });

      await users.updateOne(
        { email: payload.email },
        { $addToSet: { following: targetEmail } }
      );

      await users.updateOne(
        { email: targetEmail },
        { $addToSet: { followers: payload.email } }
      );

      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      // Unfollow a user
      const targetUser = await users.findOne({ email: targetEmail });
      if (!targetUser) return res.status(404).json({ error: 'User not found' });

      await users.updateOne(
        { email: payload.email },
        { $pull: { following: targetEmail } }
      );

      await users.updateOne(
        { email: targetEmail },
        { $pull: { followers: payload.email } }
      );

      return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
      // Get followers/following
      const { type } = req.query || {};
      const user = await users.findOne({ email: payload.email });
      
      if (type === 'followers') {
        const followersList = user.followers || [];
        const followers = await users
          .find({ email: { $in: followersList } })
          .project({ email: 1, fullName: 1, username: 1, profilePicture: 1, role: 1 })
          .toArray();
        return res.status(200).json({ list: followers, count: followers.length });
      }

      if (type === 'following') {
        const followingList = user.following || [];
        const following = await users
          .find({ email: { $in: followingList } })
          .project({ email: 1, fullName: 1, username: 1, profilePicture: 1, role: 1 })
          .toArray();
        return res.status(200).json({ list: following, count: following.length });
      }

      return res.status(400).json({ error: 'type parameter required (followers or following)' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    console.error('Error in follows handler:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
