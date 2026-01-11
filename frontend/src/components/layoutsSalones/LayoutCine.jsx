// frontend/src/components/layouts/LayoutCine.jsx
import React from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';

export default function LayoutCine({ 
    eventoActual, itemActual, videoBlobUrl, config, texto_evento, acento, fondo 
}) {
    return (
        <div className="w-full h-full rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
            <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-cover z-0 opacity-90"/>
            {!itemActual && <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center"><img src={config?.logo} className="w-1/3 opacity-10 grayscale animate-pulse" alt="Logo" /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 z-10"></div>
            
            <div className="absolute bottom-10 left-10 z-20 max-w-4xl p-10">
                <h1 className="text-7xl lg:text-9xl font-black mb-4 leading-none drop-shadow-2xl" style={{ color: texto_evento }}>{eventoActual.titulo}</h1>
                
                {eventoActual.cliente && (
                    <div className="mb-6">
                        <span className="inline-block px-6 py-2 rounded-full text-2xl font-bold uppercase tracking-wider shadow-lg" style={{ backgroundColor: acento, color: fondo === '#000000' ? '#000000' : '#FFFFFF' }}>
                            {eventoActual.cliente}
                        </span>
                    </div>
                )}
                
                <div className="flex items-center gap-8" style={{ color: texto_evento }}>
                     <span className="text-3xl font-mono font-bold pl-4 border-l-4" style={{ borderColor: acento }}>{eventoActual.horario}</span>
                </div>
                
                {eventoActual.mensaje && <p className="mt-6 text-2xl font-serif italic max-w-2xl drop-shadow-md opacity-90" style={{ color: texto_evento }}>"{eventoActual.mensaje}"</p>}
            </div>

            {eventoActual.direccion && (
                <div className="absolute bottom-10 right-10 z-30 bg-white/10 p-4 rounded-full border border-white/20 backdrop-blur-md shadow-2xl animate-fade-in-up">
                    <DirectionArrow direccion={eventoActual.direccion} size="w-40 h-40" color={acento} />
                </div>
            )}
        </div>
    );
}