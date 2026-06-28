
import pool from '../src/db';

async function backfillPatients() {
    try {
        console.log("Checking for 'patient' profiles missing from 'patients' table...");

        // Find orphans
        const res = await pool.query(`
            SELECT p.id, p.email, p.first_name 
            FROM profiles p
            LEFT JOIN patients pat ON p.id = pat.id
            WHERE p.role = 'patient' AND pat.id IS NULL
        `);

        if (res.rows.length === 0) {
            console.log("✅ No missing records found.");
            return;
        }

        console.log(`⚠️  Found ${res.rows.length} missing patient records.`);

        for (const row of res.rows) {
            console.log(`   Fixing ${row.email} (${row.id})...`);
            await pool.query(
                `INSERT INTO patients (id) VALUES ($1)`,
                [row.id]
            );
        }

        console.log("✅ All fixed!");

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

backfillPatients();
