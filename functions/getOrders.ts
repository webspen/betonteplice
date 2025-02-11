import { neon } from '@neondatabase/serverless';

export async function handler(event: any) {
    try {
        const sql = neon(env.DATABASE_URL!);
        const queryParams = event.queryStringParameters || {};

        let query = 'SELECT * FROM orders';
        const params: any[] = [];
        const conditions: string[] = [];

        // Add filters if provided
        if (queryParams.status) {
            conditions.push(`status = $${params.length + 1}`);
            params.push(queryParams.status);
        }

        if (queryParams.dateFrom) {
            conditions.push(`created_at >= $${params.length + 1}`);
            params.push(queryParams.dateFrom);
        }

        if (queryParams.dateTo) {
            conditions.push(`created_at <= $${params.length + 1}`);
            params.push(queryParams.dateTo);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        const results = await sql(query, params);

        return {
            statusCode: 200,
            body: JSON.stringify(results)
        };

    } catch (error) {
        console.error('Error fetching orders:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error fetching orders' })
        };
    }
} 