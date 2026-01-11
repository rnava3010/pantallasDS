const pool = require('../config/db');

const getZonedNow = (timeZone) => {
    try {
        const zona = timeZone || 'America/Mexico_City';
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
    
    console.log(`\n--- CONSULTA DIRECTORIO (Sucursal ${idSucursal}) ---`);

    // 3. CONSULTA SQL (Con Imágenes y Flechas)
    const sql = `
        SELECT 
            e.idEvento,
            e.nombre_evento, 
            e.cliente_nombre,
            e.tipo_evento,       -- ✅ Nuevo campo (Asegúrate de que exista en tu BD)
            e.direccion_reloj,   -- ✅ Campo para la flecha
            e.fecha_inicio, 
            e.fecha_fin,
            
            DATE_FORMAT(e.fecha_fin, '%Y-%m-%d %H:%i:%s') as fin_str,
            a.nombre as nombre_salon,

            -- ✅ Agrupamos todas las imágenes (NO videos) en una lista separada por comas
            GROUP_CONCAT(em.url_archivo ORDER BY em.orden ASC SEPARATOR ',') as imagenes_lista

        FROM tbl_eventos e
        JOIN cat_areas a ON e.idArea = a.idArea
        LEFT JOIN tbl_eventos_media em ON e.idEvento = em.idEvento AND em.tipo = 'IMAGEN' -- Solo Imágenes
        
        WHERE e.idSucursal = ? 
          AND e.estatus = 'ACTIVO' 
          AND DATE(e.fecha_inicio) = ? 
        
        GROUP BY e.idEvento -- Necesario para el GROUP_CONCAT
        ORDER BY e.fecha_inicio ASC
    `;
    
    const [eventosDelDia] = await pool.query(sql, [idSucursal, tiempoActual.dateOnly]);
    
    // 4. FILTRADO JS (Vigencia)
    const eventosVigentes = eventosDelDia.filter(evento => {
        const sigueVigente = evento.fin_str > tiempoActual.full;
        return sigueVigente;
    });

    // Procesamos la lista de imágenes para que sea un Array real
    const eventosFinales = eventosVigentes.map(evt => ({
        ...evt,
        imagenes: evt.imagenes_lista ? evt.imagenes_lista.split(',') : []
    }));

    return eventosFinales;
};

module.exports = { obtenerDatosDirectorio };