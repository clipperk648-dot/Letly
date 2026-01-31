import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, Search, Users, Heart, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleBasedNavBar from '../../components/ui/RoleBasedNavBar';
import MobileAppFooter from '../../components/ui/MobileAppFooter';
import Input from '../../components/ui/Input';
import { RoleBadge } from '../../components/ui/Badge';
import ChatWindow from './components/ChatWindow';

// TODO: Replace with API call to fetch community channels
const mockCommunityChannels = [];

const MessageBubbleWithRole = ({ message, isOwn }) => {
  const roleColor = message.role === 'landlord' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200';
  const roleBg = message.role === 'landlord' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800';

  return (
    <motion.div
      initial={{ opacity: 0, x: isOwn ? 10 : -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-xs px-4 py-3 rounded-xl border ${isOwn ? 'bg-blue-500 text-white border-blue-600' : roleColor}`}>
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900">{message.sender}</span>
            {message.role && (
              <RoleBadge role={message.role} />
            )}
          </div>
        )}
        <p className={`text-sm ${isOwn ? '' : 'text-gray-900'}`}>{message.text}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>{message.time}</p>
      </div>
    </motion.div>
  );
};

const CommunityMessages = () => {
  const navigate = useNavigate();
  const { channelId } = useParams();
  const [channels, setChannels] = useState(mockCommunityChannels);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    // Load channels
    if (channels.length > 0) {
      const channel = channelId 
        ? channels.find(c => c.id === channelId) 
        : channels[0];
      setSelectedChannel(channel || channels[0]);
    }
  }, [channelId, channels]);

  const filteredChannels = channels.filter(ch =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChannel) return;

    const newMessage = {
      id: Date.now(),
      sender: 'You',
      role: localStorage.getItem('userRole') || 'tenant',
      text: messageText,
      time: 'now',
      avatar: ''
    };

    setSelectedChannel(prev => ({
      ...prev,
      messages: [...(prev.messages || []), newMessage],
      lastMessage: messageText
    }));
    setMessageText('');
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col md:flex-row pb-16 md:pb-0">
      <RoleBasedNavBar isAuthenticated={true} />
      
      {/* Channels Sidebar */}
      <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-white md:mt-20">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 sticky top-0 z-20 bg-white">
          <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Community
          </h1>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <Input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full rounded-full bg-gray-100 border-gray-200"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 flex items-start gap-3 bg-red-50 border-b border-red-200 m-3 rounded-lg"
          >
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-semibold">Error Loading Channels</p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filteredChannels.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <p className="text-sm">{searchQuery ? 'No channels found' : 'No channels available'}</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredChannels.map((channel, idx) => (
                <motion.button
                  key={channel.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedChannel(channel);
                    navigate(`/community-messages/${channel.id}`);
                  }}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  className={`w-full p-4 text-left transition-all border-b border-gray-50 last:border-b-0 ${
                    selectedChannel?.id === channel.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {channel.avatar}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm text-gray-900 truncate">{channel.name}</p>
                      </div>
                      <p className="text-xs text-gray-600 truncate mb-1">{channel.description}</p>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-500" />
                        <span className="text-xs text-gray-500">{channel.participants} members</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="hidden md:flex flex-1 flex-col">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-gray-100 p-4 md:p-6 bg-white sticky top-20 z-30 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{selectedChannel.avatar}</div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900">{selectedChannel.name}</p>
                    <p className="text-sm text-gray-600">{selectedChannel.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                  <Users size={16} className="text-gray-600" />
                  <span className="text-sm text-gray-600">{selectedChannel.participants}</span>
                </div>
              </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-gray-50">
              <AnimatePresence>
                {selectedChannel.messages && selectedChannel.messages.length > 0 ? (
                  selectedChannel.messages.map((msg, idx) => (
                    <MessageBubbleWithRole
                      key={msg.id || idx}
                      message={msg}
                      isOwn={msg.sender === 'You'}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center h-full text-gray-500"
                  >
                    <div className="text-center">
                      <div className="mb-3 text-4xl">💬</div>
                      <p className="font-medium">Be the first to start a conversation</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Composer */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-end gap-3">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Share something with the community..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 placeholder-gray-400"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="p-2 hover:bg-blue-100 rounded-full transition text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  <MessageCircle size={20} />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center text-gray-500">
              <div className="mb-4 text-5xl">💬</div>
              <p className="text-lg font-semibold">Select a channel to start</p>
            </div>
          </div>
        )}
      </div>

      <MobileAppFooter showOnDesktop />
    </div>
  );
};

export default CommunityMessages;
