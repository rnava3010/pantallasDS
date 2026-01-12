import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutTarifasHorizontal({ 
    config, datos, horaActual, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    
    const tarifas = datos?.tarifas || [];
    // ✅ DEBUG: Mira la consola del navegador. Si esto sale vacío, el error está en backend/pantallaController.js
    console.log("💰 DIVISAS RECIBIDAS:", datos?.divisas); 
    
    const divisas = datos?.divisas || []; 
    const banner = datos?.banner || "Bienvenidos - Consulte nuestras promociones";
    
    // ⚠️ REDUCIDO A 4 PARA DAR ESPACIO A LAS DIVISAS
    const ITEMS_POR_PAGINA = 4; 

    useEffect(() => {
        if (tarifas.length === 0) return;
        const total = Math.ceil(tarifas.length / ITEMS_POR_PAGINA);
        if (total > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % total), 10000);
            return () => clearInterval(int);
        }
    }, [tarifas.length]);

    const visibles = tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden p-6" style={{ backgroundColor: fondo }}>
            
            {/* --- HEADER --- */}
            <header className="flex-shrink-0 flex justify-between items-center mb-4 bg-black/40 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/10 shadow-xl z-20">
                <img 
                    src={config.logo} 
                    alt="Logo" 
                    className="h-12 object-contain animate-logo-float" 
                />
                
                <h1 
                    className="text-3xl font-black uppercase tracking-tighter" 
                    style={{ 
                        color: acento,
                        textShadow: `0 0 20px ${acento}80, 0 0 40px ${acento}40`
                    }}
                >
                    Tarifas Vigentes
                </h1>
                
                <div className="text-right flex flex-col justify-center">
                    <span className="text-4xl font-mono font-black block leading-none text-white">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm opacity-80 text-white font-light uppercase tracking-widest mt-1">
                        {horaActual?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* --- ZONA CENTRAL (Tarifas + Divisas) --- */}
            <div className="flex-1 flex flex-col min-h-0 mb-4 relative z-10">
                
                {/* 1. LISTADO DE TARIFAS */}
                <main className="flex-1 flex flex-col justify-start gap-3 px-4 overflow-hidden">
                    {visibles.map((t, i) => {
                        const tienePromo = t.precio_promocion && parseFloat(t.precio_promocion) > 0;
                        const precioMostrar = tienePromo ? t.precio_promocion : t.precio_rack;
                        const monedaSymbol = t.moneda || '$';

                        return (
                            <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 animate-fade-in-up shadow-lg">
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-2xl font-black uppercase truncate" style={{ color: texto_evento }}>{t.nombre}</span>
                                    {t.descripcion && <span className="text-xs opacity-60 text-white italic mt-1 truncate max-w-lg">{t.descripcion}</span>}
                                </div>
                                
                                <div className="flex flex-col items-end justify-center min-w-[180px]">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold opacity-40 text-white">{monedaSymbol}</span>
                                        <span className="text-4xl font-mono font-black" style={{ color: acento }}>{precioMostrar}</span>
                                    </div>
                                    {tienePromo && (
                                        <span className="text-xs font-bold text-white/40">
                                            Reg. {monedaSymbol} {t.precio_rack}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </main>

                {/* 2. BARRA DE DIVISAS (Fija al fondo del contenedor central) */}
                {divisas.length > 0 ? (
                    <div className="flex-shrink-0 mt-2 px-4 h-20"> {/* Altura forzada */}
                        <div className="flex items-center justify-center gap-4 h-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            {divisas.map((divisa, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg">
                                    <span className="text-2xl drop-shadow-md select-none">{divisa.bandera}</span>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-white/50 tracking-widest uppercase">
                                            {divisa.codigo}
                                        </span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xs text-white/70">{divisa.simbolo}</span>
                                            <span className="text-xl font-mono font-bold text-white">{divisa.tipo_cambio}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-white text-xs text-center opacity-20">Esperando datos de divisas... (Revise Backend)</div>
                )}
            </div>

            {/* --- FOOTER --- */}
            <footer className="flex-shrink-0 h-48 grid grid-cols-2 gap-6 z-20">
                <div className="relative rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="bg-black/40 backdrop-blur-md rounded-[1.5rem] border border-white/10 p-4 flex items-center justify-center overflow-hidden">
                    <div className="animate-marquee-horizontal whitespace-nowrap">
                        <span className="text-2xl font-light tracking-widest text-white uppercase">{banner}</span>
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