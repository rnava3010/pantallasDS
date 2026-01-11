import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';
import { TEXTOS_DIRECTORIO, TEXTOS_GENERAL } from '../../utils/diccionario'; // <--- IMPORTACIÓN

export default function LayoutDirectorioHorizontal({ 
    config, datos, horaActual, isOnline, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    const [langIndex, setLangIndex] = useState(0); // <--- ESTADO IDIOMA

    if (!config || !config.colores || !datos || !horaActual) return null;

    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    
    // --- LÓGICA DE IDIOMAS ---
    const idiomasActivos = config.idiomas_activos || ['es'];
    const idiomaActual = idiomasActivos[langIndex];
    
    // Seleccionamos textos del diccionario
    const t = TEXTOS_DIRECTORIO[idiomaActual] || TEXTOS_DIRECTORIO['es'];
    const tGen = TEXTOS_GENERAL[idiomaActual] || TEXTOS_GENERAL['es'];

    // Etiqueta local para Noticias (puedes agregarla al diccionario después si prefieres)
    const labelNoticias = idiomaActual === 'en' ? 'NEWS' : (idiomaActual === 'fr' ? 'ACTUALITÉS' : 'NOTICIAS');

    const eventos = datos?.eventos || [];
    const noticias = datos?.noticias || [];
    const visibles = eventos.slice(pagina * 4, (pagina + 1) * 4);

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

    // --- EFECTO 2: Paginación de Eventos ---
    useEffect(() => {
        const totalPaginas = Math.ceil(eventos.length / 4);
        if (totalPaginas > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 12000);
            return () => clearInterval(int);
        }
    }, [eventos.length]);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden relative transition-all duration-500" style={{ backgroundColor: fondo }}>
            
            {/* HEADER */}
            <header className="h-24 flex justify-between items-center px-10 shrink-0 z-20 bg-black/60 backdrop-blur-xl border-b border-white/10">
                <img src={config.logo} alt="Logo" className="h-16 w-auto object-contain" />
                <div className="px-8 py-2 rounded-full border border-white/20 bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    {/* Título Traducido */}
                    <h1 className="text-3xl font-black tracking-widest uppercase animate-fade-in-up" key={`tit-${idiomaActual}`} style={{ color: acento }}>
                        {t.titulo}
                    </h1>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-5xl font-mono font-black leading-none drop-shadow-lg" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {/* Fecha Traducida */}
                    <span className="text-sm font-bold uppercase tracking-[0.2em] mt-1" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : (idiomaActual === 'fr' ? 'fr-FR' : 'es-ES'), { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 px-10 py-6 flex flex-col gap-6 overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Encabezados de Tabla Traducidos */}
                    <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-black/40 rounded-t-3xl border-x border-t border-white/10 text-sm font-black uppercase tracking-widest transition-all" style={{ color: acento }}>
                        <div className="col-span-3 text-center">{t.horario} / {tGen.bienvenidos === 'Welcome' ? 'DATE' : (tGen.bienvenidos === 'Bienvenue' ? 'DATE' : 'FECHA')}</div>
                        <div className="col-span-6 pl-12">{t.lugar}</div> {/* Usamos 'Lugar' o 'Evento' según diccionario */}
                        <div className="col-span-3 text-right pr-8">{t.ubicacion}</div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col gap-4 mt-2">
                        {visibles.map((e, i) => {
                            // --- TRADUCCIÓN DE DATOS DINÁMICOS ---
                            // Busca nombre_en, nombre_fr, etc. Si no existe, usa el default.
                            const nombreEvento = (idiomaActual === 'en' && e.nombre_evento_en) ? e.nombre_evento_en : 
                                                 (idiomaActual === 'fr' && e.nombre_evento_fr) ? e.nombre_evento_fr : e.nombre_evento;
                            
                            const nombreSalon = (idiomaActual === 'en' && e.nombre_salon_en) ? e.nombre_salon_en : e.nombre_salon;

                            return (
                                <div 
                                    key={i} 
                                    className="grid grid-cols-12 gap-4 items-center p-4 bg-gradient-to-br from-white/10 to-black/40 backdrop-blur-md border border-white/10 rounded-2xl animate-fade-in-up shadow-[inset_0_0_20px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)] border-t-white/30"
                                >
                                    {/* COLUMNA HORARIO */}
                                    <div className="col-span-3 flex flex-col items-center justify-center border-r border-white/10 py-1">
                                        <div className="flex items-center gap-3 bg-black/40 px-4 py-1 rounded-full border border-white/10 shadow-inner">
                                            <span className="font-mono text-2xl font-black" style={{ color: acento }}>
                                                {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-xs font-black opacity-40">-</span>
                                            <span className="font-mono text-2xl font-black opacity-80" style={{ color: acento }}>
                                                {new Date(e.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <span className="mt-2 text-sm font-black uppercase tracking-widest text-white/90">
                                            {/* Fecha del evento localizada */}
                                            {new Date(e.fecha_inicio).toLocaleDateString(idiomaActual === 'en' ? 'en-US' : (idiomaActual === 'fr' ? 'fr-FR' : 'es-ES'), { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>

                                    {/* COLUMNA EVENTO */}
                                    <div className="col-span-6 flex items-center gap-6 pl-6 min-w-0">
                                        <div className="h-20 w-32 rounded-xl overflow-hidden shrink-0 border-2 border-white/20 shadow-lg bg-black/40">
                                            <img src={e.imagenes?.[0] || config.imagen_default} className="w-full h-full object-cover" alt="ev" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h2 className="text-3xl font-black leading-tight drop-shadow-md transition-all duration-300" style={{ color: texto_evento }}>
                                                {nombreEvento}
                                            </h2>
                                            <span className="text-sm font-bold opacity-70 uppercase tracking-wide" style={{ color: texto_reloj }}>
                                                {e.cliente_nombre}
                                            </span>
                                        </div>
                                    </div>

                                    {/* COLUMNA SALON */}
                                    <div className="col-span-3 flex items-center justify-end gap-6 pr-4">
                                        <span className="text-sm font-black uppercase bg-white/10 px-5 py-2 rounded-xl border border-white/20 shadow-inner text-center transition-all duration-300" style={{ color: texto_reloj }}>
                                            {nombreSalon}
                                        </span>
                                        <DirectionArrow direction={e.direccion_reloj} color={acento} size={40} animate />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FOOTER WIDGETS */}
                <div className="h-60 shrink-0 grid grid-cols-2 gap-8 mb-4">
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/20 bg-black/60 shadow-2xl">
                        <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    </div>
                    
                    {/* WIDGET NOTICIAS */}
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/20 bg-black/50 backdrop-blur-xl flex flex-col shadow-2xl shadow-white/5">
                        <div className="px-6 py-3 border-b border-white/10 bg-white/5">
                            {/* Título Noticias Traducido */}
                            <span className="text-xs font-black uppercase tracking-widest animate-fade-in-up" key={`news-${idiomaActual}`} style={{ color: acento }}>
                                {labelNoticias}
                            </span>
                        </div>
                        <div className="flex-1 relative overflow-hidden">
                            <div className="absolute top-0 w-full animate-marquee-vertical">
                                {[...noticias, ...noticias].map((n, i) => (
                                    <div key={i} className="p-5 border-b border-white/5 mx-4">
                                        <h3 className="text-xl font-black mb-1" style={{ color: acento }}>{n.titulo}</h3>
                                        <p className="text-sm font-bold opacity-80 text-white">{n.descripcion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* FOOTER */}
            <footer className="h-14 border-t border-white/10 px-10 flex justify-between items-center shrink-0 bg-black/60 backdrop-blur-xl">
                <span className="w-1/4 text-[10px] font-bold uppercase opacity-40">Powered by narabyte.xyz</span>
                <div className="flex-1 flex justify-center">
                    {/* Bienvenidos Traducido */}
                    <span className="text-2xl font-light tracking-[0.6em] uppercase opacity-80 animate-fade-in-up" key={`wel-${idiomaActual}`} style={{ color: texto_evento }}>
                        {tGen.bienvenidos}
                    </span>
                </div>
                <div className="w-1/4 flex items-center justify-end gap-4" style={{ color: texto_reloj }}>
                    <span className="text-3xl drop-shadow-md">{getIconoClima(clima?.codigo)}</span>
                    <span className="font-black text-xl">{clima?.tempC}°C</span>
                </div>
            </footer>

            <style>{`
                @keyframes marquee-vertical { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
                .animate-marquee-vertical { animation: marquee-vertical 50s linear infinite; }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
            `}</style>
        </div>
    );
}