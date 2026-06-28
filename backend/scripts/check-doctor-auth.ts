
import pool from '../src/db';
import { AuthService } from '../src/services/authService';

async function checkDoctors() {
    try {
        console.log("--- Doctors in Profiles ---");
        const profiles = await pool.query("SELECT * FROM profiles WHERE role = 'doctor'");
        console.table(profiles.rows.map(r => ({ id: r.id, email: r.email, name: `${r.first_name} ${r.last_name}` })));

        if (profiles.rows.length === 0) {
            console.log("No doctors found.");
            return;
        }

        console.log("\n--- Checking User Credentials ---");
        for (const dr of profiles.rows) {
            const creds = await pool.query("SELECT * FROM user_credentials WHERE email = $1", [dr.email]);
            if (creds.rows.length === 0) {
                console.log(`❌ Missing credentials for ${dr.email} (${dr.id})`);

                // Attempt to fix
                console.log(`🛠️ Creating default credentials for ${dr.email}...`);
                const hash = await AuthService.hashPassword("password123");
                await pool.query(
                    `INSERT INTO user_credentials (user_id, email, password_hash) VALUES ($1, $2, $3)`,
                    [dr.id, dr.email, hash]
                );
                console.log("✅ Credentials created. Password: password123");

            } else {
                console.log(`✅ Credentials exist for ${dr.email}`);
                // Verify if 'password123' works
                const hash = creds.rows[0].password_hash;
                const isMatch = await AuthService.verifyPassword("password123", hash);
                console.log(`   Password 'password123' match: ${isMatch}`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkDoctors();
