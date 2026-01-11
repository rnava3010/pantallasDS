import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { TEXTOS_SALONES } from '../../utils/diccionario'; // <--- IMPORTACIÓN

export default function LayoutVertical({ 
    eventoActual, itemActual, videoBlobUrl, config, fotosActivas, indice, shinyStyle, acento, fondo, texto_evento, textoFechas 
}) {
    // Estado para ciclo de idiomas
    const [langIndex, setLangIndex] = useState(0);

    // Configuración de idiomas
    const idiomasActivos = config?.idiomas_activos || ['es'];
    const idiomaActual = idiomasActivos[langIndex];
    const TIEMPO_ROTACION_IDIOMA = (config?.tiempo_rotacion || 20) * 1000;

    // Diccionario de etiquetas
    const t = TEXTOS_SALONES[idiomaActual] || TEXTOS_SALONES['es'];
    const labelHorario = t.hora || (idiomaActual === 'en' ? 'Time' : (idiomaActual === 'fr' ? 'Horaire' : 'Horario'));

    // --- EFECTO: Rotación de Idiomas ---
    useEffect(() => {
        if (idiomasActivos.length > 1) {
            const int = setInterval(() => {
                setLangIndex(prev => (prev + 1) % idiomasActivos.length);
            }, TIEMPO_ROTACION_IDIOMA);
            return () => clearInterval(int);
        }
    }, [idiomasActivos.length, TIEMPO_ROTACION_IDIOMA]);

    // --- TRADUCCIÓN DE DATOS DINÁMICOS ---
    const titulo = (idiomaActual === 'en' && eventoActual.titulo_en) ? eventoActual.titulo_en : 
                   (idiomaActual === 'fr' && eventoActual.titulo_fr) ? eventoActual.titulo_fr : eventoActual.titulo;

    const cliente = (idiomaActual === 'en' && eventoActual.cliente_en) ? eventoActual.cliente_en : 
                    (idiomaActual === 'fr' && eventoActual.cliente_fr) ? eventoActual.cliente_fr : eventoActual.cliente;

    const mensaje = (idiomaActual === 'en' && eventoActual.mensaje_en) ? eventoActual.mensaje_en : 
                    (idiomaActual === 'fr' && eventoActual.mensaje_fr) ? eventoActual.mensaje_fr : eventoActual.mensaje;

    // Fecha Localizada (si hay fecha inicio real, la usa; si no, fallback a textoFechas)
    const fechaFormateada = eventoActual.fecha_inicio 
        ? new Date(eventoActual.fecha_inicio).toLocaleDateString(
            idiomaActual === 'en' ? 'en-US' : (idiomaActual === 'fr' ? 'fr-FR' : 'es-ES'), 
            { weekday: 'short', day: 'numeric', month: 'long' }
          )
        : textoFechas;

    return (
        <div className="flex flex-col w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 transition-all duration-500" style={{ backgroundColor: fondo }}>
            
            {/* MITAD SUPERIOR: IMAGEN (55%) */}
            <div className="h-[55%] relative w-full bg-black z-10">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover z-10"/>
                
                {fotosActivas.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                        {fotosActivas.map((_, idx) => (
                            <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${idx === indice ? 'w-4' : 'w-1.5 bg-white/30'}`} 
                                 style={idx === indice ? { backgroundColor: acento } : {}} />
                        ))}
                    </div>
                )}
            </div>
            
            {/* MITAD INFERIOR: TEXTO (45%) */}
            <div className="h-[45%] relative flex flex-col items-center justify-center p-4 text-center z-20" style={{ backgroundColor: fondo }}>
                <div className="w-full flex flex-col items-center justify-center h-full">
                    
                    {/* TÍTULO TRADUCIDO */}
                    <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight drop-shadow-2xl w-full px-2 break-words animate-fade-in-up" 
                        key={`tit-${idiomaActual}`}
                        style={shinyStyle}>
                        {titulo}
                    </h1>
                    
                    {/* CLIENTE TRADUCIDO */}
                    {cliente && (
                        <div className="mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-base font-bold uppercase tracking-wider shadow-lg max-w-full truncate transition-all duration-300" 
                                  style={{ color: acento, backgroundColor: `${acento}15`, borderColor: `${acento}50` }}>
                                {cliente}
                            </span>
                        </div>
                    )}
                    
                    <div className="w-full relative flex justify-center items-center mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex flex-col items-center gap-1">
                            {/* ETIQUETA HORARIO TRADUCIDA */}
                            <span className="text-[10px] uppercase tracking-widest opacity-60 transition-all duration-300" style={{ color: texto_evento }}>
                                {labelHorario}
                            </span>
                            
                            {/* FECHA LOCALIZADA */}
                            <span className="text-xs font-bold uppercase opacity-90 mb-1 transition-all duration-300" key={`date-${idiomaActual}`} style={{ color: texto_evento }}>
                                {fechaFormateada}
                            </span>
                            
                            <span className="text-2xl font-mono font-bold border-b pb-1" style={{ color: texto_evento, borderColor: acento }}>
                                {eventoActual.horario}
                            </span>
                        </div>
                        
                        {/* FLECHA */}
                        {eventoActual.direccion && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 animate-bounce">
                                 <div className="bg-white/5 p-2 rounded-full border border-white/10 shadow-lg">
                                    <DirectionArrow direccion={eventoActual.direccion} size="w-10 h-10" color={acento} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MENSAJE TRADUCIDO */}
                    {mensaje && (
                        <div className="w-full bg-white/5 p-2 rounded-xl border border-white/5 max-h-[80px] overflow-hidden animate-fade-in-up" 
                             style={{ animationDelay: '0.3s' }}>
                            <p className="text-sm font-serif italic transition-all duration-300" style={{ color: texto_evento }}>
                                "{mensaje}"
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
}