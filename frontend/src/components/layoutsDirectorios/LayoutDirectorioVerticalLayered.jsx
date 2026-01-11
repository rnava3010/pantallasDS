import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';
import { TEXTOS_DIRECTORIO, TEXTOS_GENERAL } from '../../utils/diccionario'; // <--- IMPORTACIÓN

export default function LayoutDirectorioVerticalLayered({ 
    config, datos, horaActual, isOnline, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    const [langIndex, setLangIndex] = useState(0); // <--- ESTADO IDIOMA
    
    if (!config || !config.colores || !horaActual) return null;

    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    
    // --- LÓGICA DE IDIOMAS ---
    const idiomasActivos = config.idiomas_activos || ['es'];
    const idiomaActual = idiomasActivos[langIndex];
    
    // Diccionarios
    const t = TEXTOS_DIRECTORIO[idiomaActual] || TEXTOS_DIRECTORIO['es'];
    const tGen = TEXTOS_GENERAL[idiomaActual] || TEXTOS_GENERAL['es'];
    
    const eventos = datos?.eventos || [];
    const visibles = eventos.slice(pagina * 6, (pagina + 1) * 6);
    const TIEMPO_ROTACION_IDIOMA = (config.tiempo_rotacion || 20) * 1000;

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
        const totalPaginas = Math.ceil(eventos.length / 6);
        if (totalPaginas > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 12000);
            return () => clearInterval(int);
        }
    }, [eventos.length]);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden p-4 relative transition-all duration-500" style={{ backgroundColor: fondo }}>
            
            {/* Background Decorativo sutil */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

            {/* VIDEO TOP (Sección superior con clima y hora) */}
            <div className="h-[35%] w-full relative rounded-[3.5rem] overflow-hidden border border-white/20 shadow-2xl mb-6">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
                
                <div className="absolute top-8 left-8">
                    {config.logo && <img src={config.logo} alt="Logo" className="h-10 object-contain drop-shadow-xl" />}
                </div>
                
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end text-white">
                    <div>
                        <span className="text-6xl font-black block leading-none drop-shadow-lg">
                            {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {/* Fecha Localizada */}
                        <span className="text-sm font-bold opacity-60 uppercase tracking-[0.3em] ml-1">
                            {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : (idiomaActual === 'fr' ? 'fr-FR' : 'es-ES'), { weekday: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="text-right bg-black/20 backdrop-blur-md p-3 rounded-3xl border border-white/10">
                        <span className="text-4xl block leading-none">{getIconoClima(clima?.codigo)}</span>
                        <span className="text-xl font-black">{clima?.tempC}°C</span>
                    </div>
                </div>
            </div>

            {/* EVENTOS (Tarjetas con imagen y horario completo) */}
            <div className="flex-1 flex flex-col gap-3 px-2 overflow-hidden">
                <div className="flex justify-between items-center mb-2 px-4">
                    {/* Título Traducido */}
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] animate-fade-in-up" key={`tit-${idiomaActual}`} style={{ color: acento }}>
                        {t.titulo || (idiomaActual === 'en' ? 'Events Agenda' : 'Agenda de Eventos')}
                    </h2>
                    <div className="h-px flex-1 mx-6 bg-white/10"></div>
                </div>

                {visibles.map((e, i) => {
                    // --- TRADUCCIÓN DE DATOS DINÁMICOS ---
                    const nombreEvento = (idiomaActual === 'en' && e.nombre_evento_en) ? e.nombre_evento_en : 
                                         (idiomaActual === 'fr' && e.nombre_evento_fr) ? e.nombre_evento_fr : e.nombre_evento;
                    
                    const nombreSalon = (idiomaActual === 'en' && e.nombre_salon_en) ? e.nombre_salon_en : e.nombre_salon;

                    return (
                        <div key={i} className="flex items-center gap-4 p-3 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl animate-fade-in-up">
                            
                            {/* IMAGEN DEL EVENTO */}
                            <div className="h-16 w-16 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-black/40">
                                <img src={e.imagenes?.[0] || config.imagen_default} className="w-full h-full object-cover" alt="logo-evento" />
                            </div>

                            {/* INFO CENTRAL: Horario y Nombre */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-black" style={{ color: acento }}>
                                        {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-[10px] opacity-30 font-bold">→</span>
                                    <span className="text-sm font-bold opacity-60" style={{ color: acento }}>
                                        {new Date(e.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="ml-2 text-[10px] font-black opacity-40 border-l border-white/20 pl-2 uppercase">
                                        {/* Fecha Evento Localizada */}
                                        {new Date(e.fecha_inicio).toLocaleDateString(idiomaActual === 'en' ? 'en-US' : (idiomaActual === 'fr' ? 'fr-FR' : 'es-ES'), { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-black truncate leading-tight transition-all duration-300" style={{ color: texto_evento }}>
                                    {nombreEvento}
                                </h3>
                                
                                <p className="text-[10px] font-bold uppercase opacity-50 tracking-wider transition-all duration-300" style={{ color: texto_reloj }}>
                                    {nombreSalon}
                                </p>
                            </div>

                            {/* INDICADOR DE DIRECCIÓN */}
                            <div className="pr-2">
                                <DirectionArrow direction={e.direccion_reloj} color={acento} size={28} animate />
                            </div>
                        </div>
                    );
                })}
            </div>

            <footer className="h-12 flex items-center justify-center">
                {/* Bienvenidos Traducido */}
                <span className="text-[10px] font-black tracking-[1em] opacity-20 uppercase animate-pulse" key={`wel-${idiomaActual}`}>
                    {tGen.bienvenidos}
                </span>
            </footer>

            <style>{`
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(15px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
}