import { neon } from '@neondatabase/serverless';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export async function handler(event: any) {
    try {
        const sql = neon(process.env.NEON_DB_URL!);
        const { orderId, status } = JSON.parse(event.body);

        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid status' })
            };
        }

        const query = `
      UPDATE orders 
      SET status = $1 
      WHERE id = $2 
      RETURNING *
    `;

        const result = await sql(query, [status, orderId]);

        if (result.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Order not found' })
            };
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
            body: JSON.stringify({ message: 'Error updating order status' })
        };
    }
} 