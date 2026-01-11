import React from 'react';
import { useParams } from 'react-router-dom';

// Hooks especializados
import { useDirectorio } from '../hooks/useDirectorio'; 
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';

// Layouts disponibles
import LayoutDirectorioHorizontal from './layoutsDirectorios/LayoutDirectorioHorizontal';
import LayoutDirectorioVertical from './layoutsDirectorios/LayoutDirectorioVertical';

export default function PlayerDirectorio() {
    const { id } = useParams();
    
    // 1. Obtención de datos y configuración (incluye manejo offline y caché)
    const { config, datos, loading, isOnline, clima, timeOffset } = useDirectorio(id);
    
    // 2. Gestión del tiempo (Reloj centralizado)
    const horaActual = useReloj(timeOffset);

    // 3. Gestión de medios (Screensaver / Galería / Video)
    const { itemActual } = useCarrusel(config?.screensaver || [], 8000);
    const { videoBlobUrl } = useOfflineVideo(config?.screensaver || []);

    // 4. Pantalla de carga segura
    if (loading && !config) {
        return (
            <div className="bg-black h-screen flex items-center justify-center text-white font-mono animate-pulse">
                INICIALIZANDO DIRECTORIO...
            </div>
        );
    }

    // 5. Selección de Layout basada en layoutDir (0: Horiz, 1: Vert)
    const layoutId = config?.layoutDir ?? 0;

    // Preparamos las props que compartiremos con cualquier layout seleccionado
    const layoutProps = {
        config,
        datos,
        horaActual,
        isOnline,
        clima,
        itemActual,
        videoBlobUrl
    };

    // 6. Renderizado condicional
    const renderLayout = () => {
        switch (layoutId) {
            case 0:
                return <LayoutDirectorioHorizontal {...layoutProps} />;
            case 1:
                return <LayoutDirectorioVertical {...layoutProps} />;
            default:
                // Fallback por defecto si el ID no coincide
                return <LayoutDirectorioHorizontal {...layoutProps} />;
        }
    };

    return (
        <div className="w-full h-full">
            {renderLayout()}
        </div>
    );
}