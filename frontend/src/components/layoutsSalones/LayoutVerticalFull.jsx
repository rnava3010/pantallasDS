import React from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutVerticalFull({ 
    itemActual, videoBlobUrl, fondo 
}) {
    return (
         <div className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
            {/* object-contain: Muestra todo el flyer sin recortar. 
                object-cover: Llena toda la pantalla (puede recortar bordes). */}
            <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-contain z-10"/>
        </div>
    );
}