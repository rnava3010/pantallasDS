import React from 'react';
import { useParams } from 'react-router-dom';

// --- Hooks ---
import { useTarifas } from '../hooks/useTarifas'; 
import { useReloj } from '../hooks/useReloj'; //
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';

// --- Layouts de Tarifas ---
import LayoutTarifasHorizontal from './layoutTarifas/LayoutTarifasHorizontal';
import LayoutTarifasVertical from './layoutTarifas/LayoutTarifasVertical';

export default function PlayerTarifas() {
    const { id } = useParams();
    
    // 1. Obtención de datos y configuración de Tarifas
    const { config, datos, loading, timeOffset } = useTarifas(id); //
    
    // 2. Gestión del tiempo (ESTA ES LA LÍNEA QUE FALTABA)
    const horaActual = useReloj(timeOffset); //

    // 3. Gestión de la Galería del Footer (Screensaver)
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

    // 5. Selección de Layout (layoutTarifas de la DB)
    const layoutId = config?.layoutTarifas ?? 0; //

    const layoutProps = {
        config,
        datos,
        horaActual, // Ahora ya está definida
        itemActual,
        videoBlobUrl
    };

    // 6. Router de Diseños
    const renderLayout = () => {
        switch (layoutId) {
            case 0:
                return <LayoutTarifasHorizontal {...layoutProps} />;
            case 1:
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