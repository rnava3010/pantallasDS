const pool = require('../config/db');

/**
 * Obtiene la agenda de eventos.
 * CORREGIDO: Adaptado a la estructura real de tbl_eventos y cat_areas.
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
                
                -- Mensajes (Alias para el Frontend)
                a.mensaje_personalizado as mensaje, 
                a.mensaje_personalizado_en as mensaje_en, 
                a.mensaje_personalizado_fr as mensaje_fr,
                
                -- Diseño
                a.imagen_full_width, -- El modo (0, 1, 2, etc.)
                
                -- Ubicación y Dirección
                a.direccion_reloj,   -- Viene directo del evento
                
                -- Nombre del Salón (Prioridad: Personalizado > Nombre del Área)
                COALESCE(NULLIF(a.nombre_salon_personalizado, ''), s.nombre) as nombre_salon
                
            FROM tbl_eventos a
            LEFT JOIN cat_areas s ON a.idArea = s.idArea
            WHERE a.idArea = ? 
            
            -- Filtro de Estatus (Enum)
            AND a.estatus = 'ACTIVO'
            
            -- Filtro de Fechas (Vigentes hoy)
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
                // Generamos string de horario por comodidad
                horario: `${inicio.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${fin.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`,
            };
        });

    } catch (error) {
        console.error("❌ Error en salonesController:", error);
        return [];
    }
};

module.exports = { obtenerAgendaSalon };