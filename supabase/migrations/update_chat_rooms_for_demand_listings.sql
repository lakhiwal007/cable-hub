-- Update chat_rooms table to support both supply and demand listings

-- First, let's drop any existing foreign key constraints that might be causing issues
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS fk_chat_rooms_supply_listing;
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS fk_chat_rooms_demand_listing;
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_listing_id_fkey;

-- Create chat_rooms table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL,
    listing_type VARCHAR(10) NOT NULL DEFAULT 'supply',
    supplier_id UUID NOT NULL,
    buyer_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add listing_type column if it doesn't exist
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS listing_type VARCHAR(10) DEFAULT 'supply';

-- Update existing records to have listing_type = 'supply' if it's NULL
UPDATE chat_rooms SET listing_type = 'supply' WHERE listing_type IS NULL;

-- Make listing_type NOT NULL
ALTER TABLE chat_rooms ALTER COLUMN listing_type SET NOT NULL;

-- Add check constraint for listing_type
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS check_listing_type;
ALTER TABLE chat_rooms ADD CONSTRAINT check_listing_type CHECK (listing_type IN ('supply', 'demand'));

-- Add unique constraint for listing reference
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS unique_listing_reference;
ALTER TABLE chat_rooms ADD CONSTRAINT unique_listing_reference UNIQUE (listing_id, listing_type, supplier_id, buyer_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_listing_id ON chat_rooms(listing_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_supplier_id ON chat_rooms(supplier_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_buyer_id ON chat_rooms(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_listing_type ON chat_rooms(listing_type);

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for chat_rooms updated_at
DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at 
    BEFORE UPDATE ON chat_rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_room_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    sender_type VARCHAR(10) NOT NULL DEFAULT 'text',
    message_text TEXT NOT NULL,
    message_type VARCHAR(10) DEFAULT 'text',
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints to chat_messages
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS check_sender_type;
ALTER TABLE chat_messages ADD CONSTRAINT check_sender_type CHECK (sender_type IN ('supplier', 'buyer'));

ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS check_message_type;
ALTER TABLE chat_messages ADD CONSTRAINT check_message_type CHECK (message_type IN ('text', 'image', 'file', 'system'));

-- Create indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Create trigger for chat_messages updated_at
DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_at 
    BEFORE UPDATE ON chat_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Drop any existing foreign key constraints to avoid conflicts
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS fk_chat_rooms_supplier_id;
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS fk_chat_rooms_buyer_id;
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS fk_chat_messages_room_id;
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS fk_chat_messages_sender_id;

-- Add foreign key constraint for chat_messages to chat_rooms
ALTER TABLE chat_messages ADD CONSTRAINT fk_chat_messages_room_id 
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE;

-- Only add user foreign keys if users table exists and no conflicting constraints exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Check if constraints already exist to avoid duplicates
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                      WHERE table_name = 'chat_rooms' AND constraint_name = 'fk_chat_rooms_supplier_id') THEN
            ALTER TABLE chat_rooms ADD CONSTRAINT fk_chat_rooms_supplier_id 
                FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                      WHERE table_name = 'chat_rooms' AND constraint_name = 'fk_chat_rooms_buyer_id') THEN
            ALTER TABLE chat_rooms ADD CONSTRAINT fk_chat_rooms_buyer_id 
                FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                      WHERE table_name = 'chat_messages' AND constraint_name = 'fk_chat_messages_sender_id') THEN
            ALTER TABLE chat_messages ADD CONSTRAINT fk_chat_messages_sender_id 
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$; 