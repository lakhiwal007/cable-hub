-- Create calculation_constants table
CREATE TABLE IF NOT EXISTS calculation_constants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'material_densities', 'cost_factors', 'calculation_constants'
    name VARCHAR(100) NOT NULL, -- 'copper', 'aluminum', 'labor_cost', etc.
    value DECIMAL(10, 4) NOT NULL,
    unit VARCHAR(20), -- 'kg/m³', '%', 'factor', etc.
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, name)
);

-- Insert default material densities
INSERT INTO calculation_constants (category, name, value, unit, description) VALUES
-- Material Densities (kg/m³)
('material_densities', 'copper', 8960.0000, 'kg/m³', 'Density of copper material'),
('material_densities', 'aluminum', 2700.0000, 'kg/m³', 'Density of aluminum material'),
('material_densities', 'pvc', 1380.0000, 'kg/m³', 'Density of PVC material'),
('material_densities', 'xlpe', 920.0000, 'kg/m³', 'Density of XLPE material'),
('material_densities', 'rubber', 1200.0000, 'kg/m³', 'Density of rubber material'),

-- Cost Factors (%)
('cost_factors', 'labor_cost', 15.0000, '%', 'Labor cost percentage'),
('cost_factors', 'overhead_cost', 10.0000, '%', 'Overhead cost percentage'),
('cost_factors', 'profit_margin', 20.0000, '%', 'Profit margin percentage'),
('cost_factors', 'waste_factor', 5.0000, '%', 'Waste factor percentage'),

-- Calculation Constants
('calculation_constants', 'conductor_density_factor', 1.0000, 'factor', 'Conductor density adjustment factor'),
('calculation_constants', 'insulation_thickness_factor', 1.2000, 'factor', 'Insulation thickness adjustment factor'),
('calculation_constants', 'sheath_thickness_factor', 1.1000, 'factor', 'Sheath thickness adjustment factor'),
('calculation_constants', 'length_safety_factor', 1.0200, 'factor', 'Length safety factor'),

-- Electrical Resistivity (Ω·m)
('electrical_constants', 'copper_resistivity', 0.0000000168, 'Ω·m', 'Electrical resistivity of copper'),
('electrical_constants', 'aluminum_resistivity', 0.0000000282, 'Ω·m', 'Electrical resistivity of aluminum'),

-- Default Material Prices (₹/kg)
('default_prices', 'copper', 485.0000, '₹/kg', 'Default price for copper'),
('default_prices', 'aluminum', 162.0000, '₹/kg', 'Default price for aluminum'),
('default_prices', 'pvc', 89.0000, '₹/kg', 'Default price for PVC'),
('default_prices', 'xlpe', 145.0000, '₹/kg', 'Default price for XLPE'),
('default_prices', 'rubber', 120.0000, '₹/kg', 'Default price for rubber')
ON CONFLICT (category, name) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_calculation_constants_category ON calculation_constants(category);
CREATE INDEX IF NOT EXISTS idx_calculation_constants_active ON calculation_constants(is_active);

-- Enable RLS
ALTER TABLE calculation_constants ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin can manage calculation constants" ON calculation_constants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'admin'
        )
    );

-- Create policy for read access
CREATE POLICY "Users can read calculation constants" ON calculation_constants
    FOR SELECT USING (is_active = true); 