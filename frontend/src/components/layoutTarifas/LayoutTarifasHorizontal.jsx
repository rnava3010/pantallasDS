import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutTarifasHorizontal({ 
    config, datos, horaActual, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    
    const tarifas = datos?.tarifas || [];
    const banner = datos?.banner || "Bienvenidos - Consulte nuestras promociones";
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
            <header className="flex justify-between items-center mb-10 bg-black/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                <img 
                    src={config.logo} 
                    alt="Logo" 
                    className="h-14 object-contain animate-logo-float" 
                />
                
                <h1 
                    className="text-4xl font-black uppercase tracking-tighter transition-all duration-300" 
                    style={{ 
                        color: acento,
                        textShadow: `0 0 20px ${acento}80, 0 0 40px ${acento}40`
                    }}
                >
                    Tarifas Vigentes
                </h1>
                
                <div className="text-right flex flex-col justify-center">
                    <span className="text-5xl font-mono font-black block leading-none text-white">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-lg opacity-80 text-white font-light uppercase tracking-widest mt-1">
                        {horaActual?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* CENTRO: LISTADO DE TARIFAS */}
            <main className="flex-1 flex flex-col gap-4 px-10">
                {visibles.map((t, i) => {
                    // Lógica de Precios
                    // Verificamos si existe precio_promocion y si es válido (mayor a 0)
                    const tienePromo = t.precio_promocion && parseFloat(t.precio_promocion) > 0;
                    const precioMostrar = tienePromo ? t.precio_promocion : t.precio_rack;
                    const monedaSymbol = t.moneda || '$';

                    return (
                        <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5 animate-fade-in-up">
                            <div className="flex flex-col">
                                <span className="text-3xl font-black uppercase" style={{ color: texto_evento }}>{t.nombre}</span>
                                <span className="text-sm opacity-50 text-white italic mt-1">{t.descripcion}</span>
                            </div>
                            
                            {/* Columna de Precios Alineada a la derecha */}
                            <div className="flex flex-col items-end justify-center">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold opacity-40 text-white">{monedaSymbol}</span>
                                    <span className="text-5xl font-mono font-black" style={{ color: acento }}>{precioMostrar}</span>
                                </div>
                                
                                {/* Mostrar precio regular solo si hay promoción activa */}
                                {tienePromo && (
                                    <span className="text-base font-bold text-white/40 mt-1">
                                        Reg. {monedaSymbol} {t.precio_rack}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* FOOTER: GALERÍA Y BANNER */}
            <footer className="h-64 mt-10 grid grid-cols-2 gap-8">
                <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="bg-black/40 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 flex items-center justify-center overflow-hidden">
                    <div className="animate-marquee-horizontal whitespace-nowrap">
                        <span className="text-4xl font-light tracking-widest text-white uppercase">{banner}</span>
                    </div>
                </div>
            </footer>

            <style>{`
                .animate-marquee-horizontal { animation: marquee 20s linear infinite; }
                @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                .animate-logo-float { animation: floatLogo 6s ease-in-out infinite; }
                @keyframes floatLogo {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
            `}</style>
        </div>
    );
}