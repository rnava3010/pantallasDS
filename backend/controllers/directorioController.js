const pool = require('../config/db');

/**
 * Helper robusto para obtener fecha y hora en una Zona Horaria específica.
 * Usa el locale 'sv-SE' (Suecia) porque sigue el estándar ISO 8601 (YYYY-MM-DD HH:mm:ss),
 * que es exactamente lo que MySQL necesita, evitando errores de formato manual.
 */
const getZonedNow = (timeZone) => {
    try {
        const zona = timeZone || 'America/Mexico_City';
        const now = new Date();

        // Genera: "2025-01-10 23:30:05" directamente
        const fechaHoraString = now.toLocaleString('sv-SE', { timeZone: zona });
        
        // Separamos fecha y hora
        const [fecha, hora] = fechaHoraString.split(' ');
        
        return {
            dateOnly: fecha,      // "2025-01-10"
            full: fechaHoraString // "2025-01-10 23:30:05"
        };
    } catch (error) {
        console.error("Error calculando zona horaria:", error);
        // Fallback de emergencia a UTC si falla la zona
        const now = new Date();
        return {
            dateOnly: now.toISOString().split('T')[0],
            full: now.toISOString().slice(0, 19).replace('T', ' ')
        };
    }
};

const obtenerDatosDirectorio = async (idSucursal) => {
    
    // 1. Obtenemos la zona horaria de la sucursal
    const sqlZona = `SELECT zona_horaria FROM cat_sucursales WHERE idSucursal = ?`;
    const [rowsZona] = await pool.query(sqlZona, [idSucursal]);
    
    const zonaHoraria = rowsZona[0]?.zona_horaria || 'America/Mexico_City';

    // 2. Calculamos la hora exacta
    const tiempoActual = getZonedNow(zonaHoraria);
    
    // LOG DE DEPURACIÓN (Revisa esto en tu consola del backend)
    console.log(`🔎 [Directorio] Sucursal ID: ${idSucursal} | Zona: ${zonaHoraria}`);
    console.log(`🕒 [Directorio] Hora Calculada para Filtro: ${tiempoActual.full}`);

    // 3. Consulta SQL
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
          
          -- REGLA 1: Compara solo la parte de la FECHA (YYYY-MM-DD)
          AND DATE(e.fecha_inicio) = ?
          
          -- REGLA 2: El evento debe terminar DESPUÉS de ahora
          AND e.fecha_fin > ?
          
        ORDER BY e.fecha_inicio ASC
    `;
    
    const [rows] = await pool.query(sql, [idSucursal, tiempoActual.dateOnly, tiempoActual.full]);
    
    console.log(`✅ [Directorio] Eventos encontrados: ${rows.length}`);
    return rows;
};

module.exports = { obtenerDatosDirectorio };