const pool = require('../config/db');
const directorioController = require('./directorioController');
const noticiasController = require('./noticiasController');

// --- SUB-FUNCION: Obtener Configuración Base ---
const obtenerConfiguracion = async (id) => {
    const sqlTerminal = `
        SELECT 
            t.idTerminal, t.nombre_interno, t.tipo_pantalla, t.tema_color, t.idAreaAsignada,
            t.idSucursal,
            t.orientacion,
            a.nombre as nombre_area,
            COALESCE(s.logo_url, m.logo_url) as final_logo_name, 
            m.color_primario, m.color_secundario,
            s.latitud, s.longitud,
            s.zona_horaria,
            t.imagen_default_url,
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

const obtenerScreensaver = async (idTerminal) => {
    const sql = `SELECT url_archivo FROM tbl_galeria_terminal WHERE idTerminal = ? ORDER BY orden ASC`;
    const [rows] = await pool.query(sql, [idTerminal]);
    return rows.map(row => row.url_archivo);
};

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

// --- HELPERS PARA CACHÉ (Noticias y Clima) ---
const getNoticiasSeguras = async () => {
    const [rows] = await pool.query("SELECT lista_noticias, updated_at FROM tbl_cache_noticias WHERE id = 1");
    let noticias = [];
    let necesitaActualizar = true;

    if (rows.length > 0) {
        const cache = rows[0];
        const diferenciaHoras = (new Date() - new Date(cache.updated_at)) / 1000 / 60 / 60;
        if (diferenciaHoras < 2) {
            noticias = typeof cache.lista_noticias === 'string' ? JSON.parse(cache.lista_noticias) : cache.lista_noticias;
            necesitaActualizar = false;
        }
    }

    if (necesitaActualizar) {
        noticias = await noticiasController.fetchNoticiasRSS();
        pool.query("INSERT INTO tbl_cache_noticias (id, lista_noticias, updated_at) VALUES (1, ?, NOW()) ON DUPLICATE KEY UPDATE lista_noticias = VALUES(lista_noticias), updated_at = NOW()", [JSON.stringify(noticias)]);
    }
    return noticias;
};

const getClimaSeguro = async (idSucursal) => {
    const [rows] = await pool.query("SELECT json_clima, updated_at FROM tbl_cache_clima WHERE idSucursal = ?", [idSucursal]);
    if (rows.length > 0) {
        const cache = rows[0];
        const diferenciaHoras = (new Date() - new Date(cache.updated_at)) / 1000 / 60 / 60;
        if (diferenciaHoras < 2) {
            return typeof cache.json_clima === 'string' ? JSON.parse(cache.json_clima) : cache.json_clima;
        }
    }
    return null;
};

// ==========================================
// 🎮 CONTROLADOR PRINCIPAL
// ==========================================
const getDatosPantalla = async (req, res) => {
    const { id } = req.params;
    console.log(`\n⬇️ [PantallaController] Solicitud ID: ${id}`);
    
    try {
        const terminal = await obtenerConfiguracion(id);
        if (!terminal) return res.status(404).json({ error: "Terminal no encontrada" });

        let logoPngUrl = null;
        let faviconIcoUrl = null;
        if (terminal.final_logo_name) {
             const cleanName = terminal.final_logo_name.replace('/logos/', '').replace('.png', '').replace('.ico', '').replace('.jpg', '');
             logoPngUrl = `/logos/${cleanName}.png`;
             faviconIcoUrl = `/logos/${cleanName}.ico`;
        }

        const listaScreensaver = await obtenerScreensaver(terminal.idTerminal);
        const climaCache = await getClimaSeguro(terminal.idSucursal);

        let respuesta = {
            config: {
                id: terminal.idTerminal,
                nombre_interno: terminal.nombre_interno,
                tipo_pantalla: terminal.tipo_pantalla,
                orientacion: terminal.orientacion,
                zona_horaria: terminal.zona_horaria || 'America/Mexico_City', 
                logo: logoPngUrl,
                favicon: faviconIcoUrl,
                imagen_default: terminal.imagen_default_url,
                screensaver: listaScreensaver,
                ubicacion: { lat: terminal.latitud || '19.43', lon: terminal.longitud || '-99.13' },
                colores: {
                    fondo: terminal.color_fondo,
                    texto_evento: terminal.color_texto_evento,
                    texto_reloj: terminal.color_texto_reloj,
                    acento: terminal.color_acento 
                }
            },
            clima_backend: climaCache,
            data: null,
            server_time: new Date()
        };

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
                    nombre_salon: evento.nombre_salon_personalizado || terminal.nombre_area, 
                    imagenes: evento.lista_imagenes ? evento.lista_imagenes.split(',') : []
                }))
            };
        } 
		else if (terminal.tipo_pantalla === 'DIRECTORIO') {
            console.log("📂 [PantallaController] Procesando como DIRECTORIO");
            
            const eventos = await directorioController.obtenerDatosDirectorio(terminal.idSucursal);
            
            // ✅ Usa la función que lee de la Base de Datos (Caché)
            // Si quieres probar sin cron, usa: const noticias = await noticiasController.fetchNoticiasRSS();
            const noticias = await getNoticiasSeguras(); 

            respuesta.data = {
                tipo_datos: 'DIRECTORIO',
                eventos: eventos,
                noticias: noticias
            };
        }

        res.json(respuesta);

    } catch (error) {
        console.error("❌ Error en PantallaController:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = { getDatosPantalla };