import React from 'react';
import { useParams } from 'react-router-dom';

import { useDirectorio } from '../hooks/useDirectorio'; 
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';

import LayoutDirectorioHorizontal from './layoutsDirectorios/LayoutDirectorioHorizontal';         // ID 0
import LayoutDirectorioVertical from './layoutsDirectorios/LayoutDirectorioVertical';           // ID 1
import LayoutDirectorioHorizontalModern from './layoutsDirectorios/LayoutDirectorioHorizontalModern'; // ID 2
import LayoutDirectorioVerticalMinimal from './layoutsDirectorios/LayoutDirectorioVerticalMinimal'; // ID 3
import LayoutDirectorioHorizontalSide from './layoutsDirectorios/LayoutDirectorioHorizontalSide';   // ID 4
import LayoutDirectorioVerticalLayered from './layoutsDirectorios/LayoutDirectorioVerticalLayered'; // ID 5
import LayoutDirectorioHorizontalPremium from './layoutsDirectorios/LayoutDirectorioHorizontalPremium'; // ID 6
import LayoutDirectorioVerticalPremium from './layoutsDirectorios/LayoutDirectorioVerticalPremium';     // ID 7

export default function PlayerDirectorio() {
    const { id } = useParams();
    
    const { config, datos, loading, isOnline, clima, timeOffset } = useDirectorio(id);
    
    const horaActual = useReloj(timeOffset);

    const { itemActual } = useCarrusel(config?.screensaver || [], 12000);
    const { videoBlobUrl } = useOfflineVideo(config?.screensaver || []);

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

    const layoutId = config?.layoutDir ?? 0;

    const layoutProps = {
        config,
        datos,
        horaActual,
        isOnline,
        clima,
        itemActual,
        videoBlobUrl
    };

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
                return <LayoutDirectorioHorizontal {...layoutProps} />;
        }
    };

    return (
        <div className="w-screen h-screen bg-black overflow-hidden select-none cursor-none">
            {renderLayout()}
        </div>
    );
}