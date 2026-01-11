import React from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';

export default function LayoutDirectorioHorizontal({ 
    eventosVisibles, 
    config, 
    noticias, 
    itemActual, 
    videoBlobUrl, 
    FilaGaleria 
}) {
    // Extraemos colores para facilitar el uso
    const { texto_evento, texto_reloj, acento } = config.colores;

    return (
        <div className="flex-1 flex flex-col gap-6 min-h-0">
            
            {/* 1. SECCIÓN DE LISTA DE EVENTOS */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Encabezados de columna */}
                <div className="grid grid-cols-12 gap-4 px-6 py-2 border-b border-white/20 text-sm font-bold uppercase tracking-widest opacity-70 mb-2" style={{ color: acento }}>
                    <div className="col-span-2 text-center">Horario</div>
                    <div className="col-span-7">Evento</div>
                    <div className="col-span-3 text-right pr-4">Ubicación</div>
                </div>

                {/* Filas de eventos */}
                <div className="flex-1 overflow-hidden flex flex-col gap-3">
                    {eventosVisibles.map((evento, idx) => (
                        <div 
                            key={idx} 
                            className="grid grid-cols-12 gap-4 items-center p-3 bg-white/5 border border-white/5 rounded-2xl shadow-lg backdrop-blur-sm animate-fade-in-up"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Horario Vertical */}
                            <div className="col-span-2 flex flex-col items-center justify-center" style={{ color: acento }}>
                                <span className="font-mono text-2xl font-bold leading-none">
                                    {new Date(evento.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] opacity-50 uppercase my-1">a</span>
                                <span className="font-mono text-2xl font-bold leading-none">
                                    {new Date(evento.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {/* Información del Evento */}
                            <div className="col-span-7 flex items-center gap-5 min-w-0">
                                <FilaGaleria 
                                    imagenes={evento.imagenes?.length > 0 ? evento.imagenes : (config.imagen_default ? [config.imagen_default] : [])} 
                                    isVertical={false} 
                                />
                                <div className="flex flex-col min-w-0">
                                    {evento.tipo_evento && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 border border-white/20 px-2 py-0.5 rounded-full w-fit" style={{ color: acento, borderColor: acento }}>
                                            {evento.tipo_evento}
                                        </span>
                                    )}
                                    <h2 className="text-2xl font-bold leading-tight truncate" style={{ color: texto_evento }}>
                                        {evento.nombre_evento}
                                    </h2>
                                    <span className="text-sm opacity-60 truncate" style={{ color: texto_reloj }}>
                                        {evento.cliente_nombre}
                                    </span>
                                </div>
                            </div>

                            {/* Ubicación y Flecha */}
                            <div className="col-span-3 flex items-center justify-end gap-4">
                                <span className="text-sm font-bold uppercase bg-white/10 border border-white/10 px-4 py-1.5 rounded-full truncate max-w-[180px]" style={{ color: texto_reloj }}>
                                    {evento.nombre_salon}
                                </span>
                                <div className="shrink-0 w-10 h-10 flex items-center justify-center">
                                    <DirectionArrow direction={evento.direction_reloj || evento.direccion_reloj} color={acento} size={36} animate={true} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. SECCIÓN DE WIDGETS INFERIORES */}
            <div className="h-64 shrink-0 grid grid-cols-2 gap-6">
                
                {/* WIDGET IZQUIERDO: Galería / Screensaver */}
                <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
                    <MediaRenderer 
                        url={itemActual} 
                        blobUrl={videoBlobUrl} 
                        className="absolute inset-0 w-full h-full object-cover" 
                    />
                </div>

                {/* WIDGET DERECHO: Noticias */}
                <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl flex flex-col">
                    <div className="px-4 py-2 border-b border-white/10 bg-black/20 shrink-0">
                        <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ backgroundColor: acento, color: '#000' }}>
                            NOTICIAS
                        </span>
                    </div>
                    
                    <div className="flex-1 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full animate-marquee-vertical">
                            {[...noticias, ...noticias].map((noticia, idx) => (
                                <div key={idx} className="p-4 border-b border-white/5 flex flex-col gap-1">
                                    <h3 className="text-xl font-black leading-tight" style={{ color: acento }}>
                                        {noticia.titulo}
                                    </h3>
                                    <p className="text-sm leading-snug opacity-80" style={{ color: texto_evento }}>
                                        {noticia.descripcion}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Estilos locales para la animación de noticias */}
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