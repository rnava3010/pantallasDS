import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Hooks
import { usePantalla } from '../hooks/usePantalla';
import { useOfflineVideo } from '../hooks/useOfflineVideo';
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';

// Componentes
import MediaRenderer from '../components/MediaRenderer';
import DirectionArrow from '../components/DirectionArrow'; 
import { getIconoClima } from '../utils/weatherUtils'; 
import logger from '../utils/logger';

// --- HELPER: Generar color más claro para el brillo ---
const lightenColor = (hex, percent) => {
    if (!hex) return '#ffffff';
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const B = ((num >> 8) & 0x00ff) + amt;
    const G = (num & 0x0000ff) + amt;
    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
        (G < 255 ? (G < 1 ? 0 : G) : 255)
    ).toString(16).slice(1);
};

export default function PlayerSalon() {
    const { id } = useParams();
    
    // 1. Datos
    const { eventoActual, config, loading, isOnline, timeOffset, clima } = usePantalla(id);
    const horaActual = useReloj(timeOffset);

    // 2. Logs
    useEffect(() => {
        if (loading) logger.log(`🔄 [PlayerSalon] Cargando...`);
        else if (config) logger.log(`✅ [PlayerSalon] Configurado: "${config.nombre_interno}"`);
    }, [loading, config]);

    // 3. Contenido
    const fotosActivas = (eventoActual?.imagenes?.length > 0) ? eventoActual.imagenes : (config?.screensaver || []);
    const { itemActual, indice } = useCarrusel(fotosActivas, 8000);
    const { videoBlobUrl } = useOfflineVideo(fotosActivas);

    useEffect(() => {
        if (config?.favicon) {
            let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/x-icon'; link.rel = 'icon'; link.href = config.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [config?.favicon]);

    if (loading && !config) return <div className="bg-black h-screen flex items-center justify-center text-white animate-pulse">Iniciando...</div>;

    const nombreSalon = eventoActual?.nombre_salon || config?.nombre_interno || "Sala de Eventos";
    const tickerText = eventoActual?.ticker || null;
    
    // Extracción segura de colores
    const { 
        fondo = '#000000', 
        texto_evento = '#FFFFFF', 
        texto_reloj = '#FFFFFF', 
        acento = '#EAB308' 
    } = config?.colores || {};

    // Estilo "Shiny" (Brillo Metálico Dinámico)
    const colorBrillante = lightenColor(acento, 40); 
    const shinyStyle = {
        backgroundImage: `linear-gradient(to right, ${acento}, ${colorBrillante}, ${acento})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: `drop-shadow(0 0 2px ${acento})`
    };

    // --- LÓGICA DE LAYOUT ---
    let layoutMode = 0;
    if (eventoActual?.layout_mode !== undefined) {
        layoutMode = eventoActual.layout_mode;
    } else if (eventoActual?.full_width) { 
        layoutMode = 1; 
    }

    return (
        <div 
            className="flex flex-col h-screen w-screen overflow-hidden font-sans relative transition-colors duration-1000"
            style={{ backgroundColor: fondo }}
        >
            {/* Animación local Marquee (Float ya es global en index.css) */}
            <style>{`
                @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                .animate-marquee { animation: marquee 30s linear infinite; white-space: nowrap; display: inline-block; padding-left: 100%; }
            `}</style>

            {/* Indicador Offline */}
            <div className={`absolute bottom-32 right-6 z-50 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-500 ${isOnline ? 'bg-green-500/40 text-green-500' : 'bg-red-600 text-red-600 animate-pulse'}`}></div>

            {/* HEADER */}
            <header className="h-28 flex items-center justify-between px-10 relative z-20 bg-gradient-to-b from-black/90 to-transparent">
                <div className="w-1/4 flex justify-start">
                    {config?.logo && (
                        <img 
                            src={config.logo} 
                            alt="Logo" 
                            className="h-20 w-auto object-contain animate-float" 
                        />
                    )}
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="px-12 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                        <h1 
                            className="text-4xl md:text-5xl font-bold tracking-widest uppercase drop-shadow-sm whitespace-nowrap text-ellipsis overflow-hidden"
                            style={shinyStyle} 
                        >
                            {nombreSalon}
                        </h1>
                    </div>
                </div>
                <div className="w-1/4 flex flex-col items-end">
                    <span 
                        className="text-5xl font-mono font-bold drop-shadow-lg tracking-tighter"
                        style={{ color: texto_reloj }}
                    >
                        {horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span 
                        className="text-sm font-medium uppercase tracking-widest mt-1 opacity-80"
                        style={{ color: texto_reloj }}
                    >
                        {horaActual.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* CONTENIDO */}
            <div className={`flex-1 p-8 pt-2 relative z-10 w-full h-full ${tickerText ? 'pb-14' : ''}`}>
                
                {/* 1. MODO SCREENSAVER */}
                {!eventoActual && (
                    <div className="w-full h-full rounded-[3rem] overflow-hidden relative border border-white/10 shadow-2xl" style={{ backgroundColor: fondo }}>
                        <MediaRenderer 
                            url={itemActual} 
                            blobUrl={videoBlobUrl} 
                            className="object-contain z-10"
                            onError={(e) => logger.error("Error media:", e)}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-0 opacity-20">
                             <div style={{ color: texto_evento }} className="scale-150">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                             </div>
                        </div>
                    </div>
                )}

                {/* 2. MODO EVENTO */}
                {eventoActual && (
                    <div className="w-full h-full h-full relative">
                        
                        {/* === MODO 4: CORPORATIVO (Imagen Arriba / Texto Abajo) === */}
                        {layoutMode === 4 && (
                             <div className="flex flex-col w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
                                {/* Mitad Superior: Imagen */}
                                <div className="h-1/2 relative w-full bg-black">
                                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-cover z-10"/>
                                    {!itemActual && <div className="absolute inset-0 flex items-center justify-center opacity-10"><img src={config?.logo} className="w-1/3 grayscale animate-pulse" alt="Logo" /></div>}
                                    
                                    {/* Carrusel Dots (Opcional en modo vertical) */}
                                    {fotosActivas.length > 1 && (
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                            {fotosActivas.map((_, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${idx === indice ? 'w-6' : 'w-1.5 bg-white/30'}`} 
                                                    style={idx === indice ? { backgroundColor: acento } : {}}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Mitad Inferior: Información */}
                                <div className="h-1/2 relative flex flex-col items-center justify-center p-12 text-center" style={{ backgroundColor: fondo }}>
                                    <div className="animate-fade-in-up w-full flex flex-col items-center justify-center relative h-full">
                                        
                                        <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight drop-shadow-2xl" style={shinyStyle}>
                                            {eventoActual.titulo}
                                        </h1>
                                        
                                        {eventoActual.cliente && (
                                            <div className="mb-8">
                                                <span 
                                                    className="inline-block px-8 py-3 rounded-full border border-white/10 text-xl font-bold uppercase tracking-wider shadow-lg"
                                                    style={{ color: acento, backgroundColor: `${acento}15`, borderColor: `${acento}50` }}
                                                >
                                                    {eventoActual.cliente}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-col items-center gap-2 mb-6">
                                            <span className="text-sm uppercase tracking-widest opacity-60" style={{ color: texto_evento }}>Horario</span>
                                            <span className="text-3xl font-mono font-bold border-b pb-1" style={{ color: texto_evento, borderColor: acento }}>
                                                {eventoActual.horario}
                                            </span>
                                        </div>
                                        
                                        {eventoActual.mensaje && (
                                            <div className="w-4/5 mx-auto bg-white/5 p-6 rounded-2xl border border-white/5">
                                                <p className="text-xl font-serif italic leading-relaxed" style={{ color: texto_evento }}>"{eventoActual.mensaje}"</p>
                                            </div>
                                        )}
                                        
                                        {/* FLECHA: Esquina inferior derecha del panel de texto */}
                                        {eventoActual.direccion && (
                                            <div className="absolute bottom-0 right-0 p-4">
                                                <div className="bg-white/5 p-3 rounded-full border-2 shadow-lg animate-bounce" style={{ borderColor: `${acento}50` }}>
                                                    <DirectionArrow direccion={eventoActual.direccion} size="w-20 h-20" color={acento} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === MODO 3: FULL SCREEN LIMPIO (Sin texto, sin flecha) === */}
                        {layoutMode === 3 && (
                             <div className="w-full h-full rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
                                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-contain z-10"/>
                                {/* Sin elementos extra */}
                            </div>
                        )}

                        {/* === MODO 2: POSTER (Con Flecha) === */}
                        {layoutMode === 2 && (
                             <div className="w-full h-full rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
                                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-contain z-10"/>
                                
                                {eventoActual.direccion && (
                                    <div className="absolute bottom-10 right-10 z-50 bg-black/80 rounded-full p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] border-4 border-white/10 animate-pulse">
                                        <DirectionArrow direccion={eventoActual.direccion} size="w-48 h-48" color={acento} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* === MODO 1: CINE (Full + Texto) === */}
                        {layoutMode === 1 && (
                            <div className="w-full h-full rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
                                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-cover z-0 opacity-90"/>
                                {!itemActual && <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center"><img src={config?.logo} className="w-1/3 opacity-10 grayscale animate-pulse" alt="Logo" /></div>}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 z-10"></div>
                                
                                <div className="absolute bottom-10 left-10 z-20 max-w-4xl p-10">
                                    <h1 className="text-7xl lg:text-9xl font-black mb-4 leading-none drop-shadow-2xl" style={{ color: texto_evento }}>{eventoActual.titulo}</h1>
                                    
                                    {eventoActual.cliente && (
                                        <div className="mb-6">
                                            <span 
                                                className="inline-block px-6 py-2 rounded-full text-2xl font-bold uppercase tracking-wider shadow-lg"
                                                style={{ backgroundColor: acento, color: fondo === '#000000' ? '#000000' : '#FFFFFF' }}
                                            >
                                                {eventoActual.cliente}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-8" style={{ color: texto_evento }}>
                                         <span className="text-3xl font-mono font-bold pl-4 border-l-4" style={{ borderColor: acento }}>
                                            {eventoActual.horario}
                                         </span>
                                    </div>
                                    
                                    {eventoActual.mensaje && <p className="mt-6 text-2xl font-serif italic max-w-2xl drop-shadow-md opacity-90" style={{ color: texto_evento }}>"{eventoActual.mensaje}"</p>}
                                </div>

                                {/* FLECHA GRANDE */}
                                {eventoActual.direccion && (
                                    <div className="absolute bottom-10 right-10 z-30 bg-white/10 p-4 rounded-full border border-white/20 backdrop-blur-md shadow-2xl animate-fade-in-up">
                                        <DirectionArrow direccion={eventoActual.direccion} size="w-40 h-40" color={acento} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* === MODO 0: NORMAL (Split + Flecha Chica) === */}
                        {layoutMode === 0 && (
                            <div className="flex w-full h-full gap-8">
                                <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
                                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-contain z-10"/>
                                    {!itemActual && <div className="absolute inset-0 flex items-center justify-center opacity-10"><img src={config?.logo} className="w-1/3 grayscale animate-pulse" alt="Logo" /></div>}
                                    
                                    {fotosActivas.length > 1 && (
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                            {fotosActivas.map((_, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${idx === indice ? 'w-6' : 'w-1.5 bg-white/30'}`} 
                                                    style={idx === indice ? { backgroundColor: acento } : {}}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center" style={{ backgroundColor: `${fondo}CC` }}>
                                    <div className="animate-fade-in-up w-full flex flex-col items-center h-full justify-center relative">
                                        
                                        <h1 className="text-5xl lg:text-7xl font-black mb-10 leading-tight drop-shadow-2xl" style={{ color: texto_evento }}>
                                            {eventoActual.titulo}
                                        </h1>
                                        
                                        {eventoActual.cliente && (
                                            <div className="mb-14">
                                                <span 
                                                    className="inline-block px-8 py-3 rounded-full border border-white/10 text-xl font-bold uppercase tracking-wider shadow-lg"
                                                    style={{ color: acento, backgroundColor: `${acento}15`, borderColor: `${acento}50` }}
                                                >
                                                    {eventoActual.cliente}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-col items-center gap-2 mb-10">
                                            <span className="text-sm uppercase tracking-widest opacity-60" style={{ color: texto_evento }}>Horario</span>
                                            <span className="text-3xl font-mono font-bold border-b pb-1" style={{ color: texto_evento, borderColor: acento }}>
                                                {eventoActual.horario}
                                            </span>
                                        </div>
                                        
                                        {eventoActual.mensaje && (
                                            <div className="w-4/5 mx-auto bg-white/5 p-6 rounded-2xl border border-white/5">
                                                <p className="text-xl font-serif italic leading-relaxed" style={{ color: texto_evento }}>"{eventoActual.mensaje}"</p>
                                            </div>
                                        )}
                                        
                                        {/* FLECHA CHICA (Solo en Modo 0) */}
                                        {eventoActual.direccion && (
                                            <div className="absolute bottom-0 right-0 p-4">
                                                <div className="bg-white/5 p-3 rounded-full border-2 shadow-lg animate-bounce" style={{ borderColor: `${acento}50` }}>
                                                    <DirectionArrow direccion={eventoActual.direccion} size="w-20 h-20" color={acento} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <footer className="h-20 relative z-20 grid grid-cols-3 items-center px-10 border-t transition-all" style={{ backgroundColor: fondo, borderColor: `${texto_evento}20` }}>
                <div className="flex justify-start opacity-50 hover:opacity-100 transition-opacity">
                    <p className="text-[11px] tracking-[0.2em] uppercase font-medium" style={{ color: texto_reloj }}>
                        Powered by <span className="font-bold" style={{ color: acento }}>narabyte.xyz</span>
                    </p>
                </div>
                <div className="flex justify-center">
                    {!eventoActual && <h2 className="text-4xl font-light tracking-[0.3em] uppercase drop-shadow-lg animate-fade-in-up font-sans" style={{ color: texto_evento }}>BIENVENIDOS</h2>}
                </div>
                <div className="flex justify-end items-center gap-6" style={{ color: texto_reloj }}>
                    <div className="text-5xl drop-shadow-lg filter pb-2">{getIconoClima(clima.codigo)}</div>
                    <div className="flex items-baseline gap-3">
                         <span className="text-4xl font-bold tracking-tighter">{clima.tempC}°C</span>
                         <div className="h-6 w-px opacity-30 bg-current"></div>
                         <div className="flex items-start opacity-60"><span className="text-2xl font-medium tracking-tighter">{clima.tempF}</span><span className="text-xs mt-1 ml-0.5">°F</span></div>
                    </div>
                </div>
            </footer>
             
             {/* TICKER */}
             {tickerText && (
                <div 
                    className="absolute bottom-0 left-0 w-full h-12 z-50 overflow-hidden flex items-center shadow-lg border-t"
                    style={{ backgroundColor: acento, borderColor: `${acento}80` }}
                >
                    <div className="flex w-full">
                         <div 
                            className="px-6 h-12 flex items-center justify-center font-black uppercase tracking-widest text-sm relative z-20 shrink-0"
                            style={{ backgroundColor: fondo, color: acento }}
                        >
                            Aviso
                        </div>
                        <div className="flex-1 overflow-hidden relative flex items-center">
                             <div className="animate-marquee whitespace-nowrap text-2xl font-bold uppercase tracking-wide" style={{ color: fondo }}>
                                {tickerText}
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}