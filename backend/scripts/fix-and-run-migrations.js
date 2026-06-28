// Check database schema and fix migrations
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'hm_app_db',
    user: 'postgres',
    password: '$Predators@7837$'
});

async function checkAndFixMigrations() {
    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Check users table ID type
        const result = await client.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'id'
        `);

        const userIdType = result.rows[0]?.data_type || 'integer';
        console.log(`📊 Users table ID type: ${userIdType}\n`);

        if (userIdType === 'uuid') {
            console.log('🔧 Fixing migrations for UUID compatibility...\n');

            const migrations = [
                '20260121_appointment_activity_log.sql',
                '20260121_prescription_customization.sql',
                '20260121_lab_test_ordering.sql',
                '20260121_data_migration_tools.sql'
            ];

            for (const migrationFile of migrations) {
                const filePath = path.join(__dirname, 'migrations', migrationFile);
                let sql = fs.readFileSync(filePath, 'utf-8');

                // Replace INTEGER REFERENCES users(id) with UUID REFERENCES users(id)
                sql = sql.replace(/(\w+)\s+INTEGER\s+REFERENCES\s+users\(id\)/gi, '$1 UUID REFERENCES users(id)');

                // Also handle cases without column name
                sql = sql.replace(/INTEGER\s+REFERENCES\s+users\(id\)/gi, 'UUID REFERENCES users(id)');

                // Save fixed version
                const fixedPath = filePath.replace('.sql', '_fixed.sql');
                fs.writeFileSync(fixedPath, sql);
                console.log(`✅ Fixed: ${migrationFile} → ${path.basename(fixedPath)}`);
            }

            console.log('\n✅ All migrations fixed for UUID compatibility!');
            console.log('\n🚀 Running fixed migrations...\n');

            // Run fixed migrations
            for (let i = 0; i < migrations.length; i++) {
                const migration = migrations[i];
                const fixedPath = path.join(__dirname, 'migrations', migration.replace('.sql', '_fixed.sql'));
                const sql = fs.readFileSync(fixedPath, 'utf-8');

                console.log(`[${i + 1}/${migrations.length}] Running: ${migration}...`);
                const startTime = Date.now();

                await client.query(sql);

                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`✅ Completed in ${duration}s\n`);
            }

            // Verify
            console.log('🔍 Verifying tables created...');
            const verify = await client.query(`
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
                ORDER BY tablename
            `);

            console.log(`✅ ${verify.rows.length}/8 tables created:`);
            verify.rows.forEach(row => console.log(`   - ${row.tablename}`));

            // Check sample data
            console.log('\n📊 Sample data loaded:');
            const templates = await client.query('SELECT COUNT(*) FROM prescription_layout_templates');
            const tests = await client.query('SELECT COUNT(*) FROM lab_tests');

            console.log(`   - Prescription templates: ${templates.rows[0].count}`);
            console.log(`   - Lab tests: ${tests.rows[0].count}`);

            console.log('\n🎉 Phase 1 migrations deployed successfully!');
            console.log('\n📌 Next steps:');
            console.log('1. Restart backend server: Ctrl+C then "npm run dev"');
            console.log('2. Test APIs at http://localhost:3001');

        } else {
            console.log('ℹ️  Using INTEGER type - no fixes needed');
            console.log('🚀 Running original migrations...\n');

            const migrations = [
                '20260121_appointment_activity_log.sql',
                '20260121_prescription_customization.sql',
                '20260121_lab_test_ordering.sql',
                '20260121_data_migration_tools.sql'
            ];

            // Run original migrations
            for (let i = 0; i < migrations.length; i++) {
                const migration = migrations[i];
                const filePath = path.join(__dirname, 'migrations', migration);
                const sql = fs.readFileSync(filePath, 'utf-8');

                console.log(`[${i + 1}/${migrations.length}] Running: ${migration}...`);
                const startTime = Date.now();

                await client.query(sql);

                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`✅ Completed in ${duration}s\n`);
            }

            // Verify
            console.log('🔍 Verifying tables created...');
            const verify = await client.query(`
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
                ORDER BY tablename
            `);

            console.log(`✅ ${verify.rows.length}/8 tables created:`);
            verify.rows.forEach(row => console.log(`   - ${row.tablename}`));

            // Check sample data
            console.log('\n📊 Sample data loaded:');
            const templates = await client.query('SELECT COUNT(*) FROM prescription_layout_templates');
            const tests = await client.query('SELECT COUNT(*) FROM lab_tests');

            console.log(`   - Prescription templates: ${templates.rows[0].count}`);
            console.log(`   - Lab tests: ${tests.rows[0].count}`);

            console.log('\n🎉 Phase 1 migrations deployed successfully!');
            console.log('\n📌 Next steps:');
            console.log('1. Restart backend server: Ctrl+C then "npm run dev"');
            console.log('2. Test APIs at http://localhost:3001');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.code) console.error('Code:', error.code);
        process.exit(1);
    } finally {
        await client.end();
    }
}

checkAndFixMigrations();
