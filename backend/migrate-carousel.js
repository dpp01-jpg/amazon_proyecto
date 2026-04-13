require('dotenv').config();
const db = require('./db');

async function migrateCarousel() {
    try {
        // 1. Crear tabla carrusel
        await db.query(`
            CREATE TABLE IF NOT EXISTS carrusel (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image_url VARCHAR(255) NOT NULL,
                alt_text VARCHAR(255) DEFAULT 'Publicidad',
                orden INT DEFAULT 0
            )
        `);
        console.log('Tabla "carrusel" creada o ya existente.');

        // 2. Insertar imágenes iniciales (las que están en index.html)
        const [rows] = await db.query('SELECT COUNT(*) as count FROM carrusel');
        if (rows[0].count === 0) {
            await db.query(`
                INSERT INTO carrusel (image_url, alt_text, orden) VALUES 
                ('imagenes/img/imagen_1.jpg', 'Banner Especial 1', 1),
                ('imagenes/img/imagen_2.jpg', 'Banner Especial 2', 2)
            `);
            console.log('Imágenes iniciales insertadas en el carrusel.');
        }

    } catch (e) {
        console.error('Error en la migración del carrusel:', e);
    }
    process.exit(0);
}

migrateCarousel();
