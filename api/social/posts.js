const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const { getDb } = require('../lib/mongo');
const { getJwtSecret } = require('../lib/jwt');
const { ObjectId } = require('mongodb');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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

    if (req.method === 'GET') {
      // Get feed posts (all posts from followers + own posts)
      const { page = 0, limit = 20, explore = false } = req.query;
      const skip = parseInt(page) * parseInt(limit);

      let query = {};
      if (explore === 'true') {
        // Explore: get trending posts
        query = {};
      } else {
        // Feed: get own posts only for now (followers feature will extend this)
        query = { authorEmail: payload.email };
      }

      const postList = await posts
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      // Enrich posts with author info and comments
      const enrichedPosts = await Promise.all(
        postList.map(async (post) => {
          const author = await users.findOne({ email: post.authorEmail });

          // Enrich comments with author info
          const enrichedComments = await Promise.all(
            (post.comments || []).map(async (comment) => {
              const commentAuthor = await users.findOne({ email: comment.authorEmail });
              return {
                ...comment,
                _id: comment._id ? comment._id.toString() : new ObjectId().toString(),
                author: {
                  fullName: commentAuthor?.fullName || 'Unknown',
                  username: commentAuthor?.username || (comment.authorEmail || '').split('@')[0],
                  profilePicture: commentAuthor?.profilePicture,
                  role: commentAuthor?.role,
                },
              };
            })
          );

          return {
            ...post,
            _id: post._id.toString(),
            author: {
              id: author._id.toString(),
              fullName: author.fullName,
              username: author.username || author.email.split('@')[0],
              profilePicture: author.profilePicture,
              role: author.role,
            },
            comments: enrichedComments,
            likeCount: post.likes ? post.likes.length : 0,
            commentCount: post.comments ? post.comments.length : 0,
            isLiked: post.likes ? post.likes.includes(payload.email) : false,
          };
        })
      );

      return res.status(200).json({ posts: enrichedPosts });
    }

    if (req.method === 'POST') {
      // Create a new post
      const { caption, imageUrl, location } = req.body || {};
      if (!caption && !imageUrl) {
        return res.status(400).json({ error: 'Post must have caption or image' });
      }

      const user = await users.findOne({ email: payload.email });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const newPost = {
        authorEmail: payload.email,
        caption: caption || '',
        imageUrl: imageUrl || '',
        location: location || '',
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await posts.insertOne(newPost);

      return res.status(201).json({
        post: {
          ...newPost,
          _id: result.insertedId.toString(),
          comments: [],
          likeCount: 0,
          commentCount: 0,
          isLiked: false,
          author: {
            id: user._id?.toString ? user._id.toString() : String(user._id),
            fullName: user.fullName || 'Unknown',
            username: user.username || user.email.split('@')[0],
            profilePicture: user.profilePicture,
            role: user.role,
          },
        },
      });
    }

    if (req.method === 'DELETE') {
      // Delete a post
      const { postId } = req.query || {};
      if (!postId) return res.status(400).json({ error: 'postId required' });

      const post = await posts.findOne({ _id: new ObjectId(postId) });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      if (post.authorEmail !== payload.email) {
        return res.status(403).json({ error: 'Not authorized to delete this post' });
      }

      await posts.deleteOne({ _id: new ObjectId(postId) });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    console.error('Error in posts handler:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
