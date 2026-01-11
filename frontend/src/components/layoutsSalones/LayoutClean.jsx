import React from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutClean({ 
    itemActual, videoBlobUrl, fondo, config 
}) {
    return (
        <div className="w-full h-full rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10 flex items-center justify-center" 
             style={{ backgroundColor: fondo || '#000000' }}>
            
            {/* Si hay contenido, lo mostramos */}
            {itemActual ? (
                <MediaRenderer 
                    url={itemActual} 
                    blobUrl={videoBlobUrl} 
                    className="w-full h-full object-contain z-10"
                />
            ) : (
                /* FALLBACK: Si no hay contenido, mostramos el logo pulsando */
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    {config?.logo && (
                        <img 
                            src={config.logo} 
                            className="w-1/3 opacity-10 grayscale animate-pulse" 
                            alt="Logo Default" 
                        />
                    )}
                </div>
            )}
        </div>
    );
}