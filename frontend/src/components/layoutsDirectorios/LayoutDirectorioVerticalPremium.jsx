import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';

export default function LayoutDirectorioVerticalPremium({ 
    config, datos, horaActual, isOnline, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    if (!config || !config.colores || !horaActual) return null;

    const { acento, texto_evento } = config.colores;
    const eventos = datos?.eventos || [];
    const visibles = eventos.slice(pagina * 5, (pagina + 1) * 5);

    useEffect(() => {
        const total = Math.ceil(eventos.length / 5);
        if (total > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % total), 12000);
            return () => clearInterval(int);
        }
    }, [eventos.length]);

    return (
        <div className="h-screen w-screen relative overflow-hidden bg-black text-white">
            {/* Background Video de fondo completo (Muted) */}
            <div className="absolute inset-0 z-0 opacity-40 scale-110 blur-sm">
                 <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black via-black/40 to-black"></div>

            <div className="relative z-20 h-full flex flex-col p-8">
                <header className="flex flex-col items-center mb-12">
                    <img src={config.logo} className="h-16 mb-8 object-contain drop-shadow-2xl" alt="L" />
                    <div className="text-center">
                        <h1 className="text-7xl font-mono font-black tracking-tighter drop-shadow-2xl">{horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h1>
                        <p className="text-xs font-black uppercase tracking-[0.8em] opacity-40 mt-2">Sincronizado</p>
                    </div>
                </header>

                <main className="flex-1 flex flex-col gap-6">
                    {visibles.map((e, i) => (
                        <div key={i} className="relative p-6 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 flex items-center gap-6 animate-fade-in-right overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: acento }}></div>
                            <div className="h-20 w-20 rounded-full overflow-hidden shrink-0 border-2 border-white/10 shadow-xl bg-black/40">
                                <img src={e.imagenes?.[0] || config.imagen_default} className="w-full h-full object-cover" alt="ev" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-xl font-black" style={{ color: acento }}>{new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Inicia</span>
                                </div>
                                <h2 className="text-2xl font-bold truncate leading-none mb-2" style={{ color: texto_evento }}>{e.nombre_evento}</h2>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{e.nombre_salon}</span>
                            </div>
                            <DirectionArrow direction={e.direccion_reloj} color={acento} size={32} animate />
                        </div>
                    ))}
                </main>

                <footer className="h-24 flex justify-between items-center border-t border-white/10 mt-6">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">{getIconoClima(clima?.codigo)}</span>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black">{clima?.tempC}°C</span>
                            <span className="text-[10px] uppercase opacity-40">Local Weather</span>
                        </div>
                    </div>
                    <div className="text-right">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Narabyte Premium System</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}