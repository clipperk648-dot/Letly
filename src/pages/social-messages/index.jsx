import React, { useState, useEffect } from 'react';
import { Phone, Video, Info, Send, Search, Heart, Image as ImageIcon, Video as VideoIcon, ArrowLeft, Loader2 } from 'lucide-react';
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
    // Demo conversations
    const demoConversations = [
      {
        id: 1,
        name: 'Sarah Johnson',
        role: 'Agent',
        initials: 'SJ',
        lastMessage: 'The apartment is available next month!',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        online: true,
        unread: 2,
      },
      {
        id: 2,
        name: 'Mike Chen',
        role: 'Customer',
        initials: 'MC',
        lastMessage: 'Thanks for the details, will let you know soon',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        online: true,
        unread: 0,
      },
      {
        id: 3,
        name: 'Emma Davis',
        role: 'Agent',
        initials: 'ED',
        lastMessage: 'When would you like to schedule a viewing?',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        online: false,
        unread: 1,
      },
      {
        id: 4,
        name: 'John Smith',
        role: 'Customer',
        initials: 'JS',
        lastMessage: 'Looking forward to the meeting',
        timestamp: new Date(Date.now() - 1000 * 60 * 240),
        online: true,
        unread: 0,
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
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-white md:ml-64">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <motion.button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                className={`w-full p-4 text-left transition ${
                  selectedConversation?.id === conv.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {conv.initials}
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm">{conv.name}</p>
                      <span className="text-xs text-gray-500">{formatTime(conv.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {conv.role === 'landlord' ? 'Agent' : 'Customer'}
                      </span>
                      {conv.unread > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="hidden md:flex flex-1 flex-col bg-white">
          {/* Chat Header */}
          <div className="border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {selectedConversation.initials}
                </div>
                {selectedConversation.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <p className="font-semibold">{selectedConversation.name}</p>
                <p className="text-xs text-gray-500">
                  {selectedConversation.online ? 'Active now' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Phone size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Video size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Info size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
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
              </motion.div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 flex gap-2">
            <Input
              type="text"
              placeholder="Aa"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 hover:text-gray-800"
            >
              <Heart size={20} />
            </button>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2 hover:bg-blue-100 rounded-full transition text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default SocialMessagesPage;
