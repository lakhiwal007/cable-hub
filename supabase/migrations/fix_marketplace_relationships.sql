-- ===============================================
-- Fix Marketplace Relationships Migration
-- ===============================================

-- Remove existing foreign key constraints from supply_listings
ALTER TABLE supply_listings DROP CONSTRAINT IF EXISTS supply_listings_supplier_id_fkey;

-- Remove existing foreign key constraints from demand_listings  
ALTER TABLE demand_listings DROP CONSTRAINT IF EXISTS demand_listings_buyer_id_fkey;

-- Add foreign key constraints to reference users table instead
ALTER TABLE supply_listings 
ADD CONSTRAINT fk_supply_listings_supplier 
FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE demand_listings 
ADD CONSTRAINT fk_demand_listings_buyer 
FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update marketplace_contacts to reference users table
ALTER TABLE marketplace_contacts DROP CONSTRAINT IF EXISTS marketplace_contacts_requester_id_fkey;
ALTER TABLE marketplace_contacts DROP CONSTRAINT IF EXISTS fk_marketplace_contacts_requester;
ALTER TABLE marketplace_contacts 
ADD CONSTRAINT fk_marketplace_contacts_requester 
FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE; 