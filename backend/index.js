import { useState, useEffect } from 'react';

import { log, logError } from '../utils/logger'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100';

export const usePantalla = (idPantalla) => {
    const [eventoActual, setEventoActual] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [timeOffset, setTimeOffset] = useState(0);
    const [clima, setClima] = useState({ tempC: 0, tempF: 0, codigo: 0 });

    // --- LÓGICA DE URLS ---
    // Esta función asegura que las imágenes tengan la URL completa del servidor
    const procesarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        
        // Si es ruta relativa, le pegamos el dominio del API
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${path}`;
    };

    const determinarEventoActual = (agendaEventos, offset = 0) => {
        if (!agendaEventos || !Array.isArray(agendaEventos)) return null;
        
        const ahora = new Date(Date.now() + offset);
        
        return agendaEventos.find(evt => {
            const inicio = new Date(evt.mostrar_inicio_iso || evt.inicio_iso);
            const fin = new Date(evt.mostrar_fin_iso || evt.fin_iso);

            if (ahora < inicio || ahora > fin) return false;

            if (evt.recurrente) {
                const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
                const minutosInicio = inicio.getHours() * 60 + inicio.getMinutes();
                const minutosFin = fin.getHours() * 60 + fin.getMinutes();

                if (minutosAhora < minutosInicio || minutosAhora > minutosFin) {
                    return false; 
                }
            }

            return true;
        }) || null;
    };

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

    // --- FETCH PRINCIPAL (Optimizado: Sin Base64) ---
    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/pantalla/${idPantalla}`);
            if (!response.ok) throw new Error('Error Server');
            
            let result = await response.json();

            // 1. Procesamos URLs de Configuración
            if (result.config) {
                if (result.config.logo) result.config.logo = procesarUrl(result.config.logo);
                if (result.config.screensaver && Array.isArray(result.config.screensaver)) {
                    result.config.screensaver = result.config.screensaver.map(url => procesarUrl(url));
                }
            }

            // 2. Procesamos URLs de Eventos
            if (result.data?.tipo_datos === 'AGENDA' && Array.isArray(result.data.eventos)) {
                result.data.eventos = result.data.eventos.map(evt => ({
                    ...evt,
                    imagenes: evt.imagenes ? evt.imagenes.map(url => procesarUrl(url)) : []
                }));
            }
			
            // 3. Calculamos Offset de Hora
            let currentOffset = 0;
            if (result.server_time) {
                currentOffset = new Date(result.server_time).getTime() - new Date().getTime();
                setTimeOffset(currentOffset);
                localStorage.setItem('narabyte_time_offset', currentOffset);
            }

            // 4. Guardamos SOLO DATOS (JSON) en LocalStorage
            // Al no convertir imágenes a Base64, el JSON pesará poquísimo (aprox 10KB)
            try {
                localStorage.setItem(`narabyte_cache_${idPantalla}`, JSON.stringify(result));
            } catch (e) {
                // Si aun asi falla (muy raro), solo lo logueamos y seguimos funcionando
                console.warn("⚠️ No se pudo guardar caché JSON (Quota):", e);
            }
            
            setConfig(result.config);

            if (result.config?.ubicacion) {
                fetchClima(result.config.ubicacion.lat, result.config.ubicacion.lon);
            }

            if (result.data?.tipo_datos === 'AGENDA') {
                setEventoActual(determinarEventoActual(result.data.eventos, currentOffset));
            } else {
                setEventoActual(result.data);
            }
            
            setIsOnline(true);

        } catch (err) {
            console.warn("⚠️ Modo Offline Activo");
            setIsOnline(false);

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

    // --- EFECTOS ---
    useEffect(() => {
        fetchData(); 

        const intervalDescarga = setInterval(fetchData, 300000); // 5 minutos

        const intervalReloj = setInterval(() => {
            // Leemos del estado o localstorage ligero para recalcular evento actual
            const cachedRaw = localStorage.getItem(`narabyte_cache_${idPantalla}`);
            const cachedOffset = localStorage.getItem('narabyte_time_offset');
            const offset = cachedOffset ? parseInt(cachedOffset, 10) : 0;
            
            if (cachedRaw) {
                const res = JSON.parse(cachedRaw);
                if (res.data?.tipo_datos === 'AGENDA') {
                    // Solo recalculamos lógica, no volvemos a descargar nada pesado
                    setEventoActual(determinarEventoActual(res.data.eventos, offset));
                }
            }
        }, 30000); // 30 segundos

        return () => {
            clearInterval(intervalDescarga);
            clearInterval(intervalReloj);
        };
    }, [idPantalla]);

    return { eventoActual, config, loading, isOnline, timeOffset, clima };
};