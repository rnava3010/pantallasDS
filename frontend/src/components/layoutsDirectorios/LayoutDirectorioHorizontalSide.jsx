import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';

export default function LayoutDirectorioHorizontalSide({ 
    config, datos, horaActual, isOnline, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    if (!config || !config.colores || !datos || !horaActual) return null;

    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    const eventos = datos?.eventos || [];
    const noticias = datos?.noticias || [];
    const visibles = eventos.slice(pagina * 5, (pagina + 1) * 5);

    useEffect(() => {
        const totalPaginas = Math.ceil(eventos.length / 5);
        if (totalPaginas > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 10000);
            return () => clearInterval(int);
        }
    }, [eventos.length]);

    return (
        <div className="flex h-screen w-screen overflow-hidden p-6 gap-6" style={{ backgroundColor: fondo }}>
            
            {/* IZQUIERDA: Contenido de Eventos (60%) */}
            <div className="w-[60%] flex flex-col gap-6">
                <header className="flex justify-between items-center bg-black/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-xl">
                    <img src={config.logo} alt="Logo" className="h-12 object-contain" />
                    <div className="text-right">
                        <span className="text-4xl font-mono font-black block leading-none" style={{ color: texto_reloj }}>
                            {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs font-bold uppercase opacity-50 tracking-widest">{horaActual?.toLocaleDateString()}</span>
                    </div>
                </header>

                <div className="flex-1 flex flex-col gap-3">
                    <h1 className="text-2xl font-black uppercase tracking-tighter mb-2" style={{ color: acento }}>Directorio de Eventos</h1>
                    {visibles.map((e, i) => (
                        <div key={i} className="flex items-center p-4 bg-white/5 border-l-4 border-white/10 rounded-r-2xl hover:bg-white/10 transition-all animate-fade-in-up" 
                             style={{ borderLeftColor: acento }}>
                            <div className="w-24 text-center">
                                <span className="text-xl font-mono font-black block" style={{ color: acento }}>
                                    {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex-1 px-6">
                                <h2 className="text-xl font-bold truncate" style={{ color: texto_evento }}>{e.nombre_evento}</h2>
                                <p className="text-xs opacity-60 font-black uppercase">{e.nombre_salon}</p>
                            </div>
                            <DirectionArrow direction={e.direccion_reloj} color={acento} size={30} animate />
                        </div>
                    ))}
                </div>

                {/* Noticias en horizontal abajo a la izquierda */}
                <footer className="h-20 bg-black/40 rounded-[1.5rem] border border-white/10 flex items-center overflow-hidden px-6">
                    <div className="flex whitespace-nowrap animate-marquee-fast">
                        {noticias.map((n, i) => (
                            <span key={i} className="mx-8 font-bold text-sm" style={{ color: texto_reloj }}>
                                • {n.titulo}: <span className="font-normal opacity-70">{n.descripcion}</span>
                            </span>
                        ))}
                    </div>
                </footer>
            </div>

            {/* DERECHA: Gran Cuadro de Galería/Video (40%) */}
            <div className="w-[40%] flex flex-col gap-6">
                <div className="flex-1 relative rounded-[3rem] overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-10 flex items-center gap-4 text-white">
                        <span className="text-6xl">{getIconoClima(clima?.codigo)}</span>
                        <div>
                            <span className="text-4xl font-black block">{clima?.tempC}°C</span>
                            <span className="text-sm font-bold opacity-70 tracking-widest uppercase">Bienvenidos</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee-fast { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee-fast { animation: marquee-fast 30s linear infinite; }
            `}</style>
        </div>
    );
}