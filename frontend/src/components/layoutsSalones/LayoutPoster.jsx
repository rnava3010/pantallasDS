// frontend/src/components/layouts/LayoutPoster.jsx
import React from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';

export default function LayoutPoster({ 
    eventoActual, itemActual, videoBlobUrl, config 
}) {
    // Extraemos colores de config o usamos defaults
    const fondo = config?.colores?.fondo || '#000000';
    const acento = config?.colores?.acento || '#EAB308';
    const logo = config?.logo;

    return (
        <div className="w-full h-full rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10 flex items-center justify-center transition-all duration-500" 
             style={{ backgroundColor: fondo }}>
            
            {/* 1. CONTENIDO MULTIMEDIA */}
            {itemActual ? (
                <MediaRenderer 
                    url={itemActual} 
                    blobUrl={videoBlobUrl} 
                    className="w-full h-full object-contain z-10"
                />
            ) : (
                /* 2. FALLBACK: Logo pulsando si no hay imagen */
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-0">
                    {logo && (
                        <img 
                            src={logo} 
                            className="w-1/3 opacity-10 grayscale animate-pulse" 
                            alt="Logo Default" 
                        />
                    )}
                </div>
            )}
            
            {/* 3. FLECHA DE DIRECCIÓN (Overlay) */}
            {eventoActual?.direccion && (
                <div className="absolute bottom-10 right-10 z-50 animate-fade-in-up">
                    <div className="bg-black/80 backdrop-blur-md rounded-full p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)] border-4 border-white/10 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                        <DirectionArrow 
                            direccion={eventoActual.direccion} 
                            size="w-40 h-40" 
                            color={acento} 
                            animate // Asegura que la flecha tenga su propia animación interna si el componente lo soporta
                        />
                    </div>
                </div>
            )}

            <style>{`
                .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(40px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
}