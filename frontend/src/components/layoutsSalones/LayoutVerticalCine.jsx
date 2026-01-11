import React from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';

export default function LayoutVerticalCine({ 
    eventoActual, itemActual, videoBlobUrl, config, shinyStyle, acento, fondo, texto_evento, textoFechas 
}) {
    return (
        <div className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
            
            {/* 1. IMAGEN DE FONDO */}
            <div className="absolute inset-0 w-full h-full z-0">
                 <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover"/>
            </div>

            {!itemActual && <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center z-0"><img src={config?.logo} className="w-2/3 opacity-10 grayscale animate-pulse" alt="Logo" /></div>}
            
            {/* 2. DEGRADADO */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10 pointer-events-none"></div>
            
            {/* 3. INFO */}
            <div className="absolute bottom-0 left-0 w-full z-20 p-8 pb-12 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight drop-shadow-2xl w-full" style={shinyStyle}>{eventoActual.titulo}</h1>
                
                {eventoActual.cliente && (
                    <div className="mb-6">
                        <span className="inline-block px-6 py-2 rounded-full text-lg font-bold uppercase tracking-wider shadow-lg backdrop-blur-md bg-black/40 border border-white/20" style={{ color: acento, borderColor: `${acento}50` }}>
                            {eventoActual.cliente}
                        </span>
                    </div>
                )}
                
                <div className="flex flex-col items-center gap-1 mb-6" style={{ color: texto_evento }}>
                     <span className="text-sm uppercase tracking-widest opacity-80">Horario</span>
                     {/* FECHA */}
                     <span className="text-sm font-bold uppercase opacity-90">{textoFechas}</span>
                     
                     <span className="text-3xl font-mono font-bold border-b-2 pb-1" style={{ borderColor: acento }}>{eventoActual.horario}</span>
                </div>
                
                {eventoActual.mensaje && (
                    <p className="text-lg font-serif italic max-w-sm drop-shadow-md opacity-90 mb-4" style={{ color: texto_evento }}>
                        "{eventoActual.mensaje}"
                    </p>
                )}

                {/* Flecha Flotante */}
                {eventoActual.direccion && (
                    <div className="absolute bottom-6 right-6 z-30 animate-bounce">
                        <div className="bg-white/10 p-3 rounded-full border border-white/20 backdrop-blur-md shadow-2xl">
                            <DirectionArrow direccion={eventoActual.direccion} size="w-12 h-12" color={acento} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}