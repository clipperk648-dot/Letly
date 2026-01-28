import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPosts } from '../../services/socialService';
import SocialNavBar from '../../components/ui/SocialNavBar';
import Button from '../../components/ui/Button';
import { RoleBadge } from '../../components/ui/Badge';
import { toast } from 'react-toastify';

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPosts(0, 60, true);
      
      if (res?.data?.posts && Array.isArray(res.data.posts)) {
        // Sort by likes to get trending
        const sorted = res.data.posts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
        setPosts(sorted);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      setError('Failed to load trending posts. Please try again.');
      setPosts([]);
      toast.error('Failed to load trending posts');
    } finally {
      setLoading(false);
    }
  };

  const PostModal = ({ post, onClose }) => {
    if (!post) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            {post.imageUrl && (
              <div className="bg-black aspect-square hidden md:block overflow-hidden">
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

            {/* Post Details */}
            <div className="p-6 flex flex-col">
              {/* Header */}
              <div className="pb-4 border-b border-gray-200 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {post?.author?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {post?.author?.fullName || 'Unknown'}
                    </p>
                    <RoleBadge role={post?.author?.role} />
                  </div>
                </div>
              </div>

              {/* Caption & Location */}
              <div className="py-4 flex-1 overflow-auto">
                {post.caption && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-900 leading-relaxed">{post.caption}</p>
                  </div>
                )}
                {post.location && (
                  <div className="text-xs text-gray-600 font-medium">
                    📍 {post.location}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="py-2">
                    <p className="text-2xl font-bold text-gray-900">{post.likeCount || 0}</p>
                    <p className="text-xs text-gray-600 flex items-center justify-center gap-1 mt-1">
                      <Heart size={14} /> Likes
                    </p>
                  </div>
                  <div className="py-2 border-l border-r border-gray-200">
                    <p className="text-2xl font-bold text-gray-900">{post.commentCount || 0}</p>
                    <p className="text-xs text-gray-600 flex items-center justify-center gap-1 mt-1">
                      <MessageCircle size={14} /> Comments
                    </p>
                  </div>
                  <div className="py-2">
                    <p className="text-2xl font-bold text-gray-900">∞</p>
                    <p className="text-xs text-gray-600 flex items-center justify-center gap-1 mt-1">
                      <Eye size={14} /> Views
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SocialNavBar />
        <div className="max-w-6xl mx-auto p-4 md:ml-72 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Posts</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchTrendingPosts}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SocialNavBar />
        <div className="max-w-6xl mx-auto p-4 md:ml-72 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading trending posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SocialNavBar />
      
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-40 md:ml-72">
        <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
        <p className="text-sm text-gray-600">Discover trending posts from the community</p>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto p-4 md:ml-72">
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20 bg-white rounded-lg"
          >
            <div className="text-center">
              <div className="mb-4 text-5xl">🌍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts to explore yet</h3>
              <p className="text-gray-600">Be the first to share something with the community!</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.button
                  key={post?._id || index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedPost(post)}
                  className="aspect-square bg-gray-100 cursor-pointer group relative overflow-hidden rounded-lg transition hover:shadow-lg"
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-4">
                    <div className="text-white text-center">
                      <Heart size={20} className="fill-white mx-auto mb-1" />
                      <p className="text-xs font-semibold">{post.likeCount || 0}</p>
                    </div>
                    <div className="text-white text-center">
                      <MessageCircle size={20} className="mx-auto mb-1" />
                      <p className="text-xs font-semibold">{post.commentCount || 0}</p>
                    </div>
                  </div>

                  {/* No Image Fallback */}
                  {!post.imageUrl && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100 p-2">
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-700 line-clamp-2">
                          {post.caption?.substring(0, 40)}...
                        </p>
                      </div>
                    </div>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default ExplorePage;
