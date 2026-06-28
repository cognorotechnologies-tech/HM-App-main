const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration(filePath) {
    const client = await pool.connect();
    try {
        const fullPath = path.resolve(process.cwd(), filePath);
        console.log(`Reading migration file: ${fullPath}`);
        const sql = fs.readFileSync(fullPath, 'utf8');

        console.log(`Executing migration...`);
        await client.query(sql);
        console.log(`✅ Successfully executed ${path.basename(filePath)}`);
    } catch (err) {
        console.error(`❌ Error executing ${path.basename(filePath)}:`, err);
    } finally {
        client.release();
    }
}

async function main() {
    const scripts = [
        '../scripts/fix_prescriptions_schema.sql',
        '../scripts/create_prescription_customization_tables.sql'
    ];

    for (const script of scripts) {
        await runMigration(script);
    }

    await pool.end();
}

main().catch(console.error);
