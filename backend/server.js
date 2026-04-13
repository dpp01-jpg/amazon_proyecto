require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});
async function debugDatabases() {
    try {
        const [rows] = await pool.query('SHOW DATABASES');
        console.log('📦 DATABASES DISPONIBLES:');
        console.table(rows);
    } catch (err) {
        console.error('❌ Error listando DBs:', err);
    }
}

debugDatabases();

async function debugServerInfo() {
    const [rows] = await pool.query(`
    SELECT 
      @@hostname AS host,
      @@port AS port,
      @@version AS version
  `);

    console.log('🖥️ MYSQL INFO:');
    console.table(rows);
}

debugServerInfo();

async function showTables() {
    try {
        const [rows] = await pool.query('SHOW TABLES FROM amazon_db');
        console.log('📦 TABLAS EN amazon_db:');
        console.table(rows);
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

showTables();
// ========================
// ENDPOINTS PRODUCTOS
// ========================

// GET a todos los productos (con búsqueda opcional y paginación)
app.get('/api/products', async (req, res) => {
    try {
        let query = 'SELECT * FROM productos';
        const queryParams = [];

        // Búsqueda
        if (req.query.search) {
            query += ' WHERE title LIKE ? OR description LIKE ?';
            const searchTerm = `%${req.query.search}%`;
            queryParams.push(searchTerm, searchTerm);
        }

        // Paginación (ejemplo básico)
        if (req.query.page && req.query.limit) {
            const limit = parseInt(req.query.limit);
            const offset = (parseInt(req.query.page) - 1) * limit;
            query += ' LIMIT ? OFFSET ?';
            queryParams.push(limit, offset);
        }

        const [rows] = await db.query(query, queryParams);

        // Formatear image paths si es necesario
        // Pero en este caso, se asume que image tiene la ruta correcta.

        // Obtener el count total si hay paginación
        let total = rows.length;
        if (req.query.page && req.query.limit) {
            let countQuery = 'SELECT COUNT(*) as count FROM productos';
            let countParams = [];
            if (req.query.search) {
                countQuery += ' WHERE title LIKE ? OR description LIKE ?';
                const searchTerm = `%${req.query.search}%`;
                countParams.push(searchTerm, searchTerm);
            }
            const [countRows] = await db.query(countQuery, countParams);
            total = countRows[0].count;

            return res.json({
                data: rows,
                total: total,
                page: parseInt(req.query.page),
                limit: parseInt(req.query.limit)
            });
        }

        res.json({ data: rows, total: rows.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// GET producto por ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// POST nuevo producto (Back Office)
app.post('/api/products', async (req, res) => {
    try {
        const { title, price, image, description, id_categoria, detalles, promo_percent, promo_text } = req.body;
        const [result] = await db.query(
            'INSERT INTO productos (title, price, image, description, id_categoria, detalles, promo_percent, promo_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, price, image, description, id_categoria, detalles, promo_percent || null, promo_text || null]
        );
        res.status(201).json({ message: 'Producto creado', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// PUT actualizar producto (Back Office)
app.put('/api/products/:id', async (req, res) => {
    try {
        const { title, price, image, description, id_categoria, detalles, promo_percent, promo_text } = req.body;
        await db.query(
            'UPDATE productos SET title = ?, price = ?, image = ?, description = ?, id_categoria = ?, detalles = ?, promo_percent = ?, promo_text = ? WHERE id = ?',
            [title, price, image, description, id_categoria, detalles, promo_percent, promo_text, req.params.id]
        );
        res.json({ message: 'Producto actualizado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// DELETE producto (Back Office)
app.delete('/api/products/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
        res.json({ message: 'Producto eliminado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});


// ========================
// ENDPOINTS USUARIOS
// ========================

// POST Registro básico (simulado, sin encriptación avanzada por simplicidad académica a menos que se pida)
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, nombre } = req.body;
        const [result] = await db.query(
            'INSERT INTO usuarios (email, password, nombre) VALUES (?, ?, ?)',
            [email, password, nombre]
        );
        res.status(201).json({ message: 'Usuario registrado con éxito', id: result.insertId, email, nombre });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// POST Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND password = ?', [email, password]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = rows[0];

        // Verificar si está baneado
        if (user.ban_until && new Date(user.ban_until) > new Date()) {
            return res.status(403).json({
                error: 'Cuenta baneada',
                reason: user.ban_reason,
                until: user.ban_until
            });
        }

        res.json({ message: 'Login correcto', user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al hacer login' });
    }
});

// Middleware simulado para verificar que es admin (en una app real se usaría JWT decodificado en headers)
async function verifyAdmin(email) {
    const [rows] = await db.query('SELECT rol FROM usuarios WHERE email = ?', [email]);
    return rows.length > 0 && (rows[0].rol === 'admin');
}

async function verifyStaff(email) {
    const [rows] = await db.query('SELECT rol FROM usuarios WHERE email = ?', [email]);
    return rows.length > 0 && (rows[0].rol === 'admin' || rows[0].rol === 'staff');
}

// ========================
// ENDPOINTS CARRUSEL
// ========================

// GET imágenes del carrusel (Public)
app.get('/api/carousel', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM carrusel ORDER BY orden ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener el carrusel' });
    }
});

// POST añadir imagen al carrusel (Admin/Staff)
app.post('/api/carousel', async (req, res) => {
    if (!await verifyStaff(req.body.adminEmail)) return res.status(403).json({ error: 'Forbidden' });
    try {
        const { image_url, alt_text, orden } = req.body;
        const [result] = await db.query(
            'INSERT INTO carrusel (image_url, alt_text, orden) VALUES (?, ?, ?)',
            [image_url, alt_text, orden || 0]
        );
        res.status(201).json({ message: 'Imagen añadida al carrusel', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Error al añadir al carrusel' });
    }
});

// DELETE imagen del carrusel
app.delete('/api/carousel/:id', async (req, res) => {
    if (!await verifyStaff(req.query.adminEmail)) return res.status(403).json({ error: 'Forbidden' });
    try {
        await db.query('DELETE FROM carrusel WHERE id = ?', [req.params.id]);
        res.json({ message: 'Imagen eliminada del carrusel' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar del carrusel' });
    }
});

// GET Grid Dinámico de la Home (Categorías + Productos)
app.get('/api/home-grid', async (req, res) => {
    try {
        // 1. Obtener todas las categorías con su configuración de layout
        const [categories] = await db.query('SELECT * FROM categorias ORDER BY id ASC');

        // 2. Para cada categoría, obtener sus productos (limitamos según necesidades del grid)
        const gridData = await Promise.all(categories.map(async (cat) => {
            // Si el layout es grid4 necesitamos 4 fotos, si es grid2 necesitamos 2, si es single 1
            let limit = 4;
            if (cat.layout_type === 'grid2') limit = 2;
            if (cat.layout_type === 'single') limit = 1;

            const [products] = await db.query(
                'SELECT id, title, image, price, promo_percent, promo_text FROM productos WHERE id_categoria = ? LIMIT ?',
                [cat.id, limit]
            );
            return {
                ...cat,
                products: products
            };
        }));

        res.json(gridData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al generar el grid de la home' });
    }
});

// ========================
// ENDPOINTS CATEGORÍAS (ADMIN)
// ========================

// GET todas las categorías
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

// POST nueva categoría
app.post('/api/categories', async (req, res) => {
    if (!await verifyStaff(req.body.adminEmail)) return res.status(403).json({ error: 'Forbidden' });
    try {
        const { nombre, layout_type, link_text } = req.body;
        const [result] = await db.query(
            'INSERT INTO categorias (nombre, layout_type, link_text) VALUES (?, ?, ?)',
            [nombre, layout_type || 'grid4', link_text || 'Ver más']
        );
        res.status(201).json({ message: 'Categoría creada', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear categoría' });
    }
});

// PUT actualizar categoría
app.put('/api/categories/:id', async (req, res) => {
    if (!await verifyStaff(req.body.adminEmail)) return res.status(403).json({ error: 'Forbidden' });
    try {
        const { nombre, layout_type, link_text } = req.body;
        await db.query(
            'UPDATE categorias SET nombre = ?, layout_type = ?, link_text = ? WHERE id = ?',
            [nombre, layout_type, link_text, req.params.id]
        );
        res.json({ message: 'Categoría actualizada' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
});

// DELETE categoría
app.delete('/api/categories/:id', async (req, res) => {
    if (!await verifyStaff(req.query.adminEmail)) return res.status(403).json({ error: 'Forbidden' });
    try {
        await db.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);
        res.json({ message: 'Categoría eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
});

// ========================
// ENDPOINTS ADMIN: CONTROL DE USUARIOS
// ========================

// Verificar estado de cualquier usuario desde el Front Office silenciosamente
app.get('/api/users/:email/status', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT ban_until, ban_reason FROM usuarios WHERE email = ?', [req.params.email]);
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        const isBanned = rows[0].ban_until && new Date(rows[0].ban_until) > new Date();
        res.json({ isBanned, reason: rows[0].ban_reason, until: rows[0].ban_until });
    } catch (err) {
        res.status(500).json({ error: 'Error al comprobar estado' });
    }
});

// Obtener todos los usuarios (Solo Admin)
app.get('/api/users', async (req, res) => {
    if (!await verifyAdmin(req.query.adminEmail)) return res.status(403).json({ error: 'Forbidden' });
    const [rows] = await db.query('SELECT id, email, nombre, rol, ban_until, ban_reason FROM usuarios');
    res.json(rows);
});

// Editar rol (Whitelist a Staff o Degradación a User)
app.put('/api/users/:id/role', async (req, res) => {
    if (!await verifyAdmin(req.body.adminEmail)) return res.status(403).json({ error: 'Forbidden' });
    await db.query('UPDATE usuarios SET rol = ? WHERE id = ?', [req.body.rol, req.params.id]);
    res.json({ message: 'Rol actualizado' });
});

// Banear usuario (Días, Horas, Minutos y Motivo)
app.put('/api/users/:id/ban', async (req, res) => {
    if (!await verifyAdmin(req.body.adminEmail)) return res.status(403).json({ error: 'Forbidden' });
    const { minutes, reason } = req.body;

    // Calcular el DATETIME sumándole  X minutos al current
    const date = new Date();
    date.setMinutes(date.getMinutes() + parseInt(minutes));
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' '); // Formato MySQL YYYY-MM-DD HH:MM:SS

    await db.query('UPDATE usuarios SET ban_until = ?, ban_reason = ? WHERE id = ?', [formattedDate, reason, req.params.id]);
    res.json({ message: 'Usuario baneado' });
});

// Desbanear usuario
app.put('/api/users/:id/unban', async (req, res) => {
    if (!await verifyAdmin(req.body.adminEmail)) return res.status(403).json({ error: 'Forbidden' });
    await db.query('UPDATE usuarios SET ban_until = NULL, ban_reason = NULL WHERE id = ?', [req.params.id]);
    res.json({ message: 'Usuario desbaneado' });
});

// Eliminar un usuario permanentemente
app.delete('/api/users/:id', async (req, res) => {
    if (!await verifyAdmin(req.body.adminEmail)) return res.status(403).json({ error: 'Forbidden' });
    await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    res.json({ message: 'Usuario eliminado del sistema' });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
