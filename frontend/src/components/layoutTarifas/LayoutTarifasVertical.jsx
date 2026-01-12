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
        <div className="h-screen w-screen overflow-hidden p-5 flex flex-col justify-between" style={{ backgroundColor: fondo }}>
            
            {/* HEADER - Tamaños corregidos (mitad del incremento) */}
            <header className="grid grid-cols-3 items-center bg-black/50 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-xl shrink-0">
                <div className="flex justify-start">
                    <img src={config.logo} alt="Logo" className="h-10 object-contain" />
                </div>
                <div className="text-center">
                    <h1 className="text-base font-black uppercase text-white tracking-widest" style={{ textShadow: `0 0 10px ${acento}40` }}>
                        {dict.titulo_largo}
                    </h1>
                </div>
                <div className="flex flex-col items-end leading-none gap-0.5">
                    <span className="text-xl font-mono font-black text-white">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[9px] font-bold opacity-60 text-white uppercase tracking-wider">
                        {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : 'es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </header>

            {/* TARIFAS - Espaciado profesional */}
            <main className="flex-1 flex flex-col gap-2.5 justify-center py-2 overflow-hidden">
                {visibles.map((t, i) => {
                    const tienePromo = t.precio_promocion && parseFloat(t.precio_promocion) > 0;
                    const precioMostrar = tienePromo ? t.precio_promocion : t.precio_rack;
                    const monedaSymbol = t.moneda || '$';

                    return (
                        <div key={i} className="flex flex-col px-4 py-2.5 bg-white/5 rounded-xl border border-white/5 animate-fade-in-up">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col max-w-[65%]">
                                    <span className="text-base font-bold uppercase truncate text-white">
                                        {getTxt(t, 'nombre')}
                                    </span>
                                    <span className="text-[10px] opacity-40 text-white italic truncate">
                                        {getTxt(t, 'descripcion')}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[10px] font-bold opacity-30 text-white">{monedaSymbol}</span>
                                        <span className="text-3xl font-mono font-black leading-none" style={{ color: acento }}>{precioMostrar}</span>
                                    </div>
                                    {tienePromo && (
                                        <span className="text-[9px] font-bold text-white/20 line-through">
                                            {dict.reg} {monedaSymbol}{t.precio_rack}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* AVISO FIJO Y TIPO DE CAMBIO - Tamaño medio */}
            <div className="flex flex-col gap-2.5 shrink-0 mb-1">
                {textoLegal && (
                    <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] text-center font-semibold leading-none">
                        {textoLegal}
                    </p>
                )}
                
                <div className="flex justify-center gap-2.5 flex-wrap">
                    {divisas.map((divisa, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 shadow-md">
                            {/* src usa la URL que ya procesamos en el backend */}
                            <img 
                                src={divisa.imagen_url} 
                                className="w-5 h-5 rounded-full border border-white/10"
                                onError={(e) => {
                                    e.target.style.display = 'none'; 
                                    e.target.nextSibling.style.display = 'block'; 
                                }}
                            />
                            <span className="hidden text-sm">{FLAGS_EMOJI[divisa.codigo]}</span>
                            <div className="flex gap-1.5 items-baseline">
                                <span className="text-[9px] font-bold text-white/30 uppercase">{divisa.codigo}</span>
                                <span className="text-base font-mono font-bold text-white">{divisa.tipo_cambio}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FOOTER */}
            <footer className="flex flex-col gap-2.5 shrink-0">
                <div className="h-[21vh] relative rounded-2xl overflow-hidden border border-white/10 bg-black shadow-inner">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                
                <div className="h-9 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center overflow-hidden px-4">
                    <div className="animate-marquee-horizontal whitespace-nowrap">
                        {avisosRaw.map((aviso, i) => (
                            <span key={i} className="text-xs font-bold tracking-widest text-white uppercase mx-14">
                                {getTxt(aviso, 'texto')}
                            </span>
                        ))}
                    </div>
                </div>
            </footer>

            <style>{`
                .animate-marquee-horizontal { display: inline-block; animation: marqueeH 45s linear infinite; }
                @keyframes marqueeH { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}