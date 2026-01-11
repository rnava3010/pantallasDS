// frontend/src/components/layouts/LayoutClean.jsx
import React from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutClean({ 
    itemActual, videoBlobUrl, fondo 
}) {
    return (
         <div className="w-full h-full rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10" style={{ backgroundColor: fondo }}>
            <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-contain z-10"/>
        </div>
    );
}