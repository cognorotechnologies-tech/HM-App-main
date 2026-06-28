
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Explicit config for Supabase (Remote)
const pool = new Pool({
    user: 'postgres',
    host: 'db.tcrnqfhwknmlqlgdmiqf.supabase.co',
    database: 'postgres',
    password: '$Predators@7837$',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function dumpSchema() {
    const client = await pool.connect();
    try {
        let schemaSql = '-- Full Schema Dump\n\n';

        // 1. Extensions
        schemaSql += '-- Extensions\n';
        schemaSql += 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n';
        schemaSql += 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n\n';

        // 2. Enums
        console.log('Fetching enums...');
        const enumsRes = await client.query(`
            SELECT t.typname, e.enumlabel
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public'
            ORDER BY t.typname, e.enumsortorder;
        `);

        // Group enums
        const enums: Record<string, string[]> = {};
        enumsRes.rows.forEach(row => {
            if (!enums[row.typname]) enums[row.typname] = [];
            enums[row.typname].push(`'${row.enumlabel}'`);
        });

        for (const [name, values] of Object.entries(enums)) {
            schemaSql += `DROP TYPE IF EXISTS ${name} CASCADE;\n`;
            schemaSql += `CREATE TYPE ${name} AS ENUM (${values.join(', ')});\n\n`;
        }

        // 2b. Functions
        console.log('Fetching functions...');
        const funcsRes = await client.query(`
            SELECT pg_get_functiondef(f.oid) as def
            FROM pg_catalog.pg_proc f
            JOIN pg_catalog.pg_namespace n ON f.pronamespace = n.oid
            WHERE n.nspname = 'public'
        `);

        for (const row of funcsRes.rows) {
            schemaSql += `${row.def};\n\n`;
        }

        // 3. Tables
        console.log('Fetching table list...');
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);

        const tables = tablesRes.rows.map(r => r.table_name);

        for (const table of tables) {
            console.log(`Processing table: ${table}`);

            // Get columns detailed info including array types and udt_name
            const colsRes = await client.query(`
                SELECT 
                    column_name, 
                    data_type, 
                    udt_name,
                    character_maximum_length, 
                    is_nullable, 
                    column_default
                FROM information_schema.columns
                WHERE table_name = $1 AND table_schema = 'public'
                ORDER BY ordinal_position
            `, [table]);

            schemaSql += `DROP TABLE IF EXISTS ${table} CASCADE;\n`;
            schemaSql += `CREATE TABLE ${table} (\n`;

            const colDefs = colsRes.rows.map(col => {
                let type = col.data_type;

                // Handle Arrays
                if (type === 'ARRAY') {
                    // Remove leading underscore from udt_name to get type (e.g. _text -> text)
                    const elemType = col.udt_name.startsWith('_') ? col.udt_name.substring(1) : col.udt_name;
                    type = `${elemType}[]`;
                }
                // Handle Enums (USER-DEFINED)
                else if (type === 'USER-DEFINED') {
                    type = col.udt_name;
                }

                let def = `  ${col.column_name} ${type}`;

                if (col.character_maximum_length && type !== 'text' && !type.includes('[]')) {
                    def += `(${col.character_maximum_length})`;
                }

                if (col.is_nullable === 'NO') {
                    def += ' NOT NULL';
                }

                if (col.column_default) {
                    // Start fixing bad defaults
                    const d = col.column_default;
                    // Fix: uuid_generate_v4() -> uuid_generate_v4() (requires extension)
                    // Fix: gen_random_uuid() -> gen_random_uuid() (requires pgcrypto)
                    // Fix: 'value'::user_role -> 'value'::user_role

                    // Supabase sometimes exports defaults with schema qualifications we don't have easily or need
                    // But generally keeping them is fine if extensions are loaded.
                    def += ` DEFAULT ${d}`;
                }
                return def;
            });

            // Get Constraints (Primary Keys)
            const pkRes = await client.query(`
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                WHERE tc.constraint_type = 'PRIMARY KEY'
                  AND tc.table_name = $1
                  AND tc.table_schema = 'public'
            `, [table]);

            if (pkRes.rows.length > 0) {
                const pkCols = pkRes.rows.map(r => r.column_name).join(', ');
                colDefs.push(`  PRIMARY KEY (${pkCols})`);
            }

            schemaSql += colDefs.join(',\n');
            schemaSql += `\n);\n\n`;

            // Dump Triggers for this table
            const triggersRes = await client.query(`
                SELECT pg_get_triggerdef(t.oid) as def
                FROM pg_trigger t
                WHERE t.tgrelid = $1::regclass
                AND t.tgisinternal = false
            `, [table]);

            for (const tRow of triggersRes.rows) {
                schemaSql += `${tRow.def};\n\n`;
            }
        }

        // Output to file
        const outputPath = path.join(__dirname, '../../schema.sql');
        fs.writeFileSync(outputPath, schemaSql);
        console.log(`Schema dumped to ${outputPath}`);

    } catch (err) {
        console.error('Error dumping schema:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

dumpSchema();
