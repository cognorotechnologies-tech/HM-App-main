
import pool from '../src/db';
import { AuthService } from '../src/services/authService';

async function checkAdmin() {
    try {
        console.log("--- Admins in Profiles ---");
        const profiles = await pool.query("SELECT * FROM profiles WHERE role = 'admin'");
        console.table(profiles.rows.map(r => ({ id: r.id, email: r.email, name: `${r.first_name} ${r.last_name}` })));

        if (profiles.rows.length === 0) {
            console.log("❌ No admin found!");
            // Create default admin?
            const idRes = await pool.query("SELECT gen_random_uuid() as uuid");
            const id = idRes.rows[0].uuid;
            const email = "admin@hm-app.com";
            
            await pool.query(
                `INSERT INTO profiles (id, email, first_name, last_name, role) VALUES ($1, $2, 'Admin', 'User', 'admin')`,
                [id, email]
            );
            console.log("✅ Created default admin profile.");
            
            const hash = await AuthService.hashPassword("password123");
            await pool.query(
                `INSERT INTO user_credentials (user_id, email, password_hash) VALUES ($1, $2, $3)`,
                [id, email, hash]
            );
            console.log("✅ Created default admin credentials (admin@hm-app.com / password123).");
            return;
        }

        for (const admin of profiles.rows) {
             console.log(`Resetting password for ${admin.email}...`);
             const hash = await AuthService.hashPassword("password123");
             
             // Check if creds exist
             const exists = await pool.query("SELECT * FROM user_credentials WHERE email = $1", [admin.email]);
             if (exists.rows.length === 0) {
                 await pool.query(
                    `INSERT INTO user_credentials (user_id, email, password_hash) VALUES ($1, $2, $3)`,
                    [admin.id, admin.email, hash]
                );
                console.log(`✅ Created credentials for ${admin.email}.`);
             } else {
                 await pool.query(
                    `UPDATE user_credentials SET password_hash = $1 WHERE email = $2`,
                    [hash, admin.email]
                );
                console.log(`✅ Updated password for ${admin.email} to 'password123'.`);
             }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkAdmin();
