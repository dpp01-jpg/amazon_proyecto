const pool = require('./db');
const mysql = require('mysql2/promise');

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
async function test() {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('CONEXIÓN EXITOSA: Base de datos conectadaa. Resultado:', rows[0].result);
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error('ERROR DE CONEXIÓN:', err.message);
        process.exit(1);
    }
}

test(); // 👈 ESTO ES LO QUE FALTABA