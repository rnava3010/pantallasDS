import React from 'react';
import { useParams } from 'react-router-dom';
import { usePantalla } from '../hooks/usePantalla';
import { useOfflineVideo } from '../hooks/useOfflineVideo'; // <--- NUEVO
import { useReloj } from '../hooks/useReloj';             // <--- NUEVO
import { useCarrusel } from '../hooks/useCarrusel';       // <--- NUEVO
import MediaRenderer from '../components/MediaRenderer';  // <--- NUEVO
import { getIconoClima } from '../utils/weatherUtils';    // <--- NUEVO

export default function PlayerDirectorio() {
    const { id } = useParams();
    // 1. Datos principales
    const { config, loading, isOnline, timeOffset, clima } = usePantalla(id);
    
    // 2. Usamos nuestros hooks nuevos
    const horaActual = useReloj(timeOffset);
    
    // Supongamos que en directorio usamos el screensaver de fondo
    const listaMedia = config?.screensaver || [];
    
    // 3. Magia: Carrusel y Offline Video en 2 líneas
    const { itemActual } = useCarrusel(listaMedia, 10000); // 10 seg
    const { videoBlobUrl } = useOfflineVideo(listaMedia);

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="h-screen w-screen bg-black text-white relative overflow-hidden">
            
            {/* FONDO (VIDEO O IMAGEN) */}
            <div className="absolute inset-0 z-0 opacity-30">
                <MediaRenderer 
                    url={itemActual} 
                    blobUrl={videoBlobUrl} 
                    className="object-cover"
                />
            </div>

            {/* CONTENIDO SUPERPUESTO */}
            <div className="relative z-10 p-10">
                <h1 className="text-5xl font-bold">Directorio de Eventos</h1>
                <p className="text-2xl mt-4">
                    {horaActual.toLocaleTimeString()} | {getIconoClima(clima.codigo)} {clima.tempC}°C
                </p>

                {/* AQUÍ IRÍA TU TABLA DE EVENTOS */}
                <div className="mt-10 bg-white/10 p-5 rounded-xl">
                   <p>Tabla de eventos aquí...</p>
                </div>
            </div>
            
            {/* Indicador Offline reutilizado */}
            {!isOnline && <div className="absolute bottom-5 right-5 w-4 h-4 bg-red-500 rounded-full animate-pulse"/>}
        </div>
    );
}