import { neon } from '@neondatabase/serverless';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import nodemailer from 'nodemailer';

// Initialize Google Calendar client
const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    calendar_id: process.env.GOOGLE_CALENDAR_ID?.trim()
};

console.log('Credentials:', {
    hasClientEmail: !!credentials.client_email,
    hasPrivateKey: !!credentials.private_key,
    calendarId: credentials.calendar_id,
    clientEmail: credentials.client_email
});

// Validate credentials
if (!credentials.client_email || !credentials.private_key || !credentials.calendar_id) {
    console.error('Missing required Google Calendar credentials:', {
        hasClientEmail: !!credentials.client_email,
        hasPrivateKey: !!credentials.private_key,
        hasCalendarId: !!credentials.calendar_id
    });
    throw new Error('Missing required Google Calendar credentials');
}

const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
    ],
});

// Test calendar access before proceeding
async function testCalendarAccess() {
    try {
        const calendar = google.calendar({ version: 'v3', auth });

        // Try to get the calendar details first
        const calendarResponse = await calendar.calendars.get({
            calendarId: credentials.calendar_id
        }).catch(error => {
            console.error('Failed to access calendar:', {
                error: error.message,
                code: error.code,
                status: error.status,
                calendarId: credentials.calendar_id
            });
            throw error;
        });

        console.log('Successfully accessed calendar:', {
            calendarId: credentials.calendar_id,
            calendarTitle: calendarResponse.data.summary,
            timeZone: calendarResponse.data.timeZone
        });

        return calendar;
    } catch (error) {
        console.error('Calendar access test failed:', error);
        throw new Error('Failed to access Google Calendar. Please verify calendar ID and permissions.');
    }
}

// Initialize calendar with access test
let calendar: any;
testCalendarAccess().then(cal => {
    calendar = cal;
    console.log('Calendar client initialized successfully');
}).catch(error => {
    console.error('Failed to initialize calendar client:', error);
});

async function createCalendarEvent(order: any) {
    try {
        // Debug logging for incoming values
        console.log('Raw order date and time:', {
            date: order.date,
            time: order.time,
            dateType: typeof order.date,
            timeType: typeof order.time
        });

        // Parse the date properly
        let dateStr = typeof order.date === 'string' ? order.date : null;

        // If date is not a string, try to format it
        if (!dateStr && order.date instanceof Date) {
            dateStr = order.date.toISOString().split('T')[0];
        }

        // Validate date string format (should be YYYY-MM-DD)
        if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            throw new Error(`Invalid date format: ${dateStr}`);
        }

        // Parse the time properly
        let timeStr = typeof order.time === 'string' ? order.time : null;

        // Handle time validation
        if (!timeStr) {
            timeStr = '12:00:00'; // Default to noon if no time provided
        } else {
            // Clean up the time string
            timeStr = timeStr.trim();

            // Check if time matches HH:mm or HH:mm:ss format
            const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(:(\d{2}))?$/);
            if (!timeMatch) {
                throw new Error(`Invalid time format: ${timeStr}`);
            }

            // Ensure hours and minutes are padded
            const hours = timeMatch[1].padStart(2, '0');
            const minutes = timeMatch[2];
            const seconds = timeMatch[4] || '00';

            timeStr = `${hours}:${minutes}:${seconds}`;
        }

        // Create the datetime string
        const dateTimeStr = `${dateStr}T${timeStr}`;
        console.log('Constructed datetime string:', dateTimeStr);

        // Parse the datetime
        const startTime = new Date(dateTimeStr);

        // Validate the parsed date
        if (isNaN(startTime.getTime())) {
            throw new Error(`Failed to create valid date from: ${dateTimeStr}`);
        }

        console.log('Successfully parsed datetime:', {
            original: dateTimeStr,
            parsed: startTime,
            iso: startTime.toISOString()
        });

        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

        const event = {
            summary: `Betonáž - ${order.customer_name}`,
            description: `
                Zákazník: ${order.customer_name}
                Telefon: ${order.customer_phone || 'Neuvedeno'}
                Email: ${order.customer_email || 'Neuvedeno'}
                Adresa: ${order.address_street || ''}, ${order.address_city || ''}
                Typ betonu: ${order.config_type || 'Neuvedeno'}
                Kvalita: ${order.config_quality || 'Neuvedeno'}
                Délka hadic: ${order.config_hose_length || 0}m
                Výška čerpání: ${order.config_volume_height || 0}m
                Poznámka: ${order.config_description || 'Bez poznámky'}
            `.trim(),
            location: `${order.address_street || ''}, ${order.address_city || ''}, ${order.address_zip || ''}`.trim(),
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'Europe/Prague',
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'Europe/Prague',
            },
            colorId: '11',
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 60 },
                ],
            },
        };

        // Log the final event object and calendar ID being used
        console.log('Calendar event to be created:', JSON.stringify(event, null, 2));
        console.log('Using calendar ID:', credentials.calendar_id);

        const response = await calendar.events.insert({
            calendarId: credentials.calendar_id,
            requestBody: event,
        }).catch(error => {
            console.error('Google Calendar API Error:', {
                error: error.message,
                code: error.code,
                status: error.status,
                details: error.errors,
                calendarId: credentials.calendar_id
            });
            throw error;
        });

        console.log('Calendar event created successfully:', response.data.htmlLink);
        return response.data;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        console.error('Full order data:', JSON.stringify(order, null, 2));
        throw error;
    }
}

// Add these environment variables to your configuration
const emailConfig = {
    admin_email: process.env.ADMIN_EMAIL,
    smtp_user: process.env.GMAIL_USER,
    smtp_pass: process.env.GMAIL_APP_PASSWORD
};

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailConfig.smtp_user,
        pass: emailConfig.smtp_pass
    }
});

async function sendStatusEmails(order: any, status: string) {
    const statusMessages: any = {
        pending: "Čeká na schválení",
        accepted: "Přijata",
        rejected: "Zamítnuta",
        cancelled: "Zrušena"
    };

    const orderDetails = `
        Detaily objednávky:
        -------------------
        Zákazník: ${order.customer_name}
        Telefon: ${order.customer_phone || 'Neuvedeno'}
        Email: ${order.customer_email || 'Neuvedeno'}
        Adresa: ${order.address_street || ''}, ${order.address_city || ''}
        
        Typ betonu: ${order.config_type || 'Neuvedeno'}
        Kvalita: ${order.config_quality || 'Neuvedeno'}
        Délka hadic: ${order.config_hose_length || 0}m
        Výška čerpání: ${order.config_volume_height || 0}m
        
        Datum: ${order.date}
        Čas: ${order.time}
        
        Poznámka: ${order.config_description || 'Bez poznámky'}
    `;

    // Send email to customer if email exists
    if (order.customer_email) {
        await transporter.sendMail({
            from: emailConfig.smtp_user,
            to: order.customer_email,
            subject: `Vaše objednávka ${statusMessages[status]}`,
            text: `Vážený zákazníku,

Vaše objednávka ${statusMessages[status]}.

${orderDetails}

S pozdravem,
Váš tým betonáže`
        });
    }

    // Send email to admin
    if (emailConfig.admin_email) {
        await transporter.sendMail({
            from: emailConfig.smtp_user,
            to: emailConfig.admin_email,
            subject: `Objednávka ${statusMessages[status]} - ${order.customer_name}`,
            text: `Objednávka změnila status na: ${statusMessages[status]}

${orderDetails}`
        });
    }
}

export async function handler(event: any) {
    try {
        const sql = neon(process.env.NEON_DB_URL!);
        const { orderId, status } = JSON.parse(event.body);

        if (!['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid status' })
            };
        }

        // First get the order details
        const getOrderQuery = `
            SELECT * FROM orders 
            WHERE id = $1
        `;
        const orderResult = await sql(getOrderQuery, [orderId]);

        if (orderResult.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Order not found' })
            };
        }

        const order = orderResult[0];

        // Update the order status
        const updateQuery = `
            UPDATE orders 
            SET status = $1 
            WHERE id = $2 
            RETURNING *
        `;

        const result = await sql(updateQuery, [status, orderId]);

        // If status is accepted, create a calendar event
        if (status === 'accepted') {
            try {
                const calendarEvent = await createCalendarEvent(order);
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'Order status updated and calendar event created',
                        order: result[0],
                        calendarEvent
                    })
                };
            } catch (calendarError) {
                console.error('Failed to create calendar event:', calendarError);
                // Still return success for order update even if calendar fails
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'Order status updated but calendar event creation failed',
                        order: result[0],
                        calendarError: 'Failed to create calendar event'
                    })
                };
            }
        }

        // After updating the order status, send emails
        try {
            await sendStatusEmails(order, status);
        } catch (emailError) {
            console.error('Failed to send notification emails:', emailError);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Order status updated successfully',
                order: result[0]
            })
        };

    } catch (error) {
        console.error('Error updating order status:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error updating order status',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
} 