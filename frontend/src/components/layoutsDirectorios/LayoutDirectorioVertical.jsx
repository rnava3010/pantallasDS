import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';

export default function LayoutDirectorioVertical({ 
    config, 
    datos, 
    horaActual, // Viene del padre PlayerDirectorio
    isOnline, 
    clima, 
    itemActual, 
    videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);

    // 1. PROTECCIÓN TOTAL: Si config o horaActual no existen, no renderizamos nada pesado
    if (!config || !config.colores || !horaActual) {
        return (
            <div className="bg-black h-screen flex items-center justify-center text-white font-mono">
                Cargando sistema...
            </div>
        );
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
        }
    }, [totalPaginas]);

    const visibles = eventos.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden relative" style={{ backgroundColor: fondo }}>
            
            {/* HEADER INTEGRADO */}
            <header className="h-20 flex justify-between items-center px-6 shrink-0 z-20 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-4">
                    {config.logo && <img src={config.logo} alt="Logo" className="h-10 w-auto object-contain" />}
                </div>
                
                <div className="px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                    <h1 className="text-base font-black tracking-widest uppercase" style={{ color: acento }}>DIRECTORIO</h1>
                </div>

                <div className="flex flex-col items-end">
                    {/* PROTECCIÓN ADICIONAL AQUÍ */}
                    <span className="text-3xl font-mono font-bold leading-none" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '--:--'}
                    </span>
                    <span className="text-[8px] uppercase opacity-60 tracking-tighter" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }) || 'Cargando...'}
                    </span>
                </div>
            </header>

            {/* CUERPO DE EVENTOS */}
            <main className="flex-1 px-6 py-2 flex flex-col gap-3 overflow-hidden">
                <div className="flex-1 flex flex-col gap-2 min-h-0">
                    {visibles.length > 0 ? visibles.map((e, i) => (
                        <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2 animate-fade-in-up">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-lg" style={{ color: acento }}>
                                        {e.fecha_inicio ? new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </span>
                                </div>
                                <DirectionArrow direction={e.direccion_reloj} color={acento} size={24} animate />
                            </div>
                            <div className="flex gap-3 items-center">
                                <div className="h-16 w-24 rounded-lg overflow-hidden shrink-0 bg-black/20 border border-white/5">
                                    <img src={e.imagenes?.[0] || config.imagen_default} className="w-full h-full object-cover" alt="evento" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg font-bold truncate leading-tight" style={{ color: texto_evento }}>{e.nombre_evento}</h2>
                                    <p className="text-[9px] font-bold uppercase" style={{ color: acento }}>{e.nombre_salon}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="flex-1 flex items-center justify-center opacity-30 text-white uppercase text-sm">No hay eventos</div>
                    )}
                </div>

                {/* WIDGETS INFERIORES */}
                <div className="h-[35%] flex flex-col gap-3 shrink-0 mb-2">
                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 relative bg-black/40">
                        <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex flex-col">
                        <div className="px-3 py-1 border-b border-white/10 bg-black/20 text-[9px] font-bold tracking-widest" style={{ color: acento }}>NOTICIAS</div>
                        <div className="flex-1 relative overflow-hidden">
                            <div className="absolute top-0 w-full animate-marquee-vertical">
                                {noticias.length > 0 ? [...noticias, ...noticias].map((n, i) => (
                                    <div key={i} className="p-2 border-b border-white/5">
                                        <h3 className="text-xs font-bold leading-tight" style={{ color: acento }}>{n.titulo}</h3>
                                        <p className="text-[10px] opacity-60 leading-snug mt-1" style={{ color: texto_evento }}>{n.descripcion}</p>
                                    </div>
                                )) : <p className="p-4 text-center text-[10px] opacity-40 text-white">Actualizando noticias...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="h-10 border-t border-white/10 px-6 flex justify-between items-center shrink-0" style={{ backgroundColor: fondo }}>
                <span className="text-[8px] opacity-40 uppercase tracking-tighter">Powered by narabyte.xyz</span>
                <div className="flex items-center gap-2" style={{ color: texto_reloj }}>
                    <span className="text-2xl">{getIconoClima(clima?.codigo)}</span>
                    <span className="font-bold text-base">{clima?.tempC}°C</span>
                </div>
            </footer>

            <style>{`
                @keyframes marquee-vertical { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
                .animate-marquee-vertical { animation: marquee-vertical 40s linear infinite; }
            `}</style>
        </div>
    );
}