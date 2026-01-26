import api from '../utils/api';

// Posts
export const getPosts = (page = 0, limit = 20, explore = false) =>
  api.get('/social/posts', { params: { page, limit, explore } });

export const createPost = (data) =>
  api.post('/social/posts', data);

export const deletePost = (postId) =>
  api.delete('/social/posts', { params: { postId } });

// Comments
export const addComment = (postId, text) =>
  api.post('/social/comments', { text }, { params: { postId } });

export const deleteComment = (postId, commentId) =>
  api.delete('/social/comments', { params: { postId, commentId } });

// Likes
export const likePost = (postId) =>
  api.post('/social/likes', {}, { params: { postId } });

export const unlikePost = (postId) =>
  api.delete('/social/likes', { params: { postId } });

// Follows
export const followUser = (userEmail) =>
  api.post('/social/follows', {}, { params: { userEmail } });

export const unfollowUser = (userEmail) =>
  api.delete('/social/follows', { params: { userEmail } });

export const getFollowers = (userEmail) =>
  api.get('/social/follows', { params: { userEmail, type: 'followers' } });

export const getFollowing = (userEmail) =>
  api.get('/social/follows', { params: { userEmail, type: 'following' } });

// Profile with social stats
export const getUserProfile = (userEmail = null) =>
  api.get('/social/profile', { params: userEmail ? { userEmail } : {} });
