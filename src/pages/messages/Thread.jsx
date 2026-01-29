import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, Info, Send, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import RoleBasedNavBar from '../../components/ui/RoleBasedNavBar';
import MobileAppFooter from '../../components/ui/MobileAppFooter';
import { RoleBadge } from '../../components/ui/Badge';
import ChatWindow from './components/ChatWindow';

const Thread = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const convId = String(id);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConversation();
  }, [convId]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/messages');
      const json = await res.json();
      const items = Array.isArray(json?.items) ? json.items : [];
      const found = items.find(c => String(c.id) === convId || String(c._id) === convId);
      
      if (!found) {
        setError('Conversation not found');
        setConversation(null);
      } else {
        setConversation(found);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
      setConversation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (message) => {
    setConversation(prev => {
      if (!prev) return prev;
      const messages = Array.isArray(prev.messages) ? prev.messages : [];
      return {
        ...prev,
        messages: [...messages, message],
        lastMessage: message.text || (message.images?.length ? 'Image' : 'Video'),
        time: 'Now'
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
        <RoleBasedNavBar userRole="tenant" isAuthenticated={true} />
        <div className="flex-1 flex items-center justify-center mt-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading conversation...</p>
          </div>
        </div>
        <MobileAppFooter userRole="tenant" showOnDesktop />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
        <RoleBasedNavBar userRole="tenant" isAuthenticated={true} />
        <div className="flex-1 flex items-center justify-center mt-20 px-4">
          <div className="text-center bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Conversation</h2>
            <p className="text-gray-600 mb-6">{error || 'Conversation not found'}</p>
            <button
              onClick={() => navigate('/messages')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Back to Messages
            </button>
          </div>
        </div>
        <MobileAppFooter userRole="tenant" showOnDesktop />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col pb-16 md:pb-0">
      <RoleBasedNavBar userRole="tenant" isAuthenticated={true} />

      <div className="flex-1 flex flex-col mt-20">
        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-gray-100 p-4 md:p-6 bg-white sticky top-20 z-30 shadow-sm"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/messages')}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {conversation.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900">{conversation.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">
                  {conversation.status || 'Active now'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
                title="Start call"
              >
                <Phone size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
                title="Start video call"
              >
                <Video size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
                title="Conversation info"
              >
                <Info size={20} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <ChatWindow conversation={conversation} onSend={handleSend} />
          </div>
        </div>
      </div>

      <MobileAppFooter userRole="tenant" />
    </div>
  );
};

export default Thread;
