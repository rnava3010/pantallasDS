const pool = require('../config/db');
const directorioController = require('./directorioController');
const noticiasController = require('./noticiasController');
const tarifasController = require('./tarifasController'); // ✅ NUEVO IMPORT

// ... (obtenerConfiguracion, obtenerScreensaver, etc. se mantienen igual)

const getDatosPantalla = async (req, res) => {
    const { id } = req.params;
    
    try {
        const terminal = await obtenerConfiguracion(id);
        if (!terminal) return res.status(404).json({ error: "Terminal no encontrada" });

        // ... (Lógica de logos y clima se mantiene igual)
        const listaScreensaver = await obtenerScreensaver(terminal.idTerminal);
        const climaCache = await getClimaSeguro(terminal.idSucursal);

        let respuesta = {
            config: {
                id: terminal.idTerminal,
                nombre_interno: terminal.nombre_interno,
                tipo_pantalla: terminal.tipo_pantalla,
                orientacion: terminal.orientacion,
                layoutDir: terminal.layoutDir || 0,
                layoutTarifas: terminal.layoutTarifas || 0, // ✅ Nueva columna para tarifas
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

        // --- LÓGICA DE RAMIFICACIÓN POR TIPO ---
        if (terminal.tipo_pantalla === 'SALON' && terminal.idAreaAsignada) {
            // ... (Lógica de SALON existente)
        } 
        else if (terminal.tipo_pantalla === 'DIRECTORIO') {
            const eventos = await directorioController.obtenerDatosDirectorio(terminal.idSucursal);
            const noticias = await getNoticiasSeguras();
            respuesta.data = {
                tipo_datos: 'DIRECTORIO',
                eventos: eventos,
                noticias: noticias
            };
        }
        // ✅ NUEVA RAMA: TARIFAS
        else if (terminal.tipo_pantalla === 'TARIFAS') {
            const tarifas = await tarifasController.obtenerTarifasPorSucursal(terminal.idSucursal);
            const banner = await tarifasController.obtenerBannersTarifas(terminal.idSucursal);
            
            respuesta.data = {
                tipo_datos: 'TARIFAS',
                tarifas: tarifas,
                banner: banner,
                galeria: listaScreensaver // Reutilizamos el screensaver como galería si no hay una específica
            };
        }

        res.json(respuesta);

    } catch (error) {
        console.error("❌ Error en PantallaController:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = { getDatosPantalla };