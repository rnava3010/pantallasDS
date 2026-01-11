const pool = require('../config/db');

/**
 * Helper para obtener la hora actual en la Zona Horaria de la Sucursal.
 */
const getZonedNow = (timeZone) => {
    try {
        const zona = timeZone || 'America/Mexico_City';
        // Formato sueco ISO 'YYYY-MM-DD HH:mm:ss'
        const nowString = new Date().toLocaleString('sv-SE', { timeZone: zona });
        const [fecha, hora] = nowString.split(' ');
        
        return { dateOnly: fecha, full: nowString };
    } catch (error) {
        console.error("Error zona horaria:", error);
        return { dateOnly: '', full: '' };
    }
};

const obtenerDatosDirectorio = async (idSucursal) => {
    
    // 1. Obtener Zona Horaria
    const [rowsZona] = await pool.query(`SELECT zona_horaria FROM cat_sucursales WHERE idSucursal = ?`, [idSucursal]);
    const zonaHoraria = rowsZona[0]?.zona_horaria || 'America/Mexico_City';

    // 2. Calcular "AHORA"
    const tiempoActual = getZonedNow(zonaHoraria);
    
    console.log(`\n==================================================`);
    console.log(`🔍 [DEBUG] SUCURSAL ID: ${idSucursal} | ZONA: ${zonaHoraria}`);
    console.log(`🕒 [DEBUG] HORA ACTUAL SISTEMA (REF): "${tiempoActual.full}"`);
    console.log(`==================================================`);

    // 3. CONSULTA SQL (Trae todo lo de HOY)
    const sql = `
        SELECT 
            e.nombre_evento, 
            e.fecha_inicio, 
            e.fecha_fin, 
            
            -- FORZAMOS FORMATO DE TEXTO PARA COMPARAR EXACTAMENTE LO QUE VES EN SQL
            DATE_FORMAT(e.fecha_fin, '%Y-%m-%d %H:%i:%s') as fin_str,
            
            a.nombre as nombre_salon
        FROM tbl_eventos e
        JOIN cat_areas a ON e.idArea = a.idArea
        WHERE e.idSucursal = ? 
          AND e.estatus = 'ACTIVO' 
          AND DATE(e.fecha_inicio) = ? 
        ORDER BY e.fecha_inicio ASC
    `;
    
    const [eventosDelDia] = await pool.query(sql, [idSucursal, tiempoActual.dateOnly]);
    
    console.log(`📥 [DEBUG] Eventos encontrados en BD para hoy (${tiempoActual.dateOnly}): ${eventosDelDia.length}`);

    // 4. FILTRADO JS CON LOGS
    const eventosVigentes = eventosDelDia.filter((evento, index) => {
        // Comparación de cadenas de texto (ISO format)
        // Ejemplo: "2026-01-10 23:59:00" > "2026-01-10 23:35:00"
        const sigueVigente = evento.fin_str > tiempoActual.full;
        
        console.log(`\n   🔎 [Evento #${index + 1}] "${evento.nombre_evento}"`);
        console.log(`      📅 Termina BD:   "${evento.fin_str}"`);
        console.log(`      ⏰ Hora Actual:  "${tiempoActual.full}"`);
        console.log(`      ⚖️  ¿Vigente?    ${sigueVigente ? '✅ SÍ' : '❌ NO (Se oculta)'}`);

        return sigueVigente;
    });

    console.log(`\n🚀 [DEBUG] Total enviados al Frontend: ${eventosVigentes.length}`);
    console.log(`==================================================\n`);

    return eventosVigentes;
};

module.exports = { obtenerDatosDirectorio };