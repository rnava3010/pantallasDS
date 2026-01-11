const pool = require('../config/db');

/**
 * Obtiene la lista de tarifas activas para una sucursal específica.
 * @param {number} idSucursal - El ID de la sucursal a consultar.
 * @returns {Promise<Array>} - Lista de tarifas encontradas.
 */
const obtenerTarifasPorSucursal = async (idSucursal) => {
    try {
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

/**
 * Obtiene los banners activos combinando avisos de Sucursal, Marca y Propiedad.
 * @param {number} idSucursal - El ID de la sucursal actual.
 * @returns {Promise<string>} - Texto concatenado de los avisos.
 */
const obtenerBannersTarifas = async (idSucursal) => {
    try {
        // 1. Averiguamos la Marca y Propiedad de esta Sucursal
        const sqlInfo = `
            SELECT s.idSucursal, s.idMarca, m.idPropiedad 
            FROM cat_sucursales s
            LEFT JOIN cat_marcas m ON s.idMarca = m.idMarca
            WHERE s.idSucursal = ?
        `;
        const [info] = await pool.query(sqlInfo, [idSucursal]);
        
        if (info.length === 0) return "Bienvenidos"; 

        const { idMarca, idPropiedad } = info[0];

        // 2. Buscamos avisos jerárquicos (Sucursal -> Marca -> Propiedad)
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
            return rows.map(r => r.texto).join("  •  ");
        }

        return "Bienvenidos - Consulte nuestras promociones en recepción.";

    } catch (error) {
        console.error("❌ Error obteniendo banners:", error);
        // Retornamos un texto default en caso de error (ej. tabla no existe)
        return "Bienvenidos"; 
    }
};

/**
 * Obtiene los tipos de cambio activos para una sucursal.
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
        console.error("❌ Error obteniendo divisas:", error);
        // Si la tabla no existe o falla, retornamos array vacío para no romper la pantalla
        return []; 
    }
};

module.exports = {
    obtenerTarifasPorSucursal,
    obtenerBannersTarifas,
    obtenerDivisasPorSucursal
};