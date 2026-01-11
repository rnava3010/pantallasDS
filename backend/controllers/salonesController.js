const pool = require('../config/db');

/**
 * Obtiene la agenda de eventos para un área específica.
 * Incluye soporte multilenguaje y fechas crudas.
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
                
                -- Fechas y Horas (Crudas para manipulación en Frontend)
                a.fecha_inicio, 
                a.fecha_fin,
                
                -- Mensajes
                a.mensaje, 
                a.mensaje_en, 
                a.mensaje_fr,
                
                -- Datos del Salón
                s.nombre as nombre_salon,
                -- Si tu tabla de salones tiene traducciones, agrégalas aquí:
                -- s.nombre_en as nombre_salon_en, 
                s.direccion_reloj, 
                s.piso,
                s.imagen_fondo -- Por si cada salón tiene fondo específico
            FROM tbl_agenda_salones a
            LEFT JOIN cat_salones s ON a.idSalon = s.idSalon
            WHERE s.idArea = ? 
            AND a.activo = 1
            -- Filtramos solo eventos vigentes (de hoy)
            AND (
                DATE(a.fecha_inicio) = CURDATE() 
                OR 
                (a.fecha_inicio <= NOW() AND a.fecha_fin >= NOW())
            )
            ORDER BY a.fecha_inicio ASC
        `;

        const [rows] = await pool.query(sql, [idArea]);
        
        // Procesamos los datos antes de enviarlos
        return rows.map(row => {
            // Creamos objetos Date reales
            const inicio = new Date(row.fecha_inicio);
            const fin = new Date(row.fecha_fin);

            return {
                ...row, // Mantiene fecha_inicio y fecha_fin originales
                
                // Agregamos el string de horario formateado por si acaso un layout simple lo necesita
                horario: `${inicio.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${fin.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`,
                
                // Formatos auxiliares (opcional, pero útil para depurar)
                dia_mes: inicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
            };
        });

    } catch (error) {
        console.error("❌ Error en salonesController:", error);
        return [];
    }
};

module.exports = { obtenerAgendaSalon };