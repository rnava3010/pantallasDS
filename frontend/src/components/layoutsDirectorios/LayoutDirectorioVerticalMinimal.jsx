import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';

export default function LayoutDirectorioVerticalMinimal({ 
    config, datos, horaActual, isOnline, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    if (!config || !config.colores || !horaActual) return null;

    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    const eventos = datos?.eventos || [];
    const noticias = datos?.noticias || [];
    const visibles = eventos.slice(pagina * 5, (pagina + 1) * 5);

    useEffect(() => {
        const totalPaginas = Math.ceil(eventos.length / 5);
        if (totalPaginas > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 12000);
            return () => clearInterval(int);
        }
    }, [eventos.length]);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden font-sans p-6" style={{ backgroundColor: fondo }}>
            <div className="flex-1 flex flex-col bg-white/5 rounded-[4rem] border border-white/10 overflow-hidden shadow-2xl relative">
                
                <header className="p-10 flex justify-between items-center border-b border-white/10">
                    <img src={config.logo} alt="Logo" className="h-12 object-contain" />
                    <div className="text-right">
                        <span className="text-5xl font-black block leading-none" style={{ color: texto_reloj }}>
                            {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-sm font-bold opacity-50 uppercase tracking-widest mt-2 block" style={{ color: texto_reloj }}>
                            {horaActual?.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                </header>

                <main className="flex-1 p-10 flex flex-col gap-6">
                    {visibles.map((e, i) => (
                        <div key={i} className="flex items-center gap-8 border-b border-white/5 pb-6 last:border-0 animate-fade-in-up">
                            <div className="text-center min-w-[110px]">
                                <span className="text-3xl font-black block" style={{ color: acento }}>
                                    {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest" style={{ color: texto_reloj }}>HORARIO</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-2xl font-black truncate leading-tight" style={{ color: texto_evento }}>{e.nombre_evento}</h2>
                                <p className="text-sm opacity-50 uppercase font-bold mt-1" style={{ color: texto_reloj }}>{e.nombre_salon}</p>
                            </div>
                            <DirectionArrow direction={e.direccion_reloj} color={acento} size={32} animate />
                        </div>
                    ))}
                </main>

                <div className="h-[30%] relative">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                    <div className="absolute bottom-8 left-10 right-10 flex justify-between items-end">
                        <div className="flex items-center gap-4">
                            <span className="text-5xl">{getIconoClima(clima?.codigo)}</span>
                            <span className="text-3xl font-bold text-white">{clima?.tempC}°C</span>
                        </div>
                        {/* LEYENDA CENTRADA EN WIDGET */}
                        <span className="text-sm font-black text-white/40 uppercase tracking-[0.5em]">BIENVENIDOS</span>
                    </div>
                </div>
            </div>

            {/* MARQUEE ULTRA LENTO (100s) */}
            <footer className="h-16 flex items-center overflow-hidden">
                <div className="flex whitespace-nowrap animate-marquee-slow">
                    {[...noticias, ...noticias].map((n, i) => (
                        <span key={i} className="text-lg font-bold mx-12 flex items-center gap-4" style={{ color: texto_reloj }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: acento }} />
                            {n.titulo}: <span className="font-normal opacity-60">{n.descripcion}</span>
                        </span>
                    ))}
                </div>
            </footer>

            <style>{`
                @keyframes marquee-slow { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee-slow { animation: marquee-slow 100s linear infinite; }
            `}</style>
        </div>
    );
}