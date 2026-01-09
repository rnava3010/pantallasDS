// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar la conexión a la BD
const db = require('./config/db');

// Inicializar Express (Versión 4)
const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES (Configuraciones previas) ---

// 1. CORS: Permite que React (en otro puerto) se conecte aquí
app.use(cors());

// 2. JSON: Permite recibir datos en formato JSON (POST)
app.use(express.json());

// --- RUTAS DE PRUEBA ---

// Ruta básica para ver si el servidor vive
app.get('/', (req, res) => {
    res.send('🚀 Servidor Digital Signage: ACTIVO');
});

// Ruta para probar la BD real
app.get('/api/test-db', async (req, res) => {
    try {
        // Hacemos una consulta simple a la tabla de propiedades
        const [rows] = await db.query('SELECT * FROM cat_propiedades LIMIT 1');
        res.json({
            mensaje: 'Conexión exitosa',
            datos: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error consultando la BD', detalle: error.message });
    }
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`\n=============================================`);
    console.log(`📡 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`=============================================`);
});