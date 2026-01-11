import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';
import { TEXTOS_DIRECTORIO, TEXTOS_GENERAL } from '../../utils/diccionario'; // <--- IMPORTACIÓN

export default function LayoutDirectorioHorizontalSide({ 
    config, datos, horaActual, isOnline, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    const [langIndex, setLangIndex] = useState(0); // <--- ESTADO IDIOMA
    
    if (!config || !config.colores || !datos || !horaActual) return null;

    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    
    // --- LÓGICA DE IDIOMAS ---
    const idiomasActivos = config.idiomas_activos || ['es'];
    const idiomaActual = idiomasActivos[langIndex];
    
    // Diccionarios
    const t = TEXTOS_DIRECTORIO[idiomaActual] || TEXTOS_DIRECTORIO['es'];
    const tGen = TEXTOS_GENERAL[idiomaActual] || TEXTOS_GENERAL['es'];
    
    const eventos = datos?.eventos || [];
    const noticias = datos?.noticias || [];
    const TIEMPO_ROTACION_IDIOMA = (config.tiempo_rotacion || 20) * 1000;
    
    // Mostramos 5 eventos para que quepan bien con imágenes
    const ITEMS_POR_PAGINA = 5;
    const visibles = eventos.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    // --- EFECTO 1: Rotación de Idiomas ---
    useEffect(() => {
        if (idiomasActivos.length > 1) {
            const int = setInterval(() => {
                setLangIndex(prev => (prev + 1) % idiomasActivos.length);
            }, TIEMPO_ROTACION_IDIOMA);
            return () => clearInterval(int);
        }
    }, [idiomasActivos.length, TIEMPO_ROTACION_IDIOMA]);

    // --- EFECTO 2: Paginación ---
    useEffect(() => {
        const totalPaginas = Math.ceil(eventos.length / ITEMS_POR_PAGINA);
        if (totalPaginas > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 12000);
            return () => clearInterval(int);
        }
    }, [eventos.length]);

    return (
        <div className="flex h-screen w-screen overflow-hidden p-6 gap-6 transition-all duration-500" style={{ backgroundColor: fondo }}>
            
            {/* IZQUIERDA: Contenido de Eventos (60%) */}
            <div className="w-[62%] flex flex-col gap-6">
                <header className="flex justify-between items-center bg-black/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                    <img src={config.logo} alt="Logo" className="h-12 object-contain" />
                    <div className="flex flex-col items-end">
                        <span className="text-5xl font-mono font-black block leading-none" style={{ color: texto_reloj }}>
                            {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {/* Fecha Localizada */}
                        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mt-1" style={{ color: texto_reloj }}>
                            {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : (idiomaActual === 'fr' ? 'fr-FR' : 'es-ES'), { weekday: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </header>

                <div className="flex-1 flex flex-col gap-3 min-h-0">
                    {/* Título Traducido */}
                    <h1 className="text-xl font-black uppercase tracking-[0.4em] mb-1 opacity-80 animate-fade-in-up" 
                        key={`tit-${idiomaActual}`}
                        style={{ color: acento }}>
                        {t.titulo}
                    </h1>
                    
                    {visibles.map((e, i) => {
                        // --- TRADUCCIÓN DE DATOS DINÁMICOS ---
                        const nombreEvento = (idiomaActual === 'en' && e.nombre_evento_en) ? e.nombre_evento_en : 
                                             (idiomaActual === 'fr' && e.nombre_evento_fr) ? e.nombre_evento_fr : e.nombre_evento;
                        
                        const nombreSalon = (idiomaActual === 'en' && e.nombre_salon_en) ? e.nombre_salon_en : e.nombre_salon;

                        return (
                            <div key={i} className="flex items-center p-3 bg-gradient-to-r from-white/5 to-transparent border-l-4 rounded-r-2xl animate-fade-in-up shadow-lg backdrop-blur-sm" 
                                 style={{ borderLeftColor: acento }}>
                                
                                {/* MINIATURA DEL EVENTO */}
                                <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/20">
                                    <img src={e.imagenes?.[0] || config.imagen_default} className="w-full h-full object-cover" alt="img" />
                                </div>

                                <div className="w-24 text-center shrink-0">
                                    <span className="text-lg font-mono font-black block" style={{ color: acento }}>
                                        {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {/* Etiqueta 'Inicio' traducida (usamos 'hora' del diccionario de salones o directo) */}
                                    <span className="text-[10px] font-bold opacity-40 uppercase">
                                        {idiomaActual === 'en' ? 'Start' : (idiomaActual === 'fr' ? 'Début' : 'Inicio')}
                                    </span>
                                </div>

                                <div className="flex-1 px-4 min-w-0">
                                    <h2 className="text-xl font-black truncate leading-tight transition-all duration-300" style={{ color: texto_evento }}>
                                        {nombreEvento}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black uppercase bg-white/10 px-2 py-0.5 rounded text-white/70 tracking-tighter transition-all duration-300">
                                            {nombreSalon}
                                        </span>
                                        <span className="text-[10px] font-bold opacity-40 truncate" style={{ color: texto_reloj }}>{e.cliente_nombre}</span>
                                    </div>
                                </div>

                                <div className="px-4">
                                    <DirectionArrow direction={e.direccion_reloj} color={acento} size={32} animate />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* NOTICIAS: VELOCIDAD REDUCIDA A 90s */}
                <footer className="h-16 bg-black/60 backdrop-blur-xl rounded-[1.5rem] border border-white/10 flex items-center overflow-hidden px-6 shadow-2xl">
                    <div className="flex whitespace-nowrap animate-marquee-slow">
                        {[...noticias, ...noticias].map((n, i) => (
                            <div key={i} className="mx-12 font-bold text-base flex items-center gap-3" style={{ color: texto_reloj }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: acento }} />
                                <span style={{ color: acento }}>{n.titulo}:</span>
                                <span className="font-normal opacity-70 italic text-white">{n.descripcion}</span>
                            </div>
                        ))}
                    </div>
                </footer>
            </div>

            {/* DERECHA: Galería / Video (38%) */}
            <div className="w-[38%] flex flex-col">
                <div className="flex-1 relative rounded-[3.5rem] overflow-hidden border-2 border-white/10 shadow-2xl bg-black">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                    
                    {/* Overlay de clima sobre el video */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    
                    <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center text-center px-6">
                        <div className="flex items-center gap-4 mb-2 bg-black/40 backdrop-blur-md p-6 rounded-full border border-white/10">
                            <span className="text-6xl drop-shadow-2xl">{getIconoClima(clima?.codigo)}</span>
                            <div className="text-left">
                                <span className="text-4xl font-black block leading-none text-white">{clima?.tempC}°C</span>
                                {/* Etiqueta Clima Traducida */}
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-white/60 animate-fade-in-up" key={`weather-${idiomaActual}`}>
                                    {t.clima || (idiomaActual === 'en' ? 'Weather' : (idiomaActual === 'fr' ? 'Météo' : 'Clima'))}
                                </span>
                            </div>
                        </div>
                        {/* Bienvenidos Traducido */}
                        <p className="text-2xl font-light tracking-[0.6em] uppercase text-white/40 mt-4 animate-pulse" key={`wel-${idiomaActual}`}>
                            {tGen.bienvenidos}
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee-slow { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee-slow { animation: marquee-slow 90s linear infinite; }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}