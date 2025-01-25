CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
    subject_type VARCHAR(20) NOT NULL,
    ico VARCHAR(20),
    company_name VARCHAR(255),
    contact_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address_type VARCHAR(50) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    region VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    address_note TEXT,
    stone_thickness INTEGER NOT NULL,
    height VARCHAR(50) NOT NULL,
    concrete_type VARCHAR(50) NOT NULL,
    quality_type VARCHAR(255),
    hose_length VARCHAR(50) NOT NULL,
    pump_with_operator BOOLEAN DEFAULT false,
    configuration_note TEXT
);
