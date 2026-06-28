// API Test Suite for Phase 1 Features
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPIs() {
    console.log('🧪 Testing Phase 1 API Endpoints\n');

    const tests = [
        {
            name: 'Health Check',
            method: 'GET',
            url: '/',
            expected: 'message'
        },
        {
            name: 'Prescription Templates',
            method: 'GET',
            url: '/prescription-customization/templates',
            expected: 'array'
        },
        {
            name: 'Lab Tests Catalog',
            method: 'GET',
            url: '/lab-tests',
            expected: 'array'
        },
        {
            name: 'Lab Tests by Category',
            method: 'GET',
            url: '/lab-tests?category=Hematology',
            expected: 'array'
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const response = await axios({
                method: test.method,
                url: BASE_URL + test.url,
                timeout: 3000
            });

            const data = response.data;
            let success = false;

            if (test.expected === 'message' && data.message) {
                success = true;
            } else if (test.expected === 'array' && Array.isArray(data)) {
                success = true;
            }

            if (success) {
                console.log(`✅ ${test.name}`);
                if (Array.isArray(data)) {
                    console.log(`   Found ${data.length} items`);
                    if (data.length > 0 && data[0].name) {
                        console.log(`   Sample: ${data[0].name}`);
                    }
                }
                passed++;
            } else {
                console.log(`⚠️  ${test.name} - Unexpected response format`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name}`);
            console.log(`   Error: ${error.message}`);
            failed++;
        }
        console.log('');
    }

    console.log('━'.repeat(50));
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log('\n🎉 All Phase 1 APIs are working!');
    } else {
        console.log('\n⚠️  Some APIs failed - check routes are registered');
    }
}

testAPIs();
