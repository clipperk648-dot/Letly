import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPosts } from '../../services/socialService';
import SocialNavBar from '../../components/ui/SocialNavBar';
import { toast } from 'react-toastify';

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      const res = await getPosts(0, 60, true);
      // Sort by likes to get trending
      const sorted = res.data.posts.sort((a, b) => b.likeCount - a.likeCount);
      setPosts(sorted);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      toast.error('Failed to load trending posts');
    } finally {
      setLoading(false);
    }
  };

  const PostModal = ({ post, onClose }) => {
    if (!post) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            {post.imageUrl && (
              <div className="bg-black aspect-square hidden md:block">
                <img 
                  src={post.imageUrl} 
                  alt="Post" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Post Details */}
            <div className="p-6 flex flex-col">
              {/* Header */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold">
                    {post.author.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{post.author.fullName}</p>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {post.author.role === 'landlord' ? 'Agent' : 'Customer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div className="py-4 flex-1 overflow-auto">
                {post.caption && (
                  <div className="mb-4">
                    <p className="text-sm">{post.caption}</p>
                  </div>
                )}
                {post.location && (
                  <div className="text-xs text-gray-600">
                    📍 {post.location}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold">{post.likeCount}</p>
                    <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <Heart size={14} /> Likes
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{post.commentCount}</p>
                    <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <MessageCircle size={14} /> Comments
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">∞</p>
                    <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <Eye size={14} /> Views
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-black py-2 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading trending posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <SocialNavBar />
      {/* Header */}
      <div className="border-b border-gray-200 p-4 sticky top-0 bg-white/80 backdrop-blur-sm z-40 md:ml-64">
        <h1 className="text-2xl font-light">Explore</h1>
        <p className="text-sm text-gray-600">Discover trending posts from our community</p>
      </div>

      {/* Posts Grid */}
      <div className="max-w-6xl mx-auto p-2 md:p-4 md:ml-64">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-gray-600">No posts to explore yet. Be the first to post!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2">
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPost(post)}
                className="aspect-square bg-gray-100 cursor-pointer group relative overflow-hidden rounded-lg"
              >
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt="Post" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-6">
                  <div className="text-white text-center">
                    <Heart size={24} className="fill-white mx-auto mb-2" />
                    <p className="text-sm font-semibold">{post.likeCount}</p>
                  </div>
                  <div className="text-white text-center">
                    <MessageCircle size={24} className="mx-auto mb-2" />
                    <p className="text-sm font-semibold">{post.commentCount}</p>
                  </div>
                </div>

                {/* No Image Fallback */}
                {!post.imageUrl && (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700 px-2">{post.caption?.substring(0, 30)}...</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  );
};

export default ExplorePage;
