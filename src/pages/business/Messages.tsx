import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Phone, Video, MoreVertical, Check, CheckCheck, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { cn } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

export default function Messages() {
  const { convexUser } = useUser();
  const { toast } = useToast();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isMobileChat, setIsMobileChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversations = useQuery(
    api.messages.getConversations,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const conversationMessages = useQuery(
    api.messages.getConversation,
    convexUser && selectedContactId
      ? { user1Id: convexUser._id as any, user2Id: selectedContactId as any }
      : 'skip'
  );
  const sendMessage = useMutation(api.messages.send);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  useEffect(() => {
    if (selectedContactId && window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, [selectedContactId]);

  const handleSend = async () => {
    if (!messageText.trim() || !convexUser || !selectedContactId) return;
    try {
      await sendMessage({
        senderId: convexUser._id as any,
        receiverId: selectedContactId as any,
        content: messageText.trim(),
      });
      setMessageText('');
    } catch {
      toast('Failed to send message', 'error');
    }
  };

  const activeContact = conversations?.find((c) => (c.contact as any)?._id === selectedContactId);
  const activeName = (activeContact?.contact as any)?.name || 'Unknown';
  const activeImage = (activeContact?.contact as any)?.imageUrl;

  const filteredConversations = conversations?.filter((c) =>
    !searchQuery || ((c.contact as any)?.name as string)?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white">
      <div className={cn('w-80 border-r border-gray-100 flex flex-col bg-white shrink-0', isMobileChat ? 'hidden md:flex' : 'flex')}>
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#111111] mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search conversations..." className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/30 transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Send className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No conversations yet</p>
              <p className="text-xs text-gray-300 mt-1">Messages will appear once you connect with a model.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button key={(conv.contact as any)?._id} onClick={() => { setSelectedContactId((conv.contact as any)?._id); setIsMobileChat(true); }}
                className={cn('w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors border-l-2 text-left',
                  selectedContactId === (conv.contact as any)?._id ? 'bg-gray-50 border-[#D4AF37]' : 'border-transparent'
                )}>
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden">
                    {(conv.contact as any)?.imageUrl && <img src={(conv.contact as any).imageUrl} alt={(conv.contact as any).name} className="w-full h-full object-cover" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm text-[#111111] truncate">{(conv.contact as any)?.name || 'Unknown'}</span>
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage?.content || ''}</p>
                    {conv.unread > 0 && (
                      <span className="shrink-0 ml-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">{conv.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={cn('flex-1 flex flex-col min-w-0', !isMobileChat && !selectedContactId ? 'hidden md:flex' : 'flex')}>
        {selectedContactId ? (
          <>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <button onClick={() => { setIsMobileChat(false); setSelectedContactId(null); }} className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-[#111111]" /></button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {activeImage && <img src={activeImage} alt={activeName} className="w-full h-full object-cover" />}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#111111]">{activeName}</h3>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toast('Voice call coming soon', 'info')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Phone className="w-4.5 h-4.5 text-gray-500" /></button>
                <button onClick={() => toast('Video call coming soon', 'info')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Video className="w-4.5 h-4.5 text-gray-500" /></button>
                <button onClick={() => toast('More options coming soon', 'info')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><MoreVertical className="w-4.5 h-4.5 text-gray-500" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {(!conversationMessages || conversationMessages.length === 0) ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
                </div>
              ) : (
                conversationMessages.map((msg, index) => {
                  const isBusiness = msg.senderId === convexUser?._id;
                  return (
                    <motion.div key={msg._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                      className={cn('flex', isBusiness ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-xs px-4 py-3 text-sm leading-relaxed', isBusiness ? 'bg-[#111111] text-white rounded-2xl rounded-br-md' : 'bg-gray-100 text-[#111111] rounded-2xl rounded-bl-md')}>
                        <p>{msg.content}</p>
                        <div className={cn('flex items-center gap-1 mt-1.5', isBusiness ? 'justify-end' : 'justify-start')}>
                          <span className={cn('text-[10px]', isBusiness ? 'text-gray-400' : 'text-gray-400')}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isBusiness && <span>{msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-blue-400" /> : <Check className="w-3.5 h-3.5 text-gray-400" />}</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <input ref={inputRef} type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..." className="flex-1 px-4 py-3 bg-gray-50 rounded-xl outline-none text-sm" />
                <button onClick={handleSend} disabled={!messageText.trim()}
                  className={cn('p-3 rounded-xl transition-all', messageText.trim() ? 'bg-[#D4AF37] text-white hover:bg-[#D4AF37]/90 shadow-sm' : 'bg-gray-100 text-gray-400')}>
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-[#111111] mb-1">No conversations yet</h3>
              <p className="text-sm text-gray-500">Messages will appear once you connect with a model.</p>
            </div>
          </div>
        )}
      </div>

      <div className={cn('w-72 border-l border-gray-100 bg-white flex-col shrink-0 overflow-y-auto', selectedContactId ? 'hidden lg:flex' : 'hidden')}>
        {activeContact && (
          <div className="p-5 text-center border-b border-gray-100">
            <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden">
              {activeImage && <img src={activeImage} alt={activeName} className="w-full h-full object-cover" />}
            </div>
            <h3 className="font-bold text-[#111111] mb-0.5">{activeName}</h3>
            <p className="text-xs text-gray-400">Contact</p>
          </div>
        )}
      </div>
    </div>
  );
}
