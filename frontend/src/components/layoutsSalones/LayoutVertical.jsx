import React from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';

export default function LayoutVertical({ 
    eventoActual, itemActual, videoBlobUrl, fotosActivas, indice, shinyStyle, acento, fondo, texto_evento 
}) {
    return (
        <div className="flex flex-col w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
            
            {/* MITAD SUPERIOR: IMAGEN (w-full h-full object-cover dentro del contenedor de 55%) */}
            <div className="h-[55%] relative w-full bg-black z-10">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover z-10"/>
                
                {fotosActivas.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                        {fotosActivas.map((_, idx) => (
                            <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${idx === indice ? 'w-4' : 'w-1.5 bg-white/30'}`} style={idx === indice ? { backgroundColor: acento } : {}} />
                        ))}
                    </div>
                )}
            </div>
            
            {/* MITAD INFERIOR: TEXTO */}
            <div className="h-[45%] relative flex flex-col items-center justify-center p-4 text-center z-20" style={{ backgroundColor: fondo }}>
                <div className="w-full flex flex-col items-center justify-center h-full">
                    <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight drop-shadow-2xl w-full px-2 break-words" style={shinyStyle}>
                        {eventoActual.titulo}
                    </h1>
                    
                    {eventoActual.cliente && (
                        <div className="mb-4">
                            <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-base font-bold uppercase tracking-wider shadow-lg max-w-full truncate" style={{ color: acento, backgroundColor: `${acento}15`, borderColor: `${acento}50` }}>
                                {eventoActual.cliente}
                            </span>
                        </div>
                    )}
                    
                    <div className="w-full relative flex justify-center items-center mb-4">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] uppercase tracking-widest opacity-60" style={{ color: texto_evento }}>Horario</span>
                            <span className="text-2xl font-mono font-bold border-b pb-1" style={{ color: texto_evento, borderColor: acento }}>{eventoActual.horario}</span>
                        </div>
                        {eventoActual.direccion && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 animate-bounce">
                                 <div className="bg-white/5 p-2 rounded-full border border-white/10 shadow-lg">
                                    <DirectionArrow direccion={eventoActual.direccion} size="w-10 h-10" color={acento} />
                                </div>
                            </div>
                        )}
                    </div>

                    {eventoActual.mensaje && (
                         <div className="w-full bg-white/5 p-2 rounded-xl border border-white/5 max-h-[80px] overflow-hidden">
                            <p className="text-sm font-serif italic" style={{ color: texto_evento }}>"{eventoActual.mensaje}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}