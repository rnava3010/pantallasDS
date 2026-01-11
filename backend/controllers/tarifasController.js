const pool = require('../config/db');

/**
 * Obtiene la lista de tarifas activas para una sucursal específica
 */
const obtenerTarifasPorSucursal = async (idSucursal) => {
    try {
        const sql = `
            SELECT 
                idTarifa, 
                nombre_habitacion as nombre, 
                precio_rack, 
                precio_promocion as precio, 
                moneda, 
                url_imagen_fondo as imagen,
                idPropiedad,
                idMarca
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

/**
 * Obtiene los banners publicitarios de texto para el módulo de tarifas
 */
const obtenerBannersTarifas = async (idSucursal) => {
    // Aquí podrías consultar una tabla de banners si la tienes, 
    // por ahora devolvemos un texto por defecto o de la sucursal.
    return "¡Aprovecha nuestras promociones de temporada! • Consulta disponibilidad en recepción.";
};

module.exports = {
    obtenerTarifasPorSucursal,
    obtenerBannersTarifas
};