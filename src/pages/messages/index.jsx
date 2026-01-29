import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleBasedNavBar from '../../components/ui/RoleBasedNavBar';
import MobileAppFooter from '../../components/ui/MobileAppFooter';
import Input from '../../components/ui/Input';
import { RoleBadge } from '../../components/ui/Badge';

const Messages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/messages');
      const json = await res.json();
      const conversations = Array.isArray(json?.items) ? json.items : [];
      setConversations(conversations);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load messages');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Now';
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(diff / 1000 / 60 / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col md:flex-row pb-16 md:pb-0">
      <RoleBasedNavBar userRole="tenant" isAuthenticated={true} />
      
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-white md:mt-20">
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

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 flex items-start gap-3 bg-red-50 border-b border-red-200 m-3 rounded-lg"
          >
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-semibold">Error Loading Messages</p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-600">Loading messages...</p>
            </div>
          </div>
        )}

        {/* Conversations List */}
        {!loading && (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <p className="text-sm">{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredConversations.map((conv, idx) => (
                  <motion.button
                    key={conv.id || conv._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      setSelectedConversation(conv);
                      navigate(`/messages/${conv.id || conv._id}`);
                    }}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    className={`w-full p-4 text-left transition-all border-b border-gray-50 last:border-b-0 ${
                      selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {conv.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm text-gray-900 truncate">{conv.name || 'Unknown'}</p>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{formatTime(conv.time)}</span>
                        </div>
                        <p className="text-xs text-gray-600 truncate mb-1">{conv.lastMessage || 'No messages yet'}</p>
                        <div className="flex items-center gap-2">
                          {conv.status && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                              {conv.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

      {/* Empty State for Desktop */}
      <div className="hidden md:flex flex-1 items-center justify-center text-gray-500 flex-col">
        <div className="text-center">
          <div className="mb-4 text-5xl">💬</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-sm text-gray-600">Choose a conversation from the list to start messaging</p>
        </div>
      </div>

      <MobileAppFooter userRole="tenant" showOnDesktop />
    </div>
  );
};

export default Messages;
