
import { emailService } from '../src/services/emailService';

async function verifyMockEmail() {
    console.log('Testing Mock Email Service...');

    const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Mock Email',
        html: '<p>This is a test email sent via mock service.</p>'
    });

    console.log('Send Result:', result);

    if (result.success && result.id?.startsWith('mock-email-')) {
        console.log('✅ SUCCESS: Mock email sent successfully and ID indicates mock mode.');
    } else {
        console.error('❌ FAILURE: distinct mock ID not found or operation failed.');
        process.exit(1);
    }
}

verifyMockEmail();
