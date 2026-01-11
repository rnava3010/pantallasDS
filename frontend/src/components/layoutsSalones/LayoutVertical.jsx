// frontend/src/components/layouts/LayoutVertical.jsx
import React from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';

export default function LayoutVertical({ 
    eventoActual, itemActual, videoBlobUrl, config, fotosActivas, indice, shinyStyle, acento, fondo, texto_evento 
}) {
    return (
        <div className="flex flex-col w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
            
            {/* 1. IMAGEN (60% de altura para que luzca más) */}
            <div className="h-[60%] relative w-full bg-black z-10">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-cover z-10"/>
                
                {/* Dots del carrusel */}
                {fotosActivas.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                        {fotosActivas.map((_, idx) => (
                            <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${idx === indice ? 'w-4' : 'w-1.5 bg-white/30'}`} style={idx === indice ? { backgroundColor: acento } : {}} />
                        ))}
                    </div>
                )}
            </div>
            
            {/* 2. INFORMACIÓN (40% de altura) - Usamos z-20 para asegurar que esté sobre cualquier borde */}
            <div className="h-[40%] relative flex flex-col items-center justify-center p-4 text-center z-20" style={{ backgroundColor: fondo }}>
                <div className="animate-fade-in-up w-full flex flex-col items-center justify-center relative h-full">
                    
                    {/* Título: Reducido a text-4xl/5xl para que quepa */}
                    <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight drop-shadow-2xl break-words w-full px-2" style={shinyStyle}>
                        {eventoActual.titulo}
                    </h1>
                    
                    {eventoActual.cliente && (
                        <div className="mb-4">
                            <span 
                                className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-base font-bold uppercase tracking-wider shadow-lg max-w-full truncate"
                                style={{ color: acento, backgroundColor: `${acento}15`, borderColor: `${acento}50` }}
                            >
                                {eventoActual.cliente}
                            </span>
                        </div>
                    )}
                    
                    <div className="flex flex-col items-center gap-1 mb-3">
                        <span className="text-[10px] uppercase tracking-widest opacity-60" style={{ color: texto_evento }}>Horario</span>
                        <span className="text-2xl font-mono font-bold border-b pb-1" style={{ color: texto_evento, borderColor: acento }}>
                            {eventoActual.horario}
                        </span>
                    </div>
                    
                    {eventoActual.mensaje && (
                        <div className="w-full bg-white/5 p-3 rounded-xl border border-white/5 overflow-y-auto max-h-[80px]">
                            <p className="text-sm font-serif italic leading-relaxed" style={{ color: texto_evento }}>"{eventoActual.mensaje}"</p>
                        </div>
                    )}
                    
                    {/* Flecha: Flotante en la esquina inferior derecha (Sin Texto) */}
                    {eventoActual.direccion && (
                        <div className="absolute bottom-2 right-2 animate-bounce">
                             <div className="bg-white/5 p-2 rounded-full border border-white/10 shadow-lg">
                                <DirectionArrow direccion={eventoActual.direccion} size="w-10 h-10" color={acento} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}