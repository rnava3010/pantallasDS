import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';

export default function LayoutDirectorioVertical({ 
    config, datos, horaActual, isOnline, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);

    if (!config || !config.colores || !horaActual) {
        return <div className="bg-black h-screen flex items-center justify-center text-white font-mono">CARGANDO SISTEMA...</div>;
    }

    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    const eventos = datos?.eventos || [];
    const noticias = datos?.noticias || [];
    
    const ITEMS_POR_PAGINA = 6;
    const totalPaginas = Math.ceil(eventos.length / ITEMS_POR_PAGINA);

    useEffect(() => {
        if (totalPaginas > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 12000);
            return () => clearInterval(int);
        } else {
            setPagina(0);
        }
    }, [totalPaginas]);

    const visibles = eventos.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden relative" style={{ backgroundColor: fondo }}>
            <header className="h-20 flex justify-between items-center px-6 shrink-0 z-20 bg-black/60 backdrop-blur-xl border-b border-white/10">
                <img src={config.logo} alt="Logo" className="h-10 w-auto object-contain" />
                <div className="px-4 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    <h1 className="text-base font-black tracking-widest uppercase" style={{ color: acento }}>DIRECTORIO</h1>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-3xl font-mono font-bold leading-none" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-tighter mt-1" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </header>

            <main className="flex-1 px-6 py-4 flex flex-col gap-3 overflow-hidden">
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                    {visibles.length > 0 ? visibles.map((e, i) => (
                        /* EFECTO DE BRILLO APLICADO AQUÍ */
                        <div key={i} className="p-4 bg-gradient-to-br from-white/15 to-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col gap-2 animate-fade-in-up shadow-[inset_0_0_15px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.4)] border-t-white/30">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-xl" style={{ color: acento }}>
                                            {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="opacity-30 text-[10px] font-bold uppercase">a</span>
                                        <span className="font-mono font-bold text-xl opacity-60" style={{ color: acento }}>
                                            {new Date(e.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider mt-1 opacity-80" style={{ color: acento }}>
                                        {new Date(e.fecha_inicio).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                <DirectionArrow direction={e.direccion_reloj} color={acento} size={28} animate />
                            </div>
                            <div className="flex gap-3 items-center">
                                <div className="h-16 w-24 rounded-lg overflow-hidden shrink-0 bg-black/40 border border-white/20 shadow-md">
                                    <img src={e.imagenes?.[0] || config.imagen_default} className="w-full h-full object-cover" alt="img" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg font-bold truncate leading-tight drop-shadow-sm" style={{ color: texto_evento }}>{e.nombre_evento}</h2>
                                    <span className="text-[10px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded border border-white/5" style={{ color: acento }}>
                                        {e.nombre_salon}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="flex-1 flex items-center justify-center opacity-30 text-white uppercase text-sm italic">No hay eventos para hoy</div>
                    )}
                </div>

                <div className="h-[32%] flex flex-col gap-3 shrink-0 mb-2">
                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/20 relative bg-black/60 shadow-xl">
                        <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/20 bg-black/50 backdrop-blur-xl flex flex-col shadow-xl">
                        <div className="px-3 py-1 border-b border-white/10 bg-white/5 text-[10px] font-bold tracking-widest" style={{ color: acento }}>NOTICIAS</div>
                        <div className="flex-1 relative overflow-hidden">
                            <div className="absolute top-0 w-full animate-marquee-vertical">
                                {noticias.length > 0 ? [...noticias, ...noticias].map((n, i) => (
                                    <div key={i} className="p-3 border-b border-white/5">
                                        <h3 className="text-xs font-bold leading-tight" style={{ color: acento }}>{n.titulo}</h3>
                                        <p className="text-[10px] opacity-80 leading-snug mt-1 text-white">{n.descripcion}</p>
                                    </div>
                                )) : <p className="p-4 text-center text-[10px] text-white/40">Actualizando...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="h-10 border-t border-white/10 px-6 flex justify-between items-center shrink-0 bg-black/60 backdrop-blur-xl">
                <div className="w-1/4 opacity-40">
                    <span className="text-[8px] uppercase tracking-tighter">Powered by narabyte.xyz</span>
                </div>
                <div className="flex-1 flex justify-center">
                    <span className="text-lg font-light tracking-[0.4em] uppercase opacity-80" style={{ color: texto_evento }}>BIENVENIDOS</span>
                </div>
                <div className="w-1/4 flex items-center justify-end gap-2" style={{ color: texto_reloj }}>
                    <span className="text-2xl drop-shadow-md">{getIconoClima(clima?.codigo)}</span>
                    <span className="font-bold text-base">{clima?.tempC}°C</span>
                </div>
            </footer>

            <style>{`
                @keyframes marquee-vertical { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
                .animate-marquee-vertical { animation: marquee-vertical 40s linear infinite; }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
}