const pool = require('../config/db');

// 1. Obtener HABITACIONES (tbl_tarifas)
const obtenerHabitaciones = async (idSucursal) => {
    try {
        const sql = `
            SELECT 
                nombre_habitacion, 
                precio_rack, 
                precio_promocion, 
                url_imagen_fondo,
                moneda
            FROM tbl_tarifas 
            WHERE idSucursal = ? AND activo = 1
            ORDER BY idTarifa ASC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows;
    } catch (error) {
        console.error("❌ Error obteniendo habitaciones:", error.message);
        return [];
    }
};

// 2. Obtener DIVISAS (tbl_divisas)
const obtenerDivisas = async (idSucursal) => {
    try {
        /* CORRECCIÓN DE COLUMNAS:
           - Usamos 'nombre' en vez de 'moneda'
           - Usamos 'tipo_cambio' para venta (y compra si no existe otra)
           - Usamos 'bandera' como icono
        */
        const sql = `
            SELECT 
                nombre as moneda,
                codigo,
                simbolo,
                tipo_cambio as venta, 
                tipo_cambio as compra, -- Duplicamos si no hay precio de compra distinto
                bandera as icono_url
            FROM tbl_divisas 
            WHERE idSucursal = ? AND activo = 1
            ORDER BY orden ASC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows;
    } catch (error) {
        console.error("❌ Error obteniendo divisas:", error.message);
        return [];
    }
};

// 3. Obtener BANNER (tbl_avisos)
const obtenerAviso = async (idSucursal) => {
    try {
        const sql = `
            SELECT texto as mensaje 
            FROM tbl_avisos 
            WHERE idSucursal = ? AND activo = 1 
            ORDER BY idAviso DESC LIMIT 1
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows.length > 0 ? rows[0].mensaje : null;
    } catch (error) {
        return null;
    }
};

module.exports = { obtenerHabitaciones, obtenerDivisas, obtenerAviso };