import { sendEmail } from '../services/email';

async function testEmail() {
    try {
        const env = {
            GMAIL_USER: '',
            GMAIL_CLIENT_ID: '',
            GMAIL_CLIENT_SECRET: '',
            GMAIL_REFRESH_TOKEN: ''
        };

        console.log('Using email configuration:', {
            user: env.GMAIL_USER,
            clientId: env.GMAIL_CLIENT_ID,
            hasClientSecret: !!env.GMAIL_CLIENT_SECRET,
            hasRefreshToken: !!env.GMAIL_REFRESH_TOKEN
        });

        const testConfig = {
            from: `"Beton Teplice" <${env.GMAIL_USER}>`,
            to: [process.env.TEST_EMAIL || 'apurv.bhavsar.09@gmail.com'],
            subject: 'Test Email from Beton Teplice',
            text: 'This is a test email to verify the email service is working correctly.\nTimestamp: ' + new Date().toISOString()
        };

        console.log('Sending test email to:', testConfig.to);
        await sendEmail(testConfig, env);
        console.log('Test email sent successfully!');
    } catch (error) {
        console.error('Failed to send test email:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testEmail();
} 