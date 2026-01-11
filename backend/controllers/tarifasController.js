const pool = require('../config/db');

// ==========================================
// 1. OBTENER DIVISAS (Tipos de Cambio)
// ==========================================
const obtenerTarifasPorSucursal = async (idSucursal) => {
    try {
        /* NOTA IMPORTANTE: 
           Cambie 'moneda' por 'nombre' suponiendo que así se llama tu columna.
           Si tu columna se llama 'divisa' o 'codigo', cambia la palabra 'nombre' abajo.
        */
        const sql = `
            SELECT 
                nombre as moneda,  -- <--- CAMBIO AQUÍ (Si falla, prueba con 'divisa')
                compra, 
                venta, 
                icono_url, 
                descripcion 
            FROM tbl_divisas 
            WHERE idSucursal = ? 
            AND activo = 1        -- <--- CORREGIDO (Usando activo en vez de estatus)
            ORDER BY orden ASC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows;
    } catch (error) {
        console.error("❌ Error obteniendo divisas:", error.message);
        // Retornamos array vacío para que no se trabe la pantalla
        return [];
    }
};

// ==========================================
// 2. OBTENER BANNER (Noticias/Avisos)
// ==========================================
const obtenerBannersTarifas = async (idSucursal) => {
    try {
        /*
           CORREGIDO SEGÚN TU TABLA tbl_avisos:
           - Usamos 'texto' en lugar de 'mensaje'
           - Filtramos por 'activo = 1'
        */
        const sql = `
            SELECT 
                texto as mensaje,       -- Alias para que el frontend lo entienda
                texto_en as mensaje_en, -- Aprovechamos que ya los tienes
                texto_fr as mensaje_fr
            FROM tbl_avisos 
            WHERE idSucursal = ? 
            AND activo = 1 
            ORDER BY idAviso DESC 
            LIMIT 1
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        
        // Si hay resultados, devolvemos el objeto completo (para futuro soporte multi-idioma)
        // O devolvemos solo el texto en español si el frontend viejo solo espera un string.
        if (rows.length > 0) {
            // Por ahora devolvemos solo el español para que funcione el banner
            return rows[0].mensaje; 
        }
        return null;

    } catch (error) {
        console.error("⚠️ Error obteniendo aviso para banner:", error.message);
        return null;
    }
};

module.exports = { obtenerTarifasPorSucursal, obtenerBannersTarifas };