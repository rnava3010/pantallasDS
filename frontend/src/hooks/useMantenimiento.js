import { useEffect } from 'react';
import logger from '../utils/logger';

export const useMantenimiento = (horaReinicio = 3) => {
    useEffect(() => {
        // Función que revisa si es hora de reiniciar
        const revisarMantenimiento = () => {
            const ahora = new Date();
            const hora = ahora.getHours();
            const minutos = ahora.getMinutes();

            // Si son las 3:00 AM (y estamos en el minuto 0 para evitar bucles)
            if (hora === horaReinicio && minutos === 0) {
                logger.warn("🧹 [Mantenimiento] Hora de limpieza diaria. Recargando sistema...");
                
                // Forzamos al navegador a recargar desde el servidor (no caché)
                window.location.reload(true);
            }
        };

        // Revisamos el reloj cada 30 segundos
        const intervalo = setInterval(revisarMantenimiento, 30000);

        // Limpieza al desmontar (aunque App nunca se desmonta)
        return () => clearInterval(intervalo);
    }, [horaReinicio]);
};