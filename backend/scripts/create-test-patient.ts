import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

import pool from '../src/db';
import { PatientService } from '../src/services/patientService';

async function createTestPatient() {
    console.log('Creating test patient...');
    const client = await pool.connect();

    try {
        const patientData = {
            email: 'test.patient@example.com',
            password: 'password123',
            first_name: 'Test',
            last_name: 'Patient',
            phone: '9876543210',
            gender: 'Male',
            date_of_birth: '1990-01-01',
            blood_group: 'O+',
            address_street: '123 Test St',
            address_city: 'Test City',
            address_state: 'Test State',
            address_pincode: '123456',
            emergency_contact_name: 'Emergency Contact',
            emergency_contact_phone: '1122334455',
            emergency_contact_relation: 'Sibling',
            allergies: ['Peanuts'],
            chronic_conditions: ['None'],
            current_medications: 'None',
            previous_surgeries: 'None',
            family_history: 'None',
            alternative_phone: '9988776655'
        };

        // Check if exists
        const check = await client.query('SELECT * FROM user_credentials WHERE email = $1', [patientData.email]);
        if (check.rows.length > 0) {
            console.log('Test patient already exists.');
            return;
        }

        const patient = await PatientService.createPatient(patientData);
        console.log('Test Patient Created Successfully!');
        console.log('Email:', patientData.email);
        console.log('Password:', patientData.password);
        console.log('ID:', patient.id);

    } catch (error) {
        console.error('Error creating patient:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

createTestPatient();
