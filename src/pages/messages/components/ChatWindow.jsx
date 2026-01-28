import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import MessageBubble from './MessageBubble';
import Input from '../../../components/ui/Input';

const ChatWindow = ({ conversation, onSend }) => {
  const [text, setText] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // scroll to bottom when conversation changes
    scrollToBottom();
  }, [conversation?.messages]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(p => URL.revokeObjectURL(p));
      videoPreviews.forEach(p => URL.revokeObjectURL(p));
    };
  }, [imagePreviews, videoPreviews]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map(f => URL.createObjectURL(f));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map(f => URL.createObjectURL(f));
    setVideoFiles(prev => [...prev, ...files]);
    setVideoPreviews(prev => [...prev, ...previews]);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text && imageFiles.length === 0 && videoFiles.length === 0) return;

    const now = new Date();
    const message = {
      id: Date.now(),
      sender: 'You',
      avatar: '',
      text: text || '',
      images: imagePreviews,
      videos: videoPreviews,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onSend(message);
    setText('');
    setImageFiles([]);
    setVideoFiles([]);
    setImagePreviews([]);
    setVideoPreviews([]);

    // scroll after a tick
    setTimeout(() => scrollToBottom(), 100);
  };

  if (!conversation) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 flex items-center justify-center h-80">
        <div className="text-center text-muted-foreground">
          <div className="mb-2">Select a conversation to start chatting</div>
          <div className="text-sm">
            Conversations are private between you and the other party.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-300px)] md:h-[calc(100vh-180px)] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-gray-50">
        <AnimatePresence>
          {conversation.messages && conversation.messages.length > 0 ? (
            conversation.messages.map((msg, idx) => (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <MessageBubble message={{...msg, avatar: conversation.avatar}} isOwn={msg.sender === 'You'} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full text-gray-500"
            >
              <div className="text-center">
                <div className="mb-3 text-4xl">💬</div>
                <p className="font-medium">Start a conversation</p>
                <p className="text-sm mt-1">Say hello to begin messaging</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Previews */}
      <AnimatePresence>
        {(imagePreviews.length > 0 || videoPreviews.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-6 pb-2 flex gap-2 overflow-x-auto border-t border-gray-100"
          >
            {imagePreviews.map((src, i) => (
              <motion.div key={src + i} layoutId={`preview-${i}`} className="relative flex-shrink-0">
                <img src={src} className="w-20 h-20 object-cover rounded-lg" alt={`preview-${i}`} />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition"
                >
                  ×
                </button>
              </motion.div>
            ))}
            {videoPreviews.map((src, i) => (
              <motion.div key={src + i} layoutId={`video-${i}`} className="relative flex-shrink-0">
                <video src={src} className="w-20 h-20 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => {
                    setVideoPreviews(prev => prev.filter((_, idx) => idx !== i));
                    setVideoFiles(prev => prev.filter((_, idx) => idx !== i));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-3">
          <label className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer text-gray-600 hover:text-gray-900">
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            <ImageIcon size={20} />
          </label>
          <label className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer text-gray-600 hover:text-gray-900">
            <input type="file" accept="video/*" multiple onChange={handleVideoChange} className="hidden" />
            <VideoIcon size={20} />
          </label>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Aa"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 placeholder-gray-400"
          />

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 hover:text-gray-900"
          >
            <Heart size={20} />
          </motion.button>

          <motion.button
            type="submit"
            disabled={!text.trim() && imageFiles.length === 0 && videoFiles.length === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-blue-100 rounded-full transition text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
