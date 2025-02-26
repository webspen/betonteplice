import { createOrderHandler } from './functions/createOrder';
import { getOrdersHandler } from './functions/getOrders';
import { getOrderDatesHandler } from './functions/getOrderDate';
import { updateOrderStatusHandler } from './functions/updateOrderStatus';
import { ExecutionContext } from '@cloudflare/workers-types';

export interface Env {
    NEON_DB_URL: string;
    ADMIN_EMAIL: string;
    GOOGLE_CLIENT_EMAIL: string;
    GOOGLE_PRIVATE_KEY: string;
    GOOGLE_CALENDAR_ID: string;
    GMAIL_USER: string;
    GMAIL_CLIENT_ID: string;
    GMAIL_CLIENT_SECRET: string;
    GMAIL_REFRESH_TOKEN: string;
    ALLOWED_ORIGIN: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // Add CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle CORS preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: corsHeaders
            });
        }

        // Route requests
        if (url.pathname === '/api/orders' && request.method === 'POST') {
            const response = await createOrderHandler({
                body: await request.text(),
                requestContext: {},
                queryStringParameters: {},
                env: env,
            });
            return new Response(response.body, {
                status: response.statusCode,
                headers: corsHeaders,
            });
        }

        if (url.pathname === '/api/orders' && request.method === 'GET') {
            const response = await getOrdersHandler({
                queryStringParameters: Object.fromEntries(url.searchParams),
                requestContext: {},
                env: env,
            });
            return new Response(response.body, {
                status: response.statusCode,
                headers: corsHeaders,
            });
        }

        if (url.pathname === '/api/orders/dates' && request.method === 'GET') {
            const response = await getOrderDatesHandler({ env });
            return new Response(response.body, {
                status: response.statusCode,
                headers: corsHeaders,
            });
        }

        if (url.pathname === '/api/orders/status' && request.method === 'PUT') {
            const response = await updateOrderStatusHandler(request, env);
            // Add CORS headers to the response
            Object.entries(corsHeaders).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
            return response;
        }

        return new Response('Not found', { status: 404 });
    },
}; 