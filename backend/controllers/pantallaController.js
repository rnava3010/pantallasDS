const pool = require('../config/db');
const directorioController = require('./directorioController');
const noticiasController = require('./noticiasController');
const tarifasController = require('./tarifasController');
const salonesController = require('./salonesController'); 

// --- HELPERS DE CONFIGURACIÓN ---
const obtenerConfiguracionBase = async (id) => {
    const sql = `
        SELECT 
            t.idTerminal, t.nombre_interno, t.tipo_pantalla, t.idAreaAsignada,
            t.idSucursal, t.orientacion, t.layoutDir, t.layoutTarifas,
            t.pieTarifas,
            a.nombre as nombre_area,
            COALESCE(s.logo_url, m.logo_url) as final_logo_name, 
            s.latitud, s.longitud, s.zona_horaria, t.imagen_default_url,
            COALESCE(t.color_fondo, '#000000') as color_fondo,
            COALESCE(t.color_texto_evento, '#FFFFFF') as color_texto_evento,
            COALESCE(t.color_texto_reloj, '#FFFFFF') as color_texto_reloj,
            COALESCE(t.color_acento, '#EAB308') as color_acento,
            t.idiomas_activos,       
            t.tiempo_rotacion_idioma 
        FROM cat_terminales t
        LEFT JOIN cat_areas a ON t.idAreaAsignada = a.idArea
        LEFT JOIN cat_sucursales s ON t.idSucursal = s.idSucursal
        LEFT JOIN cat_marcas m ON t.idMarca = m.idMarca
        WHERE t.idTerminal = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    
    if (rows.length > 0) {
        let config = rows[0];

        if (typeof config.idiomas_activos === 'string') {
            try { config.idiomas_activos = JSON.parse(config.idiomas_activos); } catch (e) { config.idiomas_activos = ["es"]; }
        } else if (!Array.isArray(config.idiomas_activos)) {
            config.idiomas_activos = ["es"];
        }

        if (config.pieTarifas) {
            try {
                const parsed = JSON.parse(config.pieTarifas);
                config.pieTarifas = (typeof parsed === 'object') ? parsed : { es: config.pieTarifas };
            } catch (e) {
                config.pieTarifas = { es: config.pieTarifas };
            }
        } else {
            config.pieTarifas = {};
        }

        // Default de tiempo
        if (!config.tiempo_rotacion_idioma || config.tiempo_rotacion_idioma <= 0) {
            config.tiempo_rotacion_idioma = 20; 
        }

        return config;
    }
    return null;
};

const obtenerScreensaver = async (idTerminal) => {
    const [rows] = await pool.query(`SELECT url_archivo FROM tbl_galeria_terminal WHERE idTerminal = ? ORDER BY orden ASC`, [idTerminal]);
    return rows.map(row => row.url_archivo);
};

// Helper clima
const getClimaSeguro = async (idSucursal) => {
    const [rows] = await pool.query("SELECT json_clima, updated_at FROM tbl_cache_clima WHERE idSucursal = ?", [idSucursal]);
    if (rows.length > 0) {
        const cache = rows[0];
        return typeof cache.json_clima === 'string' ? JSON.parse(cache.json_clima) : cache.json_clima;
    }
    return null;
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
        const climaCache = await getClimaSeguro(terminal.idSucursal);

        let logoFinal = null;
        if (terminal.final_logo_name) {
            const fileName = terminal.final_logo_name.split('/').pop(); 
            logoFinal = `/logos/${fileName}`;
        }

        let respuesta = {
            config: {
                id: terminal.idTerminal,
                nombre_interno: terminal.nombre_interno,
                tipo_pantalla: terminal.tipo_pantalla,
                orientacion: terminal.orientacion,
                layoutDir: terminal.layoutDir || 0,
                layoutTarifas: terminal.layoutTarifas || 0,
                pieTarifas: terminal.pieTarifas, // ✅ Se envía al frontend
                zona_horaria: terminal.zona_horaria || 'America/Mexico_City',
                logo: logoFinal, 
                imagen_default: terminal.imagen_default_url,
                screensaver: listaScreensaver,
                ubicacion: { 
                    lat: terminal.latitud || '19.43', 
                    lon: terminal.longitud || '-99.13' 
                },
                colores: {
                    fondo: terminal.color_fondo,
                    texto_evento: terminal.color_texto_evento,
                    texto_reloj: terminal.color_texto_reloj,
                    acento: terminal.color_acento 
                },
                idiomas_activos: terminal.idiomas_activos,
                tiempo_rotacion_idioma: terminal.tiempo_rotacion_idioma
            },
            clima_backend: climaCache,
            data: null,  
            datos: null, 
            timeOffset: 0,
            server_time: new Date()
        };

        if (terminal.tipo_pantalla === 'SALON' && terminal.idAreaAsignada) {
            const eventos = await salonesController.obtenerAgendaSalon(terminal.idAreaAsignada);
            const dataSalon = { 
                tipo_datos: 'AGENDA', 
                eventos: eventos.map(e => ({
                    ...e,
                    nombre_salon: e.nombre_salon || terminal.nombre_area
                }))
            };
            respuesta.datos = dataSalon;
            respuesta.data = dataSalon;
        } 
        else if (terminal.tipo_pantalla === 'DIRECTORIO') {
            const eventos = await directorioController.obtenerDatosDirectorio(terminal.idSucursal);
            const noticias = await noticiasController.fetchNoticiasRSS();
            const dataDir = { tipo_datos: 'DIRECTORIO', eventos, noticias };
            respuesta.datos = dataDir;
            respuesta.data = dataDir;
        }
        else if (terminal.tipo_pantalla === 'TARIFAS') {
            const tarifas = await tarifasController.obtenerTarifasPorSucursal(terminal.idSucursal);
            const divisas = await tarifasController.obtenerDivisasPorSucursal(terminal.idSucursal);
            const avisos = await tarifasController.obtenerAvisosPorSucursal(terminal.idSucursal);

            const dataTarifas = { 
                tipo_datos: 'TARIFAS', 
                tarifas, 
                divisas,
                avisos,
                galeria: listaScreensaver 
            };
            respuesta.datos = dataTarifas;
            respuesta.data = dataTarifas;
        }

        res.json(respuesta);

    } catch (error) {
        console.error("❌ Error en PantallaController:", error);
        res.status(500).json({ error: "Error interno" });
    }
};

module.exports = { getDatosPantalla };