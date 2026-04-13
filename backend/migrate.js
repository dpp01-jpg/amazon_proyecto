require('dotenv').config();
const db = require('./db');

async function migrate() {
    try {
        await db.query('ALTER TABLE productos ADD COLUMN detalles TEXT');
        console.log('Migración completada con éxito: Columna "detalles" añadida a "productos".');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Migración: La columna "detalles" ya existía.');
        } else {
            console.error('Error durante la migración:', e);
        }
    }
    process.exit(0);
}

migrate();
