const pool = require('../config/db');

/**
 * Obtiene la lista de tarifas activas para una sucursal
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

const obtenerBannersTarifas = async (idSucursal) => {
    return "Consulte nuestras promociones de temporada en recepción. • Tarifas vigentes para el día de hoy.";
};

module.exports = {
    obtenerTarifasPorSucursal,
    obtenerBannersTarifas
};