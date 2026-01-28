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
    <div className="min-h-screen bg-gray-50">
      <SocialNavBar />
      
      <div className="max-w-2xl mx-auto md:ml-72">
        {/* Feed Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-40">
          <h1 className="text-2xl font-bold text-gray-900">Community Feed</h1>
          <p className="text-sm text-gray-500">Connect with landlords and tenants</p>
        </div>

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
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {post?.author?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {post?.author?.fullName || 'Unknown User'}
                          </p>
                          <RoleBadge role={post?.author?.role} />
                        </div>
                        <p className="text-xs text-gray-500">
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
                    <button className="p-2 hover:bg-gray-100 rounded-full transition">
                      <MoreVertical size={18} className="text-gray-600" />
                    </button>
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
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => handleLike(post._id, post.isLiked)}
                      disabled={liking[post._id]}
                      className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition disabled:opacity-50"
                    >
                      <Heart
                        size={22}
                        className={`transition ${
                          post.isLiked ? 'fill-rose-600 text-rose-600' : ''
                        }`}
                      />
                      <span className="text-sm font-medium">{post.likeCount || 0}</span>
                    </button>

                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                      <MessageCircle size={22} />
                      <span className="text-sm font-medium">{post.commentCount || 0}</span>
                    </button>

                    <button
                      onClick={() => handleSharePost(post._id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                    >
                      <Share2 size={22} />
                    </button>

                    <button
                      onClick={() => handleSavePost(post._id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 transition"
                    >
                      <Bookmark size={22} />
                    </button>
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
                    <div className="px-4 py-3 border-b border-gray-100">
                      {!expandedComments[post._id] && post.comments.length > 2 && (
                        <button
                          onClick={() =>
                            setExpandedComments(prev => ({
                              ...prev,
                              [post._id]: true
                            }))
                          }
                          className="text-sm text-gray-500 hover:text-gray-700 mb-3 font-medium"
                        >
                          View all {post.commentCount} comments
                        </button>
                      )}

                      <div className="space-y-2">
                        {(expandedComments[post._id]
                          ? post.comments
                          : post.comments.slice(-2)
                        ).map((comment) => (
                          <div key={comment?._id || Math.random()} className="text-sm">
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex items-end gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {currentUser?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <Input
                          type="text"
                          placeholder="Add a comment..."
                          className="text-sm border border-gray-200 bg-gray-50 px-3 py-2 rounded-full placeholder-gray-500"
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
                        <button
                          onClick={() => handleAddComment(post._id)}
                          disabled={commenting[post._id] || !newComments[post._id]?.trim()}
                          className="text-blue-500 hover:text-blue-600 font-semibold text-sm px-3 py-2 disabled:opacity-50 transition"
                        >
                          {commenting[post._id] ? '...' : 'Post'}
                        </button>
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
