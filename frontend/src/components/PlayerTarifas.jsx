import React from 'react';
import { useParams } from 'react-router-dom';

// --- Hooks ---
import { useTarifas } from '../hooks/useTarifas'; // Hook que deberás crear similar al de directorio
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';

// --- Layouts de Tarifas ---
import LayoutTarifasHorizontal from './layoutsTarifas/LayoutTarifasHorizontal';
import LayoutTarifasVertical from './layoutsTarifas/LayoutTarifasVertical';
// Aquí irás importando los Premium (ID 2, 3...) conforme los desarrollemos

export default function PlayerTarifas() {
    const { id } = useParams();
    
    // 1. Obtención de datos y configuración de Tarifas
    // Este hook debe traer: { tarifas: [], banner: "", galeria: [] }
    const { config, datos, loading, timeOffset } = useTarifas(id);
    
    // 2. Gestión del tiempo
    const horaActual = useReloj(timeOffset);

    // 3. Gestión de la Galería del Footer (Screensaver)
    // Usamos la galería que viene en los datos de tarifas o la general de la terminal
    const listaGaleria = datos?.galeria?.length > 0 ? datos.galeria : (config?.screensaver || []);
    const { itemActual } = useCarrusel(listaGaleria, 10000);
    const { videoBlobUrl } = useOfflineVideo(listaGaleria);

    // 4. Pantalla de carga
    if (loading && !config) {
        return (
            <div className="bg-[#050505] h-screen w-screen flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="font-mono text-[10px] uppercase tracking-[0.5em] opacity-40">Actualizando Tarifas</p>
            </div>
        );
    }

    // 5. Selección de Layout (layoutTarifas de la DB)
    const layoutId = config?.layoutTarifas ?? 0;

    const layoutProps = {
        config,
        datos,
        horaActual,
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
            /* case 2:
                return <LayoutTarifasHorizontalPremium {...layoutProps} />; 
            */
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