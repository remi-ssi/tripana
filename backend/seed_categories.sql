-- Insert predefined categories into the categories table
-- Run this SQL script directly against your PostgreSQL database

INSERT INTO categories (name) VALUES 
('Nature'),
('Cultural and Historical'),
('Adventure'),
('Events'),
('Food'),
('City Exploration'),
('Entertainment'),
('Wellness Relaxation')
ON CONFLICT (name) DO NOTHING;

-- Verify insertion
SELECT * FROM categories;
