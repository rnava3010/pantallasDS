const pool = require('../config/db');

const obtenerAgendaSalon = async (idArea) => {
    try {
        const sql = `
            SELECT 
                e.idEvento, 
                -- Datos Base
                e.nombre_evento, 
                e.nombre_evento_en, e.nombre_evento_fr, -- Nuevos campos
                
                e.cliente_nombre, 
                e.cliente_en, e.cliente_fr, -- Nuevos campos
                
                e.fecha_inicio, e.fecha_fin, 
                
                e.mensaje_personalizado, 
                e.mensaje_personalizado_en, e.mensaje_personalizado_fr, -- Nuevos campos
                
                e.mensaje_ticker,
                e.imagen_full_width, 
                e.direccion_reloj,
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
        
        return rows.map(evento => ({
            titulo: evento.nombre_evento,
            cliente: evento.cliente_nombre,
            mensaje: evento.mensaje_personalizado,
            titulo_en: evento.nombre_evento_en,
            titulo_fr: evento.nombre_evento_fr,
            cliente_en: evento.cliente_en,
            cliente_fr: evento.cliente_fr,
            mensaje_en: evento.mensaje_personalizado_en,
            mensaje_fr: evento.mensaje_personalizado_fr,
            fecha_inicio: evento.fecha_inicio,
            fecha_fin: evento.fecha_fin,
            inicio_iso: evento.fecha_inicio, 
            fin_iso: evento.fecha_fin,
            horario: `${new Date(evento.fecha_inicio).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${new Date(evento.fecha_fin).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`,
            ticker: evento.mensaje_ticker,
            layout_mode: evento.imagen_full_width || 0,
            direccion: evento.direccion_reloj, 
            recurrente: evento.es_recurrente === 1,
            nombre_salon: evento.nombre_salon_personalizado, 
            imagenes: evento.lista_imagenes ? evento.lista_imagenes.split(',') : []
        }));
    } catch (error) {
        console.error("Error en obtenerAgendaSalon:", error);
        throw error;
    }
};

module.exports = {
    obtenerAgendaSalon
};