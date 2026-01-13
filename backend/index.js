const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const pool = require('./config/db');
const pantallaRoutes = require('./routes/pantallasRoutes');
const managerAuthRoutes = require('./manager/auth/auth.routes');
const managerMenuRoutes = require('./manager/menu/menu.routes');
const { iniciarCrons } = require('./services/cronService');

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

// ==========================================
//               RUTAS API
// ==========================================
app.use('/api/pantallas', pantallaRoutes); 
app.use('/api/pantalla', pantallaRoutes); 
app.use('/api/manager/auth', managerAuthRoutes);
app.use('/api/manager/auth', require('./manager/auth/auth.routes'));
app.use('/api/manager/menu', require('./manager/src/menu/menu.routes'));
app.get('/', (req, res) => res.send('🚀 Servidor Digital Signage: ACTIVO'));

app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1');
        res.json({ mensaje: 'BD Conectada', datos: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n=============================================`);
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`📡 API Pantallas: http://localhost:${PORT}/api/pantallas`);
    console.log(`🔐 API Manager:   http://localhost:${PORT}/api/manager/auth`);
    console.log(`=============================================`);
    
    iniciarCrons();
});