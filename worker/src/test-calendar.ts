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
    GOOGLE_CLIENT_EMAIL: null,
    GOOGLE_PRIVATE_KEY: null,
    GOOGLE_CALENDAR_ID: null
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