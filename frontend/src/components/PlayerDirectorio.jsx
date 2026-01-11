import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Hooks
import { usePantalla } from '../hooks/usePantalla';
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';

// Componentes y Utilidades
import { getIconoClima } from '../utils/weatherUtils';

// Importación de Layouts de Directorio
import LayoutDirectorioHorizontal from './layoutsDirectorios/LayoutDirectorioHorizontal';
import LayoutDirectorioVertical from './layoutsDirectorios/LayoutDirectorioVertical';

// Aquí importarás los nuevos diseños conforme los crees
// import LayoutDirectorioHorizontalModern from './layoutsDirectorios/LayoutDirectorioHorizontalModern';

export default function PlayerDirectorio() {
    const { id } = useParams();
    const { config, eventoActual: data, loading, isOnline, timeOffset, clima } = usePantalla(id);
    const horaActual = useReloj(timeOffset);
    const [paginaActual, setPaginaActual] = useState(0);

    // --- 1. LÓGICA DE SELECCIÓN POR ÍNDICES ---
    const orientacion = config?.orientacion || 0; // 0: H, 1: V
    const layoutIndex = config?.layoutDir || 0;    // 0, 1, 2... de la BD

    const { fondo = '#000000', texto_reloj = '#FFFFFF', acento = '#EAB308' } = config?.colores || {};

    // Procesamiento de datos
    let eventos = [];
    let noticias = [];
    if (data && data.tipo_datos === 'DIRECTORIO') {
        eventos = data.eventos || [];
        noticias = data.noticias || [];
    }

    const isVertical = orientacion === 1;
    const ITEMS_POR_PAGINA = isVertical ? 6 : 4; 
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

    if (loading && !config) return <div className="bg-black h-screen flex items-center justify-center text-white animate-pulse">CARGANDO...</div>;

    const layoutProps = { eventosVisibles, config, noticias, itemActual, videoBlobUrl, FilaGaleria };

    // --- 2. SELECTOR DE LAYOUTS POR NÚMERO ---
    const renderLayout = () => {
        // Lógica: Orientación 0 (Horizontal)
        if (orientacion === 0) {
            switch (layoutIndex) {
                case 0: return <LayoutDirectorioHorizontal {...layoutProps} />;
                // case 1: return <LayoutDirectorioHorizontalModern {...layoutProps} />;
                default: return <LayoutDirectorioHorizontal {...layoutProps} />;
            }
        } 
        // Lógica: Orientación 1 (Vertical)
        else {
            switch (layoutIndex) {
                case 0: return <LayoutDirectorioVertical {...layoutProps} />;
                // case 1: return <LayoutDirectorioVerticalModern {...layoutProps} />;
                default: return <LayoutDirectorioVertical {...layoutProps} />;
            }
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden font-sans relative" style={{ backgroundColor: fondo }}>
            
            <header className={`${isVertical ? 'h-20' : 'h-24'} flex justify-between items-center px-10 shrink-0 z-20`}>
                <div className="flex justify-start w-1/4">
                    {config?.logo && <img src={config.logo} alt="Logo" className="h-16 w-auto object-contain" />}
                </div>
                
                <div className="flex justify-center flex-1">
                    <div className="px-8 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                        <h1 className="text-2xl font-black tracking-widest uppercase text-center" style={{ color: acento }}>
                            DIRECTORIO
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col items-end w-1/4">
                    <span className="text-4xl font-mono font-bold leading-none" style={{ color: texto_reloj }}>
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