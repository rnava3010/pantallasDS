import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { getIconoClima } from '../../utils/weatherUtils';

export default function LayoutTarifasHorizontal({ 
    config, datos, horaActual, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    
    const tarifas = datos?.tarifas || [];
    const divisas = datos?.divisas || []; // Recibimos divisas
    const banner = datos?.banner || "Bienvenidos";
    const ITEMS_POR_PAGINA = 5;

    useEffect(() => {
        const total = Math.ceil(tarifas.length / ITEMS_POR_PAGINA);
        if (total > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % total), 10000);
            return () => clearInterval(int);
        }
    }, [tarifas.length]);

    const visibles = tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden p-10" style={{ backgroundColor: fondo }}>
            
            {/* HEADER */}
            <header className="flex justify-between items-center mb-8 bg-black/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                <img src={config.logo} alt="Logo" className="h-16 object-contain animate-float" />
                <h1 className="text-5xl font-black uppercase tracking-tighter" style={{ color: acento, textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                    Tarifas Vigentes
                </h1>
                <div className="text-right flex flex-col items-end">
                    <span className="text-5xl font-mono font-black block leading-none text-white">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm font-bold uppercase tracking-widest text-white/60 mt-1">
                        {horaActual?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* MAIN */}
            <main className="flex-1 flex flex-col gap-4 px-4">
                {visibles.map((t, i) => {
                    const nombre = t.nombre || t.nombre_habitacion;
                    const descripcion = t.descripcion || t.detalles || "";
                    const moneda = t.moneda || 'MXN';
                    const precioFinal = t.precio || t.precio_promocion || t.precio_rack;
                    const precioRegular = t.precio_rack;
                    const tieneDescuento = precioRegular && precioFinal && (parseFloat(precioRegular) > parseFloat(precioFinal));

                    return (
                        <div key={i} className="flex justify-between items-center p-5 bg-white/5 rounded-3xl border border-white/5 animate-fade-in-up hover:bg-white/10 transition-colors">
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-black uppercase" style={{ color: texto_evento }}>{nombre}</span>
                                {descripcion && <span className="text-sm text-white/50 italic font-light">{descripcion}</span>}
                            </div>
                            <div className="flex flex-col items-end justify-center">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold opacity-40 text-white">{moneda}</span>
                                    <span className="text-5xl font-mono font-black" style={{ color: acento }}>{precioFinal}</span>
                                </div>
                                {tieneDescuento && (
                                    <span className="text-xs text-white/40 line-through decoration-white/40">
                                        Precio Regular: {moneda} {precioRegular}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* FOOTER: AHORA CON DIVISAS */}
            <footer className="h-64 mt-8 grid grid-cols-2 gap-8">
                
                {/* 1. Video + Clima */}
                <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    {clima && (
                        <div className="absolute bottom-6 left-6 flex items-center gap-4 animate-fade-in-up">
                            <span className="text-5xl drop-shadow-md filter grayscale-0">{getIconoClima(clima.weathercode)}</span>
                            <div>
                                <span className="text-4xl font-black text-white leading-none block">{clima.temperature}°</span>
                                <span className="text-[10px] uppercase tracking-widest text-white/80">Clima Actual</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Banner + Divisas (Split Vertical) */}
                <div className="flex flex-col gap-4">
                    
                    {/* A. Banner de Texto (Arriba) */}
                    <div className="flex-1 bg-black/40 backdrop-blur-md rounded-[2.5rem] border border-white/10 flex items-center justify-center overflow-hidden relative">
                         <div className="animate-marquee-horizontal whitespace-nowrap absolute w-full text-center">
                            <span className="text-2xl font-light tracking-widest text-white uppercase">{banner}</span>
                        </div>
                    </div>

                    {/* B. Tabla de Divisas (Abajo) */}
                    <div className="h-24 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 flex items-center justify-around px-6">
                        {divisas.length > 0 ? divisas.map((d, idx) => (
                            <div key={idx} className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-2xl">{d.bandera}</span>
                                    <span className="text-xs font-bold opacity-50 uppercase tracking-widest">{d.codigo}</span>
                                </div>
                                <span className="text-2xl font-mono font-black text-white">
                                    <span className="text-sm opacity-50 mr-1">$</span>{d.tipo_cambio}
                                </span>
                            </div>
                        )) : (
                            <span className="text-white/30 text-sm uppercase tracking-widest">Tipo de cambio no disponible</span>
                        )}
                    </div>

                </div>
            </footer>

            <style>{`
                .animate-marquee-horizontal { animation: marquee 15s linear infinite; }
                @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}