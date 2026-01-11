import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Hooks
import { usePantalla } from '../hooks/usePantalla';
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';

// Componentes y Utilidades
import MediaRenderer from '../components/MediaRenderer';
import DirectionArrow from './DirectionArrow'; // Asegúrate de que este archivo exista
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

// --- SUB-COMPONENTE: Mini Galería para la Fila ---
const FilaGaleria = ({ imagenes }) => {
    const [indice, setIndice] = useState(0);

    useEffect(() => {
        if (!imagenes || imagenes.length <= 1) return;
        const timer = setInterval(() => {
            setIndice(prev => (prev + 1) % imagenes.length);
        }, 4000); // Cambia foto cada 4 segundos
        return () => clearInterval(timer);
    }, [imagenes]);

    if (!imagenes || imagenes.length === 0) return null;

    return (
        <div className="h-24 w-36 rounded-lg overflow-hidden relative shadow-md bg-black/20 flex-shrink-0">
             <img 
                src={imagenes[indice]} 
                alt="Evento" 
                className="w-full h-full object-cover animate-fade-in"
                key={indice} 
             />
             {imagenes.length > 1 && (
                 <div className="absolute bottom-1 right-1 text-[8px] bg-black/50 text-white px-1 rounded font-mono">
                     {indice + 1}/{imagenes.length}
                 </div>
             )}
        </div>
    );
};

export default function PlayerDirectorio() {
    const { id } = useParams();
    
    // Obtenemos 'data' (la lista de eventos) desde el hook usePantalla
    const { config, eventoActual: data, loading, isOnline, timeOffset, clima } = usePantalla(id);
    const horaActual = useReloj(timeOffset);
    const [paginaActual, setPaginaActual] = useState(0);

    // Logs de configuración (Solo al inicio)
    useEffect(() => {
        if (config) logger.log(`✅ [Directorio] Configurado: "${config.nombre_interno}" Orientación: ${config.orientacion === 1 ? 'Vertical' : 'Horizontal'}`);
    }, [config]);

    // Screensaver (Carrusel de imágenes si no hay eventos)
    const fotosActivas = config?.screensaver || [];
    const { itemActual } = useCarrusel(fotosActivas, 8000);
    const { videoBlobUrl } = useOfflineVideo(fotosActivas);

    // Favicon Dinámico
    useEffect(() => {
        if (config?.favicon) {
            let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/x-icon'; link.rel = 'icon'; link.href = config.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [config?.favicon]);

    // --- PROCESAMIENTO DE DATOS ---
    const { fondo = '#000000', texto_evento = '#FFFFFF', texto_reloj = '#FFFFFF', acento = '#EAB308' } = config?.colores || {};
    
    // Normalizamos la data para obtener siempre un array
    let listaFinal = [];
    if (Array.isArray(data)) {
        listaFinal = data; 
    } else if (data && Array.isArray(data.eventos)) {
        listaFinal = data.eventos; 
    } else if (data && Array.isArray(data.data)) {
        listaFinal = data.data; 
    }

    const eventos = listaFinal;
    const hayEventos = eventos.length > 0;

    // Configuración de visualización
    const isVertical = config?.orientacion === 1;
    const paddingX = isVertical ? 'px-4' : 'px-10';
    
    // Items por página (Ajustado para que quepan con imágenes)
    const ITEMS_POR_PAGINA = isVertical ? 9 : 5; 
    const totalPaginas = Math.ceil(eventos.length / ITEMS_POR_PAGINA);

    // Ciclo de páginas automático
    useEffect(() => {
        if (totalPaginas > 1) {
            const intervalo = setInterval(() => {
                setPaginaActual((prev) => (prev + 1) % totalPaginas);
            }, 12000); // 12 segundos por página
            return () => clearInterval(intervalo);
        } else {
            setPaginaActual(0);
        }
    }, [totalPaginas]);

    const eventosVisibles = eventos.slice(paginaActual * ITEMS_POR_PAGINA, (paginaActual + 1) * ITEMS_POR_PAGINA);

    // Estilos dinámicos
    const colorBrillante = lightenColor(acento, 40);
    const shinyStyle = {
        backgroundImage: `linear-gradient(to right, ${acento}, ${colorBrillante}, ${acento})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: `drop-shadow(0 0 2px ${acento})`
    };

    // Pantalla de Carga
    if (loading && !config) return <div className="bg-black h-screen flex items-center justify-center text-white animate-pulse">Cargando Directorio...</div>;

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden font-sans relative transition-colors duration-1000" style={{ backgroundColor: fondo }}>
            
            {/* Indicador de Estado (Online/Offline) */}
            <div className={`absolute bottom-32 right-6 z-50 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-500 ${isOnline ? 'bg-green-500/40 text-green-500' : 'bg-red-600 text-red-600 animate-pulse'}`}></div>

            {/* HEADER */}
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

            {/* CONTENIDO PRINCIPAL */}
            <div className={`flex-1 ${paddingX} py-4 relative z-10 w-full h-full overflow-hidden flex flex-col`}>
                
                {/* A. MODO SCREENSAVER (Sin eventos) */}
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

                {/* B. LISTA DE EVENTOS */}
                {hayEventos && (
                    <div className="w-full h-full flex flex-col gap-3">
                        
                        {/* Encabezados de Tabla */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-2 border-b border-white/20 text-sm font-bold uppercase tracking-widest opacity-70" style={{ color: acento }}>
                            <div className="col-span-2">Horario</div>
                            <div className="col-span-7">Evento</div>
                            <div className="col-span-3 text-right pr-4">Ubicación</div>
                        </div>

                        {/* Filas */}
                        <div className="flex-1 flex flex-col gap-3 relative">
                            {eventosVisibles.map((evento, idx) => {
                                const horaInicio = new Date(evento.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                
                                // ✅ LÓGICA DE IMAGEN: Evento > Default Terminal > Nada
                                let imagenesEvento = [];
                                if (evento.imagenes && evento.imagenes.length > 0) {
                                    imagenesEvento = evento.imagenes;
                                } else if (config?.imagen_default) {
                                    imagenesEvento = [config.imagen_default];
                                }

                                return (
                                    <div 
                                        key={`${paginaActual}-${idx}`} 
                                        className="grid grid-cols-12 gap-4 items-center p-4 bg-white/5 border border-white/5 rounded-2xl shadow-lg backdrop-blur-sm animate-fade-in-up"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        {/* 1. HORARIO */}
                                        <div className="col-span-2 font-mono text-xl font-bold" style={{ color: acento }}>
                                            {horaInicio}
                                        </div>
                                        
                                        {/* 2. INFO + IMAGEN */}
                                        <div className="col-span-7 flex items-center gap-5">
                                            {/* Galería / Imagen Default */}
                                            {imagenesEvento.length > 0 && (
                                                <FilaGaleria imagenes={imagenesEvento} />
                                            )}

                                            <div className="flex flex-col justify-center min-w-0">
                                                {/* Tipo de Evento (Tag) */}
                                                {evento.tipo_evento && (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 border border-white/20 px-2 py-0.5 rounded-full w-fit" style={{ color: acento, borderColor: acento }}>
                                                        {evento.tipo_evento}
                                                    </span>
                                                )}

                                                {/* Nombre Principal */}
                                                <h2 className="text-2xl font-bold leading-tight truncate pr-2" style={{ color: texto_evento }}>
                                                    {evento.nombre_evento}
                                                </h2>
                                                
                                                {/* Cliente (Subtítulo) */}
                                                {evento.cliente_nombre && (
                                                    <span className="text-sm opacity-80 uppercase tracking-wide mt-1 truncate" style={{ color: texto_reloj }}>
                                                        {evento.cliente_nombre}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* 3. UBICACIÓN + FLECHA */}
                                        <div className="col-span-3 flex items-center justify-end gap-3">
                                            <span className="inline-block px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide bg-white/10 border border-white/10 text-right truncate max-w-[140px]" style={{ color: texto_reloj }}>
                                                {evento.nombre_salon}
                                            </span>
                                            
                                            {/* Flecha Animada */}
                                            <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center">
                                                 <DirectionArrow 
                                                    direction={evento.direccion_reloj} 
                                                    color={acento} 
                                                    size={32} 
                                                    animate={true} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Paginación (Dots) */}
                        {totalPaginas > 1 && (
                            <div className="h-6 flex items-center justify-center gap-2 mt-1">
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

            {/* FOOTER */}
            <footer className={`h-20 relative z-20 grid grid-cols-3 items-center ${paddingX} border-t transition-all`} style={{ backgroundColor: fondo, borderColor: `${texto_evento}20` }}>
                <div className="flex justify-start opacity-50"><p className="text-[10px] tracking-widest uppercase">Powered by <span className="font-bold" style={{ color: acento }}>narabyte.xyz</span></p></div>
                <div className="flex justify-center"><h2 className={`${isVertical ? 'text-2xl' : 'text-4xl'} font-light tracking-[0.3em] uppercase drop-shadow-lg font-sans`} style={{ color: texto_evento }}>BIENVENIDOS</h2></div>
                <div className="flex justify-end items-center gap-2" style={{ color: texto_reloj }}>
                    <div className={`${isVertical ? 'text-3xl' : 'text-5xl'} pb-1`}>{getIconoClima(clima.codigo)}</div>
                    <span className={`${isVertical ? 'text-2xl' : 'text-4xl'} font-bold`}>{clima.tempC}°C</span>
                </div>
            </footer>
        </div>
    );
}