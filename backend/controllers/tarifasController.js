const pool = require('../config/db');

const obtenerTarifasPorSucursal = async (idSucursal) => {
    try {
        const sql = `
            SELECT 
                idTarifa, 
                nombre_habitacion as nombre, 
                nombre_habitacion_en as nombre_en, /* <--- Traducido */
                descripcion,
                descripcion_en,                    /* <--- Traducido */
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
        console.error("Error en obtenerTarifasPorSucursal:", error);
        throw error;
    }
};

const obtenerAvisosPorSucursal = async (idSucursal) => {
    try {
        const sql = `
            SELECT texto, texto_en, texto_fr 
            FROM tbl_avisos 
            WHERE idSucursal = ? 
              AND activo = 1
              AND (fecha_inicio IS NULL OR fecha_inicio <= CURDATE())
              AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
            ORDER BY orden ASC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        
        return rows.length > 0 ? rows : [{ texto: "Bienvenidos", texto_en: "Welcome" }];
    } catch (error) {
        return [{ texto: "Bienvenidos", texto_en: "Welcome" }]; 
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
        return rows.map(divisa => ({
            ...divisa,
            imagen_url: `/banderas/${divisa.codigo.toLowerCase()}.png`
        }));
    } catch (error) {
        return [];
    }
};

module.exports = {
    obtenerTarifasPorSucursal,
    obtenerAvisosPorSucursal,
    obtenerDivisasPorSucursal
};