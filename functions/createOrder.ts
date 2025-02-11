import { neon } from '@neondatabase/serverless';

export async function handler(event: any) {
    try {
        const sql = neon(env.DATABASE_URL!);
        const form = JSON.parse(event.body);

        const query = `
      INSERT INTO orders (
        customer_type,
        customer_cid,
        customer_name,
        customer_vat,
        customer_vat_number,
        customer_phone,
        customer_email,
        contact_name,
        contact_phone,
        contact_email,
        address_type,
        address_street,
        address_state,
        address_city,
        address_zip,
        address_country,
        address_note,
        date,
        time,
        config_type,
        config_thickness,
        config_quality,
        config_height,
        config_hose_length,
        config_volume_height,
        config_description
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26
      ) RETURNING id;
    `;

        const result = await sql(query, [
            form.customer_type,
            form.customer_cid,
            form.customer_name,
            form.customer_vat,
            form.customer_vat_number,
            form.customer_phone,
            form.customer_email,
            form.contact_name,
            form.contact_phone,
            form.contact_email,
            form.address_type,
            form.address_street,
            form.address_state,
            form.address_city,
            form.address_zip,
            form.address_country,
            form.address_note,
            form.date,
            form.time,
            form.config.type,
            form.config.thickness,
            form.config.quality,
            form.config.height,
            form.config.hose_length,
            form.config.volume_height,
            form.config.description
        ]);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Order created successfully',
                orderId: result[0].id
            })
        };

    } catch (error) {
        console.error('Error creating order:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error creating order',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
} 