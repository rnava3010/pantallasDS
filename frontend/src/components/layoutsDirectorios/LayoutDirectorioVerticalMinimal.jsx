import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';
import { TEXTOS_DIRECTORIO, TEXTOS_GENERAL } from '../../utils/diccionario'; // <--- IMPORTACIÓN

export default function LayoutDirectorioVerticalMinimal({ 
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
    
    // Etiquetas traducidas
    const labelHorario = t.horario || (idiomaActual === 'en' ? 'TIME' : 'HORARIO');
    const labelBienvenidos = tGen.bienvenidos;

    const eventos = datos?.eventos || [];
    const noticias = datos?.noticias || [];
    const visibles = eventos.slice(pagina * 5, (pagina + 1) * 5);
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
        const totalPaginas = Math.ceil(eventos.length / 5);
        if (totalPaginas > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 12000);
            return () => clearInterval(int);
        }
    }, [eventos.length]);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden font-sans p-6 transition-all duration-500" style={{ backgroundColor: fondo }}>
            <div className="flex-1 flex flex-col bg-white/5 rounded-[4rem] border border-white/10 overflow-hidden shadow-2xl relative">
                
                {/* HEADER */}
                <header className="p-10 flex justify-between items-center border-b border-white/10">
                    <img src={config.logo} alt="Logo" className="h-12 object-contain" />
                    <div className="text-right">
                        <span className="text-5xl font-black block leading-none" style={{ color: texto_reloj }}>
                            {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {/* Fecha Localizada */}
                        <span className="text-sm font-bold opacity-50 uppercase tracking-widest mt-2 block" style={{ color: texto_reloj }}>
                            {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : (idiomaActual === 'fr' ? 'fr-FR' : 'es-ES'), { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                </header>

                {/* LISTA DE EVENTOS */}
                <main className="flex-1 p-10 flex flex-col gap-6">
                    {visibles.map((e, i) => {
                        // --- TRADUCCIÓN DE DATOS DINÁMICOS ---
                        const nombreEvento = (idiomaActual === 'en' && e.nombre_evento_en) ? e.nombre_evento_en : 
                                             (idiomaActual === 'fr' && e.nombre_evento_fr) ? e.nombre_evento_fr : e.nombre_evento;
                        
                        const nombreSalon = (idiomaActual === 'en' && e.nombre_salon_en) ? e.nombre_salon_en : e.nombre_salon;

                        return (
                            <div key={i} className="flex items-center gap-8 border-b border-white/5 pb-6 last:border-0 animate-fade-in-up">
                                <div className="text-center min-w-[110px]">
                                    <span className="text-3xl font-black block" style={{ color: acento }}>
                                        {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {/* Etiqueta Horario Traducida */}
                                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest animate-fade-in-up" key={`time-${idiomaActual}`} style={{ color: texto_reloj }}>
                                        {labelHorario}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-2xl font-black truncate leading-tight transition-all duration-300" style={{ color: texto_evento }}>
                                        {nombreEvento}
                                    </h2>
                                    <p className="text-sm opacity-50 uppercase font-bold mt-1 transition-all duration-300" style={{ color: texto_reloj }}>
                                        {nombreSalon}
                                    </p>
                                </div>
                                <DirectionArrow direction={e.direccion_reloj} color={acento} size={32} animate />
                            </div>
                        );
                    })}
                </main>

                {/* FOOTER INTERNO CON MEDIA */}
                <div className="h-[30%] relative">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                    <div className="absolute bottom-8 left-10 right-10 flex justify-between items-end">
                        <div className="flex items-center gap-4">
                            <span className="text-5xl">{getIconoClima(clima?.codigo)}</span>
                            <span className="text-3xl font-bold text-white">{clima?.tempC}°C</span>
                        </div>
                        {/* LEYENDA BIENVENIDOS TRADUCIDA */}
                        <span className="text-sm font-black text-white/40 uppercase tracking-[0.5em] animate-pulse" key={`wel-${idiomaActual}`}>
                            {labelBienvenidos}
                        </span>
                    </div>
                </div>
            </div>

            {/* MARQUEE ULTRA LENTO (100s) */}
            <footer className="h-16 flex items-center overflow-hidden">
                <div className="flex whitespace-nowrap animate-marquee-slow">
                    {[...noticias, ...noticias].map((n, i) => (
                        <div key={i} className="text-lg font-bold mx-12 flex items-center gap-4" style={{ color: texto_reloj }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: acento }} />
                            <span style={{ color: acento }}>{n.titulo}:</span>
                            <span className="font-normal opacity-60 text-white">{n.descripcion}</span>
                        </div>
                    ))}
                </div>
            </footer>

            <style>{`
                @keyframes marquee-slow { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee-slow { animation: marquee-slow 100s linear infinite; }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(15px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
}