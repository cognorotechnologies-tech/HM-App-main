// Simple verification script
const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'hm_app_db',
    user: 'postgres',
    password: '$Predators@7837$'
});

async function verify() {
    try {
        await client.connect();

        // Check tables
        const result = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename LIKE '%activity%' 
               OR tablename LIKE '%prescription%' 
               OR tablename LIKE '%lab%'
               OR tablename LIKE '%import%'
            ORDER BY tablename
        `);

        console.log('Found tables:', result.rows.map(r => r.tablename).join(', '));

        // Check specific ones
        const check = await client.query(`
            SELECT COUNT(*) as count FROM pg_tables 
            WHERE tablename IN ('appointment_activity_log', 'lab_tests', 'prescription_layout_templates')
        `);

        console.log('\nDeployment status:', check.rows[0].count, '/ 3 key tables exist');

        await client.end();
    } catch (e) {
        console.error('Error:', e.message);
    }
}

verify();
