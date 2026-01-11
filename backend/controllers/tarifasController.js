const pool = require('../config/db');

/**
 * Obtiene la lista de tarifas activas con traducciones.
 */
const obtenerTarifasPorSucursal = async (idSucursal) => {
    try {
        const sql = `
            SELECT 
                idTarifa, 
                nombre_habitacion as nombre_es, 
                nombre_habitacion_en as nombre_en, 
                descripcion as descripcion_es,
                descripcion_en,
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
    try {
        const sqlInfo = `
            SELECT s.idSucursal, s.idMarca, m.idPropiedad 
            FROM cat_sucursales s
            LEFT JOIN cat_marcas m ON s.idMarca = m.idMarca
            WHERE s.idSucursal = ?
        `;
        const [info] = await pool.query(sqlInfo, [idSucursal]);
        
        // Retorno por defecto trilingüe si no se encuentra la sucursal
        if (info.length === 0) return { es: "Bienvenidos", en: "Welcome", fr: "Bienvenue" }; 

        const { idMarca, idPropiedad } = info[0];

        // ACTUALIZACIÓN: Se agrega 'texto_fr' a la consulta
        const sqlAvisos = `
            SELECT texto as texto_es, texto_en, texto_fr 
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
            return {
                es: rows.map(r => r.texto_es).join("  •  "),
                // Si no hay inglés, usa español
                en: rows.map(r => r.texto_en || r.texto_es).join("  •  "), 
                // Si no hay francés, usa español
                fr: rows.map(r => r.texto_fr || r.texto_es).join("  •  ")  
            };
        }

        // Retorno por defecto trilingüe si no hay avisos en BD
        return { 
            es: "Bienvenidos - Consulte nuestras promociones", 
            en: "Welcome - Check our promotions at the front desk",
            fr: "Bienvenue - Consultez nos promotions à la réception"
        };

    } catch (error) {
        console.error("❌ Error obteniendo banners:", error);
        return { es: "Bienvenidos", en: "Welcome", fr: "Bienvenue" }; 
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
        return rows;
    } catch (error) {
        console.error("❌ Error obteniendo divisas:", error);
        return []; 
    }
};

module.exports = {
    obtenerTarifasPorSucursal,
    obtenerBannersTarifas,
    obtenerDivisasPorSucursal
};