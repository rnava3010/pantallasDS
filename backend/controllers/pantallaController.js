const pool = require('../config/db');
const directorioController = require('./directorioController');
const noticiasController = require('./noticiasController');
const tarifasController = require('./tarifasController');
const salonesController = require('./salonesController'); // ✅ Nuevo Import

// --- HELPERS DE CONFIGURACIÓN ---
const obtenerConfiguracionBase = async (id) => {
    const sql = `
        SELECT 
            t.idTerminal, t.nombre_interno, t.tipo_pantalla, t.idAreaAsignada,
            t.idSucursal, t.orientacion, t.layoutDir, t.layoutTarifas,
            a.nombre as nombre_area,
            COALESCE(s.logo_url, m.logo_url) as final_logo_name, 
            s.latitud, s.longitud, s.zona_horaria, t.imagen_default_url,
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
    const [rows] = await pool.query(sql, [id]);
    return rows[0];
};

const obtenerScreensaver = async (idTerminal) => {
    const [rows] = await pool.query(`SELECT url_archivo FROM tbl_galeria_terminal WHERE idTerminal = ? ORDER BY orden ASC`, [idTerminal]);
    return rows.map(row => row.url_archivo);
};

// ==========================================
// 🎮 CONTROLADOR PRINCIPAL
// ==========================================
const getDatosPantalla = async (req, res) => {
    const { id } = req.params;
    try {
        const terminal = await obtenerConfiguracionBase(id);
        if (!terminal) return res.status(404).json({ error: "Terminal no encontrada" });

        const listaScreensaver = await obtenerScreensaver(terminal.idTerminal);

        let respuesta = {
            config: {
                id: terminal.idTerminal,
                tipo_pantalla: terminal.tipo_pantalla,
                orientacion: terminal.orientacion,
                layoutDir: terminal.layoutDir || 0,
                layoutTarifas: terminal.layoutTarifas || 0,
                logo: terminal.final_logo_name ? `/logos/${terminal.final_logo_name.split('/').pop()}` : null,
                screensaver: listaScreensaver,
                colores: {
                    fondo: terminal.color_fondo,
                    texto_evento: terminal.color_texto_evento,
                    acento: terminal.color_acento 
                }
            },
            data: null,  // Para pantallas viejas
            datos: null, // Para pantallas nuevas
            server_time: new Date()
        };

        // --- DELEGACIÓN POR TIPO DE PANTALLA ---
        if (terminal.tipo_pantalla === 'SALON' && terminal.idAreaAsignada) {
            const eventos = await salonesController.obtenerAgendaSalon(terminal.idAreaAsignada);
            respuesta.datos = { tipo_datos: 'AGENDA', eventos };
            respuesta.data = respuesta.datos;
        } 
        else if (terminal.tipo_pantalla === 'DIRECTORIO') {
            const eventos = await directorioController.obtenerDatosDirectorio(terminal.idSucursal);
            const noticias = await noticiasController.fetchNoticiasRSS();
            respuesta.datos = { tipo_datos: 'DIRECTORIO', eventos, noticias };
            respuesta.data = respuesta.datos;
        }
        else if (terminal.tipo_pantalla === 'TARIFAS') {
            const tarifas = await tarifasController.obtenerTarifasPorSucursal(terminal.idSucursal);
            const banner = await tarifasController.obtenerBannersTarifas(terminal.idSucursal);
            respuesta.datos = { tipo_datos: 'TARIFAS', tarifas, banner, galeria: listaScreensaver };
            respuesta.data = respuesta.datos;
        }

        res.json(respuesta);
    } catch (error) {
        console.error("❌ Error en PantallaController:", error);
        res.status(500).json({ error: "Error interno" });
    }
};

module.exports = { getDatosPantalla };