const pool = require('../config/db');

/**
 * Obtiene la lista de tarifas activas.
 */
const obtenerTarifasPorSucursal = async (idSucursal) => {
    try {
        // Mantenemos la corrección de separar precio_promocion y precio_rack
        const sql = `
            SELECT 
                idTarifa, 
                nombre_habitacion as nombre, 
                descripcion,
                precio_rack, 
                precio_promocion, 
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

/**
 * Obtiene los banners de texto.
 */
const obtenerBannersTarifas = async (idSucursal) => {
    return "Consulte nuestras promociones de temporada en recepción. • Tarifas vigentes para el día de hoy.";
};

/**
 * ✅ NUEVA FUNCIÓN: Obtiene las divisas activas para la sucursal.
 */
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
        console.error("❌ Error en obtenerDivisasPorSucursal:", error);
        return []; // Retornar array vacío en caso de error para no romper la pantalla
    }
};

module.exports = {
    obtenerTarifasPorSucursal,
    obtenerBannersTarifas,
    obtenerDivisasPorSucursal // Exportamos la nueva función
};