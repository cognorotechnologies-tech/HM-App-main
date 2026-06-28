import pool from '../db';

export class MessagingService {
    static async getConversations(userId: string) {
        const query = `
            SELECT DISTINCT c.*,
                   p1.first_name as participant1_first_name,
                   p1.last_name as participant1_last_name,
                   p2.first_name as participant2_first_name,
                   p2.last_name as participant2_last_name,
                   (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at
            FROM conversations c
            INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
            LEFT JOIN profiles p1 ON c.participant1_id = p1.id
            LEFT JOIN profiles p2 ON c.participant2_id = p2.id
            WHERE cp.user_id = $1
            ORDER BY last_message_at DESC NULLS LAST
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async getConversationById(id: string) {
        const query = `
            SELECT c.*,
                   p1.first_name as participant1_first_name,
                   p1.last_name as participant1_last_name,
                   p2.first_name as participant2_first_name,
                   p2.last_name as participant2_last_name
            FROM conversations c
            LEFT JOIN profiles p1 ON c.participant1_id = p1.id
            LEFT JOIN profiles p2 ON c.participant2_id = p2.id
            WHERE c.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async createConversation(data: {
        participant1_id: string;
        participant2_id: string;
        subject?: string;
    }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create conversation
            const convResult = await client.query(
                `INSERT INTO conversations (participant1_id, participant2_id, subject)
                VALUES ($1, $2, $3)
                RETURNING *`,
                [data.participant1_id, data.participant2_id, data.subject || null]
            );

            const conversation = convResult.rows[0];

            // Add participants
            await client.query(
                `INSERT INTO conversation_participants (conversation_id, user_id)
                VALUES ($1, $2), ($1, $3)`,
                [conversation.id, data.participant1_id, data.participant2_id]
            );

            await client.query('COMMIT');
            return conversation;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async getMessages(conversationId: string) {
        const query = `
            SELECT m.*,
                   p.first_name as sender_first_name,
                   p.last_name as sender_last_name,
                   p.avatar_url as sender_avatar
            FROM messages m
            LEFT JOIN profiles p ON m.sender_id = p.id
            WHERE m.conversation_id = $1
            ORDER BY m.created_at ASC
        `;
        const result = await pool.query(query, [conversationId]);
        return result.rows;
    }

    static async sendMessage(data: {
        conversation_id: string;
        sender_id: string;
        content: string;
        message_type?: string;
    }) {
        const result = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, content, message_type, is_read)
            VALUES ($1, $2, $3, $4, false)
            RETURNING *`,
            [data.conversation_id, data.sender_id, data.content, data.message_type || 'text']
        );
        return result.rows[0];
    }

    static async markAsRead(messageId: string) {
        const result = await pool.query(
            `UPDATE messages SET is_read = true, read_at = NOW() WHERE id = $1 RETURNING *`,
            [messageId]
        );
        return result.rows[0];
    }

    static async markConversationAsRead(conversationId: string, userId: string) {
        const result = await pool.query(
            `UPDATE messages 
            SET is_read = true, read_at = NOW() 
            WHERE conversation_id = $1 
            AND sender_id != $2 
            AND is_read = false
            RETURNING *`,
            [conversationId, userId]
        );
        return result.rows;
    }

    static async getUnreadCount(userId: string) {
        const result = await pool.query(
            `SELECT COUNT(*) as count
            FROM messages m
            INNER JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE cp.user_id = $1
            AND m.sender_id != $1
            AND m.is_read = false`,
            [userId]
        );
        return parseInt(result.rows[0].count);
    }
}
