import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { getIconoClima } from '../../utils/weatherUtils';

export default function LayoutTarifasVertical({ 
    config, datos, horaActual, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    
    const tarifas = datos?.tarifas || [];
    const divisas = datos?.divisas || []; // Recibimos divisas
    const banner = datos?.banner || "Bienvenidos";
    const ITEMS_POR_PAGINA = 7; 

    // Construimos el texto del Marquee combinando Banner + Divisas
    const textoDivisas = divisas.map(d => `${d.bandera} ${d.codigo}: $${d.tipo_cambio}`).join("  •  ");
    const contenidoMarquee = `${banner}  •  TIPO DE CAMBIO:  ${textoDivisas}  •  ${banner}`;

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
            
            {/* HEADER */}
            <header className="h-24 flex items-center justify-between mb-6 px-4 bg-black/20 rounded-[2rem] border border-white/5 shadow-lg">
                <div className="w-1/4 flex justify-start">
                    <img src={config.logo} alt="Logo" className="h-16 object-contain animate-float" />
                </div>
                <div className="w-2/4 text-center">
                    <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-white" style={{ textShadow: `0 0 20px ${acento}` }}>
                        TARIFAS
                    </h1>
                </div>
                <div className="w-1/4 flex flex-col items-end justify-center">
                    <span className="text-2xl font-mono font-black leading-none text-white">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/60 mt-1">
                        {horaActual?.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </header>

            {/* MAIN: LISTA DE TARIFAS */}
            <main className="flex-1 flex flex-col gap-3 bg-black/20 rounded-[3rem] p-8 border border-white/5 shadow-inner relative">
                <div className="flex justify-between items-center mb-2 px-4 text-[10px] font-black uppercase tracking-widest opacity-40 text-white">
                    <span>Habitación / Detalles</span>
                    <span>Tarifa</span>
                </div>
                {visibles.map((t, i) => {
                    const nombre = t.nombre || t.nombre_habitacion || "Habitación";
                    const descripcion = t.descripcion || ""; 
                    const precioPromoRaw = t.precio || t.precio_promocion;
                    const precioRackRaw = t.precio_rack;
                    const precioPrincipal = precioPromoRaw ? precioPromoRaw : precioRackRaw;
                    const hayDescuento = precioPromoRaw && precioRackRaw && (parseFloat(precioPromoRaw) < parseFloat(precioRackRaw));
                    const precioTachado = hayDescuento ? precioRackRaw : null;
                    const moneda = t.moneda || 'MXN';

                    return (
                        <div key={i} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0 animate-fade-in-up">
                            <div className="flex flex-col gap-1 max-w-[65%]">
                                <span className="text-xl font-bold text-white uppercase truncate">{nombre}</span>
                                {descripcion && <span className="text-[11px] text-white/60 font-light italic leading-tight block">{descripcion}</span>}
                            </div>
                            <div className="text-right flex flex-col items-end justify-center">
                                <span className="text-2xl font-black" style={{ color: acento }}>
                                    <span className="text-sm align-top opacity-60 mr-1">{moneda}</span>
                                    {Number(precioPrincipal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </span>
                                {precioTachado && (
                                    <span className="text-[10px] text-white/40 line-through decoration-white/40">
                                        Reg: ${Number(precioTachado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* GALERÍA + CLIMA */}
            <div className="h-[25%] my-6 relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {clima && (
                    <div className="absolute bottom-6 right-8 flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-lg">
                        <span className="text-4xl drop-shadow-lg filter grayscale-0">{getIconoClima(clima.weathercode)}</span>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white leading-none">{clima.temperature}°</span>
                            <span className="text-[10px] uppercase tracking-widest text-white/70">Clima Actual</span>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER: AVISOS + DIVISAS */}
            <footer className="h-10 flex items-center bg-black/40 rounded-full border border-white/10 px-6 overflow-hidden relative">
                <div className="animate-marquee-reverse whitespace-nowrap absolute w-full flex items-center">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/90">
                        {contenidoMarquee}
                    </span>
                </div>
            </footer>

            <style>{`
                .animate-marquee-reverse { animation: marqueeReverse 30s linear infinite; }
                @keyframes marqueeReverse { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}