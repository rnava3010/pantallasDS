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
    
    const ITEMS_POR_PAGINA = 5;

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
        <div className="h-screen w-screen overflow-hidden p-8 flex flex-col" style={{ backgroundColor: fondo }}>
            
            {/* 1. HEADER - Reducido para evitar que empuje las tarifas */}
            <header className="flex flex-col items-center bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-xl mb-4 gap-1">
                <img src={config.logo} alt="Logo" className="h-16 object-contain animate-logo-float" />
                <h1 className="text-xl font-black uppercase text-center" style={{ color: acento, textShadow: `0 0 10px ${acento}40` }}>
                    {dict.titulo_largo}
                </h1>
                <div className="flex items-center gap-3">
                    <span className="text-3xl font-mono font-black text-white">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] opacity-50 text-white font-light uppercase tracking-widest border-l border-white/20 pl-3">
                        {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : 'es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </header>

            {/* 2. LISTADO DE TARIFAS - Espaciado más compacto */}
            <main className="flex-1 flex flex-col gap-2 justify-start min-h-0">
                {visibles.map((t, i) => {
                    const tienePromo = t.precio_promocion && parseFloat(t.precio_promocion) > 0;
                    const precioMostrar = tienePromo ? t.precio_promocion : t.precio_rack;
                    const monedaSymbol = t.moneda || '$';

                    return (
                        <div key={i} className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5 animate-fade-in-up">
                            <div className="flex justify-between items-start">
                                <span className="text-xl font-bold uppercase truncate max-w-[70%]" style={{ color: texto_evento }}>
                                    {getTxt(t, 'nombre')}
                                </span>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xs font-bold opacity-30 text-white">{monedaSymbol}</span>
                                        <span className="text-3xl font-mono font-black" style={{ color: acento }}>{precioMostrar}</span>
                                    </div>
                                    {tienePromo && (
                                        <span className="text-[10px] font-bold text-white/20 line-through">
                                            {dict.reg} {monedaSymbol}{t.precio_rack}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {getTxt(t, 'descripcion') && (
                                <span className="text-[11px] opacity-40 text-white italic truncate mt-1">
                                    {getTxt(t, 'descripcion')}
                                </span>
                            )}
                        </div>
                    );
                })}

                {/* PIE DE TARIFAS - Letra más pequeña para no robar espacio */}
                {textoLegal && (
                    <div className="text-center mt-2 px-4">
                        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] leading-tight">
                            {textoLegal}
                        </p>
                    </div>
                )}
            </main>

            {/* 3. TIPO DE CAMBIO - En una sola fila horizontal muy compacta */}
            <div className="flex justify-center gap-3 py-4 flex-wrap">
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
                            <span className="text-base font-mono font-bold text-white">{divisa.tipo_cambio}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 4. FOOTER - Video más pequeño para liberar la parte superior */}
            <footer className="h-80 flex flex-col gap-3">
                <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 bg-black shadow-inner">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                
                {/* MARQUESINA HORIZONTAL */}
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