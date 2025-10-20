-- FarmTally Database Schema
-- Create all necessary tables for the FarmTally application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM (
  'APPLICATION_ADMIN',
  'FARM_ADMIN', 
  'FIELD_MANAGER',
  'FARMER'
);

-- User status enum
CREATE TYPE user_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED'
);

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  owner_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  status user_status DEFAULT 'PENDING',
  organization_id UUID REFERENCES organizations(id),
  profile JSONB DEFAULT '{}',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  rejection_reason TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farmers table
CREATE TABLE farmers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  id_number VARCHAR(50),
  bank_account VARCHAR(50),
  bank_details JSONB DEFAULT '{}',
  organization_id UUID REFERENCES organizations(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lorries table
CREATE TABLE lorries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  license_plate VARCHAR(50) UNIQUE NOT NULL,
  capacity DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'AVAILABLE',
  organization_id UUID REFERENCES organizations(id),
  assigned_manager_id UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lorry requests table
CREATE TABLE lorry_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  manager_id UUID REFERENCES users(id),
  required_date DATE NOT NULL,
  priority VARCHAR(20) DEFAULT 'MEDIUM',
  purpose TEXT NOT NULL,
  estimated_duration INTEGER,
  location TEXT,
  expected_volume DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'PENDING',
  assigned_lorry_id UUID REFERENCES lorries(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliveries table
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  lorry_id UUID REFERENCES lorries(id),
  farmer_id UUID REFERENCES farmers(id),
  field_manager_id UUID REFERENCES users(id),
  delivery_date DATE,
  bags_count INTEGER NOT NULL,
  individual_weights DECIMAL[] DEFAULT '{}',
  gross_weight DECIMAL(10,2),
  moisture_content DECIMAL(5,2),
  standard_deduction DECIMAL(10,2) DEFAULT 0,
  quality_deduction DECIMAL(10,2) DEFAULT 0,
  net_weight DECIMAL(10,2),
  price_per_kg DECIMAL(10,2),
  total_value DECIMAL(12,2),
  advance_amount DECIMAL(12,2) DEFAULT 0,
  interest_charges DECIMAL(12,2) DEFAULT 0,
  final_amount DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'IN_PROGRESS',
  photos TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advance payments table
CREATE TABLE advance_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  farmer_id UUID REFERENCES farmers(id),
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_date DATE NOT NULL,
  reference_number VARCHAR(100),
  reason TEXT,
  notes TEXT,
  receipt_photo TEXT,
  recorded_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_farmers_organization ON farmers(organization_id);
CREATE INDEX idx_lorries_organization ON lorries(organization_id);
CREATE INDEX idx_lorry_requests_organization ON lorry_requests(organization_id);
CREATE INDEX idx_deliveries_organization ON deliveries(organization_id);
CREATE INDEX idx_advance_payments_organization ON advance_payments(organization_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON farmers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lorries_updated_at BEFORE UPDATE ON lorries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lorry_requests_updated_at BEFORE UPDATE ON lorry_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advance_payments_updated_at BEFORE UPDATE ON advance_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();