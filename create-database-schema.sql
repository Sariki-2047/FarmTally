-- FarmTally Database Schema
-- Create all necessary tables for the microservices

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('APPLICATION_ADMIN', 'FARM_ADMIN', 'FIELD_MANAGER', 'FARMER')),
    organization_id UUID,
    profile JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farmers table
CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    id_number VARCHAR(50),
    bank_details JSONB DEFAULT '{}',
    organization_id UUID,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Lorries table
CREATE TABLE IF NOT EXISTS lorries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    capacity DECIMAL(10,2) NOT NULL,
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    organization_id UUID,
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'MAINTENANCE')),
    current_request_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Lorry Requests table
CREATE TABLE IF NOT EXISTS lorry_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_manager_id UUID NOT NULL,
    requested_date DATE NOT NULL,
    location TEXT NOT NULL,
    estimated_quantity DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')),
    lorry_id UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    approval_notes TEXT,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (field_manager_id) REFERENCES users(id),
    FOREIGN KEY (lorry_id) REFERENCES lorries(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (rejected_by) REFERENCES users(id)
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL,
    lorry_id UUID NOT NULL,
    field_manager_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    delivery_date DATE NOT NULL,
    total_bags INTEGER DEFAULT 0,
    gross_weight DECIMAL(10,2) DEFAULT 0,
    net_weight DECIMAL(10,2) DEFAULT 0,
    average_moisture DECIMAL(5,2) DEFAULT 0,
    quality_notes TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    settlement_status VARCHAR(20) CHECK (settlement_status IN ('PENDING', 'PROCESSED', 'PAID')),
    settlement_id UUID,
    total_value DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id),
    FOREIGN KEY (lorry_id) REFERENCES lorries(id),
    FOREIGN KEY (field_manager_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Delivery Bags table
CREATE TABLE IF NOT EXISTS delivery_bags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL,
    bag_number INTEGER NOT NULL,
    weight DECIMAL(8,2) NOT NULL,
    moisture_content DECIMAL(5,2),
    quality_grade VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE
);

-- Advance Payments table
CREATE TABLE IF NOT EXISTS advance_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    field_manager_id UUID NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'CASH' CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'CHEQUE')),
    payment_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SETTLED', 'CANCELLED')),
    settlement_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (field_manager_id) REFERENCES users(id)
);

-- Pricing Rules table
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    moisture_threshold DECIMAL(5,2) NOT NULL,
    moisture_deduction DECIMAL(10,2) DEFAULT 0,
    quality_bonuses JSONB DEFAULT '{}',
    effective_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Settlements table
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL,
    farmer_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    gross_weight DECIMAL(10,2) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    moisture_deduction DECIMAL(10,2) DEFAULT 0,
    quality_bonus DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    processed_by UUID NOT NULL,
    settlement_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PROCESSED' CHECK (status IN ('PROCESSED', 'PAID', 'CANCELLED')),
    payment_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
    FOREIGN KEY (farmer_id) REFERENCES farmers(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_farmers_phone ON farmers(phone);
CREATE INDEX IF NOT EXISTS idx_farmers_organization ON farmers(organization_id);
CREATE INDEX IF NOT EXISTS idx_lorry_requests_status ON lorry_requests(status);
CREATE INDEX IF NOT EXISTS idx_lorry_requests_field_manager ON lorry_requests(field_manager_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_farmer ON deliveries(farmer_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_organization ON deliveries(organization_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_advance_payments_farmer ON advance_payments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_advance_payments_status ON advance_payments(status);

-- Insert default system admin user
INSERT INTO users (email, password_hash, role, profile, status) 
VALUES (
    'admin@farmtally.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL/.HL9S.', -- password: Admin123!
    'APPLICATION_ADMIN',
    '{"firstName": "System", "lastName": "Admin"}',
    'APPROVED'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample organization
INSERT INTO organizations (name, code, address, phone, email) 
VALUES (
    'FarmTally Demo Organization',
    'DEMO001',
    '123 Farm Street, Agriculture City',
    '+1234567890',
    'demo@farmtally.com'
) ON CONFLICT (code) DO NOTHING;