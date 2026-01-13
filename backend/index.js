const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const pantallaRoutes = require('./routes/pantallasRoutes');
// [NUEVO] Importamos las rutas de autenticación del Manager
const managerAuthRoutes = require('./manager/auth/auth.routes');
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

// --- 1. API PÚBLICA (PANTALLAS) ---
// Rutas que consumen los Players en los hoteles
app.use('/api/pantallas', pantallaRoutes); 
app.use('/api/pantalla', pantallaRoutes); 

// --- 2. API PRIVADA (MANAGER) [NUEVO] ---
// Rutas para el Dashboard de Administración
// Todo lo que sea gestión entra por /api/manager
app.use('/api/manager/auth', managerAuthRoutes);


// --- RUTAS DE UTILIDAD ---
app.get('/', (req, res) => res.send('🚀 Servidor Digital Signage: ACTIVO'));

app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1');
        res.json({ mensaje: 'BD Conectada', datos: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`\n=============================================`);
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`📡 API Pantallas: http://localhost:${PORT}/api/pantallas`);
    console.log(`🔐 API Manager:   http://localhost:${PORT}/api/manager/auth`);
    console.log(`=============================================`);
    
    iniciarCrons();
});