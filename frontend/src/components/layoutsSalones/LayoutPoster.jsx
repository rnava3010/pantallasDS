// frontend/src/components/layouts/LayoutPoster.jsx
import React from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';

export default function LayoutPoster({ 
    eventoActual, itemActual, videoBlobUrl, acento, fondo 
}) {
    return (
         <div className="w-full h-full rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
            <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-contain z-10"/>
            
            {eventoActual.direccion && (
                <div className="absolute bottom-10 right-10 z-50 bg-black/80 rounded-full p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] border-4 border-white/10 animate-pulse">
                    <DirectionArrow direccion={eventoActual.direccion} size="w-48 h-48" color={acento} />
                </div>
            )}
        </div>
    );
}