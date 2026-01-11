import React from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';

export default function LayoutDirectorioHorizontal({ 
    eventosVisibles, paginaActual, totalPaginas, config, noticias, 
    itemActual, videoBlobUrl, FilaGaleria 
}) {
    const { texto_evento, texto_reloj, acento } = config.colores;

    return (
        <div className="flex-1 flex flex-col gap-4 min-h-0">
            {/* LISTA DE EVENTOS */}
            <div className="flex-1 flex flex-col gap-2 min-h-0">
                <div className="grid grid-cols-12 gap-4 px-6 py-2 border-b border-white/20 text-sm font-bold uppercase tracking-widest opacity-70" style={{ color: acento }}>
                    <div className="col-span-2 text-center">Horario</div>
                    <div className="col-span-7">Evento</div>
                    <div className="col-span-3 text-right pr-4">Ubicación</div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col gap-3">
                    {eventosVisibles.map((evento, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 items-center p-3 bg-white/5 border border-white/5 rounded-2xl shadow-lg backdrop-blur-sm animate-fade-in-up">
                            <div className="col-span-2 flex flex-col items-center" style={{ color: acento }}>
                                <span className="font-mono text-xl font-bold">{new Date(evento.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-[10px] opacity-50 uppercase">a</span>
                                <span className="font-mono text-xl font-bold">{new Date(evento.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="col-span-7 flex items-center gap-5">
                                <FilaGaleria imagenes={evento.imagenes?.length > 0 ? evento.imagenes : (config.imagen_default ? [config.imagen_default] : [])} />
                                <div className="flex flex-col min-w-0">
                                    {evento.tipo_evento && <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 border border-white/20 px-2 py-0.5 rounded-full w-fit" style={{ color: acento, borderColor: acento }}>{evento.tipo_evento}</span>}
                                    <h2 className="text-2xl font-bold leading-tight truncate" style={{ color: texto_evento }}>{evento.nombre_evento}</h2>
                                    <span className="text-sm opacity-60 truncate" style={{ color: texto_reloj }}>{evento.cliente_nombre}</span>
                                </div>
                            </div>
                            <div className="col-span-3 flex items-center justify-end gap-3">
                                <span className="text-sm font-bold uppercase bg-white/10 px-3 py-1 rounded-full truncate" style={{ color: texto_reloj }}>{evento.nombre_salon}</span>
                                <DirectionArrow direction={evento.direccion_reloj} color={acento} size={32} animate />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* WIDGETS INFERIORES (Lado a Lado) */}
            <div className="h-60 shrink-0 grid grid-cols-2 gap-6">
                <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-black/40">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-cover w-full h-full"/>
                </div>
                <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md">
                    {/* El Ticker se renderiza desde el padre */}
                    <NewsTickerComponent noticias={noticias} colorTitulo={acento} colorTexto={texto_evento} />
                </div>
            </div>
        </div>
    );
}

// Sub-componente interno para no repetir lógica
const NewsTickerComponent = ({ noticias, colorTitulo, colorTexto }) => (
    <div className="w-full h-full relative overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b border-white/10 bg-black/20 shrink-0">
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: colorTitulo, color: '#000' }}>NOTICIAS</span>
        </div>
        <div className="flex-1 relative overflow-hidden">
            <div className="absolute top-0 w-full animate-marquee-vertical">
                {[...noticias, ...noticias].map((n, i) => (
                    <div key={i} className="p-4 border-b border-white/5">
                        <h3 className="text-lg font-black leading-tight" style={{ color: colorTitulo }}>{n.titulo}</h3>
                        <p className="text-xs opacity-80" style={{ color: colorTexto }}>{n.descripcion}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);