import pool from '../db';

export class ScheduleService {
    static async getByDoctor(doctorId: string) {
        const result = await pool.query(
            `SELECT * FROM schedules WHERE doctor_id = $1 ORDER BY day_of_week, start_time`,
            [doctorId]
        );
        return result.rows;
    }

    static async create(data: {
        doctor_id: string;
        day_of_week: number;
        start_time: string;
        end_time: string;
        slot_duration: number;
    }) {
        const result = await pool.query(
            `INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time, slot_duration)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [data.doctor_id, data.day_of_week, data.start_time, data.end_time, data.slot_duration]
        );
        return result.rows[0];
    }

    static async delete(id: string) {
        const result = await pool.query(
            `DELETE FROM schedules WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    }
}
