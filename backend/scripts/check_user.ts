import pool from '../src/db';

async function checkUser() {
    const client = await pool.connect();
    try {
        const email = 'pharmacist@example.com';
        const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log('User found:', res.rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

checkUser();
