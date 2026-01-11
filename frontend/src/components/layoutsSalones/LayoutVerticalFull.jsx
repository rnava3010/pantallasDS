import React from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutVerticalFull({ 
    itemActual, videoBlobUrl, fondo 
}) {
    return (
         <div className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
            {/* Corrección: w-full h-full para llenar el contenedor */}
            <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-contain z-10"/>
        </div>
    );
}