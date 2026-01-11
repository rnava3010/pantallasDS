import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Hooks
import { usePantalla } from '../hooks/usePantalla';
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';

// Componentes y Utilidades
import MediaRenderer from '../components/MediaRenderer';
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

export default function PlayerDirectorio() {
    const { id } = useParams();
    // data contiene la lista filtrada por el backend (solo eventos activos del día)
    const { config, data, loading, isOnline, timeOffset, clima } = usePantalla(id);
    const horaActual = useReloj(timeOffset);

    // Estado para paginación
    const [paginaActual, setPaginaActual] = useState(0);

    // Logs
    useEffect(() => {
        if (config) logger.log(`✅ [Directorio] Configurado: "${config.nombre_interno}" Orientación: ${config.orientacion === 1 ? 'Vertical' : 'Horizontal'}`);
    }, [config]);

    // Screensaver (Se usa si la lista de eventos está vacía)
    const fotosActivas = config?.screensaver || [];
    const { itemActual } = useCarrusel(fotosActivas, 8000);
    const { videoBlobUrl } = useOfflineVideo(fotosActivas);

    // Favicon
    useEffect(() => {
        if (config?.favicon) {
            let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/x-icon'; link.rel = 'icon'; link.href = config.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [config?.favicon]);

    // --- VARIABLES Y LÓGICA ---
    const { fondo = '#000000', texto_evento = '#FFFFFF', texto_reloj = '#FFFFFF', acento = '#EAB308' } = config?.colores || {};
    
    // Si data viene vacío (porque no hay eventos hoy o ya acabaron), hayEventos será false
    const eventos = Array.isArray(data) ? data : [];
    const hayEventos = eventos.length > 0;

    // Lógica de Orientación
    const isVertical = config?.orientacion === 1;
    const paddingX = isVertical ? 'px-4' : 'px-10';
    
    // Lógica de Paginación
    const ITEMS_POR_PAGINA = isVertical ? 12 : 7; 
    const totalPaginas = Math.ceil(eventos.length / ITEMS_POR_PAGINA);

    // Ciclo de páginas automático
    useEffect(() => {
        if (totalPaginas > 1) {
            const intervalo = setInterval(() => {
                setPaginaActual((prev) => (prev + 1) % totalPaginas);
            }, 10000); // Cambia página cada 10 segundos
            return () => clearInterval(intervalo);
        } else {
            setPaginaActual(0);
        }
    }, [totalPaginas]);

    // Obtener eventos de la página actual
    const eventosVisibles = eventos.slice(
        paginaActual * ITEMS_POR_PAGINA,
        (paginaActual + 1) * ITEMS_POR_PAGINA
    );

    // Estilos dinámicos
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
            
            {/* Indicador Offline */}
            <div className={`absolute bottom-32 right-6 z-50 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-500 ${isOnline ? 'bg-green-500/40 text-green-500' : 'bg-red-600 text-red-600 animate-pulse'}`}></div>

            {/* --- HEADER --- */}
            <header className={`h-24 grid grid-cols-3 items-center ${paddingX} relative z-20 bg-gradient-to-b from-black/90 to-transparent`}>
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

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className={`flex-1 ${paddingX} py-4 relative z-10 w-full h-full overflow-hidden flex flex-col`}>
                
                {/* OPCIÓN A: MODO SCREENSAVER (Se activa si hayEventos es false) */}
                {!hayEventos && (
                    <div className={`w-full h-full rounded-[3rem] overflow-hidden relative border border-white/10 shadow-2xl`} style={{ backgroundColor: fondo }}>
                        <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-contain z-10 w-full h-full"/>
                        {!itemActual && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                                <img src={config?.logo} className="w-1/3 grayscale animate-pulse mb-4" alt="Logo" />
                                <p className="text-xl uppercase tracking-widest" style={{ color: texto_evento }}>Sin eventos por hoy</p>
                            </div>
                        )}
                    </div>
                )}

                {/* OPCIÓN B: LISTA DE EVENTOS (Se activa si hay al menos 1 evento) */}
                {hayEventos && (
                    <div className="w-full h-full flex flex-col gap-4">
                        
                        {/* Encabezados de Tabla */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-2 border-b border-white/20 text-sm font-bold uppercase tracking-widest opacity-70" style={{ color: acento }}>
                            <div className="col-span-3">Horario</div>
                            <div className="col-span-6">Evento</div>
                            <div className="col-span-3 text-right">Ubicación</div>
                        </div>

                        {/* Filas de Eventos */}
                        <div className="flex-1 flex flex-col gap-3 relative">
                            {eventosVisibles.map((evento, idx) => {
                                const horaInicio = new Date(evento.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                
                                return (
                                    <div 
                                        key={`${paginaActual}-${idx}`} 
                                        className="grid grid-cols-12 gap-4 items-center p-6 bg-white/5 border border-white/5 rounded-2xl shadow-lg backdrop-blur-sm animate-fade-in-up"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="col-span-3 font-mono text-2xl font-bold" style={{ color: acento }}>
                                            {horaInicio}
                                        </div>
                                        <div className="col-span-6 flex flex-col justify-center">
                                            <h2 className="text-2xl font-bold leading-tight" style={{ color: texto_evento }}>
                                                {evento.nombre_evento}
                                            </h2>
                                        </div>
                                        <div className="col-span-3 text-right">
                                            <span className="inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide bg-white/10 border border-white/10" style={{ color: texto_reloj }}>
                                                {evento.nombre_salon}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Paginación (Puntos) */}
                        {totalPaginas > 1 && (
                            <div className="h-8 flex items-center justify-center gap-2 mt-2">
                                {Array.from({ length: totalPaginas }).map((_, idx) => (
                                    <div 
                                        key={idx}
                                        className={`h-2 rounded-full transition-all duration-500 ${idx === paginaActual ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                                        style={idx === paginaActual ? { backgroundColor: acento } : {}}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- FOOTER --- */}
            <footer className={`h-20 relative z-20 grid grid-cols-3 items-center ${paddingX} border-t transition-all`} style={{ backgroundColor: fondo, borderColor: `${texto_evento}20` }}>
                <div className="flex justify-start opacity-50">
                    <p className="text-[10px] tracking-widest uppercase">Powered by <span className="font-bold" style={{ color: acento }}>narabyte.xyz</span></p>
                </div>
                <div className="flex justify-center">
                    <h2 className={`${isVertical ? 'text-2xl' : 'text-4xl'} font-light tracking-[0.3em] uppercase drop-shadow-lg animate-fade-in-up font-sans`} style={{ color: texto_evento }}>BIENVENIDOS</h2>
                </div>
                <div className="flex justify-end items-center gap-2" style={{ color: texto_reloj }}>
                    <div className={`${isVertical ? 'text-3xl' : 'text-5xl'} pb-1`}>{getIconoClima(clima.codigo)}</div>
                    <span className={`${isVertical ? 'text-2xl' : 'text-4xl'} font-bold`}>{clima.tempC}°C</span>
                </div>
            </footer>
        </div>
    );
}