// pruebas pantallas/frontend/src/hooks/useDirectorio.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useDirectorio = (idTerminal) => {
    const [config, setConfig] = useState(null);
    const [datos, setDatos] = useState({ eventos: [], noticias: [] });
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [clima, setClima] = useState({ tempC: '--', codigo: 0 });
    const [timeOffset, setTimeOffset] = useState(0);

    const fetchDatos = async () => {
        try {
            // ✅ USA TU URL REAL
            const API_URL = `https://ds.logicielmx.cloud/api/pantalla/${idTerminal}`;
            const res = await axios.get(API_URL);
            
            const { config: cfg, data, clima_backend, server_time } = res.data;

            // Calcular desfase de tiempo
            if (server_time) {
                const sTime = new Date(server_time).getTime();
                const lTime = Date.now();
                setTimeOffset(sTime - lTime);
            }

            setConfig(cfg);
            setDatos({
                eventos: data?.eventos || [],
                noticias: data?.noticias || []
            });
            if (clima_backend) setClima(clima_backend);

            localStorage.setItem(`cache_dir_${idTerminal}`, JSON.stringify(res.data));
            setIsOnline(true);
        } catch (error) {
            console.error("⚠️ Error de red, cargando caché...");
            setIsOnline(false);
            
            const cache = localStorage.getItem(`cache_dir_${idTerminal}`);
            if (cache) {
                const parsed = JSON.parse(cache);
                setConfig(parsed.config);
                setDatos({
                    eventos: parsed.data?.eventos || [],
                    noticias: parsed.data?.noticias || []
                });
                setClima(parsed.clima_backend);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatos();
        const interval = setInterval(fetchDatos, 60000);
        return () => clearInterval(interval);
    }, [idTerminal]);

    return { config, datos, loading, isOnline, clima, timeOffset };
};