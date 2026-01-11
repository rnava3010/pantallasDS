import React from 'react';
import { useParams } from 'react-router-dom';

// --- Hooks especializados ---
import { useDirectorio } from '../hooks/useDirectorio'; 
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';

// --- Importación de los 5 Layouts ---
import LayoutDirectorioHorizontal from './layoutsDirectorios/LayoutDirectorioHorizontal';         // ID 0
import LayoutDirectorioVertical from './layoutsDirectorios/LayoutDirectorioVertical';           // ID 1
import LayoutDirectorioHorizontalModern from './layoutsDirectorios/LayoutDirectorioHorizontalModern'; // ID 2
import LayoutDirectorioVerticalMinimal from './layoutsDirectorios/LayoutDirectorioVerticalMinimal'; // ID 3
import LayoutDirectorioHorizontalSide from './layoutsDirectorios/LayoutDirectorioHorizontalSide';   // ID 4
import LayoutDirectorioVerticalLayered from './layoutsDirectorios/LayoutDirectorioVerticalLayered'; // ID 5

export default function PlayerDirectorio() {
    const { id } = useParams();
    
    // 1. Obtención de datos y configuración
    const { config, datos, loading, isOnline, clima, timeOffset } = useDirectorio(id);
    
    // 2. Gestión del tiempo (Reloj centralizado para todos los layouts)
    const horaActual = useReloj(timeOffset);

    // 3. Gestión de medios (Screensaver / Galería / Video)
    // El carrusel cambia de ítem cada 12 segundos para dar tiempo a los videos
    const { itemActual } = useCarrusel(config?.screensaver || [], 12000);
    const { videoBlobUrl } = useOfflineVideo(config?.screensaver || []);

    // 4. Pantalla de carga con estilo Glassmorphism
    if (loading && !config) {
        return (
            <div className="bg-[#0a0a0a] h-screen w-screen flex flex-col items-center justify-center text-white font-mono">
                <div className="w-16 h-16 border-4 border-t-white border-white/10 rounded-full animate-spin mb-4"></div>
                <p className="tracking-[0.5em] uppercase text-xs opacity-50">Sincronizando Directorio</p>
            </div>
        );
    }

    // 5. Selección de Layout basada en layoutDir (ID de la DB)
    const layoutId = config?.layoutDir ?? 0;

    // Props compartidas que se inyectan en cualquier layout seleccionado
    const layoutProps = {
        config,
        datos,
        horaActual,
        isOnline,
        clima,
        itemActual,
        videoBlobUrl
    };

    // 6. Router Interno de Diseños
    const renderLayout = () => {
        switch (layoutId) {
            case 0:
                // Horizontal Clásico (Corregido con Horario en cápsula y brillo)
                return <LayoutDirectorioHorizontal {...layoutProps} />;
            case 1:
                // Vertical Clásico (Corregido con brillo y legibilidad)
                return <LayoutDirectorioVertical {...layoutProps} />;
            case 2:
                // Horizontal Moderno (Cinematográfico, 3 columnas, Noticias Lentas)
                return <LayoutDirectorioHorizontalModern {...layoutProps} />;
            case 3:
                // Vertical Minimalista (Limpio, Noticias Marquee ultra lento)
                return <LayoutDirectorioVerticalMinimal {...layoutProps} />;
            case 4:
                // Horizontal Side-Gallery (Contenido 60% / Video 40%)
                return <LayoutDirectorioHorizontalSide {...layoutProps} />;
            case 5:
                // Vertical Layered (Video Superior curvo / Cards flotantes)
                return <LayoutDirectorioVerticalLayered {...layoutProps} />;
            default:
                // Fallback al diseño original
                return <LayoutDirectorioHorizontal {...layoutProps} />;
        }
    };

    return (
        <div className="w-screen h-screen bg-black overflow-hidden">
            {renderLayout()}
        </div>
    );
}