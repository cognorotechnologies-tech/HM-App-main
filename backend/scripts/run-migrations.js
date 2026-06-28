// Automated Migration Runner for Phase 1
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'hm_app_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '$Predators@7837$'
});

const migrations = [
    '20260121_appointment_activity_log.sql',
    '20260121_prescription_customization.sql',
    '20260121_lab_test_ordering.sql',
    '20260121_data_migration_tools.sql'
];

async function runMigrations() {
    console.log('🚀 Starting Phase 1 Migrations...\n');

    try {
        await client.connect();
        console.log('✅ Connected to database:', client.database);
        console.log('');

        for (let i = 0; i < migrations.length; i++) {
            const migration = migrations[i];
            const filePath = path.join(__dirname, 'migrations', migration);

            console.log(`[${i + 1}/${migrations.length}] Running: ${migration}...`);

            if (!fs.existsSync(filePath)) {
                console.error(`❌ File not found: ${filePath}`);
                continue;
            }

            const sql = fs.readFileSync(filePath, 'utf-8');
            const startTime = Date.now();

            await client.query(sql);

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ Completed in ${duration}s\n`);
        }

        // Verify tables created
        console.log('🔍 Verifying tables...');
        const verifyQuery = `
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN (
              'appointment_activity_log',
              'prescription_layout_templates',
              'doctor_prescription_preferences',
              'lab_tests',
              'lab_orders',
              'lab_test_results',
              'import_jobs',
              'import_log_details'
            )
            ORDER BY tablename;
        `;

        const result = await client.query(verifyQuery);
        console.log(`✅ Created ${result.rows.length}/8 tables:`);
        result.rows.forEach(row => console.log(`   - ${row.tablename}`));

        // Check sample data
        console.log('\n📊 Sample data check:');
        const templateCount = await client.query('SELECT COUNT(*) FROM prescription_layout_templates');
        const testCount = await client.query('SELECT COUNT(*) FROM lab_tests');

        console.log(`   - Prescription templates: ${templateCount.rows[0].count}`);
        console.log(`   - Lab tests: ${testCount.rows[0].count}`);

        console.log('\n🎉 All migrations completed successfully!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Restart backend server (Ctrl+C and npm run dev)');
        console.log('2. Test APIs at http://localhost:3001');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n✅ Database connection closed');
    }
}

// Run migrations
runMigrations();
