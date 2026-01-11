const cron = require('node-cron');
const pool = require('../config/db');
const { fetchNoticiasRSS } = require('../controllers/noticiasController'); // Reutilizamos tu función

// --- 1. ACTUALIZAR NOTICIAS (Cada 30 min) ---
const actualizarNoticias = async () => {
    try {
        console.log('🔄 [CRON] Actualizando Noticias...');
        const noticias = await fetchNoticiasRSS(); // Tu función con el User-Agent
        
        // Guardamos el array como JSON en la BD
        await pool.query(
            `INSERT INTO tbl_cache_noticias (id, lista_noticias, updated_at) 
             VALUES (1, ?, NOW()) 
             ON DUPLICATE KEY UPDATE lista_noticias = VALUES(lista_noticias), updated_at = NOW()`,
            [JSON.stringify(noticias)]
        );
        console.log('✅ [CRON] Noticias actualizadas en BD.');
    } catch (error) {
        console.error('❌ [CRON] Error actualizando noticias:', error.message);
    }
};

// --- 2. ACTUALIZAR CLIMA (Cada 1 hora) ---
const actualizarClima = async () => {
    try {
        console.log('🔄 [CRON] Actualizando Clima de Sucursales...');
        
        // Obtenemos todas las sucursales con lat/lon
        const [sucursales] = await pool.query("SELECT idSucursal, latitud, longitud FROM cat_sucursales WHERE latitud IS NOT NULL");
        
        for (const suc of sucursales) {
            // Pequeña pausa para no saturar la API (500ms entre peticiones)
            await new Promise(r => setTimeout(r, 500)); 
            
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${suc.latitud}&longitude=${suc.longitud}&current_weather=true`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                const infoClima = {
                    tempC: Math.round(data.current_weather.temperature),
                    tempF: Math.round((data.current_weather.temperature * 9/5) + 32),
                    codigo: data.current_weather.weathercode
                };

                await pool.query(
                    `INSERT INTO tbl_cache_clima (idSucursal, json_clima, updated_at) 
                     VALUES (?, ?, NOW()) 
                     ON DUPLICATE KEY UPDATE json_clima = VALUES(json_clima), updated_at = NOW()`,
                    [suc.idSucursal, JSON.stringify(infoClima)]
                );
            }
        }
        console.log(`✅ [CRON] Clima actualizado para ${sucursales.length} sucursales.`);
    } catch (error) {
        console.error('❌ [CRON] Error actualizando clima:', error.message);
    }
};

// --- INICIAR CRONS ---
const iniciarCrons = () => {
    // Noticias: Minuto 0 y 30 de cada hora
    cron.schedule('0,30 * * * *', actualizarNoticias);
    
    // Clima: Minuto 5 de cada hora
    cron.schedule('5 * * * *', actualizarClima);
    
    console.log('⏰ Sistema de Cron Jobs Iniciado');
    
    // Ejecución inicial al arrancar el servidor
    actualizarNoticias();
    actualizarClima();
};

module.exports = { iniciarCrons };