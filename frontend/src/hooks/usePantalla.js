import { useState, useEffect } from 'react';

// Si usas el logger, descomenta:
import { log, logError } from '../utils/logger'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100';

export const usePantalla = (idPantalla) => {
    const [eventoActual, setEventoActual] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [timeOffset, setTimeOffset] = useState(0);
    const [clima, setClima] = useState({ tempC: 0, tempF: 0, codigo: 0 });

    const determinarEventoActual = (agendaEventos, offset = 0) => {
        if (!agendaEventos || !Array.isArray(agendaEventos)) return null;
        
        const ahora = new Date(Date.now() + offset);
        
        return agendaEventos.find(evt => {
            const inicio = new Date(evt.inicio_iso);
            const fin = new Date(evt.fin_iso);
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

    // --- 3. CONVERTIDOR DE IMÁGENES A BASE64 ---
    const cachearImagen = async (url) => {
        if (!url) return null;
        if (url.startsWith('data:')) return url; // Ya es base64

        // CONSTRUCCIÓN DE LA URL COMPLETA
        let urlFinal = url;
        if (!url.startsWith('http')) {
            // Si es ruta relativa (/eventos/boda.jpg), le pegamos la API_URL
            // Quitamos la barra inicial si la API_URL ya la tiene para evitar dobles //
            const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const path = url.startsWith('/') ? url : `/${url}`;
            urlFinal = `${baseUrl}${path}`;
        }

        try {
            // Intentamos descargar la imagen real
            const response = await fetch(urlFinal);
            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result); // Devuelve el string Base64
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn(`⚠️ No se pudo cachear imagen (Fallo descarga de ${urlFinal}):`, error);
            // IMPORTANTE: Si falla la conversión, devolvemos la URL original para que al menos intente cargarla normal
            return urlFinal; 
        }
    };

    // --- 4. FETCH PRINCIPAL ---
    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/pantalla/${idPantalla}`);
            if (!response.ok) throw new Error('Error Server');
            
            let result = await response.json();

            // ===========================================================
            // 🚀 INICIO: PROCESO DE CACHÉ (CONFIG + EVENTOS)
            // ===========================================================
            
            if (result.config) {
                if (result.config.logo) {
                    result.config.logo = await cachearImagen(result.config.logo);
                }
                if (result.config.screensaver && result.config.screensaver.length > 0) {
                    const ssPromesas = result.config.screensaver.map(url => cachearImagen(url));
                    result.config.screensaver = await Promise.all(ssPromesas);
                }
            }

            if (result.data?.tipo_datos === 'AGENDA' && Array.isArray(result.data.eventos)) {
                for (let i = 0; i < result.data.eventos.length; i++) {
                    const evento = result.data.eventos[i];
                    
                    if (evento.imagenes && evento.imagenes.length > 0) {
                        const imgPromesas = evento.imagenes.map(url => cachearImagen(url));
                        evento.imagenes = await Promise.all(imgPromesas);
                    }
                }
            }
			
            let currentOffset = 0;
            if (result.server_time) {
                currentOffset = new Date(result.server_time).getTime() - new Date().getTime();
                setTimeOffset(currentOffset);
                localStorage.setItem('narabyte_time_offset', currentOffset);
            }

            try {
                localStorage.setItem(`narabyte_cache_${idPantalla}`, JSON.stringify(result));
            } catch (e) {
                console.error("⚠️ Memoria llena. No se pudo guardar caché offline.", e);
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