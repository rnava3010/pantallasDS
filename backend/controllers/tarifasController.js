const pool = require('../config/db');

// 1. OBTENER TARIFAS (Habitaciones)
const obtenerHabitaciones = async (idSucursal) => {
    try {
        const sql = `
            SELECT 
                idTarifa,
                nombre_habitacion, 
                nombre_habitacion_en,
                descripcion,
                descripcion_en,
                precio_rack, 
                precio_promocion, 
                moneda,
                url_imagen_fondo,
                activo
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

// 2. OBTENER AVISOS (Noticias)
const obtenerAvisos = async (idSucursal) => {
    try {
        const sql = `
            SELECT 
                texto, 
                texto_en, 
                texto_fr 
            FROM tbl_avisos 
            WHERE idSucursal = ? AND activo = 1
            ORDER BY orden ASC, idAviso DESC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows;
    } catch (error) {
        console.error("❌ Error avisos:", error.message);
        return [];
    }
};

// 3. OBTENER GALERÍA (Específica de la Terminal)
const obtenerGaleria = async (idTerminal) => {
    try {
        const sql = `
            SELECT 
                tipo, 
                url_archivo, 
                duracion_segundos 
            FROM tbl_galeria_terminal 
            WHERE idTerminal = ? 
            ORDER BY orden ASC
        `;
        const [rows] = await pool.query(sql, [idTerminal]);
        return rows;
    } catch (error) {
        console.error("❌ Error galería:", error.message);
        return [];
    }
};

// 4. OBTENER DIVISAS (Tipo de Cambio)
const obtenerDivisas = async (idSucursal) => {
    try {
        // Asumiendo tabla tbl_divisas estándar
        const sql = `
            SELECT nombre, codigo, simbolo, tipo_cambio, bandera 
            FROM tbl_divisas 
            WHERE idSucursal = ? AND activo = 1
            ORDER BY orden ASC
        `;
        const [rows] = await pool.query(sql, [idSucursal]);
        return rows;
    } catch (error) {
        // Si no existe la tabla, retornamos vacío para no romper nada
        return [];
    }
};

module.exports = { 
    obtenerHabitaciones, 
    obtenerAvisos, 
    obtenerGaleria, 
    obtenerDivisas 
};