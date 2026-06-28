import pool from '../db';

export class DepartmentService {
    static async getAll() {
        const result = await pool.query('SELECT * FROM departments ORDER BY name ASC');
        return result.rows;
    }

    static async getActive() {
        // Assuming 'is_active' exists or just return all for now if schema doesn't match exactly yet

        // So we just return all for now, or check business logic.
        const result = await pool.query('SELECT * FROM departments ORDER BY name ASC');
        return result.rows;
    }

    static async getById(id: string) {
        const result = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create(name: string, description?: string) {
        const result = await pool.query(
            'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        return result.rows[0];
    }

    static async update(id: string, name: string, description?: string) {
        const result = await pool.query(
            'UPDATE departments SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        return result.rows[0];
    }

    static async delete(id: string) {
        const result = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}
