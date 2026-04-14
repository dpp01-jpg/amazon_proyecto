-- Script para crear la base de datos amazon_db e inicializarla

CREATE DATABASE IF NOT EXISTS amazon_db;
USE amazon_db;

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255) NOT NULL,
    description TEXT,
    id_categoria INT,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS carrito (
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id_usuario, id_producto),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE
);

-- Insertar algunas categorías de prueba
INSERT INTO categorias (nombre) VALUES ('Oferta Top'), ('Informática'), ('Electrónica');

-- Insertar productos basados en el diseño de index.html
INSERT INTO productos (title, price, image, description, id_categoria) VALUES
('Producto Oferta 1', 19.99, '/amazon_proyecto/imagenes/img/01.OfertaTop/imagen_3.jpg', 'Producto de oferta destacada', 1),
('Producto Oferta 2', 29.99, '/amazon_proyecto/imagenes/img/01.OfertaTop/imagen_4.jpg', 'Producto de oferta destacada', 1),
('Dispositivo Amazon 1', 49.99, '/amazon_proyecto/imagenes/img/02.Ahorra/imagen_7.jpg', 'Dispositivo inteligente para el hogar', 3),
('Accesorios informáticos', 15.50, '/amazon_proyecto/imagenes/img/03.Informática/imagen_11.jpg', 'Accesorios esenciales para PC', 2);
