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
    
    // ✅ Cambiado a 4 items: Cabe perfecto en 1920px de alto
    const ITEMS_POR_PAGINA = 4;

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
        <div className="h-screen w-screen overflow-hidden p-8 flex flex-col gap-5" style={{ backgroundColor: fondo }}>
            
            {/* 1. HEADER HORIZONTAL (Logo | Título | Reloj) */}
            <header className="grid grid-cols-3 items-center bg-black/40 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
                <div className="flex justify-start">
                    <img src={config.logo} alt="Logo" className="h-14 object-contain animate-logo-float" />
                </div>

                <div className="text-center">
                    <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: acento, textShadow: `0 0 15px ${acento}40` }}>
                        {dict.titulo_largo}
                    </h1>
                </div>

                <div className="flex flex-col items-end border-l border-white/10 pl-5">
                    <span className="text-3xl font-mono font-black text-white leading-none">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] opacity-50 text-white font-light uppercase tracking-widest mt-1">
                        {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : 'es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </header>

            {/* 2. LISTADO DE TARIFAS (CARRUSEL DE 4) */}
            <main className="flex-1 flex flex-col gap-4 justify-start mt-2">
                {visibles.map((t, i) => {
                    const tienePromo = t.precio_promocion && parseFloat(t.precio_promocion) > 0;
                    const precioMostrar = tienePromo ? t.precio_promocion : t.precio_rack;
                    const monedaSymbol = t.moneda || '$';

                    return (
                        <div key={i} className="flex flex-col p-5 bg-white/5 rounded-3xl border border-white/5 animate-fade-in-up shadow-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold uppercase truncate max-w-[60%]" style={{ color: texto_evento }}>
                                    {getTxt(t, 'nombre')}
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold opacity-30 text-white">{monedaSymbol}</span>
                                    <span className="text-4xl font-mono font-black" style={{ color: acento }}>{precioMostrar}</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center border-t border-white/5 mt-3 pt-3">
                                <span className="text-sm opacity-50 text-white italic truncate max-w-[70%]">
                                    {getTxt(t, 'descripcion')}
                                </span>
                                {tienePromo && (
                                    <span className="text-xs font-bold text-white/20 line-through">
                                        {dict.reg} {monedaSymbol}{t.precio_rack}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* ✅ PIE DE TARIFAS FIJO (Siempre debajo de la lista) */}
            {textoLegal && (
                <div className="text-center px-4">
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.25em] leading-relaxed">
                        {textoLegal}
                    </p>
                </div>
            )}

            {/* 3. TIPO DE CAMBIO (COMPACTO) */}
            <div className="flex justify-center gap-4 py-2 flex-wrap">
                {divisas.map((divisa, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                        <img 
                            src={divisa.imagen_url} 
                            className="w-6 h-6 rounded-full" 
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} 
                        />
                        <span className="hidden text-sm">{FLAGS_EMOJI[divisa.codigo]}</span>
                        <div className="flex gap-2 items-baseline">
                            <span className="text-[10px] font-bold text-white/30">{divisa.codigo}</span>
                            <span className="text-xl font-mono font-bold text-white">{divisa.tipo_cambio}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 4. FOOTER (GALERÍA + MARQUESINA) */}
            <footer className="h-72 flex flex-col gap-4">
                <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                
                <div className="h-12 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex items-center overflow-hidden">
                    <div className="animate-marquee-horizontal whitespace-nowrap">
                        {avisosRaw.map((aviso, i) => (
                            <span key={i} className="text-lg font-medium tracking-widest text-white uppercase mx-20">
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
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .animate-logo-float { animation: floatLogo 6s ease-in-out infinite; }
                @keyframes floatLogo { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
            `}</style>
        </div>
    );
}