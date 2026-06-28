import pool from '../db';

export class AppointmentModificationService {
    static async getByAppointment(appointmentId: string) {
        const query = `
            SELECT * FROM appointment_modifications
            WHERE appointment_id = $1
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query, [appointmentId]);
        return result.rows;
    }

    static async create(data: {
        appointment_id: string;
        modification_type: string;
        old_date?: string;
        old_start_time?: string;
        old_end_time?: string;
        new_date?: string;
        new_start_time?: string;
        new_end_time?: string;
        reason?: string;
        modified_by?: string;
    }) {
        const result = await pool.query(
            `INSERT INTO appointment_modifications 
            (appointment_id, modification_type, old_date, old_start_time, old_end_time, 
             new_date, new_start_time, new_end_time, reason, modified_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
                data.appointment_id,
                data.modification_type,
                data.old_date || null,
                data.old_start_time || null,
                data.old_end_time || null,
                data.new_date || null,
                data.new_start_time || null,
                data.new_end_time || null,
                data.reason || null,
                data.modified_by || null
            ]
        );
        return result.rows[0];
    }

    static async reschedule(appointmentId: string, data: {
        old_date: string;
        old_start_time: string;
        old_end_time: string;
        new_date: string;
        new_start_time: string;
        new_end_time: string;
        reason?: string;
        modified_by?: string;
    }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update appointment
            await client.query(
                `UPDATE appointments 
                SET appointment_date = $1, start_time = $2, end_time = $3
                WHERE id = $4`,
                [data.new_date, data.new_start_time, data.new_end_time, appointmentId]
            );

            // Log modification
            const result = await client.query(
                `INSERT INTO appointment_modifications 
                (appointment_id, modification_type, old_date, old_start_time, old_end_time, 
                 new_date, new_start_time, new_end_time, reason, modified_by)
                VALUES ($1, 'reschedule', $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *`,
                [
                    appointmentId,
                    data.old_date,
                    data.old_start_time,
                    data.old_end_time,
                    data.new_date,
                    data.new_start_time,
                    data.new_end_time,
                    data.reason || null,
                    data.modified_by || null
                ]
            );

            await client.query('COMMIT');
            return result.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async cancel(appointmentId: string, data: {
        reason?: string;
        modified_by?: string;
    }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get current appointment data
            const apt = await client.query('SELECT * FROM appointments WHERE id = $1', [appointmentId]);
            if (apt.rows.length === 0) throw new Error('Appointment not found');

            const currentApt = apt.rows[0];

            // Update appointment status
            await client.query(
                `UPDATE appointments SET status = 'cancelled' WHERE id = $1`,
                [appointmentId]
            );

            // Log modification
            const result = await client.query(
                `INSERT INTO appointment_modifications 
                (appointment_id, modification_type, old_date, old_start_time, old_end_time, reason, modified_by)
                VALUES ($1, 'cancel', $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                    appointmentId,
                    currentApt.appointment_date,
                    currentApt.start_time,
                    currentApt.end_time,
                    data.reason || null,
                    data.modified_by || null
                ]
            );

            await client.query('COMMIT');
            return result.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}
