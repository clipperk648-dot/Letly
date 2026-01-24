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

    const posts = db.collection('posts');
    const users = db.collection('users');
    const { postId } = req.query || {};

    if (!postId) return res.status(400).json({ error: 'postId required' });

    if (req.method === 'POST') {
      // Add a comment to a post
      const { text } = req.body || {};
      if (!text || !String(text).trim()) {
        return res.status(400).json({ error: 'Comment text required' });
      }

      const post = await posts.findOne({ _id: new ObjectId(postId) });
      if (!post) return res.status(404).json({ error: 'Post not found' });

      const user = await users.findOne({ email: payload.email });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const newComment = {
        _id: new ObjectId(),
        authorEmail: payload.email,
        text: String(text).trim(),
        createdAt: new Date(),
      };

      await posts.updateOne(
        { _id: new ObjectId(postId) },
        { $push: { comments: newComment } }
      );

      return res.status(201).json({
        comment: {
          ...newComment,
          _id: newComment._id.toString(),
          author: {
            fullName: user.fullName,
            username: user.username || user.email.split('@')[0],
            profilePicture: user.profilePicture,
            role: user.role,
          },
        },
      });
    }

    if (req.method === 'DELETE') {
      // Delete a comment
      const { commentId } = req.query || {};
      if (!commentId) return res.status(400).json({ error: 'commentId required' });

      const post = await posts.findOne({ _id: new ObjectId(postId) });
      if (!post) return res.status(404).json({ error: 'Post not found' });

      const comment = post.comments?.find(c => c._id.toString() === commentId);
      if (!comment) return res.status(404).json({ error: 'Comment not found' });
      if (comment.authorEmail !== payload.email) {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
      }

      await posts.updateOne(
        { _id: new ObjectId(postId) },
        { $pull: { comments: { _id: new ObjectId(commentId) } } }
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    console.error('Error in comments handler:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
