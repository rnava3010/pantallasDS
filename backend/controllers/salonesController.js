const pool = require('../config/db');

/**
 * Obtiene la agenda de eventos para un área (salón) específica
 */
const obtenerAgendaSalon = async (idArea) => {
    try {
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
        
        // Mapeamos al formato que espera el frontend
        return rows.map(evento => ({
            titulo: evento.nombre_evento,
            cliente: evento.cliente_nombre,
            inicio_iso: evento.fecha_inicio, 
            fin_iso: evento.fecha_fin,
            mensaje: evento.mensaje_personalizado,
            ticker: evento.mensaje_ticker,
            layout_mode: evento.imagen_full_width || 0,
            direccion: evento.direccion_reloj, 
            recurrente: evento.es_recurrente === 1,
            nombre_salon: evento.nombre_salon_personalizado, 
            imagenes: evento.lista_imagenes ? evento.lista_imagenes.split(',') : []
        }));
    } catch (error) {
        console.error("❌ Error en obtenerAgendaSalon:", error);
        throw error;
    }
};

module.exports = {
    obtenerAgendaSalon
};