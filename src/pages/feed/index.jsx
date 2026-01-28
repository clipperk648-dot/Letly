import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPosts, likePost, unlikePost, addComment } from '../../services/socialService';
import { getProfile } from '../../services/authServices';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SocialNavBar from '../../components/ui/SocialNavBar';
import { toast } from 'react-toastify';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});

  useEffect(() => {
    fetchUserProfile();
    fetchFeed();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await getProfile();
      setCurrentUser(res.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await getPosts(0, 20, false);
      setPosts(res.data.posts);
    } catch (error) {
      console.error('Error fetching feed:', error);
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, isLiked: !isLiked, likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like post');
    }
  };

  const handleAddComment = async (postId) => {
    const text = newComments[postId];
    if (!text?.trim()) return;

    try {
      const res = await addComment(postId, text);
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data.comment]
      }));
      setNewComments(prev => ({
        ...prev,
        [postId]: ''
      }));
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getRoleLabel = (role) => {
    return role === 'landlord' ? 'Agent' : 'Customer';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <SocialNavBar />
      <div className="max-w-2xl mx-auto md:ml-72">
        {/* Feed Header */}
        <div className="border-b border-gray-200 p-4 sticky top-0 bg-white/80 backdrop-blur-sm z-40">
          <h1 className="text-2xl font-light">Homely Feed</h1>
        </div>

        {/* Posts Feed */}
        <div className="divide-y divide-gray-200">
          {posts.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-gray-600 mb-4">No posts yet. Start following users to see their posts!</p>
                <Button onClick={() => window.location.href = '/explore'}>
                  Explore
                </Button>
              </div>
            </div>
          ) : (
            posts.map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-200 last:border-b-0"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold">
                      {post.author.fullName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{post.author.fullName}</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {getRoleLabel(post.author.role)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={20} className="text-gray-600" />
                  </button>
                </div>

                {/* Post Image */}
                {post.imageUrl && (
                  <div className="w-full bg-gray-100 aspect-square">
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

                {/* Post Caption & Location */}
                <div className="p-4">
                  {post.caption && (
                    <p className="text-sm mb-2">
                      <span className="font-semibold">{post.author.fullName}</span> {post.caption}
                    </p>
                  )}
                  {post.location && (
                    <p className="text-xs text-gray-500 mb-2">📍 {post.location}</p>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 py-2 flex items-center justify-between text-gray-600 border-t border-gray-100">
                  <button
                    onClick={() => handleLike(post._id, post.isLiked)}
                    className="flex items-center gap-2 hover:text-rose-600 transition group"
                  >
                    <Heart 
                      size={20} 
                      className={post.isLiked ? 'fill-rose-600 text-rose-600' : ''}
                    />
                    <span className="text-xs">{post.likeCount}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-600 transition">
                    <MessageCircle size={20} />
                    <span className="text-xs">{post.commentCount}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-600 transition">
                    <Share2 size={20} />
                  </button>
                  <button className="hover:text-yellow-500 transition">
                    <Bookmark size={20} />
                  </button>
                </div>

                {/* Comments Section */}
                {post.commentCount > 0 && (
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                    <details className="cursor-pointer">
                      <summary className="text-xs text-gray-500 font-semibold hover:text-gray-700">
                        View all {post.commentCount} comments
                      </summary>
                      <div className="mt-3 space-y-2">
                        {comments[post._id]?.map(comment => (
                          <div key={comment._id} className="text-xs">
                            <span className="font-semibold">{comment.author.fullName}</span> {comment.text}
                            <p className="text-gray-500 mt-1">{new Date(comment.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}

                {/* Add Comment */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {currentUser?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add a comment..."
                      className="text-xs border-none bg-gray-100 px-3 py-2 rounded-full"
                      value={newComments[post._id] || ''}
                      onChange={(e) => setNewComments(prev => ({ ...prev, [post._id]: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post._id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className="text-blue-500 font-semibold text-xs hover:text-blue-700"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
