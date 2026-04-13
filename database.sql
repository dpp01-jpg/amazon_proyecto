-- Script completo para crear la base de datos amazon_db e inicializarla
-- Actualizado con tablas de carrusel, promociones y roles de usuario

CREATE DATABASE IF NOT EXISTS amazon_db;
USE amazon_db;

-- 1. CATEGORÍAS
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    layout_type VARCHAR(50) DEFAULT 'grid4', -- 'grid4', 'grid2', 'single'
    link_text VARCHAR(100) DEFAULT 'Ver más'
);

-- 2. PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255) NOT NULL,
    description TEXT,
    detalles TEXT,
    id_categoria INT,
    promo_percent INT DEFAULT NULL,
    promo_text VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE SET NULL
);

-- 3. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    rol ENUM('admin', 'staff', 'user') DEFAULT 'user',
    ban_until DATETIME DEFAULT NULL,
    ban_reason TEXT DEFAULT NULL
);

-- 4. CARRUSEL (Banners de la home)
CREATE TABLE IF NOT EXISTS carrusel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255) DEFAULT 'Publicidad',
    orden INT DEFAULT 0
);

-- ========================
-- DATOS INICIALES
-- ========================

-- Insertar categorías con sus layouts
INSERT INTO categorias (nombre, layout_type, link_text) VALUES 
('Oferta Top', 'grid4', 'Ver todas las ofertas'), 
('Informática', 'grid4', 'Explorar informática'), 
('Ahorra en tus compras', 'grid2', 'Ver más ahorros'),
('Electrónica', 'single', 'Ver catálogo completo');

-- Insertar productos con detalles y promociones
INSERT INTO productos (title, price, image, description, detalles, id_categoria, promo_percent, promo_text) VALUES
('Producto Oferta 1', 19.99, 'imagenes/img/01.OfertaTop/imagen_3.jpg', 'Producto de oferta destacada', 'Detalles técnicos del producto 1...', 1, 35, 'Oferta flash'),
('Producto Oferta 2', 29.99, 'imagenes/img/01.OfertaTop/imagen_4.jpg', 'Producto de oferta destacada', 'Detalles técnicos del producto 2...', 1, 15, 'Ahorra ahora'),
('Laptop Pro', 899.00, 'imagenes/img/03.Informática/imagen_11.jpg', 'Potencia para tu trabajo', 'Intel i7, 16GB RAM, 512GB SSD', 2, NULL, NULL),
('Monitor Gamer', 199.99, 'imagenes/img/03.Informática/imagen_12.jpg', '144Hz para tus juegos', '24 pulgadas, 1ms respuesta', 2, 10, 'Descuento Gaming'),
('Smart TV 4K', 450.00, 'imagenes/img/02.Ahorra/imagen_7.jpg', 'Cine en casa', '43 pulgadas, HDR10', 3, 20, 'Promoción TV'),
('Auriculares Wireless', 59.90, 'imagenes/img/02.Ahorra/imagen_8.jpg', 'Sonido puro', 'Bluetooth 5.0, 20h batería', 3, NULL, NULL);

-- Insertar imágenes del carrusel
INSERT INTO carrusel (image_url, alt_text, orden) VALUES 
('imagenes/img/imagen_1.jpg', 'Banner Rebajas de Primavera', 1),
('imagenes/img/imagen_2.jpg', 'Banner Lanzamiento Nuevo Producto', 2);

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (email, password, nombre, rol) VALUES 
('admin', '1234', 'Administrador Global', 'admin'),
('user@test.com', '1234', 'Usuario de Prueba', 'user');
