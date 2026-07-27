/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Send,
  Smile,
  Paperclip,
  Image,
  Phone,
  Video,
  MoreVertical,
  Star,
  Calendar,
  FileText,
  ArrowLeft,
  Check,
  CheckCheck,
} from 'lucide-react';
import { conversations, chatMessages } from '../../data/businessData';
import { cn } from '../../lib/utils';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [localMessages, setLocalMessages] = useState(chatMessages);
  const [isMobileChat, setIsMobileChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find((c) => c.id === selectedConversation);

  const conversationMessages = localMessages.filter(
    (m) => m.conversationId === selectedConversation
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length, isTyping]);

  useEffect(() => {
    if (selectedConversation && window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation,
      sender: 'business' as const,
      text: messageText.trim(),
      time: new Date().toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: false,
    };

    setLocalMessages((prev) => [...prev, newMessage]);
    setMessageText('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const modelReply = {
        id: `msg-${Date.now() + 1}`,
        conversationId: selectedConversation,
        sender: 'model' as const,
        text: 'Thanks for reaching out! I will get back to you shortly.',
        time: new Date().toLocaleTimeString('en-NG', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        read: true,
      };
      setLocalMessages((prev) => [...prev, modelReply]);
    }, 2000);
  };

  const handleConversationSelect = (id: string) => {
    setSelectedConversation(id);
    setIsMobileChat(true);
  };

  const handleBackToList = () => {
    setIsMobileChat(false);
    setSelectedConversation(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white">
      {/* Left Panel - Conversation List */}
      <div
        className={cn(
          'w-80 border-r border-gray-100 flex flex-col bg-white shrink-0',
          isMobileChat ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#111111] mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/30 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleConversationSelect(conversation.id)}
              className={cn(
                'w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors border-l-2 text-left',
                selectedConversation === conversation.id
                  ? 'bg-gray-50 border-[#D4AF37]'
                  : 'border-transparent'
              )}
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden">
                  {conversation.modelImage && (
                    <img
                      src={conversation.modelImage}
                      alt={conversation.modelName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {conversation.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-sm text-[#111111] truncate">
                    {conversation.modelName}
                  </span>
                  <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                    {conversation.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                  {conversation.unread && conversation.unread > 0 && (
                    <span className="shrink-0 ml-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center Panel - Chat Window */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0',
          !isMobileChat && !selectedConversation ? 'hidden md:flex' : 'flex'
        )}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToList}
                  className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#111111]" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {activeConversation?.modelImage && (
                      <img
                        src={activeConversation.modelImage}
                        alt={activeConversation.modelName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {activeConversation?.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#111111]">
                    {activeConversation?.modelName}
                  </h3>
                  <span className="text-[11px] text-green-500 font-medium">Online</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Phone className="w-4.5 h-4.5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Video className="w-4.5 h-4.5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-4.5 h-4.5 text-gray-500" />
                </button>
              </div>
            </motion.div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                  Today
                </span>
              </div>

              {conversationMessages.map((message, index) => {
                const isBusiness = message.sender === 'business';
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn('flex', isBusiness ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-xs px-4 py-3 text-sm leading-relaxed',
                        isBusiness
                          ? 'bg-[#111111] text-white rounded-2xl rounded-br-md'
                          : 'bg-gray-100 text-[#111111] rounded-2xl rounded-bl-md'
                      )}
                    >
                      <p>{message.text}</p>
                      <div
                        className={cn(
                          'flex items-center gap-1 mt-1.5',
                          isBusiness ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <span
                          className={cn(
                            'text-[10px]',
                            isBusiness ? 'text-gray-400' : 'text-gray-400'
                          )}
                        >
                          {message.time}
                        </span>
                        {isBusiness && (
                          <span>
                            {message.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-5 py-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Smile className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Image className="w-5 h-5 text-gray-400" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-xl outline-none text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className={cn(
                    'p-3 rounded-xl transition-all',
                    messageText.trim()
                      ? 'bg-[#D4AF37] text-white hover:bg-[#D4AF37]/90 shadow-sm'
                      : 'bg-gray-100 text-gray-400'
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-[#111111] mb-1">Select a conversation</h3>
              <p className="text-sm text-gray-500">Choose a model to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Model Profile & Details */}
      <div
        className={cn(
          'w-72 border-l border-gray-100 bg-white flex-col shrink-0 overflow-y-auto',
          selectedConversation ? 'hidden lg:flex' : 'hidden'
        )}
      >
        {activeConversation && (
          <motion.div
            key={activeConversation.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Model Profile Card */}
            <div className="p-5 text-center border-b border-gray-100">
              <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden">
                {activeConversation.modelImage && (
                  <img
                    src={activeConversation.modelImage}
                    alt={activeConversation.modelName}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h3 className="font-bold text-[#111111] mb-0.5">{activeConversation.modelName}</h3>
              <p className="text-xs text-gray-500 mb-1">Fashion Model</p>
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#111111]">4.9</span>
                <span className="text-xs text-gray-400">(127 reviews)</span>
              </div>
              <p className="text-[11px] text-gray-400">Lagos, Nigeria</p>
            </div>

            {/* Upcoming Jobs */}
            <div className="p-5 border-b border-gray-100">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Upcoming Jobs
              </h4>
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">
                      Fashion Shoot
                    </p>
                    <p className="text-xs text-gray-500">Aug 15, 2026 - 10:00 AM</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shared Files */}
            <div className="p-5 border-b border-gray-100">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Shared Files
              </h4>
              <div className="space-y-2.5">
                {[
                  { name: 'portfolio_lookbook.pdf', size: '2.4 MB' },
                  { name: 'brand_guidelines.pdf', size: '1.1 MB' },
                  { name: 'contract_draft.pdf', size: '890 KB' },
                ].map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#111111] truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-400">{file.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-5">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Quick Actions
              </h4>
              <div className="space-y-2">
                <button className="w-full py-2.5 bg-[#D4AF37] text-white text-sm font-semibold rounded-xl hover:bg-[#D4AF37]/90 transition-colors">
                  Invite to Job
                </button>
                <button className="w-full py-2.5 bg-gray-50 text-[#111111] text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                  View Full Profile
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
