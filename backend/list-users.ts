import pool from './src/db';

async function listUsers() {
    try {
        const res = await pool.query('SELECT email, id FROM user_credentials');
        console.log('Registered Users:', res.rows);
    } catch (err) {
        console.error('Query failed:', err);
    } finally {
        await pool.end();
    }
}

listUsers();
