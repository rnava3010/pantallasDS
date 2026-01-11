import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { getIconoClima } from '../../utils/weatherUtils'; // Importamos utilidad del clima

export default function LayoutTarifasVertical({ 
    config, datos, horaActual, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    
    const tarifas = datos?.tarifas || [];
    const banner = datos?.banner || "Bienvenidos";
    const ITEMS_POR_PAGINA = 8;

    useEffect(() => {
        const total = Math.ceil(tarifas.length / ITEMS_POR_PAGINA);
        if (total > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % total), 10000);
            return () => clearInterval(int);
        }
    }, [tarifas.length]);

    const visibles = tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden p-6" style={{ backgroundColor: fondo }}>
            
            {/* HEADER REORGANIZADO */}
            <header className="h-24 flex items-center justify-between mb-6 px-4 bg-black/20 rounded-[2rem] border border-white/5">
                {/* IZQUIERDA: Logo */}
                <div className="w-1/4 flex justify-start">
                    <img src={config.logo} alt="Logo" className="h-16 object-contain animate-float" />
                </div>

                {/* CENTRO: Título TARIFAS */}
                <div className="w-2/4 text-center">
                    <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-white" style={{ textShadow: `0 0 20px ${acento}` }}>
                        TARIFAS
                    </h1>
                </div>

                {/* DERECHA: Hora y Fecha */}
                <div className="w-1/4 flex flex-col items-end justify-center">
                    <span className="text-3xl font-mono font-black leading-none text-white">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/60 mt-1">
                        {horaActual?.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </header>

            {/* LISTA DE TARIFAS */}
            <main className="flex-1 flex flex-col gap-4 bg-black/20 rounded-[3rem] p-8 border border-white/5 shadow-inner">
                <div className="flex justify-between items-center mb-4 px-4 text-[10px] font-black uppercase tracking-widest opacity-40 text-white">
                    <span>Categoría</span>
                    <span>Tarifa Diaria</span>
                </div>
                {visibles.map((t, i) => (
                    <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 animate-fade-in-up">
                        <span className="text-xl font-bold text-white uppercase">{t.nombre}</span>
                        <div className="text-right">
                            <span className="text-2xl font-black" style={{ color: acento }}>{t.moneda}{t.precio}</span>
                        </div>
                    </div>
                ))}
            </main>

            {/* GALERÍA CON CLIMA (Sin hora) */}
            <div className="h-[30%] my-6 relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                
                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Widget del Clima (Reemplaza a la hora) */}
                {clima && (
                    <div className="absolute bottom-6 right-8 flex items-center gap-4 bg-black/40 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10">
                        <span className="text-5xl drop-shadow-lg filter">
                            {getIconoClima(clima.weathercode)}
                        </span>
                        <div className="flex flex-col">
                            <span className="text-4xl font-black text-white leading-none">
                                {clima.temperature}°
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-white/70">
                                Clima Actual
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER: AVISOS (Izquierda a Derecha) */}
            <footer className="h-12 flex items-center bg-black/40 rounded-full border border-white/10 px-6 overflow-hidden relative">
                <div className="animate-marquee-reverse whitespace-nowrap absolute w-full">
                    <span className="text-sm font-bold uppercase tracking-[0.15em] text-white">
                        {banner} • {banner} • {banner}
                    </span>
                </div>
            </footer>

            <style>{`
                /* Animación de Izquierda a Derecha */
                .animate-marquee-reverse { 
                    animation: marqueeReverse 20s linear infinite; 
                }
                @keyframes marqueeReverse { 
                    0% { transform: translateX(-100%); } 
                    100% { transform: translateX(100%); } 
                }

                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}