import { useState, useEffect } from 'react';

import { log } from '../utils/logger'; 
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100';

export const usePantalla = (idPantalla) => {
    const [eventoActual, setEventoActual] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [timeOffset, setTimeOffset] = useState(0);
    const [clima, setClima] = useState({ tempC: 0, tempF: 0, codigo: 0 });

    // ... (determinarEventoActual sigue igual) ...
    const determinarEventoActual = (agendaEventos, offset = 0) => {
        if (!agendaEventos || !Array.isArray(agendaEventos)) return null;
        const ahora = new Date(Date.now() + offset);
        return agendaEventos.find(evt => {
            const inicio = new Date(evt.inicio_iso);
            const fin = new Date(evt.fin_iso);
            return ahora >= inicio && ahora <= fin;
        }) || null;
    };

    const fetchClima = async (lat, lon) => {
        console.log(`🌦️ [CLIMA] Solicitando para Lat: ${lat}, Lon: ${lon}`);

        if (!lat || !lon) {
            console.warn("⚠️ [CLIMA] Faltan coordenadas. Abortando.");
            return;
        }

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
            const res = await fetch(url);
            
            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

            const data = await res.json();
            
            // LOG 2: Ver qué respondió la API
            console.log("🌦️ [CLIMA] Respuesta API:", data);

            if (data.current_weather) {
                const c = data.current_weather.temperature;
                setClima({
                    tempC: Math.round(c),
                    tempF: Math.round((c * 9/5) + 32),
                    codigo: data.current_weather.weathercode
                });
            }
        } catch (e) {
            console.error("❌ [CLIMA] Error al obtener datos:", e);
        }
    };

    // --- FETCH PRINCIPAL ---
    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/pantalla/${idPantalla}`);
            if (!response.ok) throw new Error('Error Server');
            const result = await response.json();

            // LOG 3: Ver si el backend manda la ubicación
            console.log("📡 [API] Config recibida:", result.config); 
            console.log("📡 [API] Ubicación en config:", result.config?.ubicacion);

            // Hora
            let currentOffset = 0;
            if (result.server_time) {
                currentOffset = new Date(result.server_time).getTime() - new Date().getTime();
                setTimeOffset(currentOffset);
                localStorage.setItem('narabyte_time_offset', currentOffset);
            }

            // Cache
            localStorage.setItem(`narabyte_cache_${idPantalla}`, JSON.stringify(result));
            setConfig(result.config);

            // ---> AQUI ESTA LA CLAVE DEL CLIMA <---
            if (result.config?.ubicacion) {
                fetchClima(result.config.ubicacion.lat, result.config.ubicacion.lon);
            } else {
                console.warn("⚠️ [CLIMA] El backend NO envió el objeto 'ubicacion'");
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

            // Recuperación Offline
            let savedOffset = 0;
            const cachedOffset = localStorage.getItem('narabyte_time_offset');
            if (cachedOffset) savedOffset = parseInt(cachedOffset, 10);
            setTimeOffset(savedOffset);

            const cachedRaw = localStorage.getItem(`narabyte_cache_${idPantalla}`);
            if (cachedRaw) {
                const cachedResult = JSON.parse(cachedRaw);
                setConfig(cachedResult.config);
                
                // Intentar cargar clima cacheado si existiera lógica para ello (por ahora reintenta fetch)
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