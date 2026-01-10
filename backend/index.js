const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importamos la conexion a la BD
const pool = require('./config/db');

const app = express();

// Usamos el puerto 3100 para coincidir con Nginx
const PORT = process.env.PORT || 3100;

// Middleware
app.use(cors());
app.use(express.json());

// --- RUTA: ESTADO DEL SERVIDOR ---
app.get('/', (req, res) => {
    res.send('?? Servidor Digital Signage: ACTIVO');
});

// --- RUTA: OBTENER DATOS DE PANTALLA ---
app.get('/api/pantalla/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // 1. OBTENER CONFIGURACION DE LA TERMINAL
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

        // --- LOGICA DE LOGOS (PNG / ICO) ---
        let logoPngUrl = null;
        let faviconIcoUrl = null;

        if (terminal.final_logo_name) {
            const cleanName = terminal.final_logo_name
                .replace('/logos/', '')
                .replace('.png', '')
                .replace('.ico', '')
                .replace('.jpg', '');
            
            logoPngUrl = `/logos/${cleanName}.png`;
            faviconIcoUrl = `/logos/${cleanName}.ico`;
        }

        // --- LOGICA DE SCREENSAVER (GALERIA) ---
        // Buscamos las imagenes configuradas en tbl_galeria_terminal
        const sqlScreensaver = `
            SELECT url_archivo 
            FROM tbl_galeria_terminal 
            WHERE idTerminal = ? 
            ORDER BY orden ASC
        `;
        const [rowsMedia] = await pool.query(sqlScreensaver, [terminal.idTerminal]);
        
        // Convertimos a un array simple de URLs ['/img1.jpg', '/img2.jpg']
        const listaScreensaver = rowsMedia.map(row => row.url_archivo);


        // --- OBJETO BASE DE RESPUESTA ---
        let respuesta = {
            config: {
                id: terminal.idTerminal,
                nombre_interno: terminal.nombre_interno,
                tipo_pantalla: terminal.tipo_pantalla,
                tema_color: terminal.tema_color || 'dark',
                
                logo: logoPngUrl,
                favicon: faviconIcoUrl,

                colores: {
                    primario: terminal.color_primario,
                    secundario: terminal.color_secundario
                },
                
                screensaver: listaScreensaver // Lista de fotos de respaldo
            },
            data: null,
            server_time: new Date() // Hora del servidor para sincronizacion
        };

        // --- CASO A: PANTALLA DE SALON (Agenda) ---
        if (terminal.tipo_pantalla === 'SALON' && terminal.idAreaAsignada) {
            const sqlAgenda = `
                SELECT 
                    e.idEvento,
                    e.nombre_evento, 
                    e.cliente_nombre, 
                    e.fecha_inicio, 
                    e.fecha_fin, 
                    e.mensaje_personalizado,
                    GROUP_CONCAT(em.url_archivo ORDER BY em.orden ASC SEPARATOR ',') as lista_imagenes
                FROM tbl_eventos e
                LEFT JOIN tbl_eventos_media em ON e.idEvento = em.idEvento AND em.tipo = 'IMAGEN'
                WHERE e.idArea = ? 
                AND e.estatus = 'ACTIVO'
                AND e.fecha_fin >= NOW() -- Trae eventos actuales y futuros
                GROUP BY e.idEvento
                ORDER BY e.fecha_inicio ASC
            `;
            
            const [agenda] = await pool.query(sqlAgenda, [terminal.idAreaAsignada]);
            
            const agendaProcesada = agenda.map(evento => ({
                titulo: evento.nombre_evento,
                cliente: evento.cliente_nombre,
                inicio_iso: evento.fecha_inicio, 
                fin_iso: evento.fecha_fin,
                horario: `${new Date(evento.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(evento.fecha_fin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                mensaje: evento.mensaje_personalizado,
                nombre_salon: terminal.nombre_area,
                imagenes: evento.lista_imagenes ? evento.lista_imagenes.split(',') : []
            }));

            respuesta.data = {
                tipo_datos: 'AGENDA',
                eventos: agendaProcesada
            };
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
            mensaje: 'Conexion exitosa',
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
    console.log(`?? Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`=============================================`);
});