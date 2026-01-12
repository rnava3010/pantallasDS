import React from 'react';
import { useParams } from 'react-router-dom';
import { useTarifas } from '../hooks/useTarifas'; 
import { useReloj } from '../hooks/useReloj'; //
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';

import LayoutTarifasHorizontal from './layoutTarifas/LayoutTarifasHorizontal';
import LayoutTarifasVertical from './layoutTarifas/LayoutTarifasVertical';
import LayoutTarifasHorizontal2 from './layoutTarifas/LayoutTarifasHorizontal_V2';
import LayoutTarifasVertical2 from './layoutTarifas/LayoutTarifasVertical_V2';

export default function PlayerTarifas() {
    const { id } = useParams();
    
    const { config, datos, loading, timeOffset } = useTarifas(id); //
    
    const horaActual = useReloj(timeOffset); //

    const listaGaleria = datos?.galeria?.length > 0 ? datos.galeria : (config?.screensaver || []);
    const { itemActual } = useCarrusel(listaGaleria, 10000);
    const { videoBlobUrl } = useOfflineVideo(listaGaleria);

    // 4. Pantalla de carga
    if (loading || !config) { //
        return (
            <div className="bg-[#050505] h-screen w-screen flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="font-mono text-[10px] uppercase tracking-[0.5em] opacity-40">Cargando Tarifas...</p>
            </div>
        );
    }

    const layoutId = config?.layoutTarifas ?? 0; //

    const layoutProps = {
        config,
        datos,
        horaActual,
        itemActual,
        videoBlobUrl
    };

    const renderLayout = () => {
        switch (layoutId) {
            case 0:
                return <LayoutTarifasHorizontal {...layoutProps} />;
            case 1:
                return <LayoutTarifasVertical {...layoutProps} />;
			case 2:
                return <LayoutTarifasHorizontal {...layoutProps} />;
            case 3:
                return <LayoutTarifasVertical {...layoutProps} />;
            default:
                return <LayoutTarifasHorizontal {...layoutProps} />;
        }
    };

    return (
        <div className="w-screen h-screen bg-black overflow-hidden select-none cursor-none">
            {renderLayout()}
        </div>
    );
}