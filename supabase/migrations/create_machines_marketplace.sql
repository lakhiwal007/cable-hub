-- Create machine types table
CREATE TABLE IF NOT EXISTS machine_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default machine types
INSERT INTO machine_types (name, category) VALUES
  ('Extruders', 'Processing'),
  ('Laying', 'Assembly'),
  ('Stranding', 'Wire Processing'),
  ('Drum Twisters', 'Wire Processing'),
  ('RBD Copper', 'Drawing'),
  ('RDB Aluminum', 'Drawing'),
  ('Fine Drawing Machines', 'Drawing'),
  ('Annealers', 'Heat Treatment'),
  ('Tinning Machines', 'Coating'),
  ('Wire Drawing Machines', 'Drawing'),
  ('Cable Sheathing Machines', 'Processing'),
  ('Insulation Machines', 'Processing'),
  ('Armoring Machines', 'Assembly'),
  ('Jacketing Machines', 'Processing'),
  ('Testing Machines', 'Quality Control'),
  ('Packaging Machines', 'Packaging'),
  ('Cutting Machines', 'Processing'),
  ('Spooling Machines', 'Winding'),
  ('Bunching Machines', 'Assembly'),
  ('Taping Machines', 'Processing')
ON CONFLICT (name) DO NOTHING;

-- Create sell machines table
CREATE TABLE IF NOT EXISTS sell_machines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  machine_name VARCHAR(255) NOT NULL,
  machine_type_id UUID REFERENCES machine_types(id),
  payoff_nos INTEGER,
  payoff_size VARCHAR(100),
  main_motor_capacity VARCHAR(100),
  line_speed_max_size VARCHAR(100),
  video_url TEXT,
  expected_daily_production VARCHAR(100),
  manufacturing_location VARCHAR(255),
  material_specification_url TEXT,
  production_image_urls TEXT[],
  other_options JSONB,
  whatsapp_number VARCHAR(20),
  price DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'INR',
  is_urgent BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buy machines table
CREATE TABLE IF NOT EXISTS buy_machines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  machine_name VARCHAR(255) NOT NULL,
  machine_type_id UUID REFERENCES machine_types(id),
  payoff_nos INTEGER,
  payoff_size VARCHAR(100),
  main_motor_capacity VARCHAR(100),
  line_speed_max_size VARCHAR(100),
  expected_daily_production VARCHAR(100),
  manufacturing_location VARCHAR(255),
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'INR',
  notes TEXT,
  whatsapp_number VARCHAR(20),
  is_urgent BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sell_machines_user_id ON sell_machines(user_id);
CREATE INDEX IF NOT EXISTS idx_sell_machines_machine_type_id ON sell_machines(machine_type_id);
CREATE INDEX IF NOT EXISTS idx_sell_machines_status ON sell_machines(status);
CREATE INDEX IF NOT EXISTS idx_buy_machines_user_id ON buy_machines(user_id);
CREATE INDEX IF NOT EXISTS idx_buy_machines_machine_type_id ON buy_machines(machine_type_id);
CREATE INDEX IF NOT EXISTS idx_buy_machines_status ON buy_machines(status);

-- Enable RLS (Row Level Security)
ALTER TABLE machine_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE buy_machines ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Machine types are viewable by everyone" ON machine_types
  FOR SELECT USING (true);

CREATE POLICY "Users can view all sell machines" ON sell_machines
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own sell machines" ON sell_machines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sell machines" ON sell_machines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sell machines" ON sell_machines
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all buy machines" ON buy_machines
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own buy machines" ON buy_machines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buy machines" ON buy_machines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own buy machines" ON buy_machines
  FOR DELETE USING (auth.uid() = user_id); 