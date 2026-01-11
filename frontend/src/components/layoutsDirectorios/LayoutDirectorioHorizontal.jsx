import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';

export default function LayoutDirectorioHorizontal({ 
    config, datos, horaActual, isOnline, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);

    // Protección de seguridad contra datos nulos
    if (!config || !config.colores || !datos || !horaActual) {
        return <div className="bg-black h-screen flex items-center justify-center text-white font-mono">CARGANDO SISTEMA...</div>;
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
            {/* HEADER CON FECHA MEJORADA */}
            <header className="h-24 flex justify-between items-center px-10 shrink-0 z-20 bg-gradient-to-b from-black/80 to-transparent">
                <img src={config.logo} alt="Logo" className="h-16 w-auto object-contain" />
                <div className="px-8 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                    <h1 className="text-3xl font-black tracking-widest uppercase" style={{ color: acento }}>DIRECTORIO</h1>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-5xl font-mono font-bold leading-none" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {/* Fecha de encabezado más grande y negrita */}
                    <span className="text-sm font-bold uppercase tracking-[0.2em] mt-1" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            <main className="flex-1 px-10 py-4 flex flex-col gap-6 overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="grid grid-cols-12 gap-4 px-6 py-2 border-b border-white/20 text-sm font-bold uppercase tracking-widest opacity-70 mb-2" style={{ color: acento }}>
                        <div className="col-span-2 text-center">Horario / Fecha</div>
                        <div className="col-span-7">Evento</div>
                        <div className="col-span-3 text-right pr-4">Ubicación</div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col gap-3">
                        {visibles.map((e, i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 items-center p-3 bg-white/5 border border-white/5 rounded-2xl shadow-lg animate-fade-in-up">
                                <div className="col-span-2 flex flex-col items-center justify-center border-r border-white/10" style={{ color: acento }}>
                                    <span className="font-mono text-2xl font-bold">
                                        {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {/* Fecha del evento resaltada */}
                                    <span className="text-xs font-black uppercase my-1 bg-white/10 px-2 py-0.5 rounded">
                                        {new Date(e.fecha_inicio).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                    </span>
                                    <span className="font-mono text-xl font-bold opacity-50">
                                        {new Date(e.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="col-span-7 flex items-center gap-5 min-w-0">
                                    <div className="h-24 w-36 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                        <img src={e.imagenes?.[0] || config.imagen_default} className="w-full h-full object-cover" alt="img" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h2 className="text-2xl font-bold truncate" style={{ color: texto_evento }}>{e.nombre_evento}</h2>
                                        <span className="text-sm opacity-60 truncate" style={{ color: texto_reloj }}>{e.cliente_nombre}</span>
                                    </div>
                                </div>
                                <div className="col-span-3 flex items-center justify-end gap-4">
                                    <span className="text-sm font-bold uppercase bg-white/10 px-4 py-1.5 rounded-full text-center truncate" style={{ color: texto_reloj }}>
                                        {e.nombre_salon}
                                    </span>
                                    <DirectionArrow direction={e.direccion_reloj} color={acento} size={36} animate />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-64 shrink-0 grid grid-cols-2 gap-6">
                    <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
                        <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 flex flex-col shadow-2xl">
                        <div className="px-4 py-2 border-b border-white/10 bg-black/20 shrink-0">
                            <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ backgroundColor: acento, color: '#000' }}>NOTICIAS</span>
                        </div>
                        <div className="flex-1 relative overflow-hidden">
                            <div className="absolute top-0 w-full animate-marquee-vertical">
                                {noticias.length > 0 ? [...noticias, ...noticias].map((n, i) => (
                                    <div key={i} className="p-4 border-b border-white/5">
                                        <h3 className="text-xl font-black" style={{ color: acento }}>{n.titulo}</h3>
                                        <p className="text-sm opacity-80" style={{ color: texto_evento }}>{n.descripcion}</p>
                                    </div>
                                )) : <p className="p-4 text-center text-white/40">Cargando noticias...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <footer className="h-14 border-t border-white/10 px-10 flex justify-between items-center shrink-0">
                <span className="text-[10px] opacity-40 uppercase">Powered by narabyte.xyz</span>
                <div className="flex items-center gap-2" style={{ color: texto_reloj }}>
                    <span className="text-3xl">{getIconoClima(clima?.codigo)}</span>
                    <span className="font-bold text-xl">{clima?.tempC}°C</span>
                </div>
            </footer>
            <style>{`
                @keyframes marquee-vertical { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
                .animate-marquee-vertical { animation: marquee-vertical 60s linear infinite; }
            `}</style>
        </div>
    );
}