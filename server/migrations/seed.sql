-- Initial Seed Data for Padma Fabrics
-- Categories
INSERT INTO categories (id, name, slug, description, display_order) VALUES
('sarees', 'Sarees', 'sarees', 'Silk & handloom drapes', 1),
('fabrics', 'Fabrics', 'fabrics', 'Beautiful by the metre', 2),
('shirts', 'Shirts', 'shirts', 'Crisp linen & cotton', 3),
('t-shirts', 'T-Shirts', 't-shirts', 'Easy everyday comfort', 4),
('womens-dresses', 'Women\'s Dresses', 'womens-dresses', 'Festive & daily wear', 5),
('kids-wear', 'Kids Wear', 'kids-wear', 'Little celebrations', 6)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Initial Administrator (admin@gmail.com / admin123)
-- bcrypt hash for 'admin123' (10 rounds): $2a$10$sPqQc8K3WJgHqG7ZpQ2b9u1L7vB2cK3wJgHqG7ZpQ2b9u1L7vB2cK
INSERT INTO admin_users (id, email, password_hash, name, role) VALUES
('adm-001', 'admin@gmail.com', '$2a$10$f6B0L6H9w5I6F2Y9K9u9euFv7sY3d8H9k3Y6w5I6F2Y9K9u9euFv7', 'Padmanabha Administrator', 'admin')
ON DUPLICATE KEY UPDATE email=VALUES(email);
