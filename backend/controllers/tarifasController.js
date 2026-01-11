const pool = require('../config/db');

/**
 * Obtiene la lista de tarifas activas para una sucursal específica.
 * @param {number} idSucursal - El ID de la sucursal a consultar.
 * @returns {Promise<Array>} - Lista de tarifas encontradas.
 */
const obtenerTarifasPorSucursal = async (idSucursal) => {
    try {
        // AGREGAMOS 'descripcion' AL SELECT
        const sql = `
            SELECT 
                idTarifa, 
                nombre_habitacion as nombre, 
                descripcion,
                precio_rack, 
                precio_promocion as precio, 
                moneda, 
                url_imagen_fondo as imagen
            FROM tbl_tarifas 
            WHERE idSucursal = ? AND activo = 1
            ORDER BY idTarifa ASC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows;
    } catch (error) {
        console.error("❌ Error en obtenerTarifasPorSucursal:", error);
        throw error;
    }
};
const obtenerDivisasPorSucursal = async (idSucursal) => {
    try {
        const sql = `
            SELECT nombre, codigo, simbolo, tipo_cambio, bandera 
            FROM tbl_divisas 
            WHERE idSucursal = ? AND activo = 1 
            ORDER BY orden ASC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows;
    } catch (error) {
        console.error("❌ Error obteniendo divisas:", error);
        return []; // Retornar array vacío en caso de error para no romper la app
    }
};

/**
 * Obtiene los banners activos combinando avisos de Sucursal, Marca y Propiedad.
 * @param {number} idSucursal - El ID de la sucursal actual.
 * @returns {Promise<string>} - Texto concatenado de los avisos.
 */
const obtenerBannersTarifas = async (idSucursal) => {
    try {
        // 1. Primero averiguamos la Marca y Propiedad de esta Sucursal
        // (Asumimos que cat_sucursales tiene idMarca y cat_marcas tiene idPropiedad, 
        // o que cat_sucursales tiene ambos. Ajustamos con LEFT JOIN para asegurar datos).
        const sqlInfo = `
            SELECT s.idSucursal, s.idMarca, m.idPropiedad 
            FROM cat_sucursales s
            LEFT JOIN cat_marcas m ON s.idMarca = m.idMarca
            WHERE s.idSucursal = ?
        `;
        const [info] = await pool.query(sqlInfo, [idSucursal]);
        
        if (info.length === 0) return "Bienvenidos"; // Fallback si no existe sucursal

        const { idMarca, idPropiedad } = info[0];

        // 2. Buscamos avisos que coincidan con CUALQUIERA de los niveles jerárquicos
        // Se muestran si coinciden con la Sucursal O la Marca O la Propiedad.
        // También validamos fechas si existen.
        const sqlAvisos = `
            SELECT texto 
            FROM tbl_avisos 
            WHERE 
                activo = 1 
                AND (
                    (idSucursal = ?) 
                    OR (idMarca = ? AND idSucursal IS NULL) 
                    OR (idPropiedad = ? AND idMarca IS NULL AND idSucursal IS NULL)
                )
                AND (fecha_inicio IS NULL OR fecha_inicio <= CURDATE())
                AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
            ORDER BY orden ASC, idAviso DESC
        `;

        const [rows] = await pool.query(sqlAvisos, [idSucursal, idMarca || 0, idPropiedad || 0]);

        if (rows.length > 0) {
            // Unimos todos los avisos con un separador
            return rows.map(r => r.texto).join("  •  ");
        }

        // Texto por defecto si no hay nada en BD
        return "Bienvenidos - Consulte nuestras promociones en recepción.";

    } catch (error) {
        console.error("❌ Error obteniendo banners:", error);
        return "Bienvenidos";
    }
};

/**
 * Obtiene los banners de texto informativos para el módulo de tarifas.
 * @param {number} idSucursal - El ID de la sucursal.
 * @returns {Promise<string>} - Texto del banner.
 */
const obtenerBannersTarifas = async (idSucursal) => {
    // Por ahora devuelve un texto estático, pero se puede extender para consultar la BD
    return "Consulte nuestras promociones de temporada en recepción. • Tarifas vigentes para el día de hoy.";
};

module.exports = {
    obtenerTarifasPorSucursal,
    obtenerBannersTarifas,
    obtenerDivisasPorSucursal
};