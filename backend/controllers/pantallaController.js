const pool = require('../config/db');
const tarifasController = require('./tarifasController');
// ... importa tus otros controladores si los necesitas (salones, directorio)

const obtenerConfiguracionBase = async (id) => {
    // Consulta limpia sin comentarios para evitar errores
    const sql = `
        SELECT 
            t.idTerminal, t.nombre_interno, t.tipo_pantalla, t.idSucursal,
            t.idiomas_activos, t.tiempo_rotacion_idioma, t.layoutTarifas,
            COALESCE(s.logo_url, m.logo_url) as logo_url,
            COALESCE(t.color_fondo, '#000000') as color_fondo,
            COALESCE(t.color_texto_evento, '#FFFFFF') as color_texto_evento,
            COALESCE(t.color_acento, '#EAB308') as color_acento,
            s.zona_horaria
        FROM cat_terminales t
        LEFT JOIN cat_sucursales s ON t.idSucursal = s.idSucursal
        LEFT JOIN cat_marcas m ON t.idMarca = m.idMarca
        WHERE t.idTerminal = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0];
};

const getDatosPantalla = async (req, res) => {
    const { id } = req.params;
    try {
        const terminal = await obtenerConfiguracionBase(id);
        if (!terminal) return res.status(404).json({ error: "Terminal no encontrada" });

        // Parseo seguro de idiomas
        let idiomas = ['es'];
        try {
            if (terminal.idiomas_activos) {
                idiomas = typeof terminal.idiomas_activos === 'string' 
                    ? JSON.parse(terminal.idiomas_activos) 
                    : terminal.idiomas_activos;
            }
        } catch (e) {}

        // Estructura Base
        let respuesta = {
            config: {
                id: terminal.idTerminal,
                tipo_pantalla: terminal.tipo_pantalla,
                layoutTarifas: terminal.layoutTarifas || 0,
                idiomas_activos: idiomas,
                tiempo_rotacion: terminal.tiempo_rotacion_idioma || 20,
                logo: terminal.logo_url ? `/logos/${terminal.logo_url.split('/').pop()}` : null,
                zona_horaria: terminal.zona_horaria || 'America/Mexico_City',
                colores: {
                    fondo: terminal.color_fondo,
                    texto: terminal.color_texto_evento,
                    acento: terminal.color_acento
                }
            },
            datos: null
        };

        // Lógica Exclusiva para TARIFAS
        if (terminal.tipo_pantalla === 'TARIFAS') {
            const habitaciones = await tarifasController.obtenerHabitaciones(terminal.idSucursal);
            const avisos = await tarifasController.obtenerAvisos(terminal.idSucursal);
            const galeria = await tarifasController.obtenerGaleria(terminal.idTerminal);
            const divisas = await tarifasController.obtenerDivisas(terminal.idSucursal);

            respuesta.datos = {
                habitaciones,
                avisos,
                galeria,
                divisas
            };
        }

        res.json(respuesta);

    } catch (error) {
        console.error("Error en getDatosPantalla:", error);
        res.status(500).json({ error: "Error interno" });
    }
};

module.exports = { getDatosPantalla };