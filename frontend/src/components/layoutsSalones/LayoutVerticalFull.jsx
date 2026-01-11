import React from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutVerticalFull({ 
    itemActual, videoBlobUrl, fondo, config 
}) {
    // Aseguramos un color de fondo por defecto
    const bgColor = fondo || '#000000';

    return (
        <div className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/10 flex items-center justify-center transition-colors duration-500" 
             style={{ backgroundColor: bgColor }}>
            
            {/* 1. CONTENIDO PRINCIPAL */}
            {itemActual ? (
                <MediaRenderer 
                    url={itemActual} 
                    blobUrl={videoBlobUrl} 
                    className="w-full h-full object-contain z-10"
                />
            ) : (
                /* 2. FALLBACK: Si la lista de reproducción está vacía o cargando */
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-0">
                    {config?.logo && (
                        <img 
                            src={config.logo} 
                            className="w-2/3 opacity-10 grayscale animate-pulse" 
                            alt="Logo Default" 
                        />
                    )}
                </div>
            )}
        </div>
    );
}