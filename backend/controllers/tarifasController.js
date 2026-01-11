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