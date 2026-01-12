import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { TEXTOS_TARIFAS } from '../../utils/diccionario';

const FLAGS_EMOJI = {
    USD: '🇺🇸', EUR: '🇪🇺', CAD: '🇨🇦', JPY: '🇯🇵', MXN: '🇲🇽', GBP: '🇬🇧'
};

export default function LayoutTarifasVertical({ 
    config, datos, horaActual, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    const [idiomaIndex, setIdiomaIndex] = useState(0);

    const { fondo, texto_evento, acento } = config.colores;
    
    const idiomas = Array.isArray(config?.idiomas_activos) ? config.idiomas_activos : ['es'];
    const tiempoRotacion = (config?.tiempo_rotacion_idioma || 20) * 1000;
    
    const idiomaActual = idiomas[idiomaIndex];
    const dict = TEXTOS_TARIFAS[idiomaActual] || TEXTOS_TARIFAS['es'];
    const pieTarifasObj = config?.pieTarifas || {};
    const textoLegal = pieTarifasObj[idiomaActual] || pieTarifasObj['es'] || "";

    const tarifas = datos?.tarifas || [];
    const divisas = datos?.divisas || [];
    const avisosRaw = datos?.avisos || [];
    
    // Mantenemos 3 items para asegurar que el diseño respire
    const ITEMS_POR_PAGINA = 3;

    useEffect(() => {
        if (idiomas.length > 1) {
            const interval = setInterval(() => {
                setIdiomaIndex(prev => (prev + 1) % idiomas.length);
            }, tiempoRotacion);
            return () => clearInterval(interval);
        }
    }, [idiomas, tiempoRotacion]);

    useEffect(() => {
        if (tarifas.length === 0) return;
        const total = Math.ceil(tarifas.length / ITEMS_POR_PAGINA);
        if (total > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % total), 10000);
            return () => clearInterval(int);
        }
    }, [tarifas.length, idiomaIndex]);

    const getTxt = (obj, campoBase) => {
        if (!obj) return "";
        if (idiomaActual === 'es') return obj[campoBase] || ""; 
        const campoTraducido = `${campoBase}_${idiomaActual}`;
        return obj[campoTraducido] || obj[campoBase] || ""; 
    };

    const visibles = tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    return (
        <div className="h-screen w-screen overflow-hidden p-6 flex flex-col gap-4" style={{ backgroundColor: fondo }}>
            
            {/* 1. HEADER HORIZONTAL COMPACTO */}
            <header className="grid grid-cols-3 items-center bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex justify-start">
                    <img src={config.logo} alt="Logo" className="h-12 object-contain animate-logo-float" />
                </div>

                <div className="text-center">
                    <h1 className="text-xl font-black uppercase tracking-tight" style={{ color: acento, textShadow: `0 0 10px ${acento}40` }}>
                        {dict.titulo_largo}
                    </h1>
                </div>

                <div className="flex flex-col items-end border-l border-white/10 pl-4">
                    <span className="text-2xl font-mono font-black text-white leading-none">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[9px] opacity-50 text-white font-light uppercase tracking-widest mt-1">
                        {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : 'es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </header>

            {/* 2. CONTENEDOR DE TARIFAS (CARRUSEL) */}
            <main className="flex-1 flex flex-col gap-3 justify-center min-h-0">
                {visibles.map((t, i) => {
                    const tienePromo = t.precio_promocion && parseFloat(t.precio_promocion) > 0;
                    const precioMostrar = tienePromo ? t.precio_promocion : t.precio_rack;
                    const monedaSymbol = t.moneda || '$';

                    return (
                        <div key={i} className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5 animate-fade-in-up shadow-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold uppercase truncate max-w-[65%]" style={{ color: texto_evento }}>
                                    {getTxt(t, 'nombre')}
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xs font-bold opacity-30 text-white">{monedaSymbol}</span>
                                    <span className="text-3xl font-mono font-black" style={{ color: acento }}>{precioMostrar}</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center border-t border-white/5 mt-2 pt-2">
                                <span className="text-[11px] opacity-50 text-white italic truncate max-w-[70%]">
                                    {getTxt(t, 'descripcion')}
                                </span>
                                {tienePromo && (
                                    <span className="text-[10px] font-bold text-white/20 line-through">
                                        {dict.reg} {monedaSymbol}{t.precio_rack}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* ✅ 3. TEXTO LEGAL FIJO (Fuera del carrusel, siempre visible) */}
            {textoLegal && (
                <div className="text-center px-6">
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] leading-tight">
                        {textoLegal}
                    </p>
                </div>
            )}

            {/* 4. TIPO DE CAMBIO */}
            <div className="flex justify-center gap-3 py-1 flex-wrap">
                {divisas.map((divisa, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                        <img 
                            src={divisa.imagen_url} 
                            className="w-5 h-5 rounded-full" 
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} 
                        />
                        <span className="hidden text-sm">{FLAGS_EMOJI[divisa.codigo]}</span>
                        <div className="flex gap-1.5 items-baseline">
                            <span className="text-[9px] font-bold text-white/30">{divisa.codigo}</span>
                            <span className="text-lg font-mono font-bold text-white">{divisa.tipo_cambio}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 5. FOOTER (Video más chico y Marquesina) */}
            <footer className="h-64 flex flex-col gap-2">
                <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                
                <div className="h-10 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center overflow-hidden">
                    <div className="animate-marquee-horizontal whitespace-nowrap">
                        {avisosRaw.map((aviso, i) => (
                            <span key={i} className="text-sm font-medium tracking-widest text-white uppercase mx-16">
                                {getTxt(aviso, 'texto')}
                            </span>
                        ))}
                    </div>
                </div>
            </footer>

            <style>{`
                .animate-marquee-horizontal { 
                    display: inline-block;
                    animation: marqueeH 40s linear infinite; 
                }
                @keyframes marqueeH { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .animate-logo-float { animation: floatLogo 6s ease-in-out infinite; }
                @keyframes floatLogo { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
            `}</style>
        </div>
    );
}