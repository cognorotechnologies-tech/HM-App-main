import pool from '../src/db';

async function addRole() {
    try {
        console.log('Adding pharmacist role...');
        // Postgres doesn't support IF NOT EXISTS for enum values directly in all versions, 
        // but we can catch the error if it exists.
        await pool.query("ALTER TYPE user_role ADD VALUE 'pharmacist'");
        console.log('Role added successfully.');
    } catch (error: any) {
        if (error.code === '42710') { // duplicate_object
            console.log('Role "pharmacist" already exists.');
        } else {
            console.error('Error adding role:', error);
        }
    } finally {
        pool.end();
    }
}

addRole();
