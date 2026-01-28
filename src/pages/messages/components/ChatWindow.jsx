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
    <div className="flex flex-col h-[70vh] md:h-[75vh] bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src={conversation.avatar} alt={conversation.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-semibold">{conversation.name}</div>
            <div className="text-xs text-muted-foreground">{conversation?.status || 'Online'}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => alert('Start video call (mock)')}>Video</Button>
          <Button variant="ghost" size="sm" onClick={() => alert('More options (mock)')}>More</Button>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {conversation.messages?.map(msg => (
          <MessageBubble key={msg.id} message={{...msg, avatar: conversation.avatar}} isOwn={msg.sender === 'You'} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-white">
        { (imagePreviews.length > 0 || videoPreviews.length > 0) && (
          <div className="mb-2 flex gap-2 overflow-x-auto">
            {imagePreviews.map((src, i) => <img key={src + i} src={src} className="w-24 h-16 object-cover rounded" alt={`preview-${i}`} />)}
            {videoPreviews.map((src, i) => <video key={src + i} src={src} className="w-36 h-20 object-cover rounded" controls />)}
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="p-2 rounded-md bg-muted cursor-pointer">
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            <Icon name="Image" size={18} />
          </label>
          <label className="p-2 rounded-md bg-muted cursor-pointer">
            <input type="file" accept="video/*" multiple onChange={handleVideoChange} className="hidden" />
            <Icon name="Camera" size={18} />
          </label>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-border px-3 py-2"
          />

          <Button type="submit" variant="default">Send</Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
