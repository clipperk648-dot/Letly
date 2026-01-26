const jwt = require('jsonwebtoken');
const { getDb } = require('../lib/mongo');
const { getJwtSecret } = require('../lib/jwt');
const { ObjectId } = require('mongodb');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
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

    const posts = db.collection('posts');
    const { postId } = req.query || {};

    if (!postId) return res.status(400).json({ error: 'postId required' });

    if (req.method === 'POST') {
      // Like a post
      const post = await posts.findOne({ _id: new ObjectId(postId) });
      if (!post) return res.status(404).json({ error: 'Post not found' });

      const likes = post.likes || [];
      if (likes.includes(payload.email)) {
        return res.status(400).json({ error: 'Already liked' });
      }

      await posts.updateOne(
        { _id: new ObjectId(postId) },
        { $push: { likes: payload.email } }
      );

      return res.status(200).json({ success: true, likeCount: likes.length + 1 });
    }

    if (req.method === 'DELETE') {
      // Unlike a post
      const post = await posts.findOne({ _id: new ObjectId(postId) });
      if (!post) return res.status(404).json({ error: 'Post not found' });

      const likes = post.likes || [];
      if (!likes.includes(payload.email)) {
        return res.status(400).json({ error: 'Not liked' });
      }

      await posts.updateOne(
        { _id: new ObjectId(postId) },
        { $pull: { likes: payload.email } }
      );

      return res.status(200).json({ success: true, likeCount: likes.length - 1 });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    console.error('Error in likes handler:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
