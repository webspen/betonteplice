-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    -- Customer information
    customer_type VARCHAR(50) NOT NULL,
    customer_cid VARCHAR(8),
    customer_name VARCHAR(200) NOT NULL,
    customer_vat BOOLEAN DEFAULT FALSE,
    customer_vat_number VARCHAR(12),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(100),
    
    -- Contact person information
    contact_name VARCHAR(200),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    
    -- Address information
    address_type VARCHAR(50) NOT NULL,
    address_street TEXT,
    address_state VARCHAR(100),
    address_city VARCHAR(100),
    address_zip VARCHAR(10),
    address_country VARCHAR(2) DEFAULT 'CZ',
    address_note TEXT,
    
    -- Date and time
    date DATE NOT NULL,
    time TIME NOT NULL,
    
    -- Concrete configuration
    config_type VARCHAR(50) NOT NULL,
    config_thickness INTEGER,
    config_quality VARCHAR(100) NOT NULL,
    config_height INTEGER,
    config_hose_length INTEGER NOT NULL,
    config_volume_height INTEGER NOT NULL,
    config_description TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on customer_cid for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_cid ON orders(customer_cid);

-- Create an index on date for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns for better documentation
COMMENT ON TABLE orders IS 'Stores concrete delivery orders';
COMMENT ON COLUMN orders.customer_type IS 'Type of customer (fyzicka, podnikatel, pravnicka, baracnik)';
COMMENT ON COLUMN orders.customer_cid IS 'Customer identification number (ICO)';
COMMENT ON COLUMN orders.customer_vat IS 'Whether the customer is VAT registered';
COMMENT ON COLUMN orders.customer_vat_number IS 'Customer VAT number (DIC)';
COMMENT ON COLUMN orders.address_type IS 'Type of delivery address (existing, construction)';
COMMENT ON COLUMN orders.config_type IS 'Type of concrete delivery (vlastni, betonTeplice, betonMimo)';
COMMENT ON COLUMN orders.config_thickness IS 'Concrete aggregate thickness in mm';
COMMENT ON COLUMN orders.config_hose_length IS 'Length of hose in meters';
COMMENT ON COLUMN orders.config_volume_height IS 'Pumping height in meters';
