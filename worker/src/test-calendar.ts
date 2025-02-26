import { createCalendarEvent } from './services/calendar';

// Test order data
const testOrder = {
    customer_name: "Test Customer",
    customer_phone: "123456789",
    customer_email: "test@example.com",
    address_street: "Test Street 123",
    address_city: "Test City",
    address_zip: "12345",
    config_type: "Test Type",
    config_quality: "Test Quality",
    config_hose_length: 10,
    config_volume_height: 5,
    config_description: "Test Description",
    date: "2025-03-11",
    time: "06:00:00"
};

// Test environment
const env = {
    GOOGLE_CLIENT_EMAIL: '',
    GOOGLE_PRIVATE_KEY: '',
    GOOGLE_CALENDAR_ID: ''
};

// Run test
async function testCalendar() {
    try {
        console.log('Testing calendar event creation...');
        const result = await createCalendarEvent(testOrder, env);
        console.log('Calendar event created successfully:', result);
    } catch (error) {
        console.error('Failed to create calendar event:', error);
    }
}

testCalendar();

async function testCalendarEvent() {
    // Check if required environment variables are present
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CALENDAR_ID) {
        console.error('Missing required environment variables. Please check your .env file.');
        process.exit(1);
    }

    try {
        const testOrder = {
            customer_name: "Test Customer",
            customer_email: "test@example.com",
            customer_phone: "+420123456789",
            address_street: "Test Street 123",
            address_city: "Test City",
            date: "2024-03-20",
            time: "14:30",
            config_type: "Test Type",
            config_quality: "Test Quality",
            config_hose_length: 30,
            config_volume_height: 15,
            config_description: "Test description"
        };

        const env = {
            GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
            GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
            GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID
        };

        console.log('Testing calendar event creation with:', {
            order: testOrder,
            hasClientEmail: !!env.GOOGLE_CLIENT_EMAIL,
            hasPrivateKey: !!env.GOOGLE_PRIVATE_KEY,
            hasCalendarId: !!env.GOOGLE_CALENDAR_ID
        });

        const result = await createCalendarEvent(testOrder, env);
        console.log('Calendar event created successfully:', result);
    } catch (error) {
        console.error('Failed to create test calendar event:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testCalendarEvent();
} 