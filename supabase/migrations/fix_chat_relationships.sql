-- ===============================================
-- Fix Chat Room Relationships Migration
-- ===============================================

-- Remove existing foreign key constraints if they exist
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS fk_chat_rooms_supplier;
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS fk_chat_rooms_buyer;

-- Add foreign key constraints to reference users table instead
ALTER TABLE chat_rooms 
ADD CONSTRAINT fk_chat_rooms_supplier 
FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE chat_rooms 
ADD CONSTRAINT fk_chat_rooms_buyer 
FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update chat_participants to reference users table
ALTER TABLE chat_participants DROP CONSTRAINT IF EXISTS fk_chat_participants_user;
ALTER TABLE chat_participants 
ADD CONSTRAINT fk_chat_participants_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update chat_messages sender_id to reference users table
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS fk_chat_messages_sender;
ALTER TABLE chat_messages 
ADD CONSTRAINT fk_chat_messages_sender 
FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

-- ===============================================
-- ADD VALIDATION FOR LISTING_ID
-- ===============================================
-- Function to validate listing_id based on listing_type
CREATE OR REPLACE FUNCTION validate_chat_room_listing()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.listing_type = 'supply' THEN
        IF NOT EXISTS (SELECT 1 FROM supply_listings WHERE id = NEW.listing_id) THEN
            RAISE EXCEPTION 'Invalid supply listing_id: %', NEW.listing_id;
        END IF;
    ELSIF NEW.listing_type = 'demand' THEN
        IF NOT EXISTS (SELECT 1 FROM demand_listings WHERE id = NEW.listing_id) THEN
            RAISE EXCEPTION 'Invalid demand listing_id: %', NEW.listing_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate listing_id
DROP TRIGGER IF EXISTS validate_chat_room_listing_trigger ON chat_rooms;
CREATE TRIGGER validate_chat_room_listing_trigger
    BEFORE INSERT OR UPDATE ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION validate_chat_room_listing();

-- ===============================================
-- REMOVE SENDER VALIDATION (not needed with FK)
-- ===============================================
-- Remove the sender validation function since we now have FK constraint
DROP TRIGGER IF EXISTS validate_chat_message_sender_trigger ON chat_messages;
DROP FUNCTION IF EXISTS validate_chat_message_sender(); 