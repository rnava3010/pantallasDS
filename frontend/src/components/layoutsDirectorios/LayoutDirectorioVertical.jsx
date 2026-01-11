import React from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';

export default function LayoutDirectorioVertical({ 
    eventosVisibles, 
    config, 
    noticias, 
    itemActual, 
    videoBlobUrl, 
    FilaGaleria 
}) {
    const { texto_evento, texto_reloj, acento } = config.colores;

    return (
        <div className="flex-1 flex flex-col gap-4 min-h-0">
            
            {/* 1. SECCIÓN DE LISTA DE EVENTOS (Modo Vertical) */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex flex-col gap-3">
                    {eventosVisibles.map((evento, idx) => (
                        <div 
                            key={idx} 
                            className="flex flex-col p-4 bg-white/5 border border-white/5 rounded-2xl shadow-lg animate-fade-in-up"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Fila Superior: Horas y Flecha */}
                            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                                <div className="flex items-center gap-3" style={{ color: acento }}>
                                    <span className="font-mono font-bold text-xl">
                                        {new Date(evento.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="opacity-40 text-xs uppercase">a</span>
                                    <span className="font-mono font-bold text-xl">
                                        {new Date(evento.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="shrink-0">
                                    <DirectionArrow direction={evento.direction_reloj || evento.direccion_reloj} color={acento} size={28} animate={true} />
                                </div>
                            </div>

                            {/* Fila Inferior: Miniatura y Textos */}
                            <div className="flex gap-4 items-center min-w-0">
                                <FilaGaleria 
                                    imagenes={evento.imagenes?.length > 0 ? evento.imagenes : (config.imagen_default ? [config.imagen_default] : [])} 
                                    isVertical={true} 
                                />
                                <div className="flex flex-col min-w-0 flex-1">
                                    <h2 className="text-xl font-bold leading-tight truncate mb-1" style={{ color: texto_evento }}>
                                        {evento.nombre_evento}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-tighter bg-white/10 px-2 py-0.5 rounded text-white/70">
                                            {evento.nombre_salon}
                                        </span>
                                        {evento.cliente_nombre && (
                                            <span className="text-[10px] opacity-50 truncate italic" style={{ color: texto_reloj }}>
                                                {evento.cliente_nombre}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. SECCIÓN DE WIDGETS INFERIORES (Apilados Verticalmente) */}
            <div className="h-[42%] shrink-0 flex flex-col gap-4">
                
                {/* WIDGET: Galería / Screensaver */}
                <div className="relative flex-1 rounded-3xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
                    <MediaRenderer 
                        url={itemActual} 
                        blobUrl={videoBlobUrl} 
                        className="absolute inset-0 w-full h-full object-cover" 
                    />
                </div>

                {/* WIDGET: Noticias */}
                <div className="relative flex-1 rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl flex flex-col">
                    <div className="px-4 py-2 border-b border-white/10 bg-black/20 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ backgroundColor: acento, color: '#000' }}>
                            NOTICIAS
                        </span>
                    </div>
                    
                    <div className="flex-1 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full animate-marquee-vertical">
                            {[...noticias, ...noticias].map((noticia, idx) => (
                                <div key={idx} className="p-3 border-b border-white/5 flex flex-col gap-1">
                                    <h3 className="text-base font-black leading-tight" style={{ color: acento }}>
                                        {noticia.titulo}
                                    </h3>
                                    <p className="text-[10px] leading-snug opacity-70" style={{ color: texto_evento }}>
                                        {noticia.descripcion}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Estilos locales */}
            <style>{`
                @keyframes marquee-vertical {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                .animate-marquee-vertical {
                    animation: marquee-vertical 60s linear infinite;
                }
            `}</style>
        </div>
    );
}