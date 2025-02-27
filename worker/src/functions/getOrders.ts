import { neon } from '@neondatabase/serverless';

interface CustomError extends Error {
    message: string;
}

export const getOrdersHandler = async (event: any): Promise<{ statusCode: number; body: string }> => {
    try {
        const sql = neon(event.env.NEON_DB_URL!);
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

    } catch (error: unknown) {
        console.error('Error fetching orders:', error);
        const customError = error as CustomError;
        return {
            statusCode: customError?.message === 'Unauthorized' ? 401 : 500,
            body: JSON.stringify({
                message: customError?.message === 'Unauthorized' ? 'Unauthorized' : 'Error fetching orders'
            })
        };
    }
}; 