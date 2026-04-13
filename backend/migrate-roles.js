require('dotenv').config();
const db = require('./db');

async function migrateRoles() {
    try {
        await db.query(`ALTER TABLE usuarios ADD COLUMN rol ENUM('admin', 'staff', 'user') DEFAULT 'user'`);
        await db.query(`ALTER TABLE usuarios ADD COLUMN ban_until DATETIME DEFAULT NULL`);
        await db.query(`ALTER TABLE usuarios ADD COLUMN ban_reason TEXT DEFAULT NULL`);
        console.log('Nuevas columnas de seguridad añadidas a usuarios.');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Las columnas de rol y baneos ya existían.');
        } else {
            console.error('Error alterando la tabla:', e);
        }
    }

    try {
        // Asegurarse de que exista el super_admin
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', ['admin']);
        if (rows.length === 0) {
            await db.query('INSERT INTO usuarios (email, password, nombre, rol) VALUES (?, ?, ?, ?)',
                ['admin', '1234', 'Root', 'admin']);
            console.log('Rootistrador (admin) creado exitosamente.');
        } else {
            // Forzar rol admin si ya existía pero era user
            await db.query('UPDATE usuarios SET rol = ? WHERE email = ?', ['admin', 'admin']);
            console.log('La cuenta admin ya existía, rol actualizado a admin.');
        }
    } catch (e) {
        console.error('Error creando el Root:', e);
    }

    process.exit(0);
}

migrateRoles();
