const pool = require('../config/db');

// 1. Obtener HABITACIONES (Con Alias de Compatibilidad)
const obtenerHabitaciones = async (idSucursal) => {
    try {
        const sql = `
            SELECT 
                -- 1. Datos Originales
                nombre_habitacion,
                precio_rack,
                precio_promocion,
                url_imagen_fondo,

                -- 2. Alias para Layout Viejo (LayoutTarifasHorizontal)
                nombre_habitacion AS nombre_es,
                
                -- 3. Alias para Layout Nuevo (Grid/Glass - Tarjetas)
                nombre_habitacion AS moneda,    -- Se usa como Título
                precio_rack AS compra,          -- Se usa como precio tachado
                precio_promocion AS venta,      -- Se usa como precio principal
                url_imagen_fondo AS icono_url,  -- Se usa como imagen
                'MXN' AS descripcion            -- Texto extra
            FROM tbl_tarifas 
            WHERE idSucursal = ? AND activo = 1
            ORDER BY idTarifa ASC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows;
    } catch (error) {
        console.error("❌ Error habitaciones:", error.message);
        return [];
    }
};

// 2. Obtener DIVISAS
const obtenerDivisas = async (idSucursal) => {
    try {
        const sql = `
            SELECT 
                nombre as moneda,
                codigo,
                tipo_cambio, 
                bandera as icono_url
            FROM tbl_divisas 
            WHERE idSucursal = ? AND activo = 1
            ORDER BY orden ASC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows;
    } catch (error) {
        return [];
    }
};

// 3. Obtener BANNER
const obtenerAviso = async (idSucursal) => {
    try {
        const sql = `
            SELECT texto as mensaje, texto_en as mensaje_en 
            FROM tbl_avisos WHERE idSucursal = ? AND activo = 1 
            ORDER BY idAviso DESC LIMIT 1
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        // Devolvemos objeto con idiomas
        if (rows.length > 0) return { es: rows[0].mensaje, en: rows[0].mensaje_en };
        return { es: "", en: "" };
    } catch (error) { return null; }
};

module.exports = { obtenerHabitaciones, obtenerDivisas, obtenerAviso };