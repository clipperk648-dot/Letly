import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPosts, likePost, unlikePost, addComment } from '../../services/socialService';
import { getProfile } from '../../services/authServices';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SocialNavBar from '../../components/ui/SocialNavBar';
import { RoleBadge } from '../../components/ui/Badge';
import { toast } from 'react-toastify';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [newComments, setNewComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [liking, setLiking] = useState({});
  const [commenting, setCommenting] = useState({});

  useEffect(() => {
    const initializeData = async () => {
      try {
        setError(null);
        await Promise.all([fetchUserProfile(), fetchFeed()]);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to load feed. Please refresh the page.');
      }
    };

    initializeData();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await getProfile();
      if (res?.data?.user) {
        setCurrentUser(res.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPosts(0, 20, false);
      
      if (res?.data?.posts && Array.isArray(res.data.posts)) {
        setPosts(res.data.posts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
      setError('Unable to load feed. Please try again.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = useCallback(async (postId, isLiked) => {
    try {
      setLiking(prev => ({ ...prev, [postId]: true }));
      
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      
      setPosts(posts.map(post =>
        post._id === postId
          ? {
              ...post,
              isLiked: !isLiked,
              likeCount: Math.max(0, isLiked ? post.likeCount - 1 : post.likeCount + 1)
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setLiking(prev => ({ ...prev, [postId]: false }));
    }
  }, [posts]);

  const handleAddComment = useCallback(async (postId) => {
    const text = newComments[postId]?.trim();
    if (!text) return;

    try {
      setCommenting(prev => ({ ...prev, [postId]: true }));
      
      const res = await addComment(postId, text);
      
      if (res?.data?.comment) {
        setPosts(posts.map(post =>
          post._id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), res.data.comment],
                commentCount: (post.commentCount || 0) + 1
              }
            : post
        ));
        
        setNewComments(prev => ({
          ...prev,
          [postId]: ''
        }));
        
        toast.success('Comment added');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setCommenting(prev => ({ ...prev, [postId]: false }));
    }
  }, [newComments, posts]);

  const handleSavePost = (postId) => {
    toast.info('Saving post...');
  };

  const handleSharePost = (postId) => {
    toast.info('Sharing functionality coming soon');
  };

  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SocialNavBar />
        <div className="max-w-2xl mx-auto md:ml-72 flex items-center justify-center min-h-screen">
          <div className="text-center bg-white p-8 rounded-lg">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Feed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchFeed}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SocialNavBar />
        <div className="max-w-2xl mx-auto md:ml-72 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your feed...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SocialNavBar />

      <div className="max-w-2xl mx-auto md:ml-72">
        {/* Feed Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-4 z-40 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Community Feed
              </h1>
              <p className="text-sm text-gray-500 mt-1">Connect with landlords and tenants</p>
            </div>
            <motion.button
              onClick={() => navigate('/create-post')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>+</span> Create
            </motion.button>
          </div>
        </motion.div>

        {/* Posts Feed */}
        <div className="space-y-6 p-4 md:p-0">
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-20 bg-white rounded-lg"
            >
              <div className="text-center">
                <div className="mb-4 text-5xl">📱</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-6">Start following users to see their posts in your feed</p>
                <Button onClick={() => (window.location.href = '/explore')}>
                  Explore Community
                </Button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post?._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300"
                >
                  {/* Post Header */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm"
                      >
                        {post?.author?.fullName?.charAt(0) || 'U'}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {post?.author?.fullName || 'Unknown User'}
                          </p>
                          <RoleBadge role={post?.author?.role} />
                        </div>
                        <p className="text-xs text-gray-400">
                          {post?.createdAt
                            ? new Date(post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'Recently'}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ rotate: 90 }}
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      <MoreVertical size={18} className="text-gray-600" />
                    </motion.button>
                  </div>

                  {/* Post Image */}
                  {post?.imageUrl && (
                    <div className="w-full bg-gray-100 aspect-square overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt="Post content"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <motion.button
                      onClick={() => handleLike(post._id, post.isLiked)}
                      disabled={liking[post._id]}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition disabled:opacity-50"
                    >
                      <motion.div
                        animate={post.isLiked ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Heart
                          size={22}
                          className={`transition ${
                            post.isLiked ? 'fill-rose-600 text-rose-600' : ''
                          }`}
                        />
                      </motion.div>
                      <span className="text-sm font-medium">{post.likeCount || 0}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                    >
                      <MessageCircle size={22} />
                      <span className="text-sm font-medium">{post.commentCount || 0}</span>
                    </motion.button>

                    <motion.button
                      onClick={() => handleSharePost(post._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                    >
                      <Share2 size={22} />
                    </motion.button>

                    <motion.button
                      onClick={() => handleSavePost(post._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 transition"
                    >
                      <Bookmark size={22} />
                    </motion.button>
                  </div>

                  {/* Post Caption */}
                  {(post?.caption || post?.location) && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      {post?.caption && (
                        <p className="text-sm text-gray-900 mb-2">
                          <span className="font-semibold">{post?.author?.fullName || 'Unknown'}</span>{' '}
                          {post.caption}
                        </p>
                      )}
                      {post?.location && (
                        <p className="text-xs text-gray-500">📍 {post.location}</p>
                      )}
                    </div>
                  )}

                  {/* Comments Section */}
                  {post.commentCount > 0 && post.comments && post.comments.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-4 py-3 border-b border-gray-50 bg-gray-50/50"
                    >
                      {!expandedComments[post._id] && post.comments.length > 2 && (
                        <motion.button
                          whileHover={{ x: 2 }}
                          onClick={() =>
                            setExpandedComments(prev => ({
                              ...prev,
                              [post._id]: true
                            }))
                          }
                          className="text-sm text-gray-500 hover:text-gray-700 mb-3 font-medium transition"
                        >
                          View all {post.commentCount} comments
                        </motion.button>
                      )}

                      <div className="space-y-3">
                        {(expandedComments[post._id]
                          ? post.comments
                          : post.comments.slice(-2)
                        ).map((comment, idx) => (
                          <motion.div
                            key={comment?._id || idx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="text-sm"
                          >
                            <div className="flex gap-2">
                              <span className="font-semibold text-gray-900 flex-shrink-0">
                                {comment?.author?.fullName || 'Unknown'}
                              </span>
                              <p className="text-gray-700 flex-1">{comment?.text || ''}</p>
                            </div>
                            {comment?.createdAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Add Comment */}
                  <div className="px-4 py-3 border-t border-gray-50 bg-white">
                    <div className="flex items-end gap-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      >
                        {currentUser?.fullName?.charAt(0) || 'U'}
                      </motion.div>
                      <div className="flex-1 flex gap-2">
                        <Input
                          type="text"
                          placeholder="Add a comment..."
                          className="text-sm border border-gray-200 bg-gray-50 px-3 py-2 rounded-full placeholder-gray-400 focus:bg-white focus:ring-1 focus:ring-blue-400 transition"
                          value={newComments[post._id] || ''}
                          onChange={(e) =>
                            setNewComments(prev => ({
                              ...prev,
                              [post._id]: e.target.value
                            }))
                          }
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !commenting[post._id]) {
                              handleAddComment(post._id);
                            }
                          }}
                          disabled={commenting[post._id]}
                        />
                        <motion.button
                          onClick={() => handleAddComment(post._id)}
                          disabled={commenting[post._id] || !newComments[post._id]?.trim()}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-blue-500 hover:text-blue-600 font-semibold text-sm px-3 py-2 disabled:opacity-50 transition"
                        >
                          {commenting[post._id] ? '...' : 'Post'}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Bottom Padding */}
        <div className="pb-20 md:pb-8" />
      </div>
    </div>
  );
};

export default FeedPage;
