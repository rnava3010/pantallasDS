import { useState, useEffect } from 'react';

// Detectamos la URL de la API (Producción o Local)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100';

export const usePantalla = (idPantalla) => {
    const [eventoActual, setEventoActual] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [timeOffset, setTimeOffset] = useState(0);
    const [clima, setClima] = useState({ tempC: 0, tempF: 0, codigo: 0 });

    // --- HELPER: PROCESAR URLS ---
    const procesarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${path}`;
    };

    // --- HELPER: LÓGICA DE AGENDA ---
    const determinarEventoActual = (agendaEventos, offset = 0) => {
        if (!agendaEventos || !Array.isArray(agendaEventos)) return null;
        
        const ahora = new Date(Date.now() + offset);
        
        return agendaEventos.find(evt => {
            const inicio = new Date(evt.mostrar_inicio_iso || evt.inicio_iso);
            const fin = new Date(evt.mostrar_fin_iso || evt.fin_iso);

            // 1. Validar fecha general
            if (ahora < inicio || ahora > fin) return false;

            // 2. Validar recurrencia
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

    // --- FETCH CLIMA ---
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
            console.warn("⚠️ No se pudo obtener clima:", e);
        }
    };

    // --- FUNCIÓN PRINCIPAL DE CARGA ---
    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/pantalla/${idPantalla}`);
            if (!response.ok) throw new Error('Error de conexión con Servidor');
            
            let result = await response.json();

            // 1. Procesamos todas las URLs
            if (result.config) {
                if (result.config.logo) result.config.logo = procesarUrl(result.config.logo);
                
                // ✅ PROCESAMOS LA IMAGEN DEFAULT AQUI
                if (result.config.imagen_default) {
                    result.config.imagen_default = procesarUrl(result.config.imagen_default);
                }

                if (result.config.screensaver && Array.isArray(result.config.screensaver)) {
                    result.config.screensaver = result.config.screensaver.map(url => procesarUrl(url));
                }
            }

            if (result.data?.tipo_datos === 'AGENDA' && Array.isArray(result.data.eventos)) {
                result.data.eventos = result.data.eventos.map(evt => ({
                    ...evt,
                    imagenes: evt.imagenes ? evt.imagenes.map(url => procesarUrl(url)) : []
                }));
            }
            
            // Para Directorio también procesamos las imágenes de los eventos si vienen
            if (Array.isArray(result.data)) {
                 result.data = result.data.map(evt => ({
                    ...evt,
                    imagenes: evt.imagenes ? evt.imagenes.map(url => procesarUrl(url)) : []
                }));
            } else if (result.data && Array.isArray(result.data.eventos)) {
                 // Estructura alternativa
                 result.data.eventos = result.data.eventos.map(evt => ({
                    ...evt,
                    imagenes: evt.imagenes ? evt.imagenes.map(url => procesarUrl(url)) : []
                }));
            }
			
            // 2. Calculamos diferencia de hora
            let currentOffset = 0;
            if (result.server_time) {
                currentOffset = new Date(result.server_time).getTime() - new Date().getTime();
                setTimeOffset(currentOffset);
            }

            // 3. Guardado LocalStorage
            try {
                localStorage.setItem(`narabyte_cache_${idPantalla}`, JSON.stringify(result));
                localStorage.setItem('narabyte_time_offset', currentOffset);
            } catch (e) {
                console.warn("⚠️ Caché llena");
            }
            
            // 4. Actualizamos Estado
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
            try {
                const cachedRaw = localStorage.getItem(`narabyte_cache_${idPantalla}`);
                const cachedOffset = localStorage.getItem('narabyte_time_offset');
                const savedOffset = cachedOffset ? parseInt(cachedOffset, 10) : 0;
                setTimeOffset(savedOffset);

                if (cachedRaw) {
                    const cachedResult = JSON.parse(cachedRaw);
                    setConfig(cachedResult.config);
                    if (cachedResult.data?.tipo_datos === 'AGENDA') {
                        setEventoActual(determinarEventoActual(cachedResult.data.eventos, savedOffset));
                    } else {
                        setEventoActual(cachedResult.data);
                    }
                }
            } catch (e) { console.error("Error caché", e); }
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