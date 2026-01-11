import React from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';

export default function LayoutDirectorioVertical({ 
    eventosVisibles, paginaActual, totalPaginas, config, noticias, 
    itemActual, videoBlobUrl, FilaGaleria 
}) {
    const { texto_evento, texto_reloj, acento } = config.colores;

    return (
        <div className="flex-1 flex flex-col gap-4 min-h-0">
            {/* LISTA DE EVENTOS (Más compacta) */}
            <div className="flex-1 flex flex-col gap-2 min-h-0">
                <div className="flex flex-col gap-2">
                    {eventosVisibles.map((evento, idx) => (
                        <div key={idx} className="flex flex-col p-3 bg-white/5 border border-white/5 rounded-2xl gap-2">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <div className="flex items-center gap-2" style={{ color: acento }}>
                                    <span className="font-mono font-bold text-sm">{new Date(evento.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="opacity-40 text-[10px]">-</span>
                                    <span className="font-mono font-bold text-sm">{new Date(evento.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <DirectionArrow direction={evento.direccion_reloj} color={acento} size={24} animate />
                            </div>
                            <div className="flex gap-3 items-center">
                                <FilaGaleria imagenes={evento.imagenes?.length > 0 ? evento.imagenes : (config.imagen_default ? [config.imagen_default] : [])} isVertical />
                                <div className="flex flex-col min-w-0 flex-1">
                                    <h2 className="text-lg font-bold truncate leading-tight" style={{ color: texto_evento }}>{evento.nombre_evento}</h2>
                                    <span className="text-[10px] font-bold uppercase opacity-60" style={{ color: acento }}>{evento.nombre_salon}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* WIDGETS INFERIORES (Uno arriba del otro) */}
            <div className="h-[45%] shrink-0 flex flex-col gap-4">
                <div className="flex-1 rounded-3xl overflow-hidden border border-white/10 bg-black/40">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-cover w-full h-full"/>
                </div>
                <div className="flex-1 rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md">
                     <NewsTickerComponent noticias={noticias} colorTitulo={acento} colorTexto={texto_evento} isVertical />
                </div>
            </div>
        </div>
    );
}

const NewsTickerComponent = ({ noticias, colorTitulo, colorTexto, isVertical }) => (
    <div className="w-full h-full relative overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b border-white/10 bg-black/20 shrink-0">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: colorTitulo, color: '#000' }}>NOTICIAS</span>
        </div>
        <div className="flex-1 relative overflow-hidden">
            <div className="absolute top-0 w-full animate-marquee-vertical">
                {[...noticias, ...noticias].map((n, i) => (
                    <div key={i} className="p-3 border-b border-white/5">
                        <h3 className="text-sm font-black leading-tight" style={{ color: colorTitulo }}>{n.titulo}</h3>
                        <p className="text-[10px] opacity-70" style={{ color: colorTexto }}>{n.descripcion}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);