const pool = require('../config/db');

// ==========================================
// 1. OBTENER DIVISAS (Adaptado a tbl_divisas)
// ==========================================
const obtenerTarifasPorSucursal = async (idSucursal) => {
    try {
        /* MAPEO EXACTO A TU TABLA:
           - nombre       -> moneda
           - tipo_cambio  -> compra (Se repite porque no tienes columna compra)
           - tipo_cambio  -> venta  (Se repite porque no tienes columna venta)
           - bandera      -> icono_url
           - codigo       -> descripcion
        */
        const sql = `
            SELECT 
                nombre as moneda,
                tipo_cambio as compra, 
                tipo_cambio as venta,
                bandera as icono_url,
                codigo as descripcion
            FROM tbl_divisas 
            WHERE idSucursal = ? 
            AND activo = 1
            ORDER BY orden ASC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows;
    } catch (error) {
        console.error("❌ Error obteniendo divisas:", error.message);
        return [];
    }
};

// ==========================================
// 2. OBTENER BANNER (Adaptado a tbl_avisos)
// ==========================================
const obtenerBannersTarifas = async (idSucursal) => {
    try {
        /*
           MAPEO EXACTO A TU TABLA tbl_avisos:
           - texto -> mensaje
           - activo = 1
        */
        const sql = `
            SELECT 
                texto as mensaje,
                texto_en as mensaje_en,
                texto_fr as mensaje_fr
            FROM tbl_avisos 
            WHERE idSucursal = ? 
            AND activo = 1 
            ORDER BY idAviso DESC 
            LIMIT 1
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        
        // Devolvemos el mensaje en español por defecto
        if (rows.length > 0) {
            return rows[0].mensaje; 
        }
        return null;

    } catch (error) {
        console.error("⚠️ Error obteniendo aviso para banner:", error.message);
        return null;
    }
};

module.exports = { obtenerTarifasPorSucursal, obtenerBannersTarifas };