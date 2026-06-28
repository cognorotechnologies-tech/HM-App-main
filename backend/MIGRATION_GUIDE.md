# 🚀 Phase 1 Migration Deployment Guide

## Quick Deployment Steps

Since `psql` is not in your PATH, here are alternative methods to run the migrations:

---

## Option 1: Using DBeaver (Recommended for Windows)

1. **Open DBeaver**
2. **Connect to your database:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `hm_app_db`
   - Username: `postgres`
   - Password: `$Predators@7837$`

3. **Run migrations in order:**

   **Step 1:** Open `backend/scripts/migrations/20260121_appointment_activity_log.sql`
   - Click the file in DBeaver
   - Click "Execute SQL Script" (or press `Ctrl+Enter`)
   - Wait for completion

   **Step 2:** Open `backend/scripts/migrations/20260121_prescription_customization.sql`
   - Execute

   **Step 3:** Open `backend/scripts/migrations/20260121_lab_test_ordering.sql`
   - Execute

   **Step 4:** Open `backend/scripts/migrations/20260121_data_migration_tools.sql`
   - Execute

4. **Verify tables created:**
```sql
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
```

Should return 8 rows.

---

## Option 2: Using pgAdmin

1. Open pgAdmin
2. Connect to `hm_app_db`
3. Right-click database → **Query Tool**
4. For each migration file:
   - Click "Open File" icon
   - Select the SQL file
   - Click "Execute" (▶ button)

---

## Option 3: Using psql (if installed)

Find your PostgreSQL installation (usually `C:\Program Files\PostgreSQL\{version}\bin\psql.exe`)

```powershell
# Add psql to PATH for this session
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"

# Run migrations
cd "d:\HospitalManagementSystem\HM App"
psql -U postgres -d hm_app_db -f "backend\scripts\migrations\20260121_appointment_activity_log.sql"
psql -U postgres -d hm_app_db -f "backend\scripts\migrations\20260121_prescription_customization.sql"
psql -U postgres -d hm_app_db -f "backend\scripts\migrations\20260121_lab_test_ordering.sql"
psql -U postgres -d hm_app_db -f "backend\scripts\migrations\20260121_data_migration_tools.sql"
```

---

## Option 4: Via Node.js Script (Automated)

Create and run this script:

**File:** `backend/scripts/run-migrations.js`

```javascript
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

const migrations = [
    '20260121_appointment_activity_log.sql',
    '20260121_prescription_customization.sql',
    '20260121_lab_test_ordering.sql',
    '20260121_data_migration_tools.sql'
];

async function runMigrations() {
    try {
        await client.connect();
        console.log('✅ Connected to database');

        for (const migration of migrations) {
            const filePath = path.join(__dirname, 'migrations', migration);
            const sql = fs.readFileSync(filePath, 'utf-8');
            
            console.log(`\n🔄 Running: ${migration}...`);
            await client.query(sql);
            console.log(`✅ Completed: ${migration}`);
        }

        console.log('\n🎉 All migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await client.end();
    }
}

runMigrations();
```

**Run it:**
```powershell
cd "d:\HospitalManagementSystem\HM App\backend"
node scripts/run-migrations.js
```

---

## After Migration: Restart Backend

Once migrations are complete:

```powershell
# Stop current backend (Ctrl+C in the terminal running npm run dev)
# Then restart:
cd "d:\HospitalManagementSystem\HM App\backend"
npm run dev
```

The server should show:
```
Server is running on http://localhost:3001
```

---

## Verification Steps

### 1. Check Tables Exist

```sql
-- Should return counts
SELECT 
  (SELECT COUNT(*) FROM appointment_activity_log) as activity_logs,
  (SELECT COUNT(*) FROM prescription_layout_templates) as templates,
  (SELECT COUNT(*) FROM lab_tests) as lab_tests,
  (SELECT COUNT(*) FROM import_jobs) as import_jobs;
```

**Expected:**
- `templates`: 3 (Classic, Modern, Minimal)
- `lab_tests`: 20 (pre-loaded tests)

### 2. Test APIs

```powershell
# Test prescription templates
curl http://localhost:3001/prescription-customization/templates

# Test lab tests catalog
curl http://localhost:3001/lab-tests

# Test appointment activity (replace :id with actual appointment ID)
curl http://localhost:3001/appointment-activity/1
```

---

## Troubleshooting

### Issue: "relation already exists"
**Meaning:** Table was created before  
**Solution:** Drop and recreate:
```sql
DROP TABLE IF EXISTS appointment_activity_log CASCADE;
-- Then re-run migration
```

### Issue: "permission denied"
**Solution:** Ensure you're connected as `postgres` user

### Issue: "syntax error"
**Solution:** Make sure you're running the entire file, not line-by-line

---

## Migration File Locations

All migrations are in:
```
d:\HospitalManagementSystem\HM App\backend\scripts\migrations\
```

1. `20260121_appointment_activity_log.sql` - 209 lines
2. `20260121_prescription_customization.sql` - 256 lines
3. `20260121_lab_test_ordering.sql` - 328 lines
4. `20260121_data_migration_tools.sql` - 234 lines

---

## What Gets Created

### Tables (8):
1. `appointment_activity_log` - Activity tracking
2. `prescription_layout_templates` - Templates (3 pre-loaded)
3. `doctor_prescription_preferences` - Doctor settings
4. `lab_tests` - Test catalog (20 pre-loaded)
5. `lab_orders` - Lab orders
6. `lab_test_results` - Individual results
7. `import_jobs` - Import tracking
8. `import_log_details` - Import logs

### Functions:
- `log_appointment_activity()` - Auto-trigger
- `get_doctor_prescription_preferences()` - Helper
- `generate_lab_order_number()` - Auto order #
- `create_import_job()` - Import helper

### Triggers:
- `appointment_activity_trigger` - Auto-log changes
- `trigger_set_lab_order_number` - Auto order #

### Views:
- `appointment_activity_view` - Human-readable activity
- `popular_lab_tests` - Popular tests only
- `import_jobs_summary` - Import statistics

---

**Status:** Ready to deploy  
**Recommended Method:** DBeaver (easiest for Windows)  
**Time Required:** ~5-10 minutes
