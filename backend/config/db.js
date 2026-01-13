// backend/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
	timezone: '-06:00'
	});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conectado exitosamente a la BD:', process.env.DB_NAME);
        connection.release();
    } catch (error) {
        console.error('❌ Error de Conexión a BD:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Verifica que la IP sea correcta y que el VPS acepte conexiones remotas.');
        }
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Verifica usuario y contraseña.');
        }
    }
})();

module.exports = pool;