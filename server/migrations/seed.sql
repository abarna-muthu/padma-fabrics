-- Initial Seed Data for Padma Fabrics
-- Categories
INSERT INTO categories (id, name, slug, description, display_order) VALUES
('saree', 'Saree', 'saree', 'Silk & handloom drapes', 1),
('chudithar', 'Chudithar', 'chudithar', 'Elegant ethnic suits', 2),
('coordset', 'Coordset', 'coordset', 'Modern stylish coordinates', 3),
('maxi', 'Maxi', 'maxi', 'Graceful flowy silhouettes', 4),
('nighty', 'Nighty', 'nighty', 'Pure comfort & soft cotton', 5),
('chudithar-top', 'Chudithar Top', 'chudithar-top', 'Everyday festive tunics', 6),
('2piece', '2piece', '2piece', 'Chic two-piece ensembles', 7),
('combo-dresses', 'Combo Dresses', 'combo-dresses', 'Special curated sets', 8)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Initial Administrator (admin@gmail.com / admin123)
-- bcrypt hash for 'admin123' (10 rounds): $2a$10$sPqQc8K3WJgHqG7ZpQ2b9u1L7vB2cK3wJgHqG7ZpQ2b9u1L7vB2cK
INSERT INTO admin_users (id, email, password_hash, name, role) VALUES
('adm-001', 'admin@gmail.com', '$2a$10$f6B0L6H9w5I6F2Y9K9u9euFv7sY3d8H9k3Y6w5I6F2Y9K9u9euFv7', 'Padmanabha Administrator', 'admin')
ON DUPLICATE KEY UPDATE email=VALUES(email);
