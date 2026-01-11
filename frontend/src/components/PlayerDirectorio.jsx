import React from 'react';
import { useParams } from 'react-router-dom';

// --- Hooks especializados ---
import { useDirectorio } from '../hooks/useDirectorio'; 
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';

// --- Importación de Layouts (0 - 7) ---

// Básicos y Modernos
import LayoutDirectorioHorizontal from './layoutsDirectorios/LayoutDirectorioHorizontal';         // ID 0
import LayoutDirectorioVertical from './layoutsDirectorios/LayoutDirectorioVertical';           // ID 1
import LayoutDirectorioHorizontalModern from './layoutsDirectorios/LayoutDirectorioHorizontalModern'; // ID 2
import LayoutDirectorioVerticalMinimal from './layoutsDirectorios/LayoutDirectorioVerticalMinimal'; // ID 3

// Estructura Alternativa
import LayoutDirectorioHorizontalSide from './layoutsDirectorios/LayoutDirectorioHorizontalSide';   // ID 4
import LayoutDirectorioVerticalLayered from './layoutsDirectorios/LayoutDirectorioVerticalLayered'; // ID 5

// Versiones Premium
import LayoutDirectorioHorizontalPremium from './layoutsDirectorios/LayoutDirectorioHorizontalPremium'; // ID 6
import LayoutDirectorioVerticalPremium from './layoutsDirectorios/LayoutDirectorioVerticalPremium';     // ID 7

export default function PlayerDirectorio() {
    const { id } = useParams();
    
    // 1. Obtención de datos y configuración desde la API/Caché
    const { config, datos, loading, isOnline, clima, timeOffset } = useDirectorio(id);
    
    // 2. Gestión del tiempo centralizada (Sincronizada con el offset del servidor)
    const horaActual = useReloj(timeOffset);

    // 3. Gestión de Multimedia (Screensaver y Video Offline)
    // Rotación de galería cada 12 segundos
    const { itemActual } = useCarrusel(config?.screensaver || [], 12000);
    const { videoBlobUrl } = useOfflineVideo(config?.screensaver || []);

    // 4. Pantalla de carga (Splash Screen)
    if (loading && !config) {
        return (
            <div className="bg-[#050505] h-screen w-screen flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin mb-6"></div>
                <p className="font-mono text-[10px] uppercase tracking-[0.8em] opacity-40 animate-pulse">
                    Cargando Configuración Premium
                </p>
            </div>
        );
    }

    // 5. Determinación del Layout (layoutDir viene de la base de datos)
    const layoutId = config?.layoutDir ?? 0;

    // Paquete de datos que se inyecta en el layout seleccionado
    const layoutProps = {
        config,
        datos,
        horaActual,
        isOnline,
        clima,
        itemActual,
        videoBlobUrl
    };

    // 6. Router de Diseños (Switch Principal)
    const renderLayout = () => {
        switch (layoutId) {
            case 0:
                return <LayoutDirectorioHorizontal {...layoutProps} />;
            case 1:
                return <LayoutDirectorioVertical {...layoutProps} />;
            case 2:
                return <LayoutDirectorioHorizontalModern {...layoutProps} />;
            case 3:
                return <LayoutDirectorioVerticalMinimal {...layoutProps} />;
            case 4:
                return <LayoutDirectorioHorizontalSide {...layoutProps} />;
            case 5:
                return <LayoutDirectorioVerticalLayered {...layoutProps} />;
            case 6:
                return <LayoutDirectorioHorizontalPremium {...layoutProps} />;
            case 7:
                return <LayoutDirectorioVerticalPremium {...layoutProps} />;
            default:
                // Fallback de seguridad al diseño clásico horizontal
                return <LayoutDirectorioHorizontal {...layoutProps} />;
        }
    };

    return (
        <div className="w-screen h-screen bg-black overflow-hidden select-none cursor-none">
            {renderLayout()}
        </div>
    );
}