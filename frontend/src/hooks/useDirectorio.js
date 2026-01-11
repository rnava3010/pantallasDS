import { useState, useEffect } from 'react';
import axios from 'axios';

export const useDirectorio = (idTerminal) => {
    const [config, setConfig] = useState(null);
    const [datos, setDatos] = useState({ eventos: [], noticias: [] });
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [clima, setClima] = useState({ tempC: '--', codigo: 0 });

    const fetchDatos = async () => {
        try {
            const res = await axios.get(`https://ds.logicielmx.cloud/pantalla/${idTerminal}`);
            const { config: cfg, data, clima_backend } = res.data;

            setConfig(cfg);
            setDatos({
                eventos: data?.eventos || [],
                noticias: data?.noticias || []
            });
            if (clima_backend) setClima(clima_backend);

            // ✅ PERSISTENCIA OFFLINE: Guardamos en LocalStorage
            localStorage.setItem(`cache_dir_${idTerminal}`, JSON.stringify(res.data));
            setIsOnline(true);
        } catch (error) {
            console.error("⚠️ Error de red, cargando caché...");
            setIsOnline(false);
            
            // ✅ RECUPERACIÓN OFFLINE
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
        const interval = setInterval(fetchDatos, 60000); // Poll cada minuto
        return () => clearInterval(interval);
    }, [idTerminal]);

    return { config, datos, loading, isOnline, clima };
};