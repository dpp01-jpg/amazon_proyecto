require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Configurar Nodemailer (Gmail o Ethereal fallback)
let transporter;

async function setupEmail() {
    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'tu_correo@gmail.com') {
        // Usar Gmail configurado en .env
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log("Servidor de correo Gmail configurado.");
    } else {
        // Fallback a Ethereal (solo para pruebas locales)
        try {
            let account = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: {
                    user: account.user,
                    pass: account.pass
                }
            });
            console.log("Servidor de correo Ethereal listo (pruebas).");
        } catch (err) {
            console.error('No se pudo crear cuenta de prueba Ethereal:', err.message);
        }
    }
}
setupEmail();

// ========================
// ENDPOINTS PRODUCTOS
// ========================

// GET a todos los productos (con búsqueda opcional, filtros y paginación)
app.get('/api/products', async (req, res) => {
    try {
        let query = 'SELECT * FROM productos WHERE 1=1';
        const queryParams = [];

        // Búsqueda por texto
        if (req.query.search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            const searchTerm = `%${req.query.search}%`;
            queryParams.push(searchTerm, searchTerm);
        }

        // Filtro por categoría
        if (req.query.category) {
            query += ' AND id_categoria = ?';
            queryParams.push(req.query.category);
        }

        // Filtro por precio mínimo
        if (req.query.minPrice) {
            query += ' AND price >= ?';
            queryParams.push(parseFloat(req.query.minPrice));
        }

        // Filtro por precio máximo
        if (req.query.maxPrice) {
            query += ' AND price <= ?';
            queryParams.push(parseFloat(req.query.maxPrice));
        }

        // Paginación (ejemplo básico)
        let paginatedQuery = query;
        if (req.query.page && req.query.limit) {
            const limit = parseInt(req.query.limit);
            const offset = (parseInt(req.query.page) - 1) * limit;
            paginatedQuery += ' LIMIT ? OFFSET ?';
            queryParams.push(limit, offset);
        }

        const [rows] = await db.query(paginatedQuery, queryParams);

        // Obtener el count total si hay paginación
        let total = rows.length;
        if (req.query.page && req.query.limit) {
            let countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
            const countParams = queryParams.slice(0, queryParams.length - 2); // Quitar limit y offset
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

// GET sugerencias de búsqueda (autocompletado) - MUST be before /:id
app.get('/api/products/suggestions', async (req, res) => {
    const q = req.query.q || '';
    if (q.trim().length < 1) return res.json([]);
    try {
        const searchTerm = `%${q}%`;
        const [rows] = await db.query(
            'SELECT id, title, price, image FROM productos WHERE title LIKE ? OR description LIKE ? LIMIT 5',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener sugerencias' });
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

// POST Registro básico con envío de correo
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, nombre } = req.body;
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO usuarios (email, password, nombre, verification_token) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, nombre, verificationToken]
        );

        // Enviar correo
        const verificationUrl = `http://localhost:3000/api/verify-email?token=${verificationToken}`;
        
        console.log("\n==============================================");
        console.log("NUEVO USUARIO REGISTRADO:", email);
        console.log("🔗 ENLACE DE VERIFICACIÓN (Púlsalo con Ctrl+Clic):");
        console.log(verificationUrl);
        console.log("==============================================\n");

        if (transporter) {
            try {
                const info = await transporter.sendMail({
                    from: `"Amazon Clone" <${process.env.EMAIL_USER || 'no-reply@amazonclone.local'}>`,
                    to: email,
                    subject: "Verifica tu correo electrónico - Amazon Clone",
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon Logo" style="width: 100px; margin-bottom: 20px;">
                            <h2 style="color: #111;">Verifica tu dirección de correo electrónico</h2>
                            <p>Hola ${nombre},</p>
                            <p>Para completar la creación de tu cuenta, por favor verifica tu dirección de correo electrónico haciendo clic en el botón de abajo:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${verificationUrl}" style="background-color: #f0c14b; border: 1px solid #a88734; border-radius: 3px; color: #111; padding: 10px 20px; text-decoration: none; font-weight: bold; display: inline-block;">Verificar correo</a>
                            </div>
                            <p style="font-size: 12px; color: #555;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                            <p style="font-size: 12px; color: #0066c0;">${verificationUrl}</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #777;">Si no has creado esta cuenta, puedes ignorar este correo.</p>
                        </div>
                    `
                });
                console.log("👀 VISTA PREVIA DEL CORREO ETHEREAL:", nodemailer.getTestMessageUrl(info));
                console.log("==============================================\n");
            } catch (mailErr) {
                console.error("Error enviando el correo:", mailErr.message);
            }
        } else {
            console.log("⚠️ Ethereal Mail no está disponible. Usa el enlace directo de arriba para verificar.");
        }

        res.status(201).json({ message: 'Usuario registrado. Revisa tu consola o correo.', id: result.insertId, email, nombre });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// GET Verificar email
app.get('/api/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).send("Falta el token de verificación.");

        const [rows] = await db.query('SELECT id FROM usuarios WHERE verification_token = ?', [token]);
        if (rows.length === 0) {
            return res.status(400).send("Token inválido o expirado.");
        }

        await db.query('UPDATE usuarios SET is_verified = TRUE, verification_token = NULL WHERE id = ?', [rows[0].id]);
        
        const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
        
        // Página web simple de éxito
        res.send(`
            <div style="text-align: center; font-family: Arial, sans-serif; padding-top: 100px; background-color: #f3f3f3; height: 100vh; margin: 0;">
                <div style="background: white; max-width: 400px; margin: auto; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" style="width: 100px; margin-bottom: 20px;">
                    <h1 style="color: #007185; font-size: 24px;">¡Correo verificado!</h1>
                    <p style="color: #555;">Gracias por verificar tu cuenta. Ya puedes disfrutar de todas las ventajas de Amazon Clone.</p>
                    <a href="${frontendUrl}/registro/login.html" style="background: linear-gradient(to bottom, #f7dfa1, #f0c14b); border: 1px solid #a88734; padding: 12px 24px; text-decoration: none; color: #111; border-radius: 3px; font-weight: bold; display: inline-block; margin-top: 30px; width: 80%;">Continuar al Login</a>
                </div>
            </div>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error interno del servidor al verificar el correo.");
    }
});

// POST Reenviar correo de verificación
app.post('/api/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        const [rows] = await db.query('SELECT id, is_verified, verification_token FROM usuarios WHERE email = ?', [email]);
        
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
        if (rows[0].is_verified) return res.status(400).json({ error: 'El usuario ya está verificado.' });

        let verificationToken = rows[0].verification_token;
        // Si por algún motivo no tenía token, le generamos uno
        if (!verificationToken) {
            verificationToken = crypto.randomBytes(32).toString('hex');
            await db.query('UPDATE usuarios SET verification_token = ? WHERE id = ?', [verificationToken, rows[0].id]);
        }

        const verificationUrl = `http://localhost:3000/api/verify-email?token=${verificationToken}`;
        console.log("\n==============================================");
        console.log("🔄 REENVÍO DE CORREO SOLICITADO PARA:", email);
        console.log("🔗 ENLACE DE VERIFICACIÓN (Púlsalo con Ctrl+Clic):");
        console.log(verificationUrl);
        console.log("==============================================\n");

        if (transporter) {
            transporter.sendMail({
                from: '"Amazon Clone" <no-reply@amazonclone.local>',
                to: email,
                subject: "Reenvío: Verifica tu correo electrónico",
                html: `<p>Has solicitado un reenvío del enlace de verificación.</p>
                       <a href="${verificationUrl}">${verificationUrl}</a>`
            }).catch(console.error);
        }

        res.json({ message: 'Enlace reenviado. Revisa tu consola o tu correo.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al reenviar la verificación.' });
    }
});

// POST Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Buscar primero solo por email
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        let user = rows[0];
        
        // Comparar la contraseña encriptada
        let isMatch = await bcrypt.compare(password, user.password);

        // Sistema de auto-migración: si la contraseña en texto plano coincide (usuarios antiguos), la encriptamos y la guardamos
        if (!isMatch && password === user.password) {
            isMatch = true;
            const newHashed = await bcrypt.hash(password, 10);
            await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [newHashed, user.id]);
            user.password = newHashed; // Actualizar el objeto local
        }

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar si su correo está validado (ignorando al admin por defecto si existiera)
        if (!user.is_verified && user.rol !== 'admin') {
             return res.status(403).json({ error: 'Por favor, verifica tu correo electrónico antes de iniciar sesión. Busca el enlace en tu bandeja de entrada o consola.' });
        }

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
    if (!await verifyStaff(req.body.adminEmail)) return res.status(403).json({error: 'Forbidden'});
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
    if (!await verifyStaff(req.body.adminEmail)) return res.status(403).json({error: 'Forbidden'});
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
    if (!await verifyStaff(req.query.adminEmail)) return res.status(403).json({error: 'Forbidden'});
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

// ========================
// ENDPOINTS CARRITO
// ========================

// GET el carrito de un usuario
app.get('/api/cart/:userId', async (req, res) => {
    try {
        const query = `
            SELECT c.id_producto as id, p.title, p.price, p.image, p.promo_percent, p.promo_text, c.cantidad as quantity 
            FROM carrito c
            JOIN productos p ON c.id_producto = p.id
            WHERE c.id_usuario = ?
        `;
        const [rows] = await db.query(query, [req.params.userId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
});

// POST añadir producto al carrito (o incrementar si existe)
app.post('/api/cart/:userId', async (req, res) => {
    try {
        const { id_producto, cantidad } = req.body;
        const userId = req.params.userId;
        
        // Convertimos a número y aseguramos que sea al menos 1
        const numQty = parseInt(cantidad, 10);
        const qty = isNaN(numQty) ? 1 : numQty;
        
        console.log(`[CARRITO] User: ${userId}, Prod: ${id_producto}, Qty: ${qty}`);

        const query = `
            INSERT INTO carrito (id_usuario, id_producto, cantidad) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)
        `;
        
        await db.query(query, [userId, id_producto, qty]);
        res.status(201).json({ message: 'Producto añadido al carrito' });
    } catch (err) {
        console.error("Error en el carrito:", err);
        res.status(500).json({ error: 'Error al añadir al carrito' });
    }
});

// PUT actualizar cantidad de un producto en el carrito
app.put('/api/cart/:userId/:productId', async (req, res) => {
    try {
        const { cantidad } = req.body;
        await db.query(
            'UPDATE carrito SET cantidad = ? WHERE id_usuario = ? AND id_producto = ?',
            [cantidad, req.params.userId, req.params.productId]
        );
        res.json({ message: 'Cantidad actualizada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar cantidad' });
    }
});

// DELETE eliminar producto del carrito
app.delete('/api/cart/:userId/:productId', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?',
            [req.params.userId, req.params.productId]
        );
        res.json({ message: 'Producto eliminado del carrito' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar producto del carrito' });
    }
});

// DELETE vaciar carrito
app.delete('/api/cart/:userId', async (req, res) => {
    try {
        await db.query('DELETE FROM carrito WHERE id_usuario = ?', [req.params.userId]);
        res.json({ message: 'Carrito vaciado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al vaciar el carrito' });
    }
});

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
