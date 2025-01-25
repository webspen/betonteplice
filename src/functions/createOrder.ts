import { neon } from '@neondatabase/serverless';
// import type { Handler } from 'aws-lambda';

export async function handler(event: any) {
    try {
        const sql = neon(process.env.NEON_DB_URL!);
        const body = JSON.parse(event.body);

        const { subject, persons, address, configuration } = body;

        const query = `
      INSERT INTO orders (
        subject_type, ico, company_name, contact_name, 
        phone, email, address_type, postal_code,
        region, city, address_note, stone_thickness,
        height, concrete_type, quality_type, hose_length,
        pump_with_operator, configuration_note
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING id;
    `;

        const result = await sql(query, [
            subject.typOsoby,
            subject.ico,
            subject.jmeno,
            persons.jmeno,
            persons.telefon,
            persons.email,
            address.typAdresy,
            address.psc,
            address.kraj,
            address.mesto,
            address.poznamka,
            configuration.configuration.tloustkaKameniva,
            configuration.configuration.vyska,
            configuration.configuration.druhBetonu,
            configuration.configuration.kvalitaTyp,
            configuration.configuration.delkaHadic,
            configuration.configuration.checkbox_8,
            configuration.configuration.poznamka
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
            body: JSON.stringify({ message: 'Error creating order' })
        };
    }
} 