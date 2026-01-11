const pool = require('../config/db');

/**
 * Obtiene la lista de eventos para el Directorio de una Sucursal.
 * Reglas de Negocio:
 * 1. Muestra eventos del día actual (desde las 00:00 hrs).
 * 2. Oculta eventos que ya terminaron (fecha_fin > NOW()).
 */
const obtenerDatosDirectorio = async (idSucursal) => {
    const sql = `
        SELECT 
            e.nombre_evento, 
            e.fecha_inicio, 
            e.fecha_fin, 
            a.nombre as nombre_salon
        FROM tbl_eventos e
        JOIN cat_areas a ON e.idArea = a.idArea
        WHERE e.idSucursal = ? 
          AND e.estatus = 'ACTIVO' 
          -- REGLA 1: Que sea del día de hoy (para que aparezca desde las 00:00)
          AND DATE(e.fecha_inicio) = CURDATE()
          -- REGLA 2: Que no haya terminado todavía (se va quitando en tiempo real)
          AND e.fecha_fin > NOW()
        ORDER BY e.fecha_inicio ASC
    `;
    
    const [rows] = await pool.query(sql, [idSucursal]);
    return rows;
};

module.exports = { obtenerDatosDirectorio };