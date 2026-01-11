const pool = require('../config/db');

/**
 * Obtiene la agenda de eventos para un área específica.
 * CORREGIDO: Mapeo correcto de columnas de tbl_eventos
 */
const obtenerAgendaSalon = async (idArea) => {
    try {
        const sql = `
            SELECT 
                a.idEvento,
                -- Datos Principales
                a.nombre_evento, 
                a.nombre_evento_en, 
                a.nombre_evento_fr,
                
                -- Datos Cliente
                a.cliente_nombre, 
                a.cliente_en,
                a.cliente_fr,
                
                -- Fechas
                a.fecha_inicio, 
                a.fecha_fin,
                
                -- Mensajes (USANDO ALIAS PARA EL FRONTEND)
                a.mensaje_personalizado as mensaje, 
                a.mensaje_personalizado_en as mensaje_en, 
                a.mensaje_personalizado_fr as mensaje_fr,
                
                -- Imagen y Diseño
                a.imagen_full_width, -- Importante para saber el modo (0-9)
                
                -- Datos del Salón
                s.nombre as nombre_salon,
                s.direccion_reloj, 
                s.piso,
                s.imagen_fondo
            FROM tbl_eventos a
            LEFT JOIN cat_salones s ON a.idSalon = s.idSalon
            WHERE s.idArea = ? 
            AND a.activo = 1
            AND (
                DATE(a.fecha_inicio) = CURDATE() 
                OR 
                (a.fecha_inicio <= NOW() AND a.fecha_fin >= NOW())
            )
            ORDER BY a.fecha_inicio ASC
        `;

        const [rows] = await pool.query(sql, [idArea]);
        
        return rows.map(row => {
            const inicio = new Date(row.fecha_inicio);
            const fin = new Date(row.fecha_fin);

            return {
                ...row,
                // Generamos horario formateado por conveniencia
                horario: `${inicio.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${fin.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`,
            };
        });

    } catch (error) {
        console.error("❌ Error en salonesController:", error);
        return [];
    }
};

module.exports = { obtenerAgendaSalon };