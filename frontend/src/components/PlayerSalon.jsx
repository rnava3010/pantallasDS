import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Hooks
import { usePantalla } from '../hooks/usePantalla';
import { useOfflineVideo } from '../hooks/useOfflineVideo';
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';

// Componentes y Utilidades
import MediaRenderer from '../components/MediaRenderer';
import { getIconoClima } from '../utils/weatherUtils'; 
import logger from '../utils/logger';

// --- IMPORTAMOS LOS LAYOUTS (Desde la carpeta 'layoutsSalones') ---
import LayoutSplit from './layoutsSalones/LayoutSplit';     // Modo 0
import LayoutCine from './layoutsSalones/LayoutCine';       // Modo 1
import LayoutPoster from './layoutsSalones/LayoutPoster';   // Modo 2
import LayoutClean from './layoutsSalones/LayoutClean';     // Modo 3
// import LayoutCorporativo from './layoutsSalones/LayoutCorporativo'; // (Opcional Modo 4)
import LayoutVertical from './layoutsSalones/LayoutVertical'; // Modo 5

// Helper de color (Brillo)
const lightenColor = (hex, percent) => {
    if (!hex) return '#ffffff';
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const B = ((num >> 8) & 0x00ff) + amt;
    const G = (num & 0x0000ff) + amt;
    return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 + (G < 255 ? (G < 1 ? 0 : G) : 255)).toString(16).slice(1);
};

export default function PlayerSalon() {
    const { id } = useParams();
    const { eventoActual, config, loading, isOnline, timeOffset, clima } = usePantalla(id);
    const horaActual = useReloj(timeOffset);

    // Logs
    useEffect(() => {
        if (config) logger.log(`✅ [PlayerSalon] Configurado: "${config.nombre_interno}"`);
    }, [config]);

    // Contenido y Hooks de Video/Carrusel
    const fotosActivas = (eventoActual?.imagenes?.length > 0) ? eventoActual.imagenes : (config?.screensaver || []);
    const { itemActual, indice } = useCarrusel(fotosActivas, 8000);
    const { videoBlobUrl } = useOfflineVideo(fotosActivas);

    // Favicon Dinámico
    useEffect(() => {
        if (config?.favicon) {
            let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/x-icon'; link.rel = 'icon'; link.href = config.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [config?.favicon]);

    if (loading && !config) return <div className="bg-black h-screen flex items-center justify-center text-white animate-pulse">Iniciando...</div>;

    // --- VARIABLES DE CONFIGURACIÓN ---
    const nombreSalon = eventoActual?.nombre_salon || config?.nombre_interno || "Sala de Eventos";
    const tickerText = eventoActual?.ticker || null;
    const { fondo = '#000000', texto_evento = '#FFFFFF', texto_reloj = '#FFFFFF', acento = '#EAB308' } = config?.colores || {};
    
    // Estilo Brillante para el Título
    const colorBrillante = lightenColor(acento, 40); 
    const shinyStyle = {
        backgroundImage: `linear-gradient(to right, ${acento}, ${colorBrillante}, ${acento})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: `drop-shadow(0 0 2px ${acento})`
    };

    // --- DETECCIÓN DE MODO ---
    let layoutMode = 0;
    if (eventoActual?.layout_mode !== undefined) {
        layoutMode = eventoActual.layout_mode;
    } else if (eventoActual?.full_width) { 
        layoutMode = 1; 
    }

    // Configuración Responsiva
    const isVertical = layoutMode === 5;
    const paddingX = isVertical ? 'px-4' : 'px-10';

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden font-sans relative transition-colors duration-1000" style={{ backgroundColor: fondo }}>
            <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } } .animate-marquee { animation: marquee 30s linear infinite; white-space: nowrap; display: inline-block; padding-left: 100%; }`}</style>
            
            {/* Indicador Offline */}
            <div className={`absolute bottom-32 right-6 z-50 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-500 ${isOnline ? 'bg-green-500/40 text-green-500' : 'bg-red-600 text-red-600 animate-pulse'}`}></div>

            {/* --- HEADER --- */}
            <header className={`h-24 flex items-center justify-between ${paddingX} relative z-20 bg-gradient-to-b from-black/90 to-transparent transition-all`}>
                {/* Logo Cliente */}
                <div className="w-auto flex justify-start">
                    {config?.logo && <img src={config.logo} alt="Logo" className={`${isVertical ? 'h-14' : 'h-20'} w-auto object-contain animate-float`} />}
                </div>
                
                {/* Título Central */}
                <div className="flex-1 flex justify-center overflow-hidden px-2">
                    <div className={`py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl ${isVertical ? 'px-4' : 'px-12'}`}>
                        <h1 className={`${isVertical ? 'text-xl' : 'text-4xl md:text-5xl'} font-bold tracking-widest uppercase drop-shadow-sm whitespace-nowrap text-ellipsis overflow-hidden`} style={shinyStyle}>
                            {nombreSalon}
                        </h1>
                    </div>
                </div>

                {/* Reloj */}
                <div className="w-auto flex flex-col items-end whitespace-nowrap">
                    <span className={`${isVertical ? 'text-3xl' : 'text-5xl'} font-mono font-bold drop-shadow-lg tracking-tighter leading-none`} style={{ color: texto_reloj }}>
                        {horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`${isVertical ? 'text-[10px]' : 'text-sm'} font-medium uppercase tracking-widest mt-1 opacity-80`} style={{ color: texto_reloj }}>
                        {horaActual.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* --- ÁREA PRINCIPAL --- */}
            <div className={`flex-1 ${paddingX} pt-2 relative z-10 w-full h-full ${tickerText ? 'pb-14' : ''}`}>
                
                {/* A. Screensaver (Si no hay evento) */}
                {!eventoActual && (
                     <div className="w-full h-full rounded-[2rem] overflow-hidden relative border border-white/10 shadow-2xl" style={{ backgroundColor: fondo }}>
                        <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-contain z-10"/>
                        {!itemActual && <div className="absolute inset-0 flex items-center justify-center opacity-10"><img src={config?.logo} className="w-1/3 grayscale animate-pulse" alt="Logo" /></div>}
                     </div>
                )}

                {/* B. Renderizado de Layouts Dinámicos */}
                {eventoActual && (
                    <>
                        {layoutMode === 5 && <LayoutVertical {...{eventoActual, itemActual, videoBlobUrl, config, fotosActivas, indice, shinyStyle, acento, fondo, texto_evento}} />}
                        {layoutMode === 0 && <LayoutSplit {...{eventoActual, itemActual, videoBlobUrl, config, fotosActivas, indice, texto_evento, acento, fondo}} />}
                        {layoutMode === 1 && <LayoutCine {...{eventoActual, itemActual, videoBlobUrl, config, texto_evento, acento, fondo}} />}
                        {layoutMode === 2 && <LayoutPoster {...{eventoActual, itemActual, videoBlobUrl, acento, fondo}} />}
                        {layoutMode === 3 && <LayoutClean {...{itemActual, videoBlobUrl, fondo}} />}
                    </>
                )}
            </div>

            {/* --- FOOTER --- */}
            <footer className={`h-16 relative z-20 grid grid-cols-3 items-center ${paddingX} border-t transition-all`} style={{ backgroundColor: fondo, borderColor: `${texto_evento}20` }}>
                <div className="flex justify-start opacity-50">
                    <p className="text-[9px] md:text-[11px] tracking-[0.2em] uppercase font-medium" style={{ color: texto_reloj }}>
                        Powered by <span className="font-bold" style={{ color: acento }}>narabyte.xyz</span>
                    </p>
                </div>
                <div className="flex justify-center">
                    {!eventoActual && <h2 className={`${isVertical ? 'text-xl' : 'text-4xl'} font-light tracking-[0.3em] uppercase drop-shadow-lg animate-fade-in-up font-sans`} style={{ color: texto_evento }}>BIENVENIDOS</h2>}
                </div>
                <div className="flex justify-end items-center gap-2 md:gap-6" style={{ color: texto_reloj }}>
                    <div className={`${isVertical ? 'text-2xl' : 'text-5xl'} drop-shadow-lg filter pb-1`}>{getIconoClima(clima.codigo)}</div>
                    <div className="flex items-baseline gap-1 md:gap-3">
                         <span className={`${isVertical ? 'text-xl' : 'text-4xl'} font-bold tracking-tighter`}>{clima.tempC}°C</span>
                    </div>
                </div>
            </footer>
             
             {/* --- TICKER --- */}
             {tickerText && (
                <div className="absolute bottom-0 left-0 w-full h-12 z-50 overflow-hidden flex items-center shadow-lg border-t" style={{ backgroundColor: acento, borderColor: `${acento}80` }}>
                    <div className="flex w-full">
                         <div className="px-6 h-12 flex items-center justify-center font-black uppercase tracking-widest text-sm relative z-20 shrink-0" style={{ backgroundColor: fondo, color: acento }}>Aviso</div>
                        <div className="flex-1 overflow-hidden relative flex items-center">
                             <div className="animate-marquee whitespace-nowrap text-2xl font-bold uppercase tracking-wide" style={{ color: fondo }}>{tickerText}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}