import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';

export default function LayoutDirectorioHorizontal({ 
    config, datos, horaActual, isOnline, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);

    if (!config || !config.colores || !datos || !horaActual) {
        return <div className="bg-black h-screen flex items-center justify-center text-white font-mono">CARGANDO...</div>;
    }

    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    const eventos = datos?.eventos || [];
    const noticias = datos?.noticias || [];
    
    const ITEMS_POR_PAGINA = 4;
    const totalPaginas = Math.ceil(eventos.length / ITEMS_POR_PAGINA);

    useEffect(() => {
        if (totalPaginas > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 12000);
            return () => clearInterval(int);
        }
    }, [totalPaginas]);

    const visibles = eventos.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden relative" style={{ backgroundColor: fondo }}>
            
            {/* HEADER */}
            <header className="h-24 flex justify-between items-center px-10 shrink-0 z-20 bg-black/40 backdrop-blur-md border-b border-white/10">
                <img src={config.logo} alt="Logo" className="h-16 w-auto object-contain" />
                <div className="px-8 py-2 rounded-full border border-white/10 bg-white/5 shadow-inner">
                    <h1 className="text-3xl font-black tracking-widest uppercase" style={{ color: acento }}>DIRECTORIO</h1>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-5xl font-mono font-bold leading-none shadow-black drop-shadow-md" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm font-bold uppercase tracking-[0.2em] mt-1" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            <main className="flex-1 px-10 py-6 flex flex-col gap-6 overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Encabezados de tabla con fondo sutil */}
                    <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-black/20 rounded-t-2xl border-x border-t border-white/10 text-sm font-black uppercase tracking-widest" style={{ color: acento }}>
                        <div className="col-span-2 text-center">Horario</div>
                        <div className="col-span-7 pl-12">Detalles del Evento</div>
                        <div className="col-span-3 text-right pr-8">Ubicación</div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col gap-4 mt-2">
                        {visibles.map((e, i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 items-center p-4 bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl animate-fade-in-up">
                                
                                {/* COLUMNA 1: HORARIO (Corregido el orden) */}
                                <div className="col-span-2 flex flex-col items-center justify-center border-r border-white/10 py-2">
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-mono text-2xl font-black" style={{ color: acento }}>
                                            {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-[10px] opacity-40 font-bold uppercase">a</span>
                                        <span className="font-mono text-xl font-bold opacity-70" style={{ color: acento }}>
                                            {new Date(e.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {/* Fecha abajo de las horas, resaltada */}
                                    <span className="mt-2 text-xs font-black uppercase bg-white/10 px-3 py-1 rounded-md tracking-wider border border-white/5" style={{ color: texto_reloj }}>
                                        {new Date(e.fecha_inicio).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>

                                {/* COLUMNA 2: INFO EVENTO */}
                                <div className="col-span-7 flex items-center gap-6 pl-6 min-w-0">
                                    <div className="h-20 w-32 rounded-xl overflow-hidden shrink-0 border-2 border-white/10 shadow-lg">
                                        <img src={e.imagenes?.[0] || config.imagen_default} className="w-full h-full object-cover" alt="evento" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h2 className="text-3xl font-black leading-tight drop-shadow-md" style={{ color: texto_evento }}>{e.nombre_evento}</h2>
                                        <span className="text-sm font-bold opacity-60 truncate uppercase tracking-wide" style={{ color: texto_reloj }}>{e.cliente_nombre}</span>
                                    </div>
                                </div>

                                {/* COLUMNA 3: SALÓN Y FLECHA */}
                                <div className="col-span-3 flex items-center justify-end gap-6 pr-4">
                                    <span className="text-sm font-black uppercase bg-white/10 px-5 py-2 rounded-xl border border-white/10 shadow-inner" style={{ color: texto_reloj }}>
                                        {e.nombre_salon}
                                    </span>
                                    <DirectionArrow direction={e.direccion_reloj} color={acento} size={40} animate />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER WIDGETS */}
                <div className="h-60 shrink-0 grid grid-cols-2 gap-8 mb-4">
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/20 bg-black/50 shadow-2xl">
                        <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/20 bg-black/40 backdrop-blur-md flex flex-col shadow-2xl">
                        <div className="px-6 py-3 border-b border-white/10 bg-white/5 shrink-0">
                            <span className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: acento }}>Cinta de Noticias</span>
                        </div>
                        <div className="flex-1 relative overflow-hidden flex items-center">
                            <div className="absolute top-0 w-full animate-marquee-vertical">
                                {[...noticias, ...noticias].map((n, i) => (
                                    <div key={i} className="p-5 border-b border-white/5 mx-4">
                                        <h3 className="text-xl font-black mb-1" style={{ color: acento }}>{n.titulo}</h3>
                                        <p className="text-sm font-bold opacity-80" style={{ color: texto_evento }}>{n.descripcion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <footer className="h-14 border-t border-white/10 px-10 flex justify-between items-center shrink-0 bg-black/20">
                <div className="w-1/4 opacity-40">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Powered by narabyte.xyz</span>
                </div>
                <div className="flex-1 flex justify-center">
                    <span className="text-2xl font-light tracking-[0.6em] uppercase opacity-70" style={{ color: texto_evento }}>BIENVENIDOS</span>
                </div>
                <div className="w-1/4 flex items-center justify-end gap-4" style={{ color: texto_reloj }}>
                    <span className="text-3xl drop-shadow-md">{getIconoClima(clima?.codigo)}</span>
                    <span className="font-black text-xl">{clima?.tempC}°C</span>
                </div>
            </footer>

            <style>{`
                @keyframes marquee-vertical { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
                .animate-marquee-vertical { animation: marquee-vertical 50s linear infinite; }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}