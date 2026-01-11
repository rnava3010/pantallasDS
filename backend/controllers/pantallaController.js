const pool = require('../config/db');
const directorioController = require('./directorioController');
const noticiasController = require('./noticiasController');
const tarifasController = require('./tarifasController');
const salonesController = require('./salonesController'); 

// ==========================================
// 🛠️ HELPERS DE CONFIGURACIÓN
// ==========================================

const obtenerConfiguracionBase = async (id) => {
    // NOTA: Se eliminaron los comentarios '--' dentro del string SQL 
    // para evitar errores de sintaxis en algunos drivers de MySQL para Node.js.
    const sql = `
        SELECT 
            t.idTerminal, t.nombre_interno, t.tipo_pantalla, t.idAreaAsignada,
            t.idSucursal, t.orientacion, t.layoutDir, t.layoutTarifas,
            t.idiomas_activos, t.tiempo_rotacion_idioma,
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

// Helper para obtener clima de forma segura (sin romper si falla el JSON)
const getClimaSeguro = async (idSucursal) => {
    try {
        const [rows] = await pool.query("SELECT json_clima, updated_at FROM tbl_cache_clima WHERE idSucursal = ?", [idSucursal]);
        if (rows.length > 0) {
            const cache = rows[0];
            return typeof cache.json_clima === 'string' ? JSON.parse(cache.json_clima) : cache.json_clima;
        }
        return null;
    } catch (error) {
        console.error("⚠️ Error leyendo caché de clima:", error.message);
        return null;
    }
};

// ==========================================
// 🎮 CONTROLADOR PRINCIPAL
// ==========================================
const getDatosPantalla = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Obtener Configuración de la Terminal
        const terminal = await obtenerConfiguracionBase(id);
        if (!terminal) return res.status(404).json({ error: "Terminal no encontrada" });

        // 2. Obtener Datos Comunes (Screensaver, Clima)
        const listaScreensaver = await obtenerScreensaver(terminal.idTerminal);
        const climaCache = await getClimaSeguro(terminal.idSucursal);

        // --- PROCESAMIENTO DE IDIOMAS ---
        let idiomasParsed = ["es"]; 
        try {
            if (terminal.idiomas_activos) {
                if (typeof terminal.idiomas_activos === 'string') {
                    idiomasParsed = JSON.parse(terminal.idiomas_activos);
                } else if (Array.isArray(terminal.idiomas_activos)) {
                    idiomasParsed = terminal.idiomas_activos;
                }
            }
        } catch (e) {
            console.error("⚠️ Error parseando idiomas, usando default ['es']");
        }

        // --- PROCESAMIENTO DEL LOGO ---
        let logoFinal = null;
        if (terminal.final_logo_name) {
            const fileName = terminal.final_logo_name.split('/').pop(); 
            logoFinal = `/logos/${fileName}`;
        }

        // 3. Estructura Base de Respuesta
        let respuesta = {
            config: {
                id: terminal.idTerminal,
                nombre_interno: terminal.nombre_interno,
                tipo_pantalla: terminal.tipo_pantalla,
                orientacion: terminal.orientacion,
                layoutDir: terminal.layoutDir || 0,
                layoutTarifas: terminal.layoutTarifas || 0, // <--- CLAVE PARA TUS DISEÑOS NUEVOS
                zona_horaria: terminal.zona_horaria || 'America/Mexico_City',
                
                // Config de Idiomas
                idiomas_activos: idiomasParsed, 
                tiempo_rotacion: terminal.tiempo_rotacion_idioma || 20,

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
                }
            },
            clima_backend: climaCache,
            data: null,  
            datos: null, 
            timeOffset: 0,
            server_time: new Date()
        };

        // ==========================================
        // 🚀 DELEGACIÓN POR TIPO DE PANTALLA
        // ==========================================
        
        // --- CASO 1: SALONES (AGENDA) ---
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
        
        // --- CASO 2: DIRECTORIO ---
        else if (terminal.tipo_pantalla === 'DIRECTORIO') {
            const eventos = await directorioController.obtenerDatosDirectorio(terminal.idSucursal);
            const noticias = await noticiasController.fetchNoticiasRSS();
            const dataDir = { tipo_datos: 'DIRECTORIO', eventos, noticias };
            respuesta.datos = dataDir;
            respuesta.data = dataDir;
        }
        
        // --- CASO 3: TARIFAS (NUEVO FIX) ---
        else if (terminal.tipo_pantalla === 'TARIFAS') {
            // Llamamos a las 3 funciones independientes para armar el paquete completo
            const habitaciones = await tarifasController.obtenerHabitaciones(terminal.idSucursal);
            const divisas = await tarifasController.obtenerDivisas(terminal.idSucursal);
            const banner = await tarifasController.obtenerAviso(terminal.idSucursal);
            
            const dataTarifas = { 
                tipo_datos: 'TARIFAS', 
                habitaciones, // Tus cuartos (tbl_tarifas)
                divisas,      // Tus cambios (tbl_divisas)
                banner,       // Tu cintillo (tbl_avisos)
                galeria: listaScreensaver 
            };
            respuesta.datos = dataTarifas;
            respuesta.data = dataTarifas;
        }

        // Enviamos la respuesta final al Frontend
        res.json(respuesta);

    } catch (error) {
        console.error("❌ Error CRÍTICO en PantallaController:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = { getDatosPantalla };