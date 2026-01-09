// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.send('🚀 Servidor Digital Signage: ACTIVO');
});


// --- RUTA: OBTENER DATOS DE PANTALLA ---
app.get('/api/pantalla/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // 1. OBTENER CONFIGURACIÓN DE LA TERMINAL
        // Hacemos JOIN con cat_areas para saber el nombre del salón y cat_marcas para el logo/colores
        const sqlTerminal = `
            SELECT 
                t.idTerminal, t.nombre_interno, t.tipo_pantalla, t.tema_color, t.idAreaAsignada,
                t.idSucursal,
                a.nombre as nombre_area,
                m.logo_url, m.color_primario, m.color_secundario
            FROM cat_terminales t
            LEFT JOIN cat_areas a ON t.idAreaAsignada = a.idArea
            LEFT JOIN cat_marcas m ON t.idMarca = m.idMarca
            WHERE t.idTerminal = ?
        `;
        
        const [rows] = await pool.query(sqlTerminal, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Terminal no encontrada" });
        }

        const terminal = rows[0];

        // Objeto base de respuesta (Configuración)
        let respuesta = {
            config: {
                id: terminal.idTerminal,
                nombre_interno: terminal.nombre_interno,
                tipo_pantalla: terminal.tipo_pantalla, // 'SALON', 'DIRECTORIO', etc.
                tema_color: terminal.tema_color || 'dark',
                logo: terminal.logo_url,
                colores: {
                    primario: terminal.color_primario,
                    secundario: terminal.color_secundario
                }
            },
            data: null
        };

        // 2. BUSCAR DATOS SEGÚN EL TIPO DE PANTALLA
        
        // --- CASO A: PANTALLA DE SALÓN (Busca evento actual en esa área) ---
        if (terminal.tipo_pantalla === 'SALON' && terminal.idAreaAsignada) {
            const sqlEvento = `
                SELECT nombre_evento, cliente_nombre, fecha_inicio, fecha_fin, mensaje_personalizado
                FROM tbl_eventos
                WHERE idArea = ? 
                AND estatus = 'ACTIVO'
                AND NOW() BETWEEN fecha_inicio AND fecha_fin
                LIMIT 1
            `;
            
            const [eventos] = await pool.query(sqlEvento, [terminal.idAreaAsignada]);
            
            if (eventos.length > 0) {
                const evento = eventos[0];
                respuesta.data = {
                    titulo: evento.nombre_evento,
                    cliente: evento.cliente_nombre,
                    horario: `${new Date(evento.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(evento.fecha_fin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                    mensaje: evento.mensaje_personalizado,
                    nombre_salon: terminal.nombre_area // "Salón Maya"
                };
            } else {
                // Si no hay evento ahorita, mandamos datos vacíos o "Sala Disponible"
                respuesta.data = {
                    titulo: "Sala Disponible",
                    mensaje: "Bienvenido a " + terminal.nombre_area,
                    nombre_salon: terminal.nombre_area
                };
            }
        }

        // --- CASO B: DIRECTORIO (Busca todos los eventos del día en la sucursal) ---
        else if (terminal.tipo_pantalla === 'DIRECTORIO') {
            const sqlDirectorio = `
                SELECT e.nombre_evento, e.fecha_inicio, a.nombre as nombre_salon
                FROM tbl_eventos e
                JOIN cat_areas a ON e.idArea = a.idArea
                WHERE e.idSucursal = ? 
                AND e.estatus = 'ACTIVO'
                AND DATE(e.fecha_inicio) = CURDATE()
                ORDER BY e.fecha_inicio ASC
            `;
            const [listaEventos] = await pool.query(sqlDirectorio, [terminal.idSucursal]);
            respuesta.data = listaEventos; 
        }

        res.json(respuesta);

    } catch (error) {
        console.error("Error SQL:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


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