import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DB_URL!);

const createTableQuery = `
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    -- Customer info
    customer_type VARCHAR(50) NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_cid VARCHAR(20), -- ICO
    customer_vat BOOLEAN,
    customer_vat_number VARCHAR(20), -- DIC
    -- Contact person
    contact_name VARCHAR(200),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(200),
    -- Responsible person
    responsible_name VARCHAR(200),
    responsible_phone VARCHAR(20),
    responsible_email VARCHAR(200),
    -- Address
    address_type VARCHAR(50) NOT NULL,
    address_street VARCHAR(200),
    address_city VARCHAR(200),
    address_zip VARCHAR(10),
    address_region VARCHAR(200),
    address_note TEXT,
    -- Configuration
    concrete_type VARCHAR(50) NOT NULL,
    concrete_quality VARCHAR(200) NOT NULL,
    aggregate_thickness INTEGER,
    hose_length NUMERIC,
    pump_height NUMERIC,
    work_description TEXT
);`;

async function setup() {
    try {
        await sql(createTableQuery);
        console.log('Table created successfully!');
    } catch (error) {
        console.error('Error creating table:', error);
    }
    process.exit(0);
}

setup(); 