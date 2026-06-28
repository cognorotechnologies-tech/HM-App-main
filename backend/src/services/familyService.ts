import pool from '../db';

export class FamilyService {
    static async getByPatientId(patientId: string) {
        const result = await pool.query(
            'SELECT * FROM family_members WHERE patient_id = $1 ORDER BY first_name ASC',
            [patientId]
        );
        return result.rows;
    }

    static async addMember(data: {
        patient_id: string;
        first_name: string;
        last_name: string;
        date_of_birth?: string;
        gender?: string;
        relationship: string;
    }) {
        const result = await pool.query(
            `INSERT INTO family_members 
            (patient_id, first_name, last_name, date_of_birth, gender, relationship) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
            [
                data.patient_id,
                data.first_name,
                data.last_name,
                data.date_of_birth || null,
                data.gender || null,
                data.relationship
            ]
        );
        return result.rows[0];
    }

    static async updateMember(id: string, data: Partial<{
        first_name: string;
        last_name: string;
        date_of_birth: string;
        gender: string;
        relationship: string;
    }>) {
        // Construct dynamic update query
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.first_name) { fields.push(`first_name = $${idx++}`); values.push(data.first_name); }
        if (data.last_name) { fields.push(`last_name = $${idx++}`); values.push(data.last_name); }
        if (data.date_of_birth) { fields.push(`date_of_birth = $${idx++}`); values.push(data.date_of_birth); }
        if (data.gender) { fields.push(`gender = $${idx++}`); values.push(data.gender); }
        if (data.relationship) { fields.push(`relationship = $${idx++}`); values.push(data.relationship); }

        // Add updated_at
        fields.push(`updated_at = NOW()`);

        if (fields.length === 0) return null; // No updates

        values.push(id);
        const query = `UPDATE family_members SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async deleteMember(id: string) {
        const result = await pool.query('DELETE FROM family_members WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}
