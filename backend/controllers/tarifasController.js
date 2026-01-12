const pool = require('../config/db');

/**
 * Obtiene la lista de tarifas activas.
 */
const obtenerTarifasPorSucursal = async (idSucursal) => {
    try {
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
 * ✅ NUEVA FUNCIÓN: Obtiene los avisos desde la BD (tbl_avisos)
 * Filtra por sucursal, activo=1 y fechas vigentes.
 */
const obtenerAvisosPorSucursal = async (idSucursal) => {
    try {
        const sql = `
            SELECT texto 
            FROM tbl_avisos 
            WHERE idSucursal = ? 
              AND activo = 1
              AND (fecha_inicio IS NULL OR fecha_inicio <= CURDATE())
              AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
            ORDER BY orden ASC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        
        // Si hay avisos, devolvemos un array de strings. Si no, un mensaje default.
        if (rows.length > 0) {
            return rows.map(r => r.texto);
        } else {
            return ["Bienvenidos a nuestra sucursal", "Consulte promociones en recepción"];
        }
    } catch (error) {
        console.error("❌ Error en obtenerAvisosPorSucursal:", error);
        // Fallback en caso de error de tabla no existente aún
        return ["Bienvenidos"]; 
    }
};

/**
 * Obtiene divisas y prepara URL de imagen.
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
        
        return rows.map(divisa => ({
            ...divisa,
            imagen_url: `/banderas/${divisa.codigo.toLowerCase()}.png`
        }));
    } catch (error) {
        console.error("❌ Error en obtenerDivisasPorSucursal:", error);
        return [];
    }
};

// Mantenemos la función antigua por compatibilidad, pero ahora usa la nueva lógica interna si quisieras
const obtenerBannersTarifas = async (idSucursal) => {
    // Retornamos solo el primer aviso como string para no romper otros controladores viejos
    const avisos = await obtenerAvisosPorSucursal(idSucursal);
    return avisos.join(" • ");
};

module.exports = {
    obtenerTarifasPorSucursal,
    obtenerBannersTarifas,
    obtenerDivisasPorSucursal,
    obtenerAvisosPorSucursal // Exportamos la nueva
};