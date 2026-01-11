const pool = require('../config/db');

// 1. Obtener Divisas (Desde tbl_divisas)
const obtenerTarifasPorSucursal = async (idSucursal) => {
    try {
        const sql = `
            SELECT 
                moneda, 
                compra, 
                venta, 
                icono_url, 
                descripcion 
            FROM tbl_divisas 
            WHERE idSucursal = ? 
            -- Asumo que usas 'estatus' o 'activo', ajusta según tu tabla
            AND (estatus = 'ACTIVO' OR estatus = 1) 
            ORDER BY orden ASC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows;
    } catch (error) {
        console.error("❌ Error obteniendo divisas:", error);
        return [];
    }
};

// 2. Obtener Banner de Texto (Desde tbl_avisos)
const obtenerBannersTarifas = async (idSucursal) => {
    try {
        // Usamos tbl_avisos para el texto que corre abajo
        // Tomamos el aviso más reciente o el que tenga mayor prioridad
        const sql = `
            SELECT mensaje 
            FROM tbl_avisos 
            WHERE idSucursal = ? 
            AND (estatus = 'ACTIVO' OR estatus = 1)
            -- Opcional: Validar fechas si tu tabla tiene vigencia
            -- AND (fecha_fin IS NULL OR fecha_fin >= NOW())
            ORDER BY idAviso DESC 
            LIMIT 1
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows.length > 0 ? rows[0].mensaje : null;
    } catch (error) {
        console.error("⚠️ Error obteniendo aviso para banner:", error.message);
        return null; // Si falla, simplemente no muestra texto abajo
    }
};

module.exports = { obtenerTarifasPorSucursal, obtenerBannersTarifas };