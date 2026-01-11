const pool = require('../config/db');

/**
 * Helper para obtener fecha y hora en una Zona Horaria específica
 * Retorna objeto con strings listos para MySQL
 */
const getZonedNow = (timeZone) => {
    // Si no hay zona horaria, usamos la de CDMX por defecto
    const zona = timeZone || 'America/Mexico_City';
    const now = new Date();

    // Usamos Intl para convertir la hora del servidor a la hora de la Sucursal
    const options = {
        timeZone: zona,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    };

    // Formateamos y extraemos las partes (año, mes, día, hora...)
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now).reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
    }, {});

    return {
        // Formato para comparar fecha: YYYY-MM-DD
        dateOnly: `${parts.year}-${parts.month}-${parts.day}`,
        // Formato para comparar hora fin: YYYY-MM-DD HH:mm:ss
        full: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`
    };
};

const obtenerDatosDirectorio = async (idSucursal) => {
    
    // 1. PRIMERO: Obtenemos la zona horaria de la sucursal desde la BD
    const sqlZona = `SELECT zona_horaria FROM cat_sucursales WHERE idSucursal = ?`;
    const [rowsZona] = await pool.query(sqlZona, [idSucursal]);
    
    const zonaHoraria = rowsZona[0]?.zona_horaria || 'America/Mexico_City';

    // 2. SEGUNDO: Calculamos la hora exacta en ESA ciudad
    const tiempoActual = getZonedNow(zonaHoraria);
    
    console.log(`[Directorio] Sucursal ${idSucursal} (${zonaHoraria}) - Hora Local: ${tiempoActual.full}`);

    // 3. TERCERO: Consultamos los eventos usando esa hora
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
          
          -- REGLA 1: Eventos de HOY (en la hora de la sucursal)
          AND DATE(e.fecha_inicio) = ?
          
          -- REGLA 2: Que no hayan terminado (según la hora de la sucursal)
          AND e.fecha_fin > ?
          
        ORDER BY e.fecha_inicio ASC
    `;
    
    const [rows] = await pool.query(sql, [idSucursal, tiempoActual.dateOnly, tiempoActual.full]);
    return rows;
};

module.exports = { obtenerDatosDirectorio };