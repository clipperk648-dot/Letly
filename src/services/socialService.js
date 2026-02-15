import api from '../utils/api';

// Helper to get stored user data
const getStoredUser = () => {
  try {
    return {
      userId: localStorage.getItem('userId'),
      username: localStorage.getItem('username'),
      userEmail: localStorage.getItem('userEmail')
    };
  } catch {
    return {};
  }
};

// Posts
export const getPosts = async () => {
  const res = await api.get('/posts');
  if (res.data && Array.isArray(res.data.posts)) {
    // Map backend schema to frontend schema
    res.data.posts = res.data.posts.map(post => ({
      ...post,
      _id: post._id || post.id,
      caption: post.caption || post.content,
      imageUrl: post.imageUrl || post.mediaUrl,
      author: post.author || {
        fullName: post.username || 'User',
        role: 'tenant' // Default role
      }
    }));
  }
  return res;
};

export const createPost = async (data) => {
  const { userId, username } = getStoredUser();

  if (!userId || !username) {
    console.error('Missing userId or username for post creation', { userId, username });
    throw new Error('You must be logged in with a valid profile to post.');
  }

  // Map frontend data to backend schema
  const mappedData = {
    userId: data.userId || userId,
    username: data.username || username,
    content: data.caption || data.content,
    mediaType: data.imageUrl ? 'image' : 'text',
  };

  if (data.imageUrl) {
    mappedData.mediaUrl = data.imageUrl;
  }

  return api.post('/posts', mappedData);
};

export const deletePost = (postId) =>
  api.delete(`/posts/${postId}`); // Note: New backend might not support this, but keeping it for consistency

// Comments
export const getComments = async (postId) => {
  if (!postId) return Promise.reject({ message: 'No postId provided' });
  const res = await api.get(`/posts/${postId}/comments`);
  if (res.data && Array.isArray(res.data.comments)) {
    res.data.comments = res.data.comments.map(comment => ({
      ...comment,
      _id: comment._id || comment.id,
      author: comment.author || {
        fullName: comment.username || 'User'
      }
    }));
  }
  return res;
};

export const addComment = async (postId, text) => {
  if (!postId) return Promise.reject({ message: 'No postId provided' });
  const { userId, username } = getStoredUser();
  const res = await api.post(`/posts/${postId}/comments`, {
    userId,
    username,
    text
  });
  if (res.data && res.data.comment) {
    res.data.comment = {
      ...res.data.comment,
      _id: res.data.comment._id || res.data.comment.id,
      author: res.data.comment.author || {
        fullName: res.data.comment.username || username || 'User'
      }
    };
  }
  return res;
};

export const deleteComment = (postId, commentId) =>
  api.delete(`/posts/${postId}/comments/${commentId}`);

// Likes
export const likePost = (postId) => {
  const { userId } = getStoredUser();
  return api.post(`/posts/${postId}/like`, { userId });
};

export const unlikePost = (postId) => {
  // New backend doesn't explicitly show unlike, but usually it's the same endpoint or a delete
  const { userId } = getStoredUser();
  return api.post(`/posts/${postId}/like`, { userId }); 
};

// Follows
export const followUser = (userIdToFollow) => {
  const { userId: followerId } = getStoredUser();
  return api.post(`/users/${userIdToFollow}/follow`, { followerId });
};

export const unfollowUser = (userIdToUnfollow) => {
  const { userId: followerId } = getStoredUser();
  return api.post(`/users/${userIdToUnfollow}/follow`, { followerId });
};

export const getFollowers = (userId) =>
  api.get(`/users/${userId}`); // Profile endpoint returns followers usually

export const getFollowing = (userId) =>
  api.get(`/users/${userId}`);

// Profile with social stats
export const getUserProfile = (userId = null) => {
  const { userId: storedUserId } = getStoredUser();
  const id = userId || storedUserId;
  if (!id) return Promise.reject({ message: 'No userId provided' });
  return api.get(`/users/${id}`);
};

export const getUserPosts = async (userId) => {
  if (!userId) return Promise.reject({ message: 'No userId provided' });
  const res = await api.get(`/users/${userId}/posts`);
  if (res.data && Array.isArray(res.data.posts)) {
    res.data.posts = res.data.posts.map(post => ({
      ...post,
      _id: post._id || post.id,
      caption: post.caption || post.content,
      imageUrl: post.imageUrl || post.mediaUrl,
      author: post.author || {
        fullName: post.username || 'User',
        role: 'tenant',
        userId: post.userId
      }
    }));
  }
  return res;
};

export const savePost = (postId) =>
  api.post(`/posts/${postId}/save`);
