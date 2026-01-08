-- Chat System Schema for Supabase
-- Run this in your Supabase SQL Editor

-- =============================================
-- CONVERSATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  assigned_to TEXT, -- user_id of admin/staff assigned to this conversation
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT, -- user_id if sent by admin/staff, null if sent by customer
  sender_name TEXT NOT NULL,
  sender_role TEXT DEFAULT 'customer' CHECK (sender_role IN ('admin', 'staff', 'customer')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'whatsapp_link')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
-- Allow public read/write for conversations (customers need to create conversations)
CREATE POLICY "Allow public access to conversations" ON conversations
  FOR ALL USING (true);

-- Messages policies
-- Allow public read/write for messages (customers need to send messages)
CREATE POLICY "Allow public access to messages" ON messages
  FOR ALL USING (true);

-- =============================================
-- AUTO-UPDATE TRIGGERS
-- =============================================
-- Update conversation's last_message_at when a new message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Update conversation's updated_at
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON conversations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_conversations_updated_at();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE conversations IS 'Chat conversations between customers and agents';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON COLUMN conversations.assigned_to IS 'User ID of admin/staff member assigned to handle this conversation';
COMMENT ON COLUMN messages.sender_id IS 'User ID if sent by admin/staff, null if sent by customer';
COMMENT ON COLUMN messages.message_type IS 'Type of message: text, system notification, or whatsapp_link';

