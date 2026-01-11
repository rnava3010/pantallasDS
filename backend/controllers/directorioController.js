const pool = require('../config/db');

/**
 * Helper para obtener la hora actual en la Zona Horaria de la Sucursal.
 * Retorna formato STRING compatible con MySQL: 'YYYY-MM-DD HH:mm:ss'
 */
const getZonedNow = (timeZone) => {
    try {
        const zona = timeZone || 'America/Mexico_City';
        
        // Obtenemos la fecha/hora en la zona deseada usando formato sueco (ISO standard)
        // Ejemplo salida: "2025-01-10 23:30:00"
        const nowString = new Date().toLocaleString('sv-SE', { timeZone: zona });
        
        const [fecha, hora] = nowString.split(' ');
        
        return {
            dateOnly: fecha,      // "2025-01-10"
            full: nowString       // "2025-01-10 23:30:00"
        };
    } catch (error) {
        console.error("Error zona horaria:", error);
        return { dateOnly: '', full: '' };
    }
};

const obtenerDatosDirectorio = async (idSucursal) => {
    
    // 1. Obtener Zona Horaria
    const [rowsZona] = await pool.query(`SELECT zona_horaria FROM cat_sucursales WHERE idSucursal = ?`, [idSucursal]);
    const zonaHoraria = rowsZona[0]?.zona_horaria || 'America/Mexico_City';

    // 2. Calcular "AHORA" en esa ciudad
    const tiempoActual = getZonedNow(zonaHoraria);
    
    console.log(`\n--- CONSULTA DIRECTORIO (Sucursal ${idSucursal}) ---`);
    console.log(`📍 Zona: ${zonaHoraria} | 🕒 Hora Local: ${tiempoActual.full}`);

    // 3. TRAER TODO LO DE HOY (Sin filtrar por hora en SQL)
    // Usamos CAST para obtener las fechas como STRING puro y evitar que JS cambie la zona horaria
    const sql = `
        SELECT 
            e.nombre_evento, 
            e.fecha_inicio,  -- Objeto Date
            e.fecha_fin,     -- Objeto Date
            
            -- Traemos versiones en Texto para comparar fácil en JS
            CAST(e.fecha_inicio AS CHAR) as inicio_str,
            CAST(e.fecha_fin AS CHAR) as fin_str,
            
            a.nombre as nombre_salon
        FROM tbl_eventos e
        JOIN cat_areas a ON e.idArea = a.idArea
        WHERE e.idSucursal = ? 
          AND e.estatus = 'ACTIVO' 
          -- Solo validamos que sea el día correcto
          AND DATE(e.fecha_inicio) = ? 
        ORDER BY e.fecha_inicio ASC
    `;
    
    const [eventosDelDia] = await pool.query(sql, [idSucursal, tiempoActual.dateOnly]);
    
    console.log(`📥 Eventos encontrados para hoy: ${eventosDelDia.length}`);

    // 4. FILTRAR EN JAVASCRIPT (Lógica de visualización)
    // "Mostrar solo si la hora de fin es MAYOR que la hora actual"
    const eventosVigentes = eventosDelDia.filter(evento => {
        // Comparamos cadenas: "2025-01-10 23:59:00" > "2025-01-10 23:30:00"
        const sigueVigente = evento.fin_str > tiempoActual.full;
        
        if (!sigueVigente) {
            console.log(`   ❌ Ocultando evento vencido: "${evento.nombre_evento}" (Terminó: ${evento.fin_str})`);
        }
        return sigueVigente;
    });

    console.log(`✅ Eventos visibles finales: ${eventosVigentes.length}`);
    console.log(`--------------------------------------------\n`);

    return eventosVigentes;
};

module.exports = { obtenerDatosDirectorio };