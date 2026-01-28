import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, X, Loader } from 'lucide-react';
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
  const fileInputRef = React.useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result || '');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!caption.trim() && !imageUrl) {
      toast.error('Please add a caption or image');
      return;
    }

    try {
      setLoading(true);
      await createPost({
        caption: caption.trim(),
        imageUrl: imageUrl || undefined,
        location: location.trim() || undefined,
      });
      toast.success('Post created successfully!');
      navigate('/feed');
    } catch (error) {
      console.error('Error creating post:', error);
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
    <div className="min-h-screen bg-white">
      <SocialNavBar />
      <div className="max-w-2xl mx-auto p-4 md:ml-64">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Create Post</h1>
            <button
              onClick={() => navigate('/feed')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div>
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
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </motion.div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition group"
              >
                <ImageIcon size={48} className="mx-auto text-gray-400 mb-3 group-hover:text-gray-600 transition" />
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
            />
          </div>

          {/* Caption Section */}
          <div>
            <label className="block text-sm font-semibold mb-2">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption... You can mention roles like Agent, Customer, etc."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              maxLength={2200}
            />
            <p className="text-xs text-gray-500 mt-1">{caption.length}/2200</p>
          </div>

          {/* Location Section */}
          <div>
            <label className="block text-sm font-semibold mb-2">Location (Optional)</label>
            <Input
              type="text"
              placeholder="Add location... e.g., Downtown Apartment, Beach House"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-blue-900 mb-2">Tips for a great post:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Use high-quality images</li>
              <li>✓ Write engaging captions</li>
              <li>✓ Add location for better visibility</li>
              <li>✓ Use relevant hashtags in your caption</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/feed')}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || (!caption.trim() && !imageUrl)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? (
                <>
                  <Loader size={18} className="mr-2 animate-spin" /> Creating...
                </>
              ) : (
                'Create Post'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
