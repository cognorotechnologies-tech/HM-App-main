import axios from 'axios';
import { spawn } from 'child_process';

const PORT = 3001; // Use a different port for testing
process.env.PORT = PORT.toString();

async function runTest() {
    // Start the server
    console.log('Starting server...');
    const server = spawn('npx', ['ts-node', 'src/server.ts'], {
        cwd: process.cwd(),
        env: { ...process.env, PORT: PORT.toString() },
        stdio: 'inherit'
    });

    // Give it time to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        const email = `test.auth.${Date.now()}@example.com`;
        const password = 'password123';

        // 1. Register
        console.log(`\nRegistering user: ${email}...`);
        const regRes = await axios.post(`http://localhost:${PORT}/auth/register`, {
            email,
            password,
            firstName: 'Test',
            lastName: 'User',
            role: 'patient'
        });
        console.log('Register success:', regRes.data.user.email);

        // 2. Login
        console.log('\nLogging in...');
        const loginRes = await axios.post(`http://localhost:${PORT}/auth/login`, {
            email,
            password
        });
        console.log('Login success. Token:', loginRes.data.token.substring(0, 20) + '...');

        // 3. Verify Token (Need a protected route, but we don't have one yet except making one)
        // For now, if we got a token, we are good.

    } catch (err: any) {
        if (err.response) {
            console.error('API Error:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    } finally {
        server.kill();
        console.log('\nTest complete.');
    }
}

runTest();
