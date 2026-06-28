import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../contexts/ToastContext';
import { messagingService, type Message } from '../../../services/messagingService';
import { MessageCircle, Send, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Messaging() {
    const { user } = useAuthStore();
    const toast = useToast();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await messagingService.getConversations();
            setConversations(data);
        } catch (error: any) {
            console.error('Error loading conversations:', error);
            toast.error('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (conversationId: string) => {
        if (!user || !conversationId) return;

        try {
            const data = await messagingService.getMessages(conversationId);
            setMessages(data);

            // Mark conversation as read
            await messagingService.markConversationAsRead(conversationId);
            loadConversations(); // Refresh to update unread count
        } catch (error: any) {
            console.error('Error loading messages:', error);
            toast.error('Failed to load messages');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !selectedConversation) return;

        try {
            setSending(true);
            await messagingService.sendMessage(
                selectedConversation.id,
                user.id,
                newMessage.trim()
            );

            setNewMessage('');
            loadMessages(selectedConversation.id);
        } catch (error: any) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (!user) {
        return <div>Please log in to access messaging</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <MessageCircle className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                </div>
                <p className="text-gray-600">Communicate with your healthcare providers</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: '600px' }}>
                <div className="flex h-full">
                    {/* Conversations List */}
                    <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="font-bold text-gray-900">Conversations</h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No conversations yet</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Messages with your doctors will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {conversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`w-full p-4 text-left hover:bg-blue-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        Dr. {conv.partner?.first_name} {conv.partner?.last_name}
                                                    </h3>
                                                    {conv.unread_count > 0 && (
                                                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                            {conv.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {conv.last_message?.message_text}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {format(new Date(conv.last_message?.created_at), 'MMM d, h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">
                                                Dr. {selectedConversation.partner?.first_name}{' '}
                                                {selectedConversation.partner?.last_name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {selectedConversation.partner?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    {messages.map((msg) => {
                                        const isMe = msg.sender_id === user.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-gray-900 border border-gray-200'
                                                        }`}
                                                >
                                                    <p className="text-sm">{msg.content}</p>
                                                    <div
                                                        className={`flex items-center gap-1 mt-1 text-xs ${isMe ? 'text-blue-100' : 'text-gray-500'
                                                            }`}
                                                    >
                                                        <Clock className="w-3 h-3" />
                                                        <span>{format(new Date(msg.created_at), 'h:mm a')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <Send className="w-5 h-5" />
                                            Send
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">Select a conversation</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Choose a doctor from the list to start messaging
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
