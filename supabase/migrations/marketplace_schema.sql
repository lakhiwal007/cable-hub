-- ===============================================
-- Cable Hub Connect - Marketplace Database Schema
-- ===============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- SUPPLIERS TABLE
-- ===============================================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT NOT NULL,
    gst_number VARCHAR(20),
    website VARCHAR(255),
    description TEXT,
    verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_listings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- BUYERS TABLE
-- ===============================================
CREATE TABLE buyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT,
    gst_number VARCHAR(20),
    website VARCHAR(255),
    description TEXT,
    verified BOOLEAN DEFAULT FALSE,
    total_requirements INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- SUPPLY LISTINGS TABLE
-- ===============================================
CREATE TABLE supply_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    material_type VARCHAR(100) NOT NULL,
    grade_specification VARCHAR(255) NOT NULL,
    available_quantity DECIMAL(12,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price_per_unit DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    minimum_order DECIMAL(12,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    delivery_terms TEXT,
    certification VARCHAR(255),
    images TEXT[], -- Array of image URLs
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- DEMAND LISTINGS TABLE
-- ===============================================
CREATE TABLE demand_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    material_type VARCHAR(100) NOT NULL,
    specifications TEXT NOT NULL,
    required_quantity DECIMAL(12,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    budget_min DECIMAL(12,2) NOT NULL,
    budget_max DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    location VARCHAR(255) NOT NULL,
    delivery_deadline VARCHAR(255) NOT NULL,
    additional_requirements TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_urgent BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- MARKETPLACE CONTACTS TABLE
-- ===============================================
CREATE TABLE marketplace_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL,
    listing_type VARCHAR(10) NOT NULL CHECK (listing_type IN ('supply', 'demand')),
    requester_id UUID NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    requester_phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ===============================================

-- Supply listings indexes
CREATE INDEX idx_supply_listings_supplier_id ON supply_listings(supplier_id);
CREATE INDEX idx_supply_listings_category ON supply_listings(category);
CREATE INDEX idx_supply_listings_material_type ON supply_listings(material_type);
CREATE INDEX idx_supply_listings_location ON supply_listings(location);
CREATE INDEX idx_supply_listings_is_active ON supply_listings(is_active);
CREATE INDEX idx_supply_listings_is_verified ON supply_listings(is_verified);
CREATE INDEX idx_supply_listings_is_urgent ON supply_listings(is_urgent);
CREATE INDEX idx_supply_listings_price ON supply_listings(price_per_unit);
CREATE INDEX idx_supply_listings_created_at ON supply_listings(created_at);

-- Demand listings indexes
CREATE INDEX idx_demand_listings_buyer_id ON demand_listings(buyer_id);
CREATE INDEX idx_demand_listings_category ON demand_listings(category);
CREATE INDEX idx_demand_listings_material_type ON demand_listings(material_type);
CREATE INDEX idx_demand_listings_location ON demand_listings(location);
CREATE INDEX idx_demand_listings_is_active ON demand_listings(is_active);
CREATE INDEX idx_demand_listings_is_urgent ON demand_listings(is_urgent);
CREATE INDEX idx_demand_listings_budget ON demand_listings(budget_min, budget_max);
CREATE INDEX idx_demand_listings_created_at ON demand_listings(created_at);

-- Marketplace contacts indexes
CREATE INDEX idx_marketplace_contacts_listing_id ON marketplace_contacts(listing_id);
CREATE INDEX idx_marketplace_contacts_listing_type ON marketplace_contacts(listing_type);
CREATE INDEX idx_marketplace_contacts_requester_id ON marketplace_contacts(requester_id);
CREATE INDEX idx_marketplace_contacts_status ON marketplace_contacts(status);
CREATE INDEX idx_marketplace_contacts_created_at ON marketplace_contacts(created_at);

-- ===============================================
-- FUNCTIONS AND TRIGGERS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supply_listings_updated_at BEFORE UPDATE ON supply_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demand_listings_updated_at BEFORE UPDATE ON demand_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_contacts_updated_at BEFORE UPDATE ON marketplace_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- SAMPLE DATA
-- ===============================================

-- Insert sample suppliers
INSERT INTO suppliers (name, email, phone, company_name, company_address, gst_number, verified, rating, description) VALUES 
('Rajesh Kumar', 'rajesh@metalcorp.com', '+91-9876543210', 'MetalCorp Industries Ltd', '123 Industrial Area, Delhi-110001', '07AABCM1234M1ZX', TRUE, 4.5, 'Leading supplier of copper and aluminum products for electrical industry'),
('Priya Sharma', 'priya@primemetals.com', '+91-9876543211', 'Prime Metals Pvt Ltd', '456 Manufacturing Hub, Mumbai-400001', '27AABCP5678N1ZY', TRUE, 4.2, 'Specialist in high-grade raw materials for cable manufacturing'),
('Amit Patel', 'amit@cabletech.com', '+91-9876543212', 'CableTech Solutions', '789 Tech Park, Bangalore-560001', '29AABCA9012P1ZZ', FALSE, 3.8, 'Innovative solutions for modern cable requirements');

-- Insert sample buyers
INSERT INTO buyers (name, email, phone, company_name, company_address, gst_number, verified) VALUES 
('Sunita Gupta', 'sunita@induscables.com', '+91-9876543220', 'Indus Cables Ltd', '321 Cable Street, Chennai-600001', '33AABCI1234Q1ZA', TRUE),
('Vikram Singh', 'vikram@powercorp.com', '+91-9876543221', 'PowerCorp Industries', '654 Electric Avenue, Hyderabad-500001', '36AABCP5678R1ZB', TRUE),
('Neha Joshi', 'neha@moderncables.com', '+91-9876543222', 'Modern Cables Pvt Ltd', '987 Innovation Drive, Pune-411001', '27AABCM9012S1ZC', FALSE);

-- Insert sample supply listings
INSERT INTO supply_listings (supplier_id, title, description, category, material_type, grade_specification, available_quantity, unit, price_per_unit, minimum_order, location, delivery_terms, certification, is_verified, is_urgent) VALUES 
((SELECT id FROM suppliers WHERE email = 'rajesh@metalcorp.com'), 'High Grade Copper Wire 99.9% Pure', 'Premium quality copper wire suitable for high-end electrical applications. Tested for conductivity and purity.', 'copper', 'Copper Wire', '99.9% Pure, EC Grade', 5000, 'kg', 485.50, 100, 'Delhi, India', 'FOB Delhi, 7-10 days delivery', 'IS 8130, IEC 60228', TRUE, FALSE),
((SELECT id FROM suppliers WHERE email = 'priya@primemetals.com'), 'Aluminum Conductor Grade AA8000', 'High conductivity aluminum conductor conforming to international standards for power transmission.', 'aluminum', 'Aluminum Conductor', 'AA8000 Series', 10000, 'kg', 162.25, 500, 'Mumbai, India', 'CIF Mumbai Port, 5-7 days', 'IS 8130, ASTM B230', TRUE, TRUE),
((SELECT id FROM suppliers WHERE email = 'amit@cabletech.com'), 'PVC Compound Grade ST2', 'Flame retardant PVC compound suitable for cable insulation and sheathing applications.', 'pvc', 'PVC Compound', 'ST2 Grade, Flame Retardant', 2000, 'kg', 89.75, 50, 'Bangalore, India', 'Ex-works Bangalore, 3-5 days', 'IS 5831, IEC 60502', FALSE, FALSE);

-- Insert sample demand listings
INSERT INTO demand_listings (buyer_id, title, description, category, material_type, specifications, required_quantity, unit, budget_min, budget_max, location, delivery_deadline, additional_requirements, is_urgent) VALUES 
((SELECT id FROM buyers WHERE email = 'sunita@induscables.com'), 'Copper Wire for Power Cable Manufacturing', 'Require high purity copper wire for manufacturing 11kV power cables. Must meet international standards.', 'copper', 'Copper Wire', '99.9% Pure, Soft Annealed, 2.5mm diameter', 3000, 'kg', 480.00, 490.00, 'Chennai, India', '15 days from order', 'Must have IS 8130 certification. Packaging in 25kg drums preferred.', TRUE),
((SELECT id FROM buyers WHERE email = 'vikram@powercorp.com'), 'XLPE Compound for HV Cables', 'Need cross-linked polyethylene compound for high voltage cable insulation up to 33kV rating.', 'xlpe', 'XLPE Compound', 'TR-XLPE, 33kV grade, Black color', 1500, 'kg', 140.00, 150.00, 'Hyderabad, India', '20 days', 'Require test certificates and material data sheets. Bulk packaging required.', FALSE),
((SELECT id FROM buyers WHERE email = 'neha@moderncables.com'), 'Aluminum Wire Rod for Conductor Manufacturing', 'Urgent requirement for aluminum wire rod to manufacture overhead transmission conductors.', 'aluminum', 'Aluminum Wire Rod', '1370 Grade, 9.5mm diameter', 5000, 'kg', 158.00, 165.00, 'Pune, India', '10 days', 'Must comply with IS 8130 and ASTM B230. Urgent delivery required.', TRUE);

-- Insert sample marketplace contacts
INSERT INTO marketplace_contacts (listing_id, listing_type, requester_id, requester_name, requester_email, requester_phone, message, status) VALUES 
((SELECT id FROM supply_listings WHERE title LIKE '%Copper Wire%' LIMIT 1), 'supply', (SELECT id FROM buyers WHERE email = 'sunita@induscables.com'), 'Sunita Gupta', 'sunita@induscables.com', '+91-9876543220', 'Interested in your copper wire. Can you provide samples and detailed specifications?', 'pending'),
((SELECT id FROM demand_listings WHERE title LIKE '%XLPE Compound%' LIMIT 1), 'demand', (SELECT id FROM suppliers WHERE email = 'amit@cabletech.com'), 'Amit Patel', 'amit@cabletech.com', '+91-9876543212', 'We can supply XLPE compound as per your requirements. Please contact us for detailed quotation.', 'responded'); 