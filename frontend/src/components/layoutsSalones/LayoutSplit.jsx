// frontend/src/components/layouts/LayoutSplit.jsx
import React from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';

export default function LayoutSplit({ 
    eventoActual, itemActual, videoBlobUrl, config, fotosActivas, indice, texto_evento, acento, fondo 
}) {
    return (
        <div className="flex w-full h-full gap-8">
            <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-contain z-10"/>
                {!itemActual && <div className="absolute inset-0 flex items-center justify-center opacity-10"><img src={config?.logo} className="w-1/3 grayscale animate-pulse" alt="Logo" /></div>}
                
                {fotosActivas.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                        {fotosActivas.map((_, idx) => (
                            <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${idx === indice ? 'w-6' : 'w-1.5 bg-white/30'}`} style={idx === indice ? { backgroundColor: acento } : {}} />
                        ))}
                    </div>
                )}
            </div>
            
            <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center" style={{ backgroundColor: `${fondo}CC` }}>
                <div className="animate-fade-in-up w-full flex flex-col items-center h-full justify-center relative">
                    <h1 className="text-5xl lg:text-7xl font-black mb-10 leading-tight drop-shadow-2xl" style={{ color: texto_evento }}>{eventoActual.titulo}</h1>
                    
                    {eventoActual.cliente && (
                        <div className="mb-14">
                            <span className="inline-block px-8 py-3 rounded-full border border-white/10 text-xl font-bold uppercase tracking-wider shadow-lg" style={{ color: acento, backgroundColor: `${acento}15`, borderColor: `${acento}50` }}>
                                {eventoActual.cliente}
                            </span>
                        </div>
                    )}
                    
                    <div className="flex flex-col items-center gap-2 mb-10">
                        <span className="text-sm uppercase tracking-widest opacity-60" style={{ color: texto_evento }}>Horario</span>
                        <span className="text-3xl font-mono font-bold border-b pb-1" style={{ color: texto_evento, borderColor: acento }}>{eventoActual.horario}</span>
                    </div>
                    
                    {eventoActual.mensaje && (
                        <div className="w-4/5 mx-auto bg-white/5 p-6 rounded-2xl border border-white/5">
                            <p className="text-xl font-serif italic leading-relaxed" style={{ color: texto_evento }}>"{eventoActual.mensaje}"</p>
                        </div>
                    )}
                    
                    {eventoActual.direccion && (
                        <div className="absolute bottom-0 right-0 p-4">
                            <div className="bg-white/5 p-3 rounded-full border-2 shadow-lg animate-bounce" style={{ borderColor: `${acento}50` }}>
                                <DirectionArrow direccion={eventoActual.direccion} size="w-20 h-20" color={acento} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}