import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';
import { TEXTOS_DIRECTORIO, TEXTOS_GENERAL } from '../../utils/diccionario'; // <--- IMPORTACIÓN

export default function LayoutDirectorioHorizontalModern({ 
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
    
    // Etiqueta manual para "Bienvenidos" si queremos variar el texto por defecto del diccionario
    const labelBienvenidos = tGen.bienvenidos;

    const eventos = datos?.eventos || [];
    const noticias = datos?.noticias || [];
    const visibles = eventos.slice(pagina * 3, (pagina + 1) * 3);
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
        const totalPaginas = Math.ceil(eventos.length / 3);
        if (totalPaginas > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 12000);
            return () => clearInterval(int);
        }
    }, [eventos.length]);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden p-8 transition-all duration-500" style={{ backgroundColor: fondo }}>
            
            {/* HEADER CON TÍTULO MEJORADO */}
            <header className="flex justify-between items-center mb-8 bg-black/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Reflejo de luz sutil */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                <div className="w-1/4">
                    {config.logo && <img src={config.logo} alt="Logo" className="h-14 object-contain drop-shadow-md" />}
                </div>

                {/* --- SECCIÓN DEL TÍTULO CON EFECTO --- */}
                <div className="flex-1 text-center relative group">
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase relative z-10 animate-pulse-slow shadow-black drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] animate-fade-in-up"
                        key={`tit-${idiomaActual}`} // Forzar re-render al cambiar idioma para animación
                        style={{ 
                            background: `linear-gradient(to bottom, #FFFFFF 0%, ${acento} 50%, #FFFFFF 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))'
                        }}>
                        {/* Usamos el título del diccionario (ej: DIRECTORIO DE SERVICIOS o AGENDA) */}
                        {t.titulo}
                    </h1>
                    {/* Resplandor detrás del texto */}
                    <div className="absolute inset-0 blur-2xl opacity-20 scale-150 rounded-full" style={{ backgroundColor: acento }}></div>
                </div>

                <div className="w-1/4 text-right">
                    <span className="text-5xl font-mono font-black block leading-none tracking-tight" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {/* Fecha Localizada */}
                    <p className="text-sm font-bold uppercase tracking-[0.3em] mt-1 opacity-60" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : (idiomaActual === 'fr' ? 'fr-FR' : 'es-ES'), { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 grid grid-cols-3 gap-8 mb-8">
                {visibles.map((e, i) => {
                    // --- TRADUCCIÓN DE DATOS DINÁMICOS ---
                    const nombreEvento = (idiomaActual === 'en' && e.nombre_evento_en) ? e.nombre_evento_en : 
                                         (idiomaActual === 'fr' && e.nombre_evento_fr) ? e.nombre_evento_fr : e.nombre_evento;
                    
                    const nombreSalon = (idiomaActual === 'en' && e.nombre_salon_en) ? e.nombre_salon_en : e.nombre_salon;

                    return (
                        <div key={i} className="relative rounded-[3rem] overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-black/60 flex flex-col animate-fade-in-up shadow-[inset_0_0_20px_rgba(255,255,255,0.05),0_20px_50px_rgba(0,0,0,0.5)] border-t-white/20">
                            {/* IMAGEN Y FECHAS */}
                            <div className="h-1/2 relative">
                                <img src={e.imagenes?.[0] || config.imagen_default} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="img" />
                                
                                <div className="absolute top-6 left-6 flex flex-col items-start gap-2">
                                    <div className="bg-black/90 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/30 flex items-center gap-2 shadow-2xl">
                                        <span className="text-2xl font-mono font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ color: acento }}>
                                            {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-[10px] font-black text-white/50">-</span>
                                        <span className="text-xl font-mono font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ color: acento }}>
                                            {new Date(e.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/20 ml-1 shadow-lg">
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
                                            {/* Fecha del evento localizada */}
                                            {new Date(e.fecha_inicio).toLocaleDateString(idiomaActual === 'en' ? 'en-US' : (idiomaActual === 'fr' ? 'fr-FR' : 'es-ES'), { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* INFO EVENTO */}
                            <div className="flex-1 p-8 flex flex-col justify-between backdrop-blur-sm bg-black/40">
                                <div>
                                    <h2 className="text-3xl font-black mb-2 leading-tight drop-shadow-md transition-all duration-300" style={{ color: texto_evento }}>
                                        {nombreEvento}
                                    </h2>
                                    <p className="text-lg opacity-80 uppercase font-black tracking-widest truncate" style={{ color: texto_reloj }}>
                                        {e.cliente_nombre}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-sm font-black bg-white/10 px-6 py-2 rounded-full border border-white/20 shadow-inner transition-all duration-300" style={{ color: texto_reloj }}>
                                        {nombreSalon}
                                    </span>
                                    <DirectionArrow direction={e.direccion_reloj} color={acento} size={40} animate />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* FOOTER */}
            <footer className="h-28 flex flex-col justify-between">
                <div className="flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl drop-shadow-lg">{getIconoClima(clima?.codigo)}</span>
                        <span className="text-3xl font-black" style={{ color: texto_reloj }}>{clima?.tempC}°C</span>
                    </div>
                    {/* Bienvenidos Traducido */}
                    <span className="text-3xl font-light tracking-[1em] uppercase opacity-40 ml-20 animate-fade-in-up" key={`wel-${idiomaActual}`} style={{ color: texto_evento }}>
                        {labelBienvenidos}
                    </span>
                    <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Powered by narabyte.xyz</span>
                </div>

                <div className="h-14 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 flex items-center overflow-hidden shadow-2xl">
                    <div className="flex whitespace-nowrap animate-marquee-horizontal">
                        {[...noticias, ...noticias].map((n, i) => (
                            <div key={i} className="text-xl font-bold mx-16 flex items-center gap-4">
                                <span className="w-3 h-3 rounded-full shadow-[0_0_10px_white]" style={{ backgroundColor: acento }} />
                                <span style={{ color: acento }}>{n.titulo}:</span>
                                <span className="font-medium opacity-80 text-white">{n.descripcion}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes marquee-horizontal { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee-horizontal { animation: marquee-horizontal 120s linear infinite; }
                .animate-fade-in-up { animation: fadeInUp 0.7s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .animate-pulse-slow { animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse-slow { 0%, 100% { opacity: 1; filter: brightness(1.2); } 50% { opacity: 0.9; filter: brightness(1); } }
            `}</style>
        </div>
    );
}