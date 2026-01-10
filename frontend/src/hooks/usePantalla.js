import { useState, useEffect } from 'react';

// Si decidiste usar el logger que creamos antes, descomenta la siguiente línea:
// import { log, logError } from '../utils/logger'; 
// Si no, usaremos console.log normales para que no te de error.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100';

export const usePantalla = (idPantalla) => {
    const [eventoActual, setEventoActual] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [timeOffset, setTimeOffset] = useState(0);

    // Estado del Clima
    const [clima, setClima] = useState({ tempC: 0, tempF: 0, codigo: 0 });

    // --- 1. FUNCIÓN DE AGENDA (Cerebro) ---
    const determinarEventoActual = (agendaEventos, offset = 0) => {
        if (!agendaEventos || !Array.isArray(agendaEventos)) return null;
        
        // Calculamos la hora corregida (Hora PC + Diferencia Servidor)
        const ahora = new Date(Date.now() + offset);
        
        return agendaEventos.find(evt => {
            const inicio = new Date(evt.inicio_iso);
            const fin = new Date(evt.fin_iso);
            return ahora >= inicio && ahora <= fin;
        }) || null;
    };

    // --- 2. FUNCIÓN PARA OBTENER CLIMA (DINÁMICA) ---
    // Recibe latitud y longitud para no depender de coordenadas fijas
    const fetchClima = async (lat, lon) => {
        if (!lat || !lon) return; 

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.current_weather) {
                const c = data.current_weather.temperature;
                const f = (c * 9/5) + 32;
                setClima({
                    tempC: Math.round(c),
                    tempF: Math.round(f),
                    codigo: data.current_weather.weathercode
                });
            }
        } catch (e) {
            console.warn("⚠️ No se pudo obtener el clima", e);
        }
    };

    // --- 3. FETCH PRINCIPAL (Datos + Hora + Cache + Clima) ---
    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/pantalla/${idPantalla}`);
            if (!response.ok) throw new Error('Error Server');
            
            const result = await response.json();

            // A) Sincronización Hora
            let currentOffset = 0;
            if (result.server_time) {
                const horaServidor = new Date(result.server_time).getTime();
                const horaLocalPC = new Date().getTime();
                currentOffset = horaServidor - horaLocalPC;
                
                setTimeOffset(currentOffset);
                localStorage.setItem('narabyte_time_offset', currentOffset);
            }

            // B) Guardar Caché (Offline First)
            localStorage.setItem(`narabyte_cache_${idPantalla}`, JSON.stringify(result));
            setConfig(result.config);

            // C) Actualizar Clima (Usando coordenadas de la BD)
            if (result.config?.ubicacion) {
                fetchClima(result.config.ubicacion.lat, result.config.ubicacion.lon);
            }

            // D) Determinar qué mostramos AHORA
            if (result.data?.tipo_datos === 'AGENDA') {
                setEventoActual(determinarEventoActual(result.data.eventos, currentOffset));
            } else {
                setEventoActual(result.data);
            }
            
            setIsOnline(true);

        } catch (err) {
            console.warn("⚠️ Modo Offline Activo");
            setIsOnline(false);

            // E) RECUPERACIÓN OFFLINE
            
            // 1. Recuperar Offset de hora
            let savedOffset = 0;
            const cachedOffset = localStorage.getItem('narabyte_time_offset');
            if (cachedOffset) {
                savedOffset = parseInt(cachedOffset, 10);
                setTimeOffset(savedOffset);
            }

            // 2. Recuperar Datos
            const cachedRaw = localStorage.getItem(`narabyte_cache_${idPantalla}`);
            if (cachedRaw) {
                const cachedResult = JSON.parse(cachedRaw);
                setConfig(cachedResult.config);
                
                // Intentar recuperar clima (si tuviéramos caché de clima, aquí iría)
                // O reintentar fetch si hay intermitencia y tenemos coordenadas en caché
                if (cachedResult.config?.ubicacion) {
                     fetchClima(cachedResult.config.ubicacion.lat, cachedResult.config.ubicacion.lon);
                }

                // Recalcular evento con la hora guardada
                if (cachedResult.data?.tipo_datos === 'AGENDA') {
                    setEventoActual(determinarEventoActual(cachedResult.data.eventos, savedOffset));
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // --- EFECTOS ---
    useEffect(() => {
        fetchData(); // Carga inicial

        // Intervalos
        // 1. Descarga de datos y Clima (Cada 5 minutos)
        // Nota: Al ejecutarse fetchData, también se actualiza el clima con las coordenadas frescas.
        const intervalDescarga = setInterval(fetchData, 300000); 

        // 2. Reloj Interno (Revisa cada 30s si el evento ya acabó)
        const intervalReloj = setInterval(() => {
            const cachedRaw = localStorage.getItem(`narabyte_cache_${idPantalla}`);
            const cachedOffset = localStorage.getItem('narabyte_time_offset');
            
            // Usamos el offset guardado o 0
            const offset = cachedOffset ? parseInt(cachedOffset, 10) : 0;

            if (cachedRaw) {
                const res = JSON.parse(cachedRaw);
                if (res.data?.tipo_datos === 'AGENDA') {
                    // Recalcula usando la función auxiliar
                    const evento = determinarEventoActual(res.data.eventos, offset);
                    setEventoActual(evento);
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