import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { TEXTOS_SALONES } from '../../utils/diccionario';

export default function LayoutSplit({ 
    eventoActual, itemActual, videoBlobUrl, config, fotosActivas, indice, texto_evento, acento, fondo, textoFechas 
}) {
    const [langIndex, setLangIndex] = useState(0);
    const idiomasActivos = config?.idiomas_activos || ['es'];
    const idiomaActual = idiomasActivos[langIndex];
    const TIEMPO_ROTACION_IDIOMA = (config?.tiempo_rotacion || 20) * 1000;

    // Diccionario etiquetas
    const t = TEXTOS_SALONES?.[idiomaActual] || TEXTOS_SALONES?.['es'] || {};
    const labelHorario = t.hora || (idiomaActual === 'en' ? 'Time' : 'Horario');

    useEffect(() => {
        if (idiomasActivos.length > 1) {
            const int = setInterval(() => setLangIndex(p => (p + 1) % idiomasActivos.length), TIEMPO_ROTACION_IDIOMA);
            return () => clearInterval(int);
        }
    }, [idiomasActivos.length, TIEMPO_ROTACION_IDIOMA]);

    // Traducciones
    const titulo = (idiomaActual === 'en' && eventoActual.titulo_en) ? eventoActual.titulo_en : 
                   (idiomaActual === 'fr' && eventoActual.titulo_fr) ? eventoActual.titulo_fr : eventoActual.titulo;
    const cliente = (idiomaActual === 'en' && eventoActual.cliente_en) ? eventoActual.cliente_en : 
                    (idiomaActual === 'fr' && eventoActual.cliente_fr) ? eventoActual.cliente_fr : eventoActual.cliente;
    const mensaje = (idiomaActual === 'en' && eventoActual.mensaje_en) ? eventoActual.mensaje_en : 
                    (idiomaActual === 'fr' && eventoActual.mensaje_fr) ? eventoActual.mensaje_fr : eventoActual.mensaje;

    // Fecha Inteligente
    const fechaFormateada = eventoActual.fecha_inicio 
        ? new Date(eventoActual.fecha_inicio).toLocaleDateString(idiomaActual === 'en'?'en-US':'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
        : textoFechas;

    return (
        <div className="flex w-full h-full gap-8 transition-all duration-500">
            {/* IZQUIERDA: MEDIA */}
            <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-contain z-10 w-full h-full"/>
                {!itemActual && <div className="absolute inset-0 flex items-center justify-center opacity-10"><img src={config?.logo} className="w-1/3 grayscale animate-pulse" alt="logo"/></div>}
                
                {fotosActivas.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                        {fotosActivas.map((_, idx) => (
                            <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === indice ? 'w-6' : 'w-1.5 bg-white/30'}`} style={idx === indice ? { backgroundColor: acento } : {}} />
                        ))}
                    </div>
                )}
            </div>
            
            {/* DERECHA: INFO */}
            <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center" 
                 style={{ backgroundColor: `${fondo}CC` }}>
                
                {/* Agregamos pb-20 para que el texto nunca baje hasta tocar la flecha */}
                <div className="w-full flex flex-col items-center h-full justify-center relative pb-20">
                    
                    <h1 className="text-5xl lg:text-7xl font-black mb-10 leading-tight drop-shadow-2xl animate-fade-in-up" key={`tit-${idiomaActual}`} style={{ color: texto_evento }}>
                        {titulo}
                    </h1>
                    
                    {cliente && (
                        <div className="mb-14 animate-fade-in-up">
                            <span className="inline-block px-8 py-3 rounded-full border border-white/10 text-xl font-bold uppercase tracking-wider shadow-lg" style={{ color: acento, backgroundColor: `${acento}15`, borderColor: `${acento}50` }}>
                                {cliente}
                            </span>
                        </div>
                    )}
                    
                    <div className="flex flex-col items-center gap-2 mb-10 animate-fade-in-up">
                        <span className="text-sm uppercase tracking-widest opacity-60" style={{ color: texto_evento }}>{labelHorario}</span>
                        <span className="text-sm font-bold uppercase opacity-80" key={`date-${idiomaActual}`}>{fechaFormateada}</span>
                        <span className="text-3xl font-mono font-bold border-b pb-1" style={{ color: texto_evento, borderColor: acento }}>
                            {eventoActual.horario}
                        </span>
                    </div>
                    
                    {mensaje && (
                        <div className="w-4/5 mx-auto bg-white/5 p-6 rounded-2xl border border-white/5 animate-fade-in-up">
                            <p className="text-xl font-serif italic leading-relaxed" style={{ color: texto_evento }}>"{mensaje}"</p>
                        </div>
                    )}
                </div>

                {/* FLECHA: MÁS ABAJO Y A LA DERECHA */}
                {eventoActual.direccion && (
                    <div className="absolute bottom-4 right-4 z-50 animate-bounce">
                        <div className="bg-white/5 p-3 rounded-full border border-white/10 shadow-lg backdrop-blur-sm">
                            <DirectionArrow direccion={eventoActual.direccion} size="w-16 h-16" color={acento} />
                        </div>
                    </div>
                )}
            </div>

            <style>{`.animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; } @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}