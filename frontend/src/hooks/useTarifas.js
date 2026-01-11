import { useState, useEffect } from 'react';
import axios from 'axios';

export const useTarifas = (id) => {
    const [config, setConfig] = useState(null);
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeOffset, setTimeOffset] = useState(0);

    const fetchData = async () => {
        try {
            // Ajusta esta ruta según tu API de backend
            const response = await axios.get(`/api/pantallas/${id}`);
            setConfig(response.data.config);
            setDatos(response.data.datos);
            setTimeOffset(response.data.timeOffset || 0);
            setLoading(false);
        } catch (error) {
            console.error("Error cargando tarifas", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [id]);

    return { config, datos, loading, timeOffset };
};