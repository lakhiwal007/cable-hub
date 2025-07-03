-- ===============================================
-- Cable Hub Connect - Chat System Schema
-- ===============================================

-- ===============================================
-- CHAT ROOMS TABLE
-- ===============================================
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL,
    listing_type VARCHAR(10) NOT NULL CHECK (listing_type IN ('supply', 'demand')),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique chat room for each listing-supplier-buyer combination
    UNIQUE(listing_id, supplier_id, buyer_id)
);

-- ===============================================
-- ADD FOREIGN KEY CONSTRAINTS FOR LISTING_ID
-- ===============================================
-- Note: Since listing_id can reference either supply_listings or demand_listings
-- based on listing_type, we'll add a constraint function to validate this

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
CREATE TRIGGER validate_chat_room_listing_trigger
    BEFORE INSERT OR UPDATE ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION validate_chat_room_listing();

-- ===============================================
-- CHAT MESSAGES TABLE
-- ===============================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('supplier', 'buyer')),
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- ADD VALIDATION FOR SENDER_ID
-- ===============================================
-- Function to validate sender_id based on sender_type
CREATE OR REPLACE FUNCTION validate_chat_message_sender()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sender_type = 'supplier' THEN
        IF NOT EXISTS (SELECT 1 FROM suppliers WHERE id = NEW.sender_id) THEN
            RAISE EXCEPTION 'Invalid supplier sender_id: %', NEW.sender_id;
        END IF;
    ELSIF NEW.sender_type = 'buyer' THEN
        IF NOT EXISTS (SELECT 1 FROM buyers WHERE id = NEW.sender_id) THEN
            RAISE EXCEPTION 'Invalid buyer sender_id: %', NEW.sender_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate sender_id
CREATE TRIGGER validate_chat_message_sender_trigger
    BEFORE INSERT OR UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION validate_chat_message_sender();

-- ===============================================
-- CHAT PARTICIPANTS TABLE (for extended functionality)
-- ===============================================
CREATE TABLE chat_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('supplier', 'buyer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Ensure unique participant per room
    UNIQUE(chat_room_id, user_id)
);

-- ===============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ===============================================

-- Chat rooms indexes
CREATE INDEX idx_chat_rooms_listing_id ON chat_rooms(listing_id);
CREATE INDEX idx_chat_rooms_supplier_id ON chat_rooms(supplier_id);
CREATE INDEX idx_chat_rooms_buyer_id ON chat_rooms(buyer_id);
CREATE INDEX idx_chat_rooms_status ON chat_rooms(status);
CREATE INDEX idx_chat_rooms_updated_at ON chat_rooms(updated_at);
CREATE INDEX idx_chat_rooms_last_message_at ON chat_rooms(last_message_at);

-- Chat messages indexes
CREATE INDEX idx_chat_messages_room_id ON chat_messages(chat_room_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_is_read ON chat_messages(is_read);

-- Chat participants indexes
CREATE INDEX idx_chat_participants_room_id ON chat_participants(chat_room_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_chat_participants_is_active ON chat_participants(is_active);

-- ===============================================
-- FUNCTIONS AND TRIGGERS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION update_chat_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_updated_at_column();

-- Function to update chat room's last_message_at when new message is added
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_rooms 
    SET 
        last_message_at = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.chat_room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update chat room when message is added
CREATE TRIGGER update_chat_room_on_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_room_last_message();

-- Function to create chat participants when chat room is created
CREATE OR REPLACE FUNCTION create_chat_participants()
RETURNS TRIGGER AS $$
BEGIN
    -- Add supplier as participant
    INSERT INTO chat_participants (chat_room_id, user_id, user_type)
    VALUES (NEW.id, NEW.supplier_id, 'supplier');
    
    -- Add buyer as participant
    INSERT INTO chat_participants (chat_room_id, user_id, user_type)
    VALUES (NEW.id, NEW.buyer_id, 'buyer');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create participants when chat room is created
CREATE TRIGGER create_participants_on_room_creation
    AFTER INSERT ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION create_chat_participants();

-- ===============================================
-- SECURITY POLICIES (Row Level Security)
-- ===============================================

-- Enable RLS on all chat tables
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- Chat rooms policies - users can only see rooms they're part of
CREATE POLICY "Users can view own chat rooms" ON chat_rooms FOR SELECT 
USING (auth.uid() = supplier_id OR auth.uid() = buyer_id);

CREATE POLICY "Users can create chat rooms" ON chat_rooms FOR INSERT 
WITH CHECK (auth.uid() = supplier_id OR auth.uid() = buyer_id);

CREATE POLICY "Users can update own chat rooms" ON chat_rooms FOR UPDATE 
USING (auth.uid() = supplier_id OR auth.uid() = buyer_id);

-- Chat messages policies - users can only see messages in their rooms
CREATE POLICY "Users can view messages in their rooms" ON chat_messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM chat_rooms 
        WHERE chat_rooms.id = chat_messages.chat_room_id 
        AND (chat_rooms.supplier_id = auth.uid() OR chat_rooms.buyer_id = auth.uid())
    )
);

CREATE POLICY "Users can send messages in their rooms" ON chat_messages FOR INSERT 
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM chat_rooms 
        WHERE chat_rooms.id = chat_messages.chat_room_id 
        AND (chat_rooms.supplier_id = auth.uid() OR chat_rooms.buyer_id = auth.uid())
    )
);

CREATE POLICY "Users can update own messages" ON chat_messages FOR UPDATE 
USING (sender_id = auth.uid());

-- Chat participants policies
CREATE POLICY "Users can view own participations" ON chat_participants FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage participants" ON chat_participants FOR ALL 
USING (true);

-- ===============================================
-- SAMPLE DATA
-- ===============================================

-- Note: Sample data will be created through the application when users start chatting

-- ===============================================
-- ENABLE REALTIME
-- ===============================================

-- Enable realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;

-- ===============================================
-- COMMENTS
-- ===============================================

COMMENT ON TABLE chat_rooms IS 'Chat rooms between suppliers and buyers for specific listings';
COMMENT ON TABLE chat_messages IS 'Messages exchanged in chat rooms';
COMMENT ON TABLE chat_participants IS 'Participants in chat rooms with read status tracking';

-- ===============================================
-- CHAT SYSTEM SCHEMA COMPLETE
-- =============================================== 