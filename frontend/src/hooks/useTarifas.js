import { useState, useEffect } from 'react';
import axios from 'axios';

export const useTarifas = (id) => {
    const [config, setConfig] = useState(null);
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeOffset, setTimeOffset] = useState(0);

    const fetchData = async () => {
        if (!id) return; // Evitar llamadas si el ID no existe
        
        try {
            // Se usa la ruta plural /api/pantallas/ para coincidir con el index.js del backend
            const res = await axios.get(`https://ds.logicielmx.cloud/api/pantallas/${id}`);
            
            // Corrección: Usar 'res' que es el nombre de la constante definida arriba
            if (res.data) {
                setConfig(res.data.config);
                setDatos(res.data.datos);
                setTimeOffset(res.data.timeOffset || 0);
            }
            
            setLoading(false);
        } catch (error) {
            console.error("❌ Error cargando tarifas en el hook:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true); // Reiniciar carga cuando cambia el ID
        fetchData();
        
        // Intervalo para actualizar datos automáticamente cada minuto
        const interval = setInterval(fetchData, 60000);
        
        return () => clearInterval(interval);
    }, [id]);

    return { config, datos, loading, timeOffset };
};