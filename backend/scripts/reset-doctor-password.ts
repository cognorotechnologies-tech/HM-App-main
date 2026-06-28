
import pool from '../src/db';
import { AuthService } from '../src/services/authService';

async function resetPassword() {
    try {
        const email = 'Test@test.test';
        console.log(`Resetting password for ${email}...`);

        const hash = await AuthService.hashPassword("password123");

        const res = await pool.query(
            `UPDATE user_credentials SET password_hash = $1 WHERE email = $2`,
            [hash, email]
        );

        console.log(`✅ Password updated for ${email}. New password: password123`);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

resetPassword();
