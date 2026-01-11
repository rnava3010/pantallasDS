import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Hooks
import { usePantalla } from '../hooks/usePantalla';
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';

// Componentes y Utilidades
import { getIconoClima } from '../utils/weatherUtils';

// Importación de Layouts (Cada número de layoutDir cargará uno de estos)
import LayoutDirectorioHorizontal from './layoutsDirectorios/LayoutDirectorioHorizontal'; // ID 0
import LayoutDirectorioVertical from './layoutsDirectorios/LayoutDirectorioVertical';     // ID 1

export default function PlayerDirectorio() {
    const { id } = useParams();
    const { config, eventoActual: data, loading, isOnline, timeOffset, clima } = usePantalla(id);
    const horaActual = useReloj(timeOffset);
    const [paginaActual, setPaginaActual] = useState(0);

    // --- LÓGICA DE SELECCIÓN POR ID DE DISEÑO ---
    const layoutId = config?.layoutDir ?? 0; // Tomamos el número directamente de la BD

    const { fondo = '#000000', texto_reloj = '#FFFFFF', acento = '#EAB308' } = config?.colores || {};

    // Procesamiento de datos
    let eventos = data?.eventos || [];
    let noticias = data?.noticias || [];

    // Definimos si es vertical u horizontal para la paginación y el header basándonos en el ID
    // 0 es Horizontal, 1 es Vertical (podemos agregar más)
    const isVerticalLayout = layoutId === 1; 

    const ITEMS_POR_PAGINA = isVerticalLayout ? 6 : 4; 
    const totalPaginas = Math.ceil(eventos.length / ITEMS_POR_PAGINA);

    const { itemActual } = useCarrusel(config?.screensaver || [], 8000);
    const { videoBlobUrl } = useOfflineVideo(config?.screensaver || []);

    useEffect(() => {
        if (totalPaginas > 1) {
            const intervalo = setInterval(() => setPaginaActual(p => (p + 1) % totalPaginas), 12000); 
            return () => clearInterval(intervalo);
        } else {
            setPaginaActual(0);
        }
    }, [totalPaginas]);

    const eventosVisibles = eventos.slice(paginaActual * ITEMS_POR_PAGINA, (paginaActual + 1) * ITEMS_POR_PAGINA);

    if (loading && !config) return <div className="bg-black h-screen flex items-center justify-center text-white">CARGANDO...</div>;

    const layoutProps = { eventosVisibles, config, noticias, itemActual, videoBlobUrl, FilaGaleria };

    // --- SELECTOR DE DISEÑO ---
    const renderLayout = () => {
        switch (layoutId) {
            case 0: // DISEÑO HORIZONTAL ESTÁNDAR
                return <LayoutDirectorioHorizontal {...layoutProps} />;
            case 1: // DISEÑO VERTICAL ESTÁNDAR
                return <LayoutDirectorioVertical {...layoutProps} />;
            // case 2: return <LayoutDirectorioModernHorizontal {...layoutProps} />;
            // case 3: return <LayoutDirectorioModernVertical {...layoutProps} />;
            default:
                return <LayoutDirectorioHorizontal {...layoutProps} />;
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden font-sans relative" style={{ backgroundColor: fondo }}>
            
            {/* HEADER (Se adapta visualmente según si el layout elegido es vertical u horizontal) */}
            <header className={`${isVerticalLayout ? 'h-20' : 'h-24'} flex justify-between items-center px-10 shrink-0 z-20`}>
                <div className="flex justify-start w-1/4">
                    {config?.logo && <img src={config.logo} alt="Logo" className={`${isVerticalLayout ? 'h-12' : 'h-16'} w-auto object-contain`} />}
                </div>
                
                <div className="flex justify-center flex-1">
                    <div className="px-8 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                        <h1 className={`${isVerticalLayout ? 'text-xl' : 'text-3xl'} font-black tracking-widest uppercase text-center`} style={{ color: acento }}>
                            DIRECTORIO
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col items-end w-1/4">
                    <span className={`${isVerticalLayout ? 'text-3xl' : 'text-5xl'} font-mono font-bold leading-none`} style={{ color: texto_reloj }}>
                        {horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] uppercase opacity-60 mt-1" style={{ color: texto_reloj }}>
                        {horaActual.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            <main className="flex-1 px-10 py-4 min-h-0 flex flex-col relative overflow-hidden">
                {renderLayout()}
            </main>

            <footer className="h-14 border-t border-white/10 px-10 flex justify-between items-center shrink-0 z-20" style={{ backgroundColor: fondo }}>
                <span className="text-[10px] opacity-40 uppercase">Powered by narabyte.xyz</span>
                <div className="flex items-center gap-2" style={{ color: texto_reloj }}>
                    <span className="text-3xl">{getIconoClima(clima.codigo)}</span>
                    <span className="font-bold text-xl">{clima.tempC}°C</span>
                </div>
            </footer>
        </div>
    );
}

const FilaGaleria = ({ imagenes, isVertical }) => {
    const [indice, setIndice] = useState(0);
    useEffect(() => {
        if (imagenes?.length > 1) {
            const timer = setInterval(() => setIndice(p => (p + 1) % imagenes.length), 4000);
            return () => clearInterval(timer);
        }
    }, [imagenes]);

    if (!imagenes?.length) return null;

    return (
        <div className={`${isVertical ? 'h-16 w-24' : 'h-24 w-36'} rounded-xl overflow-hidden shadow-xl bg-gray-800 shrink-0 border border-white/10`}>
            <img src={imagenes[indice]} alt="Evento" className="w-full h-full object-cover animate-fade-in" key={indice} />
        </div>
    );
};