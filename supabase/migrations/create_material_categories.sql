-- Create material_categories table
CREATE TABLE IF NOT EXISTS material_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample material categories with placeholder images
INSERT INTO material_categories (name, image_url) VALUES
    ('Copper Wire', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
    ('Aluminum Wire', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
    ('PVC Insulation', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
    ('XLPE Insulation', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
    ('Rubber Insulation', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
    ('Steel Armor', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
    ('Fiber Optic Cable', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
    ('Control Cable', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
    ('Power Cable', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
    ('Communication Cable', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop')
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_material_categories_updated_at 
    BEFORE UPDATE ON material_categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 