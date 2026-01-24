const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const { getDb } = require('../lib/mongo');
const { getJwtSecret } = require('../lib/jwt');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { fullName, email, password, phoneNumber, role, username, bio } = req.body || {};
    if (!fullName || !email || !password || !phoneNumber || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDb();
    if (!db) {
      const user = {
        fullName: String(fullName).trim(),
        email: String(email).toLowerCase().trim(),
        phoneNumber: String(phoneNumber).trim(),
        role: String(role),
        username: username ? String(username).trim() : String(email).split('@')[0],
        bio: bio ? String(bio).trim() : '',
        followers: [],
        following: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const publicUser = { id: 'demo-user', fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber, role: user.role, username: user.username };
      const token = jwt.sign(publicUser, getJwtSecret(), { expiresIn: '7d' });
      res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      }));
      return res.status(201).json({ user: publicUser, token });
    }
    const users = db.collection('users');

    const existing = await users.findOne({ email: String(email).toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = {
      fullName: String(fullName).trim(),
      email: String(email).toLowerCase().trim(),
      phoneNumber: String(phoneNumber).trim(),
      role: String(role),
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(user);

    const publicUser = { id: result.insertedId, fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber, role: user.role };

    const token = jwt.sign(publicUser, getJwtSecret(), { expiresIn: '7d' });
    res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    }));

    return res.status(201).json({ user: publicUser, token });
  } catch (e) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
