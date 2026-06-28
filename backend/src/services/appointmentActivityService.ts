// @ts-nocheck
// Appointment Activity Log Service
import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'hm_app_db',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

interface AppointmentActivity {
    id: number;
    appointment_id: string;
    user_id: number | null;
    action_type: string;
    action_description: string | null;
    old_values: any;
    new_values: any;
    ip_address: string | null;
    user_agent: string | null;
    created_at: Date;
}

interface CreateActivityParams {
    appointment_id: string;
    user_id: number;
    action_type: string;
    description: string;
    metadata?: any;
}

class AppointmentActivityService {
    /**
     * Get all activity for a specific appointment
     */
    async getByAppointment(appointmentId: string): Promise<AppointmentActivity[]> {
        const query = `
            SELECT 
                aal.*,
                u.name as performed_by_name,
                u.role as performed_by_role
            FROM appointment_activity_log aal
            LEFT JOIN users u ON aal.user_id = u.id
            WHERE aal.appointment_id = $1
            ORDER BY aal.created_at DESC
        `;

        const result = await pool.query(query, [appointmentId]);
        return result.rows;
    }

    /**
     * Get activity view (human-readable with joins)
     */
    async getActivityView(appointmentId: string) {
        const query = `
            SELECT * FROM appointment_activity_view
            WHERE appointment_id = $1
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query, [appointmentId]);
        return result.rows;
    }

    /**
     * Create manual activity log entry
     */
    async createActivity(params: CreateActivityParams): Promise<number> {
        const query = `
            SELECT create_appointment_activity($1, $2, $3, $4, $5)
        `;

        const result = await pool.query(query, [
            params.appointment_id,
            params.user_id,
            params.action_type,
            params.description,
            params.metadata || {}
        ]);

        return result.rows[0].create_appointment_activity;
    }

    /**
     * Log payment received
     */
    async logPayment(appointmentId: string, userId: number, amount: number, method: string) {
        return this.createActivity({
            appointment_id: appointmentId,
            user_id: userId,
            action_type: 'payment_received',
            description: `Payment of ₹${amount} received via ${method}`,
            metadata: { amount, method }
        });
    }

    /**
     * Log note added
     */
    async logNote(appointmentId: string, userId: number, note: string) {
        return this.createActivity({
            appointment_id: appointmentId,
            user_id: userId,
            action_type: 'note_added',
            description: 'Note added to appointment',
            metadata: { note }
        });
    }

    /**
     * Log status change (for explicit tracking beyond trigger)
     */
    async logStatusChange(appointmentId: string, userId: number, oldStatus: string, newStatus: string, reason?: string) {
        return this.createActivity({
            appointment_id: appointmentId,
            user_id: userId,
            action_type: 'status_changed',
            description: `Status changed from ${oldStatus} to ${newStatus}${reason ? ': ' + reason : ''}`,
            metadata: { old_status: oldStatus, new_status: newStatus, reason }
        });
    }

    /**
     * Get recent activity across all appointments (admin view)
     */
    async getRecentActivity(limit: number = 50): Promise<AppointmentActivity[]> {
        const query = `
            SELECT 
                aal.*,
                u.name as performed_by_name,
                u.role as performed_by_role,
                p.name as patient_name,
                d.name as doctor_name
            FROM appointment_activity_log aal
            LEFT JOIN users u ON aal.user_id = u.id
            LEFT JOIN appointments a ON aal.appointment_id = a.id
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            ORDER BY aal.created_at DESC
            LIMIT $1
        `;

        const result = await pool.query(query, [limit]);
        return result.rows;
    }

    /**
     * Get activity stats for an appointment
     */
    async getActivityStats(appointmentId: string) {
        const query = `
            SELECT 
                COUNT(*) as total_activities,
                COUNT(DISTINCT user_id) as unique_users,
                MIN(created_at) as first_activity,
                MAX(created_at) as last_activity,
                json_object_agg(action_type, action_count) as action_breakdown
            FROM (
                SELECT 
                    user_id,
                    created_at,
                    action_type,
                    COUNT(*) as action_count
                FROM appointment_activity_log
                WHERE appointment_id = $1
                GROUP BY user_id, created_at, action_type
            ) subquery
        `;

        const result = await pool.query(query, [appointmentId]);
        return result.rows[0];
    }
}

export default new AppointmentActivityService();
