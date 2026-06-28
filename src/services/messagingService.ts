import api from '../lib/axios';

export interface Conversation {
    id: string;
    participant1_id: string;
    participant2_id: string;
    subject: string | null;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

export const messagingService = {
    async getConversations() {
        const { data } = await api.get<Conversation[]>('/messaging/conversations');
        return data;
    },

    async getConversationById(id: string) {
        const { data } = await api.get<Conversation>(`/messaging/conversations/${id}`);
        return data;
    },

    async createConversation(participant1Id: string, participant2Id: string, subject?: string) {
        const { data } = await api.post<Conversation>('/messaging/conversations', {
            participant1_id: participant1Id,
            participant2_id: participant2Id,
            subject
        });
        return data;
    },

    async getMessages(conversationId: string) {
        const { data } = await api.get<Message[]>('/messaging/messages', {
            params: { conversation_id: conversationId }
        });
        return data;
    },

    async sendMessage(conversationId: string, senderId: string, content: string, messageType: string = 'text') {
        const { data } = await api.post<Message>('/messaging/messages', {
            conversation_id: conversationId,
            sender_id: senderId,
            content,
            message_type: messageType
        });
        return data;
    },

    async markAsRead(messageId: string) {
        const { data } = await api.put<Message>(`/messaging/messages/${messageId}/read`);
        return data;
    },

    async markConversationAsRead(conversationId: string) {
        const { data } = await api.put<Message[]>(`/messaging/conversations/${conversationId}/read`);
        return data;
    },

    async getUnreadCount() {
        const { data } = await api.get<{ count: number }>('/messaging/unread-count');
        return data.count;
    }
};
