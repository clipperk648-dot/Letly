import React, { useState, useEffect } from 'react';
import { Phone, Video, Info, Send, Heart, Image as ImageIcon, Video as VideoIcon, ArrowLeft, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SocialNavBar from '../../components/ui/SocialNavBar';
import { RoleBadge } from '../../components/ui/Badge';

const SocialMessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    // Demo conversations with role information
    const demoConversations = [
      {
        id: 1,
        name: 'Sarah Johnson',
        userRole: 'landlord',
        initials: 'SJ',
        lastMessage: 'The apartment is available next month!',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        online: true,
        unread: 2,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop'
      },
      {
        id: 2,
        name: 'Mike Chen',
        userRole: 'tenant',
        initials: 'MC',
        lastMessage: 'Thanks for the details, will let you know soon',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        online: true,
        unread: 0,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop'
      },
      {
        id: 3,
        name: 'Emma Davis',
        userRole: 'landlord',
        initials: 'ED',
        lastMessage: 'When would you like to schedule a viewing?',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        online: false,
        unread: 1,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop'
      },
      {
        id: 4,
        name: 'John Smith',
        userRole: 'tenant',
        initials: 'JS',
        lastMessage: 'Looking forward to the meeting',
        timestamp: new Date(Date.now() - 1000 * 60 * 240),
        online: true,
        unread: 0,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop'
      },
    ];
    setConversations(demoConversations);
  };

  const loadMessages = async (conversationId) => {
    // Demo messages
    const demoMessages = [
      {
        id: 1,
        sender: 'Sarah Johnson',
        senderInitials: 'SJ',
        text: 'Hi! I saw your interest in the apartment',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isOwn: false,
      },
      {
        id: 2,
        sender: 'You',
        senderInitials: 'YOU',
        text: 'Yes, I am very interested! Can you tell me more about it?',
        timestamp: new Date(Date.now() - 1000 * 60 * 28),
        isOwn: true,
      },
      {
        id: 3,
        sender: 'Sarah Johnson',
        senderInitials: 'SJ',
        text: 'Of course! It\'s a 2BR, 1BA apartment in downtown area',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        isOwn: false,
      },
      {
        id: 4,
        sender: 'Sarah Johnson',
        senderInitials: 'SJ',
        text: 'The apartment is available next month!',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isOwn: false,
      },
    ];
    setMessages(demoMessages);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const msg = {
      id: messages.length + 1,
      sender: 'You',
      senderInitials: 'YOU',
      text: newMessage,
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(diff / 1000 / 60 / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-screen bg-white flex flex-col md:flex-row pb-16 md:pb-0">
      <SocialNavBar />
      {/* Conversations Sidebar - Hidden on mobile when conversation selected */}
      {!selectedConversation && (
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-white md:ml-64 md:mt-20">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 sticky top-0 z-20 bg-white">
          <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Messages
          </h1>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full rounded-full bg-gray-100 border-gray-200"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <p className="text-sm">{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <motion.button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                className={`w-full p-4 text-left transition border-b border-gray-50 last:border-b-0 ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden shadow-sm">
                      {conv.avatar ? (
                        <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                      ) : (
                        conv.initials
                      )}
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-gray-900">{conv.name}</p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{formatTime(conv.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <RoleBadge role={conv.userRole} />
                      {conv.unread > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>
      )}

      {/* Chat Area - Shown on mobile when conversation selected, always on desktop */}
      {selectedConversation && (
        <div className="w-full md:w-auto flex-1 flex flex-col bg-white relative">
          {/* Mobile Back Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedConversation(null)}
            className="md:hidden absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition z-40 bg-white"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </motion.button>
          {/* Chat Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-gray-100 p-4 flex items-center justify-between bg-white sticky top-20 z-30 shadow-sm"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-sm">
                  {selectedConversation.avatar ? (
                    <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedConversation.initials
                  )}
                </div>
                {selectedConversation.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{selectedConversation.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <RoleBadge role={selectedConversation.userRole} />
                  <p className="text-xs text-gray-500">
                    {selectedConversation.online ? '• Active now' : '• Offline'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
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
          </motion.div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50">
            {messages.length === 0 ? (
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
            ) : (
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''} max-w-xs`}>
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {msg.senderInitials}
                      </div>
                      <div>
                        {!msg.isOwn && (
                          <p className="text-xs font-semibold text-gray-600 mb-1">{msg.sender}</p>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            msg.isOwn
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white flex items-end gap-3">
            <label className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer text-gray-600 hover:text-gray-900">
              <input type="file" accept="image/*" multiple className="hidden" />
              <ImageIcon size={20} />
            </label>
            <label className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer text-gray-600 hover:text-gray-900">
              <input type="file" accept="video/*" multiple className="hidden" />
              <VideoIcon size={20} />
            </label>
            <Input
              type="text"
              placeholder="Aa"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 rounded-full bg-gray-50 border border-gray-200"
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
              disabled={!newMessage.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-blue-100 rounded-full transition text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </motion.button>
          </form>
        </div>
      )}

      {/* Empty state for desktop */}
      {!selectedConversation && (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default SocialMessagesPage;
