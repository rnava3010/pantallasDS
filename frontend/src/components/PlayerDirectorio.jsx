import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Hooks
import { usePantalla } from '../hooks/usePantalla';
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';

// Componentes
import MediaRenderer from '../components/MediaRenderer';
import DirectionArrow from './DirectionArrow';
import { getIconoClima } from '../utils/weatherUtils';
import logger from '../utils/logger';

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

// --- SUB-COMPONENTE: Mini Galería ---
const FilaGaleria = ({ imagenes }) => {
    const [indice, setIndice] = useState(0);
    useEffect(() => {
        if (!imagenes || imagenes.length <= 1) return;
        const timer = setInterval(() => setIndice(p => (p + 1) % imagenes.length), 4000);
        return () => clearInterval(timer);
    }, [imagenes]);

    if (!imagenes || imagenes.length === 0) return null;

    return (
        <div className="h-24 w-36 rounded-lg overflow-hidden relative shadow-md bg-gray-700 flex-shrink-0 border border-white/10">
             <img 
                src={imagenes[indice]} 
                alt="Evento" 
                className="w-full h-full object-cover animate-fade-in" 
                key={indice}
                onError={(e) => { 
                    console.warn("⚠️ Imagen rota:", imagenes[indice]); 
                    e.target.style.display = 'none'; 
                }}
             />
        </div>
    );
};

// --- SUB-COMPONENTE: Ticker de Noticias ---
const NewsTicker = ({ noticias, colorTitulo, colorTexto }) => {
    // LOG DE DEBUG PARA NOTICIAS
    useEffect(() => {
        if (noticias && noticias.length > 0) {
            console.log("📰 [NewsTicker] Renderizando noticias:", noticias);
        } else {
            console.warn("⚠️ [NewsTicker] No hay noticias para mostrar");
        }
    }, [noticias]);

    if (!noticias || noticias.length === 0) return (
        <div className="w-full h-full flex items-center justify-center border border-white/10 rounded-[2rem] bg-white/5">
            <span className="opacity-50 text-sm">Sin noticias</span>
        </div>
    );

    return (
        <div className="w-full h-full relative overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2 bg-black/20">
                <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ backgroundColor: colorTitulo, color: '#000' }}>
                    NOTICIAS
                </span>
                <span className="text-xs opacity-70 uppercase tracking-wide" style={{ color: colorTexto }}>
                    Al momento
                </span>
            </div>
            
            <div className="flex-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full animate-marquee-vertical">
                    {[...noticias, ...noticias].map((noticia, idx) => (
                        <div key={idx} className="p-4 border-b border-white/5 flex gap-3">
                            <span className="text-lg font-bold opacity-30 select-none">•</span>
                            <p className="text-lg leading-snug font-medium" style={{ color: colorTexto }}>
                                {noticia}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`@keyframes marquee-vertical { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } } .animate-marquee-vertical { animation: marquee-vertical 40s linear infinite; }`}</style>
        </div>
    );
};

export default function PlayerDirectorio() {
    const { id } = useParams();
    const { config, eventoActual: data, loading, isOnline, timeOffset, clima } = usePantalla(id);
    const horaActual = useReloj(timeOffset);
    const [paginaActual, setPaginaActual] = useState(0);

    // Logs de Configuración
    useEffect(() => {
        if (config) logger.log(`✅ [Directorio] Configurado: "${config.nombre_interno}"`);
    }, [config]);

    // ✅ LOGS DE DATOS RECIBIDOS (Aquí verás qué llega del backend)
    useEffect(() => {
        if (data) {
            console.group("📡 [PlayerDirectorio] Datos Recibidos");
            console.log("Estructura completa:", data);
            console.log("¿Es Array?", Array.isArray(data));
            console.log("Tipo Datos:", data.tipo_datos);
            console.log("Eventos:", data.eventos);
            console.log("Noticias:", data.noticias);
            console.groupEnd();
        }
    }, [data]);

    // Screensaver
    const fotosTerminal = config?.screensaver || [];
    const { itemActual } = useCarrusel(fotosTerminal, 8000);
    const { videoBlobUrl } = useOfflineVideo(fotosTerminal);

    // Favicon
    useEffect(() => {
        if (config?.favicon) {
            let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/x-icon'; link.rel = 'icon'; link.href = config.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [config?.favicon]);

    // --- PROCESAMIENTO DE DATOS ---
    const { fondo = '#000000', texto_evento = '#FFFFFF', texto_reloj = '#FFFFFF', acento = '#EAB308' } = config?.colores || {};
    
    let eventos = [];
    let noticias = [];
    
    if (data) {
        if (Array.isArray(data)) {
            eventos = data;
        } else if (data.tipo_datos === 'DIRECTORIO') {
            eventos = data.eventos || [];
            noticias = data.noticias || [];
        } else if (Array.isArray(data.eventos)) {
            eventos = data.eventos;
        }
    }

    const hayEventos = eventos.length > 0;
    const isVertical = config?.orientacion === 1;
    const paddingX = isVertical ? 'px-4' : 'px-10';
    
    const ITEMS_POR_PAGINA = isVertical ? 7 : 4; 
    const totalPaginas = Math.ceil(eventos.length / ITEMS_POR_PAGINA);

    useEffect(() => {
        if (totalPaginas > 1) {
            const intervalo = setInterval(() => {
                setPaginaActual((prev) => (prev + 1) % totalPaginas);
            }, 12000); 
            return () => clearInterval(intervalo);
        } else {
            setPaginaActual(0);
        }
    }, [totalPaginas]);

    const eventosVisibles = eventos.slice(paginaActual * ITEMS_POR_PAGINA, (paginaActual + 1) * ITEMS_POR_PAGINA);

    const colorBrillante = lightenColor(acento, 40);
    const shinyStyle = {
        backgroundImage: `linear-gradient(to right, ${acento}, ${colorBrillante}, ${acento})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: `drop-shadow(0 0 2px ${acento})`
    };

    if (loading && !config) return <div className="bg-black h-screen flex items-center justify-center text-white animate-pulse">Cargando Directorio...</div>;

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden font-sans relative transition-colors duration-1000" style={{ backgroundColor: fondo }}>
            
            <div className={`absolute bottom-32 right-6 z-50 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-500 ${isOnline ? 'bg-green-500/40 text-green-500' : 'bg-red-600 text-red-600 animate-pulse'}`}></div>

            {/* HEADER */}
            <header className={`h-24 grid grid-cols-3 items-center ${paddingX} relative z-20 bg-gradient-to-b from-black/90 to-transparent shrink-0`}>
                <div className="flex justify-start">
                    {config?.logo && <img src={config.logo} alt="Logo" className={`${isVertical ? 'h-16' : 'h-20'} w-auto object-contain animate-float`} />}
                </div>
                <div className="flex justify-center w-full">
                    <div className={`py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl w-full flex justify-center ${isVertical ? 'px-4' : 'px-12'}`}>
                        <h1 className={`${isVertical ? 'text-2xl' : 'text-4xl'} font-bold tracking-widest uppercase drop-shadow-sm whitespace-nowrap text-ellipsis overflow-hidden`} style={shinyStyle}>
                            DIRECTORIO DE EVENTOS
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

            {/* CONTENIDO PRINCIPAL */}
            <div className={`flex-1 ${paddingX} py-4 relative z-10 w-full min-h-0 overflow-hidden flex flex-col gap-4`}>
                
                {/* 1. ÁREA DE LISTA */}
                <div className="flex-1 min-h-0 flex flex-col gap-3">
                    
                    {!hayEventos && (
                         <div className={`w-full h-full rounded-[3rem] overflow-hidden relative border border-white/10 shadow-2xl`} style={{ backgroundColor: fondo }}>
                            <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-contain z-10 w-full h-full"/>
                            {!itemActual && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                                    <img src={config?.logo} className="w-1/3 grayscale animate-pulse mb-4" alt="Logo" />
                                    <p className="text-xl uppercase tracking-widest" style={{ color: texto_evento }}>Sin eventos programados</p>
                                </div>
                            )}
                        </div>
                    )}

                    {hayEventos && (
                        <>
                            <div className="grid grid-cols-12 gap-4 px-6 py-2 border-b border-white/20 text-sm font-bold uppercase tracking-widest opacity-70 shrink-0" style={{ color: acento }}>
                                <div className="col-span-2 text-center">Horario</div>
                                <div className="col-span-7">Evento</div>
                                <div className="col-span-3 text-right pr-4">Ubicación</div>
                            </div>

                            <div className="flex-1 relative overflow-y-auto scrollbar-hide">
                                <div className="flex flex-col gap-3">
                                    {eventosVisibles.map((evento, idx) => {
                                        const horaInicio = new Date(evento.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        const horaFin = new Date(evento.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        
                                        let imagenesEvento = [];
                                        if (evento.imagenes && evento.imagenes.length > 0) imagenesEvento = evento.imagenes;
                                        else if (config?.imagen_default) imagenesEvento = [config.imagen_default];

                                        return (
                                            <div 
                                                key={`${paginaActual}-${idx}`} 
                                                className="grid grid-cols-12 gap-4 items-center p-3 bg-white/5 border border-white/5 rounded-2xl shadow-lg backdrop-blur-sm animate-fade-in-up"
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                {/* HORARIO VERTICAL */}
                                                <div className="col-span-2 flex flex-col justify-center items-center" style={{ color: acento }}>
                                                    <span className="font-mono text-xl font-bold leading-none">{horaInicio}</span>
                                                    <span className="text-[10px] opacity-60 uppercase tracking-widest my-0.5">a</span>
                                                    <span className="font-mono text-xl font-bold leading-none">{horaFin}</span>
                                                </div>

                                                <div className="col-span-7 flex items-center gap-5">
                                                    {imagenesEvento.length > 0 && <FilaGaleria imagenes={imagenesEvento} />}
                                                    <div className="flex flex-col justify-center min-w-0">
                                                        {evento.tipo_evento && <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 border border-white/20 px-2 py-0.5 rounded-full w-fit" style={{ color: acento, borderColor: acento }}>{evento.tipo_evento}</span>}
                                                        <h2 className="text-2xl font-bold leading-tight truncate pr-2" style={{ color: texto_evento }}>{evento.nombre_evento}</h2>
                                                        {evento.cliente_nombre && <span className="text-sm opacity-80 uppercase tracking-wide mt-1 truncate" style={{ color: texto_reloj }}>{evento.cliente_nombre}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-span-3 flex items-center justify-end gap-3">
                                                    <span className="inline-block px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide bg-white/10 border border-white/10 text-right truncate max-w-[140px]" style={{ color: texto_reloj }}>{evento.nombre_salon}</span>
                                                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center">
                                                         <DirectionArrow direction={evento.direccion_reloj} color={acento} size={32} animate={true} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Paginación */}
                            {totalPaginas > 1 && (
                                <div className="h-6 shrink-0 flex items-center justify-center gap-2 mt-1">
                                    {Array.from({ length: totalPaginas }).map((_, idx) => (
                                        <div key={idx} className={`h-2 rounded-full transition-all duration-500 ${idx === paginaActual ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} style={idx === paginaActual ? { backgroundColor: acento } : {}} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 2. ÁREA INFERIOR (Widgets) */}
                {hayEventos && (
                    <div className="h-64 shrink-0 grid grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                        
                        {/* WIDGET IZQUIERDO: Galería "Limpia" */}
                        <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black/40">
                             <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-cover w-full h-full"/>
                        </div>

                        {/* WIDGET DERECHO: Noticias */}
                        <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-md">
                            <NewsTicker noticias={noticias} colorTitulo={acento} colorTexto={texto_evento} />
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <footer className={`h-16 shrink-0 relative z-20 grid grid-cols-3 items-center ${paddingX} border-t transition-all`} style={{ backgroundColor: fondo, borderColor: `${texto_evento}20` }}>
                <div className="flex justify-start opacity-50"><p className="text-[10px] tracking-widest uppercase">Powered by <span className="font-bold" style={{ color: acento }}>narabyte.xyz</span></p></div>
                <div className="flex justify-center"><h2 className={`${isVertical ? 'text-2xl' : 'text-3xl'} font-light tracking-[0.3em] uppercase drop-shadow-lg font-sans`} style={{ color: texto_evento }}>BIENVENIDOS</h2></div>
                <div className="flex justify-end items-center gap-2" style={{ color: texto_reloj }}>
                    <div className={`${isVertical ? 'text-2xl' : 'text-4xl'} pb-1`}>{getIconoClima(clima.codigo)}</div>
                    <span className={`${isVertical ? 'text-xl' : 'text-3xl'} font-bold`}>{clima.tempC}°C</span>
                </div>
            </footer>
        </div>
    );
}