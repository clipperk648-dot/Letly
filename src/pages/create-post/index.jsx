import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, X, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SocialNavBar from '../../components/ui/SocialNavBar';
import { createPost } from '../../services/socialService';
import { toast } from 'react-toastify';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleImageSelect = (e) => {
    try {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setImagePreview(result);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file');
      };
      reader.readAsDataURL(file);

      // For demo purposes, use a sample image URL
      // In production, you'd upload to a service like AWS S3, Cloudinary, etc.
      const sampleImages = [
        'https://images.unsplash.com/photo-1540932239986-310128078ceb?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1522029447490-c42a6b016800?w=600&h=600&fit=crop',
      ];
      const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
      setImageUrl(randomImage);
    } catch (err) {
      console.error('Error handling image:', err);
      setError('Failed to process image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!caption.trim() && !imageUrl) {
      setError('Please add a caption or image');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      const postData = {
        caption: caption.trim(),
        imageUrl: imageUrl || undefined,
        location: location.trim() || undefined,
      };

      const result = await createPost(postData);
      
      if (result?.data) {
        toast.success('Post created successfully! 🎉');
        navigate('/feed');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error?.response?.data?.error || 'Failed to create post. Please try again.');
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SocialNavBar />
      <div className="max-w-2xl mx-auto p-4 md:ml-72 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center justify-between border border-gray-100"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Create Post
            </h1>
            <p className="text-gray-500 text-sm mt-2">Share something with the community</p>
          </div>
          <motion.button
            onClick={() => navigate('/feed')}
            whileHover={{ rotate: 90, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="Close"
          >
            <X size={24} className="text-gray-600" />
          </motion.button>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3 shadow-sm"
            >
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 text-sm">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold mb-4 text-gray-900">
              Post Image
            </label>
            
            {imageUrl || imagePreview ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  src={imagePreview || imageUrl}
                  alt="Post preview"
                  className="w-full h-96 object-cover"
                  onError={() => setError('Failed to load image')}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </motion.div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
              >
                <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-700 font-semibold mb-2">Click to upload an image</p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              disabled={loading}
            />
          </div>

          {/* Caption Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold mb-3 text-gray-900">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption... Share what's on your mind, ask questions, or inspire others!"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
              rows={5}
              maxLength={2200}
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {caption.length === 0 ? 'Add a caption' : `${caption.length} characters`}
              </p>
              <p className="text-xs text-gray-400">{caption.length}/2200</p>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold mb-3 text-gray-900">
              Location <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <Input
              type="text"
              placeholder="Add location... e.g., Downtown Apartment, Beach House"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={100}
              disabled={loading}
              className="border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-2">{location.length}/100</p>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h3 className="font-semibold text-sm text-blue-900 mb-3">💡 Tips for a great post:</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>Use high-quality, clear images</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>Write engaging, descriptive captions</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>Add location for better discoverability</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>Be authentic and helpful to the community</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex gap-4">
            <Button
              type="button"
              onClick={() => navigate('/feed')}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-900 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || (!caption.trim() && !imageUrl)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" /> Creating...
                </>
              ) : (
                'Share Post'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
