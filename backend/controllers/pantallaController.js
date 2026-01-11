const pool = require('../config/db');

// Importamos el especialista en Directorios
const directorioController = require('./directorioController');

// --- SUB-FUNCION: Obtener Configuración Base ---
const obtenerConfiguracion = async (id) => {
    const sqlTerminal = `
        SELECT 
            t.idTerminal, t.nombre_interno, t.tipo_pantalla, t.tema_color, t.idAreaAsignada,
            t.idSucursal,
            t.orientacion, -- 0=Horizontal, 1=Vertical
            a.nombre as nombre_area,
            COALESCE(s.logo_url, m.logo_url) as final_logo_name, 
            m.color_primario, m.color_secundario,
            s.latitud, s.longitud,
            
            -- COLORES PERSONALIZABLES
            COALESCE(t.color_fondo, '#000000') as color_fondo,
            COALESCE(t.color_texto_evento, '#FFFFFF') as color_texto_evento,
            COALESCE(t.color_texto_reloj, '#FFFFFF') as color_texto_reloj,
            COALESCE(t.color_acento, '#EAB308') as color_acento

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

// --- SUB-FUNCION: Obtener Agenda (EXCLUSIVO PARA SALÓN) ---
const obtenerAgendaSalon = async (idArea) => {
    const sql = `
        SELECT 
            e.idEvento, e.nombre_evento, e.cliente_nombre, 
            e.fecha_inicio, e.fecha_fin, 
            e.mensaje_personalizado, e.mensaje_ticker,
            e.imagen_full_width, e.direccion_reloj,
            e.nombre_salon_personalizado, 
            
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

// ==========================================
// 🎮 CONTROLADOR PRINCIPAL (El "Dispatcher")
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

        // 3. Screensaver (Común para todos)
        const listaScreensaver = await obtenerScreensaver(terminal.idTerminal);

        // 4. Armar Respuesta Base
        let respuesta = {
            config: {
                id: terminal.idTerminal,
                nombre_interno: terminal.nombre_interno,
                tipo_pantalla: terminal.tipo_pantalla,
                orientacion: terminal.orientacion,
                tema_color: terminal.tema_color || 'dark',
                logo: logoPngUrl,
                favicon: faviconIcoUrl,
                screensaver: listaScreensaver,
                ubicacion: { lat: terminal.latitud || '19.43', lon: terminal.longitud || '-99.13' },
                colores: {
                    fondo: terminal.color_fondo,
                    texto_evento: terminal.color_texto_evento,
                    texto_reloj: terminal.color_texto_reloj,
                    acento: terminal.color_acento 
                }
            },
            data: null,
            server_time: new Date()
        };

        // 5. DELEGACIÓN DE LÓGICA SEGÚN TIPO
        if (terminal.tipo_pantalla === 'SALON' && terminal.idAreaAsignada) {
             // Lógica de Salón (Se queda aquí por ahora)
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
                    nombre_salon: evento.nombre_salon_personalizado || terminal.nombre_area, 
                    imagenes: evento.lista_imagenes ? evento.lista_imagenes.split(',') : []
                }))
            };
        } 
        else if (terminal.tipo_pantalla === 'DIRECTORIO') {
            // ✅ AQUÍ USAMOS EL NUEVO CONTROLADOR DE DIRECTORIO
            respuesta.data = await directorioController.obtenerDatosDirectorio(terminal.idSucursal);
        }

        res.json(respuesta);

    } catch (error) {
        console.error("Error en PantallaController:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = { getDatosPantalla };