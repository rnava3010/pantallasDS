const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const pantallaRoutes = require('./routes/pantallasRoutes');

const app = express();
const PORT = process.env.PORT || 3100;

app.use(cors());
app.use(express.json());

app.use(express.static('public', {
  setHeaders: function (res, path, stat) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
  }
}));

// --- RUTAS API ---
app.use('/api/pantalla', pantallaRoutes); // Aquí conectamos todo

// --- RUTA TEST (Opcional, la puedes dejar o mover) ---
app.get('/', (req, res) => res.send('🚀 Servidor Digital Signage: ACTIVO'));

app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1');
        res.json({ mensaje: 'BD Conectada', datos: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- INICIAR ---
app.listen(PORT, () => {
    console.log(`\n=============================================`);
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`=============================================`);
});