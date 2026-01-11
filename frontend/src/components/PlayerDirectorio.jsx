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

export default function PlayerDirectorio() {
    const { id } = useParams();
    const { config, eventoActual: data, loading, isOnline, timeOffset, clima } = usePantalla(id);
    const horaActual = useReloj(timeOffset);
    const [paginaActual, setPaginaActual] = useState(0);

    // --- 1. SELECCIÓN DINÁMICA DE LAYOUT ---
    const isVertical = config?.orientacion === 1; // 0: Horizontal, 1: Vertical
    const dbLayoutBase = config?.layoutDir || 'default';
    
    // Construimos el identificador del layout (ej: "horizontal-default" o "vertical-modern")
    const layoutDir = `${isVertical ? 'vertical' : 'horizontal'}-${dbLayoutBase}`;

    const { fondo = '#000000', texto_reloj = '#FFFFFF', acento = '#EAB308' } = config?.colores || {};

    // --- 2. PROCESAMIENTO DE DATOS ---
    let eventos = [];
    let noticias = [];
    if (data && data.tipo_datos === 'DIRECTORIO') {
        eventos = data.eventos || [];
        noticias = data.noticias || [];
    }

    // Paginación ajustada según orientación
    const ITEMS_POR_PAGINA = isVertical ? 6 : 4; 
    const totalPaginas = Math.ceil(eventos.length / ITEMS_POR_PAGINA);

    // Carrusel de Widgets (Screensaver)
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

    // Props que se inyectan a los layouts
    const layoutProps = {
        eventosVisibles,
        paginaActual,
        totalPaginas,
        config,
        noticias,
        itemActual,
        videoBlobUrl,
        FilaGaleria
    };

    // --- 3. RENDERIZADO CONDICIONAL DE LAYOUTS ---
    const renderContent = () => {
        switch (layoutDir) {
            case 'vertical-default':
                return <LayoutDirectorioVertical {...layoutProps} />;
            case 'horizontal-default':
                return <LayoutDirectorioHorizontal {...layoutProps} />;
            
            // Aquí puedes añadir futuros diseños:
            // case 'horizontal-modern': return <LayoutDirectorioModern {...layoutProps} />;
            
            default:
                // Fallback de seguridad basado en orientación
                return isVertical ? 
                    <LayoutDirectorioVertical {...layoutProps} /> : 
                    <LayoutDirectorioHorizontal {...layoutProps} />;
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden font-sans relative" style={{ backgroundColor: fondo }}>
            
            {/* INDICADOR ONLINE */}
            <div className={`absolute bottom-20 right-4 z-50 w-2 h-2 rounded-full transition-colors duration-500 ${isOnline ? 'bg-green-500/40' : 'bg-red-600 animate-pulse'}`}></div>

            {/* HEADER */}
            <header className={`${isVertical ? 'h-20' : 'h-24'} flex justify-between items-center px-10 shrink-0 z-20 bg-gradient-to-b from-black/80 to-transparent`}>
                <div className="flex justify-start w-1/4">
                    {config?.logo && <img src={config.logo} alt="Logo" className={`${isVertical ? 'h-12' : 'h-16'} w-auto object-contain`} />}
                </div>
                
                <div className="flex justify-center flex-1">
                    <div className="px-8 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                        <h1 className={`${isVertical ? 'text-xl' : 'text-3xl'} font-black tracking-widest uppercase text-center`} style={{ color: acento }}>
                            DIRECTORIO
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col items-end w-1/4 whitespace-nowrap">
                    <span className={`${isVertical ? 'text-3xl' : 'text-5xl'} font-mono font-bold leading-none`} style={{ color: texto_reloj }}>
                        {horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest opacity-60 mt-1" style={{ color: texto_reloj }}>
                        {horaActual.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 px-10 py-4 min-h-0 flex flex-col relative overflow-hidden">
                {renderContent()}
            </main>

            {/* FOOTER */}
            <footer className="h-14 border-t border-white/10 px-10 flex justify-between items-center shrink-0 z-20" style={{ backgroundColor: fondo }}>
                <div className="opacity-40">
                    <p className="text-[10px] tracking-widest uppercase">Powered by <span className="font-bold">narabyte.xyz</span></p>
                </div>
                
                <div className="flex justify-center flex-1">
                    <h2 className="text-2xl font-light tracking-[0.4em] uppercase opacity-80" style={{ color: config?.colores?.texto_evento }}>BIENVENIDOS</h2>
                </div>

                <div className="flex items-center gap-2" style={{ color: texto_reloj }}>
                    <span className="text-3xl">{getIconoClima(clima.codigo)}</span>
                    <span className="font-bold text-xl">{clima.tempC}°C</span>
                </div>
            </footer>
        </div>
    );
}

// Sub-componente de Galería (reutilizado por los layouts)
const FilaGaleria = ({ imagenes, isVertical }) => {
    const [indice, setIndice] = useState(0);
    useEffect(() => {
        if (!imagenes || imagenes.length <= 1) return;
        const timer = setInterval(() => setIndice(p => (p + 1) % imagenes.length), 4000);
        return () => clearInterval(timer);
    }, [imagenes]);

    if (!imagenes || imagenes.length === 0) return null;

    return (
        <div className={`${isVertical ? 'h-16 w-24' : 'h-24 w-36'} rounded-xl overflow-hidden shadow-xl bg-gray-800 shrink-0 border border-white/10`}>
            <img 
                src={imagenes[indice]} 
                alt="Evento" 
                className="w-full h-full object-cover animate-fade-in" 
                key={indice} 
            />
        </div>
    );
};