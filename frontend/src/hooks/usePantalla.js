import { useState, useEffect } from 'react';

// Si usas el logger, descomenta:
// import { log, logError } from '../utils/logger'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100';

export const usePantalla = (idPantalla) => {
    const [eventoActual, setEventoActual] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [timeOffset, setTimeOffset] = useState(0);
    const [clima, setClima] = useState({ tempC: 0, tempF: 0, codigo: 0 });

    // --- 1. FUNCIÓN DE AGENDA ---
    const determinarEventoActual = (agendaEventos, offset = 0) => {
        if (!agendaEventos || !Array.isArray(agendaEventos)) return null;
        const ahora = new Date(Date.now() + offset);
        return agendaEventos.find(evt => {
            const inicio = new Date(evt.inicio_iso);
            const fin = new Date(evt.fin_iso);
            return ahora >= inicio && ahora <= fin;
        }) || null;
    };

    // --- 2. CLIMA ---
    const fetchClima = async (lat, lon) => {
        if (!lat || !lon) return;
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await res.json();
            if (data.current_weather) {
                const c = data.current_weather.temperature;
                setClima({
                    tempC: Math.round(c),
                    tempF: Math.round((c * 9/5) + 32),
                    codigo: data.current_weather.weathercode
                });
            }
        } catch (e) {
            console.warn("⚠️ Error clima:", e);
        }
    };

    // --- 3. [NUEVO] CONVERTIDOR DE IMÁGENES A BASE64 ---
    // Esto descarga la imagen y la convierte en una cadena de texto gigante
    const cachearImagen = async (url) => {
        if (!url) return null;
        // Si ya es base64 (empieza con data:), la devolvemos tal cual
        if (url.startsWith('data:')) return url;

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn("No se pudo cachear imagen:", url);
            return url; // Si falla, devolvemos la URL original como respaldo
        }
    };

    // --- 4. FETCH PRINCIPAL ---
    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/pantalla/${idPantalla}`);
            if (!response.ok) throw new Error('Error Server');
            
            // 1. Obtenemos el JSON crudo del servidor
            let result = await response.json();

            // -----------------------------------------------------------
            // [NUEVO] PROCESO DE CACHÉ DE IMÁGENES (SÓLO SI HAY INTERNET)
            // -----------------------------------------------------------
            if (result.config) {
                // A) Cachear Logo
                if (result.config.logo) {
                    const logoBase64 = await cachearImagen(result.config.logo);
                    result.config.logo = logoBase64; // Reemplazamos URL por Base64
                }

                // B) Cachear Screensaver (Galería)
                if (result.config.screensaver && result.config.screensaver.length > 0) {
                    const screensaverPromesas = result.config.screensaver.map(url => cachearImagen(url));
                    const screensaverBase64 = await Promise.all(screensaverPromesas);
                    result.config.screensaver = screensaverBase64; // Reemplazamos URLs por Base64
                }
            }
            // -----------------------------------------------------------

            // Sincronización Hora
            let currentOffset = 0;
            if (result.server_time) {
                currentOffset = new Date(result.server_time).getTime() - new Date().getTime();
                setTimeOffset(currentOffset);
                localStorage.setItem('narabyte_time_offset', currentOffset);
            }

            // GUARDAR EN CACHÉ (Ahora incluye las fotos reales codificadas)
            try {
                localStorage.setItem(`narabyte_cache_${idPantalla}`, JSON.stringify(result));
            } catch (e) {
                console.error("⚠️ Memoria llena (QuotaExceeded). No se pudo guardar caché offline.", e);
            }
            
            setConfig(result.config);

            // Clima
            if (result.config?.ubicacion) {
                fetchClima(result.config.ubicacion.lat, result.config.ubicacion.lon);
            }

            // Agenda
            if (result.data?.tipo_datos === 'AGENDA') {
                setEventoActual(determinarEventoActual(result.data.eventos, currentOffset));
            } else {
                setEventoActual(result.data);
            }
            
            setIsOnline(true);

        } catch (err) {
            console.warn("⚠️ Modo Offline Activo");
            setIsOnline(false);

            // RECUPERACIÓN OFFLINE
            let savedOffset = 0;
            const cachedOffset = localStorage.getItem('narabyte_time_offset');
            if (cachedOffset) savedOffset = parseInt(cachedOffset, 10);
            setTimeOffset(savedOffset);

            const cachedRaw = localStorage.getItem(`narabyte_cache_${idPantalla}`);
            if (cachedRaw) {
                const cachedResult = JSON.parse(cachedRaw);
                setConfig(cachedResult.config);
                
                if (cachedResult.config?.ubicacion) {
                     fetchClima(cachedResult.config.ubicacion.lat, cachedResult.config.ubicacion.lon);
                }

                if (cachedResult.data?.tipo_datos === 'AGENDA') {
                    setEventoActual(determinarEventoActual(cachedResult.data.eventos, savedOffset));
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); 

        const intervalDescarga = setInterval(fetchData, 300000); 

        const intervalReloj = setInterval(() => {
            const cachedRaw = localStorage.getItem(`narabyte_cache_${idPantalla}`);
            const cachedOffset = localStorage.getItem('narabyte_time_offset');
            const offset = cachedOffset ? parseInt(cachedOffset, 10) : 0;
            if (cachedRaw) {
                const res = JSON.parse(cachedRaw);
                if (res.data?.tipo_datos === 'AGENDA') {
                    setEventoActual(determinarEventoActual(res.data.eventos, offset));
                }
            }
        }, 30000);

        return () => {
            clearInterval(intervalDescarga);
            clearInterval(intervalReloj);
        };
    }, [idPantalla]);

    return { eventoActual, config, loading, isOnline, timeOffset, clima };
};