require('dotenv').config();
const db = require('./db');

async function migratePromos() {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM productos");
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('promo_percent')) {
            await db.query("ALTER TABLE productos ADD COLUMN promo_percent INT DEFAULT NULL");
            console.log('Columna promo_percent añadida.');
        }

        if (!columnNames.includes('promo_text')) {
            await db.query("ALTER TABLE productos ADD COLUMN promo_text VARCHAR(100) DEFAULT NULL");
            console.log('Columna promo_text añadida.');
        }

        // Actualizar algunos productos de ejemplo para que tengan ofertas
        await db.query("UPDATE productos SET promo_percent = 35, promo_text = 'Oferta flash' WHERE id = 1");
        await db.query("UPDATE productos SET promo_percent = 29, promo_text = 'Oferta de primavera' WHERE id = 2");

        console.log('Migración de promociones completada.');
    } catch (e) {
        console.error('Error migrando promociones:', e);
    }
    process.exit(0);
}

migratePromos();
