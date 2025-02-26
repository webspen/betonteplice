import { neon } from '@neondatabase/serverless';

export const getOrderDatesHandler = async (event: any) => {
    try {
        const sql = neon(event.env.NEON_DB_URL!);

        // Query to get all dates with their status where date is in the future
        const query = `
            SELECT 
                date::date as date,
                status
            FROM orders 
            WHERE date >= CURRENT_DATE
            ORDER BY date ASC
        `;

        const results = await sql(query);

        // Format the results to match the expected OrderDate type
        const formattedResults = results.map((row: any) => ({
            date: row.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
            status: row.status
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Add CORS headers
                'Access-Control-Allow-Methods': 'GET'
            },
            body: JSON.stringify(formattedResults)
        };

    } catch (error: any) {
        console.error('Error fetching order dates:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Error fetching order dates',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
}; 