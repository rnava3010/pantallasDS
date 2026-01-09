import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100';

export const usePantalla = (idPantalla) => {
    const [eventoActual, setEventoActual] = useState(null); // El evento que toca ver AHORA
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [timeOffset, setTimeOffset] = useState(0); // Diferencia de hora (Servidor vs PC)

    // --- FUNCIÓN AUXILIAR: BUSCAR EVENTO EN AGENDA ---
    // Recibe la lista de eventos y decide cuál toca según la hora
    const determinarEventoActual = (agendaEventos, offset = 0) => {
        if (!agendaEventos || !Array.isArray(agendaEventos)) return null;

        // Calculamos la hora "CORREGIDA" (Hora PC + Diferencia Servidor)
        // Para asegurar que si la PC tiene mal la hora, la agenda siga funcionando bien
        const ahora = new Date(Date.now() + offset);

        const eventoEncontrado = agendaEventos.find(evt => {
            const inicio = new Date(evt.inicio_iso);
            const fin = new Date(evt.fin_iso);
            return ahora >= inicio && ahora <= fin;
        });

        return eventoEncontrado || null; // Si no hay evento, devuelve null (se activará galería)
    };

    // --- FUNCIÓN PRINCIPAL DE DESCARGA ---
    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/pantalla/${idPantalla}`);
            
            if (!response.ok) throw new Error('Error Server');
            
            const result = await response.json();

            // 1. CÁLCULO DE HORA SERVIDOR (Sincronización)
            let currentOffset = 0;
            if (result.server_time) {
                const horaServidor = new Date(result.server_time).getTime();
                const horaLocalPC = new Date().getTime();
                currentOffset = horaServidor - horaLocalPC;
                
                setTimeOffset(currentOffset);
                localStorage.setItem('narabyte_time_offset', currentOffset);
            }

            // 2. GUARDAR CACHÉ (Offline First)
            localStorage.setItem(`narabyte_cache_${idPantalla}`, JSON.stringify(result));
            
            // 3. ACTUALIZAR ESTADOS
            setConfig(result.config);
            
            // Calculamos qué mostrar AHORITA usando el offset calculado
            if (result.data?.tipo_datos === 'AGENDA') {
                setEventoActual(determinarEventoActual(result.data.eventos, currentOffset));
            } else {
                setEventoActual(result.data); // Fallback para modos antiguos (Directorio, etc)
            }
            
            setIsOnline(true);

        } catch (err) {
            console.warn("⚠️ Modo Offline Activo");
            setIsOnline(false);

            // 4. RECUPERACIÓN EN CASO DE ERROR (OFFLINE)
            
            // A) Recuperar Offset de Hora
            let savedOffset = 0;
            const cachedOffset = localStorage.getItem('narabyte_time_offset');
            if (cachedOffset) {
                savedOffset = parseInt(cachedOffset, 10);
                setTimeOffset(savedOffset);
            }

            // B) Recuperar Datos/Agenda
            const cachedRaw = localStorage.getItem(`narabyte_cache_${idPantalla}`);
            if (cachedRaw) {
                const cachedResult = JSON.parse(cachedRaw);
                setConfig(cachedResult.config);
                
                // RE-CALCULAMOS qué evento toca según la hora corregida
                if (cachedResult.data?.tipo_datos === 'AGENDA') {
                    setEventoActual(determinarEventoActual(cachedResult.data.eventos, savedOffset));
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // --- EFECTOS (Ciclos de vida) ---

    useEffect(() => {
        // Carga inicial
        fetchData();

        // A. Intervalo de DESCARGA (Cada 5 minutos)
        // Solo descarga datos nuevos, no actualiza la UI constantemente
        const intervalDescarga = setInterval(fetchData, 300000); 
        
        // B. Intervalo de RELOJ INTERNO (Cada 30 segundos)
        // Este revisa la agenda localmente para cambiar de evento SIN internet
        const intervalReloj = setInterval(() => {
            const cachedRaw = localStorage.getItem(`narabyte_cache_${idPantalla}`);
            const cachedOffset = localStorage.getItem('narabyte_time_offset');
            const offset = cachedOffset ? parseInt(cachedOffset, 10) : 0;

            if (cachedRaw) {
                const cachedResult = JSON.parse(cachedRaw);
                if (cachedResult.data?.tipo_datos === 'AGENDA') {
                    // Recalcula el evento actual usando la hora corregida
                    setEventoActual(determinarEventoActual(cachedResult.data.eventos, offset));
                }
            }
        }, 30000);

        return () => {
            clearInterval(intervalDescarga);
            clearInterval(intervalReloj);
        };
    }, [idPantalla]);

    // Retornamos todo lo necesario para la UI
    return { eventoActual, config, loading, isOnline, timeOffset };
};