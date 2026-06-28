
import pool from '../db';

export class CampaignService {
    // --- CAMPAIGNS ---

    static async getCampaigns(filters: { status?: string; channel?: string; type?: string } = {}) {
        let query = `
            SELECT c.*, p.first_name as creator_first_name, p.last_name as creator_last_name
            FROM campaigns c
            LEFT JOIN profiles p ON c.created_by = p.id
        `;

        const conditions: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (filters.status) {
            conditions.push(`c.status = $${idx++}`);
            values.push(filters.status);
        }
        if (filters.channel) {
            conditions.push(`c.channel = $${idx++}`);
            values.push(filters.channel);
        }
        if (filters.type) {
            conditions.push(`c.campaign_type = $${idx++}`);
            values.push(filters.type);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY c.created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows.map((row: any) => ({
            ...row,
            creator: row.created_by ? {
                first_name: row.creator_first_name,
                last_name: row.creator_last_name
            } : undefined
        }));
    }

    static async getCampaignById(id: string) {
        const query = `
            SELECT c.*, p.first_name as creator_first_name, p.last_name as creator_last_name
            FROM campaigns c
            LEFT JOIN profiles p ON c.created_by = p.id
            WHERE c.id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            ...row,
            creator: row.created_by ? {
                first_name: row.creator_first_name,
                last_name: row.creator_last_name
            } : undefined
        };
    }

    static async createCampaign(data: any) {
        const query = `
            INSERT INTO campaigns (
                name, description, channel, campaign_type, status,
                subject, message, target_type, filters, send_type,
                scheduled_at, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        const values = [
            data.name,
            data.description,
            data.channel,
            data.campaign_type || 'general',
            data.status || 'draft',
            data.subject,
            data.message || data.content, // Frontend might send 'content'
            data.target_type || 'manual',
            data.filters || {},
            data.send_type || 'immediate',
            data.scheduled_at,
            data.created_by
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async updateCampaign(id: string, updates: any) {
        const keys = Object.keys(updates).filter(k =>
            ['name', 'description', 'status', 'subject', 'message', 'content', 'scheduled_at', 'filters', 'target_type', 'send_type'].includes(k)
        );

        if (keys.length === 0) return null;

        // Map 'content' to 'message' if present
        if (updates.content) {
            updates.message = updates.content;
            if (!keys.includes('message')) keys.push('message');
            // Remove 'content' from keys if checking against columns directly, but helper logic simpler:
        }

        // Filter valid columns again
        const validColumns = ['name', 'description', 'status', 'subject', 'message', 'scheduled_at', 'filters', 'target_type', 'send_type'];
        const finalKeys = keys.filter(k => validColumns.includes(k));

        if (finalKeys.length === 0) return null;

        const setClause = finalKeys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
        const values = [id, ...finalKeys.map(k => updates[k])];

        const query = `UPDATE campaigns SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async deleteCampaign(id: string) {
        await pool.query('DELETE FROM campaigns WHERE id = $1', [id]);
        return true;
    }

    static async getCampaignStats() {
        const query = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'draft') as draft,
                COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
                COUNT(*) FILTER (WHERE status = 'sending') as sending,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
            FROM campaigns
        `;
        const result = await pool.query(query);
        const row = result.rows[0];
        return {
            total: parseInt(row.total),
            draft: parseInt(row.draft),
            scheduled: parseInt(row.scheduled),
            sending: parseInt(row.sending),
            completed: parseInt(row.completed),
            cancelled: parseInt(row.cancelled)
        };
    }

    // --- TEMPLATES ---

    static async getTemplates(channel?: string) {
        let query = `SELECT * FROM campaign_templates WHERE is_active = true`;
        const values: any[] = [];

        if (channel) {
            query += ` AND channel = $1`;
            values.push(channel);
        }

        query += ` ORDER BY created_at DESC`;
        const result = await pool.query(query, values);
        return result.rows;
    }

    static async getTemplateById(id: string) {
        const result = await pool.query('SELECT * FROM campaign_templates WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    // --- RECIPIENTS ---

    static async getRecipients(campaignId: string) {
        const query = `
            SELECT cr.*, p.first_name, p.last_name, p.email, p.phone
            FROM campaign_recipients cr
            LEFT JOIN profiles p ON cr.patient_id = p.id
            WHERE cr.campaign_id = $1
        `;
        const result = await pool.query(query, [campaignId]);
        return result.rows.map((row: any) => ({
            ...row,
            patient: {
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                contact_number: row.phone
            }
        }));
    }

    // This is a stub for logic determining recipient count based on filters
    static async calculateRecipientCount(targetType: string, filters: any) {
        if (targetType === 'all') {
            const res = await pool.query('SELECT COUNT(*) FROM patients');
            return parseInt(res.rows[0].count);
        }
        // Basic implementation for manual/filtered
        return 0;
    }
}
