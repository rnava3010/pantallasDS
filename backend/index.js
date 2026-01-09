const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importamos la conexión a la BD
const pool = require('./config/db');

const app = express();

// Usamos el puerto 3100 para coincidir con Nginx
const PORT = process.env.PORT || 3100;

// Middleware
app.use(cors());
app.use(express.json());

// --- RUTA: ESTADO DEL SERVIDOR ---
app.get('/', (req, res) => {
    res.send('🚀 Servidor Digital Signage: ACTIVO');
});

// --- RUTA: OBTENER DATOS DE PANTALLA ---
app.get('/api/pantalla/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // 1. OBTENER CONFIGURACIÓN DE LA TERMINAL
        const sqlTerminal = `
            SELECT 
                t.idTerminal, t.nombre_interno, t.tipo_pantalla, t.tema_color, t.idAreaAsignada,
                t.idSucursal,
                a.nombre as nombre_area,
                COALESCE(s.logo_url, m.logo_url) as final_logo_name, -- Nombre base (ej: 001logo_prop1)
                m.color_primario, m.color_secundario
            FROM cat_terminales t
            LEFT JOIN cat_areas a ON t.idAreaAsignada = a.idArea
            LEFT JOIN cat_sucursales s ON t.idSucursal = s.idSucursal
            LEFT JOIN cat_marcas m ON t.idMarca = m.idMarca
            WHERE t.idTerminal = ?
        `;
        
        const [rows] = await pool.query(sqlTerminal, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Terminal no encontrada" });
        }

        const terminal = rows[0];

        // --- LÓGICA DE IMÁGENES (NUEVO) ---
        // Asumimos que en la BD solo está el nombre base (sin ruta ni extensión)
        let logoPngUrl = null;
        let faviconIcoUrl = null;

        if (terminal.final_logo_name) {
            // Limpiamos por si acaso ya traía ruta o extensión
            const cleanName = terminal.final_logo_name
                .replace('/logos/', '')
                .replace('.png', '')
                .replace('.ico', '')
                .replace('.jpg', '');
            
            // Construimos las URLs finales
            logoPngUrl = `/logos/${cleanName}.png`;
            faviconIcoUrl = `/logos/${cleanName}.ico`;
        }
        // -----------------------------------

        // Objeto base de respuesta (Configuración)
        let respuesta = {
            config: {
                id: terminal.idTerminal,
                nombre_interno: terminal.nombre_interno,
                tipo_pantalla: terminal.tipo_pantalla,
                tema_color: terminal.tema_color || 'dark',
                
                // Ahora enviamos DOS propiedades separadas
                logo: logoPngUrl,         // Para la imagen grande (.png)
                favicon: faviconIcoUrl,   // Para el icono del navegador (.ico)

                colores: {
                    primario: terminal.color_primario,
                    secundario: terminal.color_secundario
                }
            },
            data: null
        };

        // 2. BUSCAR DATOS SEGÚN EL TIPO DE PANTALLA (ESTO SIGUE IGUAL)
        
        // --- CASO A: PANTALLA DE SALÓN ---
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
                    nombre_salon: terminal.nombre_area
                };
            } else {
                respuesta.data = {
                    titulo: "Sala Disponible",
                    mensaje: "Bienvenido a " + terminal.nombre_area,
                    nombre_salon: terminal.nombre_area
                };
            }
        }

        // --- CASO B: DIRECTORIO ---
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

// --- RUTA: TEST DE BASE DE DATOS ---
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cat_propiedades LIMIT 1');
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