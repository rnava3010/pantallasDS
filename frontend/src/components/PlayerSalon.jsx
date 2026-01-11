import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
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

// --- IMPORTAMOS LOS LAYOUTS ---
import LayoutSplit from './layoutsSalones/LayoutSplit';
import LayoutCine from './layoutsSalones/LayoutCine';
import LayoutPoster from './layoutsSalones/LayoutPoster';
import LayoutClean from './layoutsSalones/LayoutClean';
import LayoutVertical from './layoutsSalones/LayoutVertical';
import LayoutVerticalCine from './layoutsSalones/LayoutVerticalCine';
import LayoutVerticalFull from './layoutsSalones/LayoutVerticalFull';

// Helper de color
const lightenColor = (hex, percent) => {
    if (!hex) return '#ffffff';
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const B = ((num >> 8) & 0x00ff) + amt;
    const G = (num & 0x0000ff) + amt;
    return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 + (G < 255 ? (G < 1 ? 0 : G) : 255)).toString(16).slice(1);
};

// Helper de Fecha
const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString); 
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function PlayerSalon() {
    const { id } = useParams();
    const { eventoActual, config, loading, isOnline, timeOffset, clima } = usePantalla(id);
    const horaActual = useReloj(timeOffset);

    // Logs
    useEffect(() => {
        if (config) logger.log(`✅ [PlayerSalon] Configurado: "${config.nombre_interno}" Orientación: ${config.orientacion === 1 ? 'Vertical' : 'Horizontal'}`);
    }, [config]);

    // Contenido
    const fotosActivas = (eventoActual?.imagenes?.length > 0) ? eventoActual.imagenes : (config?.screensaver || []);
    const { itemActual, indice } = useCarrusel(fotosActivas, 8000);
    const { videoBlobUrl } = useOfflineVideo(fotosActivas);

    // Favicon
    useEffect(() => {
        if (config?.favicon) {
            let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/x-icon'; link.rel = 'icon'; link.href = config.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [config?.favicon]);

    // 1. PRIMERO: Definimos las variables base (nombreSalon, isVertical, etc.)
    // Esto evita el error "Cannot access before initialization"
    const nombreSalon = eventoActual?.nombre_salon || config?.nombre_interno || "Sala de Eventos";
    
    // Detección de Orientación
    let layoutMode = 0;
    if (eventoActual?.layout_mode !== undefined) { layoutMode = eventoActual.layout_mode; } 
    else if (eventoActual?.full_width) { layoutMode = 1; }
    
    const isEventVertical = (layoutMode === 5 || layoutMode === 6 || layoutMode === 7);
    const isConfigVertical = config?.orientacion === 1;
    const isVertical = eventoActual ? isEventVertical : isConfigVertical;
    
    // Variables CSS
    const paddingX = isVertical ? 'px-4' : 'px-10';
    const radioBorde = isVertical ? 'rounded-[2rem]' : 'rounded-[3rem]';

    // 2. SEGUNDO: Hooks de Redimensionamiento (Ahora sí pueden leer nombreSalon e isVertical)
    const titleRef = useRef(null);
    const baseFontSize = isVertical ? 24 : 48; 
    const [dynamicFontSize, setDynamicFontSize] = useState(baseFontSize);

    useLayoutEffect(() => {
        const element = titleRef.current;
        if (!element || !config) return;

        element.style.fontSize = `${baseFontSize}px`;

        const textWidth = element.scrollWidth;
        const containerWidth = element.parentElement.clientWidth;

        if (textWidth > containerWidth) {
            const ratio = containerWidth / textWidth;
            let newSize = Math.floor(baseFontSize * ratio * 0.95);
            newSize = Math.max(newSize, 14); 
            setDynamicFontSize(newSize);
        } else {
            setDynamicFontSize(baseFontSize);
        }
    }, [nombreSalon, isVertical, baseFontSize, config]); // Ahora nombreSalon ya existe aquí

    // 3. TERCERO: Loading Check
    if (loading && !config) return <div className="bg-black h-screen flex items-center justify-center text-white animate-pulse">Iniciando...</div>;

    // 4. CUARTO: Variables dependientes de config (Colores y Estilos)
    const tickerText = eventoActual?.ticker || null;
    const { fondo = '#000000', texto_evento = '#FFFFFF', texto_reloj = '#FFFFFF', acento = '#EAB308' } = config?.colores || {};
    
    const colorBrillante = lightenColor(acento, 40); 
    const shinyStyle = {
        backgroundImage: `linear-gradient(to right, ${acento}, ${colorBrillante}, ${acento})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: `drop-shadow(0 0 2px ${acento})`,
        fontSize: `${dynamicFontSize}px` // Usamos el tamaño calculado
    };

    // Lógica de fechas
    let textoFechas = "";
    if (eventoActual) {
        const fInicio = formatDate(eventoActual.inicio_iso);
        const fFin = formatDate(eventoActual.fin_iso);
        if (fInicio === fFin) { textoFechas = fInicio; } 
        else { textoFechas = `${fInicio} al ${fFin}`; }
    }

    // 5. RENDER
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden font-sans relative transition-colors duration-1000" style={{ backgroundColor: fondo }}>
            <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } } .animate-marquee { animation: marquee 30s linear infinite; white-space: nowrap; display: inline-block; padding-left: 100%; }`}</style>
            
            <div className={`absolute bottom-32 right-6 z-50 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-500 ${isOnline ? 'bg-green-500/40 text-green-500' : 'bg-red-600 text-red-600 animate-pulse'}`}></div>

            {/* HEADER */}
            <header className={`h-24 grid grid-cols-3 items-center ${paddingX} relative z-20 bg-gradient-to-b from-black/90 to-transparent`}>
                <div className="flex justify-start">
                    {config?.logo && <img src={config.logo} alt="Logo" className={`${isVertical ? 'h-16' : 'h-20'} w-auto object-contain animate-float`} />}
                </div>
                
                {/* Contenedor del Título con Auto-Resize */}
                <div className="flex justify-center overflow-hidden w-full px-2">
                    <div className={`py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl w-full flex justify-center ${isVertical ? 'px-2 max-w-[95%]' : 'px-8 max-w-[80%]'}`}>
                        <h1 
                            ref={titleRef}
                            className="font-bold tracking-widest uppercase drop-shadow-sm whitespace-nowrap overflow-hidden text-center leading-none py-1"
                            style={shinyStyle}
                        >
                            {nombreSalon}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col items-end whitespace-nowrap">
                    <span className={`${isVertical ? 'text-4xl' : 'text-5xl'} font-mono font-bold drop-shadow-lg tracking-tighter leading-none`} style={{ color: texto_reloj }}>
                        {horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`${isVertical ? 'text-xs' : 'text-sm'} font-medium uppercase tracking-widest mt-1 opacity-80`} style={{ color: texto_reloj }}>
                        {horaActual.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* CONTENIDO */}
            <div className={`flex-1 ${paddingX} pt-2 relative z-10 w-full h-full min-h-0 ${tickerText ? 'pb-14' : ''}`}>
                
                {/* A. SCREENSAVER */}
                {!eventoActual && (
                     <div className={`w-full h-full ${radioBorde} overflow-hidden relative border border-white/10 shadow-2xl`} style={{ backgroundColor: fondo }}>
                        <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-contain z-10 w-full h-full"/>
                        {!itemActual && <div className="absolute inset-0 flex items-center justify-center opacity-10"><img src={config?.logo} className="w-1/3 grayscale animate-pulse" alt="Logo" /></div>}
                     </div>
                )}

                {/* B. EVENTO ACTIVO */}
                {eventoActual && (
                    <>
                        {/* Verticales */}
                        {layoutMode === 5 && <LayoutVertical {...{eventoActual, itemActual, videoBlobUrl, config, fotosActivas, indice, shinyStyle, acento, fondo, texto_evento, textoFechas}} />}
                        {layoutMode === 6 && <LayoutVerticalCine {...{eventoActual, itemActual, videoBlobUrl, config, shinyStyle, acento, fondo, texto_evento, textoFechas}} />}
                        {layoutMode === 7 && <LayoutVerticalFull {...{itemActual, videoBlobUrl, fondo}} />}
                        
                        {/* Horizontales */}
                        {layoutMode === 0 && <LayoutSplit {...{eventoActual, itemActual, videoBlobUrl, config, fotosActivas, indice, texto_evento, acento, fondo, textoFechas}} />}
                        {layoutMode === 1 && <LayoutCine {...{eventoActual, itemActual, videoBlobUrl, config, texto_evento, acento, fondo, textoFechas}} />}
                        {layoutMode === 2 && <LayoutPoster {...{eventoActual, itemActual, videoBlobUrl, acento, fondo}} />}
                        {layoutMode === 3 && <LayoutClean {...{itemActual, videoBlobUrl, fondo}} />}
                    </>
                )}
            </div>

            {/* FOOTER */}
            <footer className={`h-16 relative z-20 grid grid-cols-3 items-center ${paddingX} border-t transition-all`} style={{ backgroundColor: fondo, borderColor: `${texto_evento}20` }}>
                <div className="flex justify-start opacity-50"><p className="text-[10px] tracking-widest uppercase">Powered by <span className="font-bold" style={{ color: acento }}>narabyte.xyz</span></p></div>
                <div className="flex justify-center">{!eventoActual && <h2 className={`${isVertical ? 'text-2xl' : 'text-4xl'} font-light tracking-[0.3em] uppercase`} style={{ color: texto_evento }}>BIENVENIDOS</h2>}</div>
                <div className="flex justify-end items-center gap-2" style={{ color: texto_reloj }}>
                    <div className={`${isVertical ? 'text-3xl' : 'text-4xl'} pb-1`}>{getIconoClima(clima.codigo)}</div>
                    <span className={`${isVertical ? 'text-2xl' : 'text-3xl'} font-bold`}>{clima.tempC}°C</span>
                </div>
            </footer>
             
             {/* TICKER */}
             {tickerText && (
                <div className="absolute bottom-0 left-0 w-full h-12 z-50 overflow-hidden flex items-center shadow-lg border-t" style={{ backgroundColor: acento, borderColor: `${acento}80` }}>
                    <div className="flex w-full">
                         <div className="px-6 h-12 flex items-center justify-center font-black uppercase tracking-widest text-sm relative z-20 shrink-0" style={{ backgroundColor: fondo, color: acento }}>Aviso</div>
                        <div className="flex-1 overflow-hidden relative flex items-center"><div className="animate-marquee whitespace-nowrap text-2xl font-bold uppercase tracking-wide" style={{ color: fondo }}>{tickerText}</div></div>
                    </div>
                </div>
            )}
        </div>
    );
}