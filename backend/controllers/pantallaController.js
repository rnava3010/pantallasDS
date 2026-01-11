const pool = require('../config/db');

// --- SUB-FUNCION: Obtener Configuración Base ---
const obtenerConfiguracion = async (id) => {
    const sqlTerminal = `
        SELECT 
            t.idTerminal, t.nombre_interno, t.tipo_pantalla, t.tema_color, t.idAreaAsignada,
            t.idSucursal,
            a.nombre as nombre_area,
            COALESCE(s.logo_url, m.logo_url) as final_logo_name, 
            m.color_primario, m.color_secundario,
            s.latitud, s.longitud 
        FROM cat_terminales t
        LEFT JOIN cat_areas a ON t.idAreaAsignada = a.idArea
        LEFT JOIN cat_sucursales s ON t.idSucursal = s.idSucursal
        LEFT JOIN cat_marcas m ON t.idMarca = m.idMarca
        WHERE t.idTerminal = ?
    `;
    const [rows] = await pool.query(sqlTerminal, [id]);
    return rows[0];
};

// --- SUB-FUNCION: Obtener Screensaver ---
const obtenerScreensaver = async (idTerminal) => {
    const sql = `SELECT url_archivo FROM tbl_galeria_terminal WHERE idTerminal = ? ORDER BY orden ASC`;
    const [rows] = await pool.query(sql, [idTerminal]);
    return rows.map(row => row.url_archivo);
};

// --- SUB-FUNCION: Obtener Agenda (Salón) ---
const obtenerAgendaSalon = async (idArea) => {
    const sql = `
        SELECT 
            e.idEvento, e.nombre_evento, e.cliente_nombre, 
            e.fecha_inicio, e.fecha_fin, 
            e.mensaje_personalizado, e.mensaje_ticker,
            e.imagen_full_width, e.direccion_reloj,
            e.nombre_salon_personalizado,  -- <--- ¡NUEVO CAMPO AGREGADO!
            
            e.fecha_visualizacion_inicio, e.fecha_visualizacion_fin,
            e.es_recurrente,
            GROUP_CONCAT(em.url_archivo ORDER BY em.orden ASC SEPARATOR ',') as lista_imagenes
        FROM tbl_eventos e
        LEFT JOIN tbl_eventos_media em ON e.idEvento = em.idEvento AND em.tipo = 'IMAGEN'
        WHERE e.idArea = ? AND e.estatus = 'ACTIVO'
        AND COALESCE(e.fecha_visualizacion_fin, e.fecha_fin) >= NOW()
        GROUP BY e.idEvento
        ORDER BY e.fecha_inicio ASC
    `;
    const [rows] = await pool.query(sql, [idArea]);
    return rows;
};

// --- SUB-FUNCION: Obtener Directorio ---
const obtenerDirectorio = async (idSucursal) => {
    const sql = `
        SELECT e.nombre_evento, e.fecha_inicio, a.nombre as nombre_salon
        FROM tbl_eventos e
        JOIN cat_areas a ON e.idArea = a.idArea
        WHERE e.idSucursal = ? AND e.estatus = 'ACTIVO' AND DATE(e.fecha_inicio) = CURDATE()
        ORDER BY e.fecha_inicio ASC
    `;
    const [rows] = await pool.query(sql, [idSucursal]);
    return rows;
};


// ==========================================
// 🎮 CONTROLADOR PRINCIPAL
// ==========================================
const getDatosPantalla = async (req, res) => {
    const { id } = req.params;
    
    try {
        // 1. Configuración Principal
        const terminal = await obtenerConfiguracion(id);
        if (!terminal) return res.status(404).json({ error: "Terminal no encontrada" });

        // 2. Procesar Logos
        let logoPngUrl = null;
        let faviconIcoUrl = null;
        if (terminal.final_logo_name) {
            const cleanName = terminal.final_logo_name.replace('/logos/', '').replace('.png', '').replace('.ico', '').replace('.jpg', '');
            logoPngUrl = `/logos/${cleanName}.png`;
            faviconIcoUrl = `/logos/${cleanName}.ico`;
        }

        // 3. Screensaver
        const listaScreensaver = await obtenerScreensaver(terminal.idTerminal);

        // 4. Armar Respuesta Base
        let respuesta = {
            config: {
                id: terminal.idTerminal,
                nombre_interno: terminal.nombre_interno,
                tipo_pantalla: terminal.tipo_pantalla,
                tema_color: terminal.tema_color || 'dark',
                logo: logoPngUrl,
                favicon: faviconIcoUrl,
                colores: { primario: terminal.color_primario, secundario: terminal.color_secundario },
                screensaver: listaScreensaver,
                ubicacion: { lat: terminal.latitud || '19.43', lon: terminal.longitud || '-99.13' }
            },
            data: null,
            server_time: new Date()
        };

        // 5. Lógica Específica según Tipo
        if (terminal.tipo_pantalla === 'SALON' && terminal.idAreaAsignada) {
            const agenda = await obtenerAgendaSalon(terminal.idAreaAsignada);
            
            respuesta.data = {
                tipo_datos: 'AGENDA',
                eventos: agenda.map(evento => ({
                    titulo: evento.nombre_evento,
                    cliente: evento.cliente_nombre,
                    inicio_iso: evento.fecha_inicio, 
                    fin_iso: evento.fecha_fin,
                    horario: `${new Date(evento.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(evento.fecha_fin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                    mensaje: evento.mensaje_personalizado,
                    ticker: evento.mensaje_ticker,
                    layout_mode: evento.imagen_full_width || 0,
                    direccion: evento.direccion_reloj, 
                    recurrente: evento.es_recurrente === 1,
                    mostrar_inicio_iso: evento.fecha_visualizacion_inicio || evento.fecha_inicio,
                    mostrar_fin_iso: evento.fecha_visualizacion_fin || evento.fecha_fin,
                    
                    // --- AQUÍ ESTÁ EL TRUCO ---
                    // Si hay nombre personalizado, úsalo. Si no, usa el nombre normal del área.
                    nombre_salon: evento.nombre_salon_personalizado || terminal.nombre_area, 
                    
                    imagenes: evento.lista_imagenes ? evento.lista_imagenes.split(',') : []
                }))
            };
        } 
        else if (terminal.tipo_pantalla === 'DIRECTORIO') {
            respuesta.data = await obtenerDirectorio(terminal.idSucursal);
        }

        res.json(respuesta);

    } catch (error) {
        console.error("Error en PantallaController:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = { getDatosPantalla };