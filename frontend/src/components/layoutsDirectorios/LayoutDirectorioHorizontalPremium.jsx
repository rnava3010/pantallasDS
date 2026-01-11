import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';

export default function LayoutDirectorioHorizontalPremium({ 
    config, datos, horaActual, isOnline, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    if (!config || !config.colores || !datos || !horaActual) return null;

    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    const eventos = datos?.eventos || [];
    const visibles = eventos.slice(pagina * 3, (pagina + 1) * 3);

    useEffect(() => {
        const total = Math.ceil(eventos.length / 3);
        if (total > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % total), 15000);
            return () => clearInterval(int);
        }
    }, [eventos.length]);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden p-10 relative bg-black">
            
            {/* 🎥 GALERÍA/VIDEO DE FONDO */}
            <div className="absolute inset-0 z-0 opacity-40 scale-105 animate-slow-zoom">
                 <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover" />
            </div>

            {/* Capa de Glassmorphism */}
            <div className="absolute inset-0 z-1 bg-gradient-to-b from-black/80 via-black/20 to-black/90 backdrop-blur-[4px]"></div>

            {/* Luces de neón decorativas */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-30 animate-pulse z-2" style={{ backgroundColor: acento }}></div>
            
            {/* CONTENIDO FRONTAL */}
            <header className="flex justify-between items-end mb-12 z-10">
                <div className="flex flex-col gap-4">
                    <div className="animate-logo-float">
                        <img src={config.logo} alt="Logo" className="h-16 w-fit object-contain brightness-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                    </div>
                    {/* POSICIÓN ACTUALIZADA: Directorio de Eventos con el estilo de Agenda Exclusiva */}
                    <h1 className="text-6xl font-black tracking-tighter uppercase leading-none" style={{ color: '#fff' }}>
                        Directorio <span style={{ color: acento }}>de Eventos</span>
                    </h1>
                </div>

                <div className="text-right">
                    <span className="text-8xl font-mono font-black leading-none tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="text-sm font-black uppercase tracking-[0.5em] mt-2 opacity-40" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </header>

            <main className="flex-1 grid grid-cols-3 gap-10 z-10">
                {visibles.map((e, i) => (
                    <div key={i} className="group relative rounded-[4rem] p-0.5 bg-gradient-to-br from-white/30 to-transparent shadow-2xl animate-fade-in-up">
                        <div className="h-full w-full bg-black/60 backdrop-blur-3xl rounded-[3.9rem] overflow-hidden flex flex-col border border-white/10">
                            <div className="h-48 relative">
                                <img src={e.imagenes?.[0] || config.imagen_default} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="img" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                                <div className="absolute bottom-6 left-8 bg-black/50 backdrop-blur-md px-4 py-1 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest text-white">
                                    {new Date(e.fecha_inicio).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                </div>
                            </div>
                            <div className="flex-1 p-8 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-3xl font-black" style={{ color: acento }}>
                                            {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="w-8 h-px bg-white/20"></span>
                                        <span className="text-xl font-bold opacity-40 text-white">
                                            {new Date(e.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-bold leading-tight mb-2" style={{ color: texto_evento }}>{e.nombre_evento}</h2>
                                    <p className="text-sm font-black uppercase opacity-40 tracking-widest text-white">{e.cliente_nombre}</p>
                                </div>
                                <div className="flex justify-between items-center border-t border-white/10 pt-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] py-2 px-5 rounded-full bg-white/5 border border-white/10 text-white">
                                        {e.nombre_salon}
                                    </span>
                                    <DirectionArrow direction={e.direccion_reloj} color={acento} size={44} animate />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </main>

            <footer className="h-20 flex items-center justify-between border-t border-white/5 mt-8 px-4 z-10">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/5">
                        <span className="text-4xl drop-shadow-lg">{getIconoClima(clima?.codigo)}</span>
                        <span className="text-3xl font-black text-white">{clima?.tempC}°C</span>
                    </div>
                    <span className="text-xl font-thin tracking-[1.5em] text-white/30 uppercase">Bienvenidos</span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 text-white">
                        Powered by narabyte.xyz
                    </span>
                </div>
            </footer>

            <style>{`
                @keyframes logo-float {
                    0%, 100% { transform: translateY(0) scale(1); filter: brightness(1.1); }
                    50% { transform: translateY(-8px) scale(1.03); filter: brightness(1.3) drop-shadow(0 0 25px ${acento}66); }
                }
                .animate-logo-float { animation: logo-float 6s ease-in-out infinite; }

                @keyframes slow-zoom {
                    0%, 100% { transform: scale(1.05); }
                    50% { transform: scale(1.12); }
                }
                .animate-slow-zoom { animation: slow-zoom 30s ease-in-out infinite; }

                .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}