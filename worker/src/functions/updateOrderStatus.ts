import { neon } from '@neondatabase/serverless';
// import { google } from 'googleapis';
// import { JWT } from 'google-auth-library';
import { createCalendarEvent } from '../services/calendar';
import { sendEmail } from '../services/email';

interface Env {
    NEON_DB_URL: string;
    ADMIN_EMAIL: string;
    GMAIL_USER: string;
    GMAIL_CLIENT_ID: string;
    GMAIL_CLIENT_SECRET: string;
    GMAIL_REFRESH_TOKEN: string;
    GOOGLE_CLIENT_EMAIL: string;
    GOOGLE_PRIVATE_KEY: string;
    GOOGLE_CALENDAR_ID: string;
}

// const auth = new JWT({
//     email: credentials.client_email,
//     key: credentials.private_key,
//     scopes: [
//         'https://www.googleapis.com/auth/calendar',
//         'https://www.googleapis.com/auth/calendar.events'
//     ],
// });

// interface GoogleApiError extends Error {
//     code?: number;
//     status?: string;
//     errors?: any[];
// }

// Test calendar access before proceeding
// async function testCalendarAccess() {
//     try {
//         const calendar = google.calendar({ version: 'v3', auth });

//         // Try to get the calendar details first
//         const calendarResponse = await calendar.calendars.get({
//             calendarId: credentials.calendar_id
//         }).catch((error: GoogleApiError) => {
//             console.error('Failed to access calendar:', {
//                 error: error.message,
//                 code: error.code,
//                 status: error.status,
//                 calendarId: credentials.calendar_id
//             });
//             throw error;
//         });

//         console.log('Successfully accessed calendar:', {
//             calendarId: credentials.calendar_id,
//             calendarTitle: calendarResponse.data.summary,
//             timeZone: calendarResponse.data.timeZone
//         });

//         return calendar;
//     } catch (error: any) {
//         console.error('Calendar access test failed:', error);
//         throw new Error('Failed to access Google Calendar. Please verify calendar ID and permissions.');
//     }
// }

// Initialize calendar with access test
// let calendar: any;
// testCalendarAccess().then(cal => {
//     calendar = cal;
//     console.log('Calendar client initialized successfully');
// }).catch((error: any) => {
//     console.error('Failed to initialize calendar client:', error);
// });

// Add interface for email payload
interface EmailPayload {
    from: {
        email: string;
        name: string;
    };
    to: Array<{
        email: string;
    }>;
    subject: string;
    content: Array<{
        type: string;
        value: string;
    }>;
}

interface UpdateOrderStatusRequest {
    orderId: number;
    status: 'pending' | 'accepted' | 'rejected';
}

async function sendStatusEmails(order: any, status: string, env: Env) {
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

    // Send email to customer if email is provided
    if (order.customer_email) {
        await sendEmail({
            from: `"Beton Teplice" <${env.GMAIL_USER}>`,
            to: [order.customer_email],
            subject: `Vaše objednávka ${statusMessages[status]}`,
            text: `Vážený zákazníku,\n\nVaše objednávka ${statusMessages[status]}.\n\n${orderDetails}\n\nS pozdravem,\nVáš tým betonáže`
        }, env);
    }

    // Send admin notification
    if (env.ADMIN_EMAIL) {
        await sendEmail({
            from: `"Beton Teplice" <${env.GMAIL_USER}>`,
            to: [env.ADMIN_EMAIL],
            subject: `Objednávka ${statusMessages[status]} - ${order.customer_name}`,
            text: `Nová objednávka byla ${statusMessages[status]}.\n\n${orderDetails}`
        }, env);
    }
}

interface CustomError extends Error {
    message: string;
}

export const updateOrderStatusHandler = async (request: Request, env: Env): Promise<Response> => {
    try {
        const sql = neon(env.NEON_DB_URL);
        const body = await request.json() as UpdateOrderStatusRequest;
        const { orderId, status } = body;

        // Validate request body
        if (!orderId || !status) {
            return new Response(JSON.stringify({
                message: 'Missing required fields: orderId and status'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate status value
        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return new Response(JSON.stringify({
                message: 'Invalid status value. Must be one of: pending, accepted, rejected'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fetch the order
        const result = await sql`
            UPDATE orders 
            SET status = ${status}
            WHERE id = ${orderId}
            RETURNING *
        `;

        if (result.length === 0) {
            return new Response(JSON.stringify({
                message: 'Order not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const order = result[0];

        // If status is accepted, create a calendar event
        if (status === 'accepted') {
            try {
                console.log('Order data for calendar:', {
                    date: order.date,
                    time: order.time,
                    fullOrder: order
                });
                await createCalendarEvent(order, env);
            } catch (calendarError) {
                console.error('Failed to create calendar event:', calendarError);
            }
        }

        // Send emails using MailChannels
        await sendStatusEmails(order, status, env);

        return new Response(JSON.stringify({
            message: 'Order status updated successfully',
            order: result[0]
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: unknown) {
        console.error('Error updating order status:', error);
        const customError = error as CustomError;
        return new Response(JSON.stringify({
            message: customError?.message || 'Unknown error',
            error: customError?.message === 'Unauthorized' ? 'Unauthorized' : 'Error updating order status'
        }), {
            status: customError?.message === 'Unauthorized' ? 401 : 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
