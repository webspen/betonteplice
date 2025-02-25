import { neon } from '@neondatabase/serverless';
// import { google } from 'googleapis';
// import { JWT } from 'google-auth-library';
import { createCalendarEvent } from '../services/calendar';

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

    // Create email payload with proper typing
    const emailPayload: EmailPayload = {
        from: {
            email: "noreply@betonteplice.cz",
            name: "Beton Teplice"
        },
        to: [], // Initialize empty array
        subject: `Vaše objednávka ${statusMessages[status]}`,
        content: [{
            type: "text/plain",
            value: `Vážený zákazníku,\n\nVaše objednávka ${statusMessages[status]}.\n\n${orderDetails}\n\nS pozdravem,\nVáš tým betonáže`
        }]
    };

    if (order.customer_email) {
        emailPayload.to = [{ email: order.customer_email }];
        await fetch('https://api.mailchannels.net/tx/v1/send', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });
    }

    // Send admin notification
    if (env.ADMIN_EMAIL) {
        const adminEmailPayload: EmailPayload = {
            ...emailPayload,
            to: [{ email: env.ADMIN_EMAIL }],
            subject: `Objednávka ${statusMessages[status]} - ${order.customer_name}`
        };

        await fetch('https://api.mailchannels.net/tx/v1/send', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(adminEmailPayload),
        });
    }
}

export const updateOrderStatusHandler = async (request: Request, env: Env) => {
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

    } catch (error) {
        console.error('Error updating order status:', error);
        return new Response(JSON.stringify({
            message: 'Error updating order status',
            error: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// Also add an interface for the order type
interface Order {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    address_street?: string;
    address_city?: string;
    address_zip?: string;
    date: string;
    time: string;
    config_type?: string;
    config_quality?: string;
    config_hose_length?: number;
    config_volume_height?: number;
    config_description?: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at: string;
}

// async function sendStatusEmails(order: Order, status: string, env: Env) {
//     const emailPayload = {
//         personalizations: [{
//             to: [{ email: order.customer_email }]
//         }],
//         from: {
//             email: "noreply@betonteplice.cz",
//             name: "Beton Teplice"
//         },
//         subject: `Objednávka ${status === 'accepted' ? 'potvrzena' : 'zamítnuta'}`,
//         content: [{
//             type: "text/plain",
//             value: `Vaše objednávka byla ${status === 'accepted' ? 'potvrzena' : 'zamítnuta'}.`
//         }]
//     };

//     // Send customer email
//     await fetch('https://api.mailchannels.net/tx/v1/send', {
//         method: 'POST',
//         headers: {
//             'content-type': 'application/json',
//         },
//         body: JSON.stringify(emailPayload),
//     });

//     // Send admin notification
//     const adminEmailPayload = {
//         ...emailPayload,
//         personalizations: [{
//             to: [{ email: env.ADMIN_EMAIL }]
//         }],
//         subject: `Nová objednávka ${status === 'accepted' ? 'potvrzena' : 'zamítnuta'}`,
//     };

//     await fetch('https://api.mailchannels.net/tx/v1/send', {
//         method: 'POST',
//         headers: {
//             'content-type': 'application/json',
//         },
//         body: JSON.stringify(adminEmailPayload),
//     });
// } 