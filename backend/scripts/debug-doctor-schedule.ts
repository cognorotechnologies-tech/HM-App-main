import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '../src/.env') });

const API_URL = 'http://localhost:3000';
const USER_EMAIL = 'doctor@hm-app.com';
const USER_PASSWORD = 'password123';

async function debugDoctorSchedule() {
    try {
        console.log(`\n🔍 Debugging Doctor Schedule for ${USER_EMAIL}...`);

        // 1. Login
        console.log('1️⃣ Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: USER_EMAIL,
            password: USER_PASSWORD
        });
        const { token, user } = loginRes.data;
        console.log('   ✅ Login successful');
        console.log('   👤 User ID:', user.id);
        console.log('   🎭 Role:', user.role);

        const authHeaders = { Authorization: `Bearer ${token}` };

        // 2. Get Doctor Profile
        console.log(`\n2️⃣ Fetching Doctor Profile /doctors/${user.id}...`);
        try {
            const doctorRes = await axios.get(`${API_URL}/doctors/${user.id}`, { headers: authHeaders });
            console.log('   ✅ Doctor profile found:', doctorRes.data.id);
        } catch (error: any) {
            console.error('   ❌ Failed to fetch doctor profile:', error.message);
            if (error.response) {
                console.error('   Status:', error.response.status);
                console.error('   Data:', error.response.data);
            }
            console.log('   ⚠️  HYPOTHESIS CONFIRMED: User exists but is not in "doctors" table.');
            return;
        }

        // 3. Get Schedules
        console.log(`\n3️⃣ Fetching Schedules for doctor_id=${user.id}...`);
        try {
            const scheduleRes = await axios.get(`${API_URL}/schedules`, {
                params: { doctor_id: user.id },
                headers: authHeaders
            });
            console.log('   ✅ Schedules fetched:', scheduleRes.data);
        } catch (error: any) {
            console.error('   ❌ Failed to fetch schedules:', error.message);
        }

    } catch (error: any) {
        console.error('\n❌ Fatal Error:', error);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error config:', error.config);
        }
    }
}

debugDoctorSchedule();
