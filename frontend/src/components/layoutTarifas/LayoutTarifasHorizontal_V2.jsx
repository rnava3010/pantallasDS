import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { TEXTOS_TARIFAS } from '../../utils/diccionario';

export default function LayoutTarifasHorizontal2({ config, datos, horaActual, itemActual, videoBlobUrl }) {
    const [pagina, setPagina] = useState(0);
    const [idiomaIndex, setIdiomaIndex] = useState(0);
    const { acento } = config.colores;
    
    const idiomas = Array.isArray(config?.idiomas_activos) ? config.idiomas_activos : ['es'];
    const idiomaActual = idiomas[idiomaIndex];
    const dict = TEXTOS_TARIFAS[idiomaActual] || TEXTOS_TARIFAS['es'];
    const pieTarifasObj = config?.pieTarifas || {};
    const textoLegal = pieTarifasObj[idiomaActual] || pieTarifasObj['es'] || "";

    const tarifas = datos?.tarifas || [];
    const avisosRaw = datos?.avisos || [];
    const ITEMS_POR_PAGINA = 5;
    const visibles = tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    useEffect(() => {
        const int = setInterval(() => setIdiomaIndex(prev => (prev + 1) % idiomas.length), (config?.tiempo_rotacion_idioma || 20) * 1000);
        return () => clearInterval(int);
    }, [idiomas, config]);

    useEffect(() => {
        const total = Math.ceil(tarifas.length / ITEMS_POR_PAGINA);
        if (total > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % total), 10000);
            return () => clearInterval(int);
        }
    }, [tarifas.length]);

    const getTxt = (obj, campo) => obj[`${campo}_${idiomaActual}`] || obj[campo] || "";

    return (
        <div className="h-screen w-screen overflow-hidden relative bg-black text-white">
            <div className="absolute inset-0 z-0">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 h-full flex flex-col p-6 justify-between">
                <header className="flex justify-between items-center bg-black/60 p-5 rounded-2xl border border-white/10 shadow-2xl">
                    <img src={config.logo} className="h-14" alt="logo" />
                    <h1 className="text-3xl font-black uppercase tracking-tight" 
                        style={{ color: acento, textShadow: `0px 2px 10px rgba(0,0,0,0.9), 0 0 20px ${acento}44` }}>
                        {dict.titulo_largo}
                    </h1>
                    <div className="text-right leading-none flex flex-col items-end gap-1">
                        <div className="text-4xl font-mono font-black">{horaActual?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        <div className="text-[11px] font-bold opacity-70 uppercase tracking-widest border-t border-white/20 pt-1">
                            {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : 'es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex gap-6 py-6 overflow-hidden">
                    <main className="w-2/3 flex flex-col gap-3 justify-center">
                        {visibles.map((t, i) => (
                            <div key={i} className="flex justify-between items-center bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 animate-fade-in-up shadow-xl">
                                <div className="flex flex-col max-w-[70%] text-left">
                                    <span className="text-xl font-bold uppercase truncate pr-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,1)' }}>
                                        {getTxt(t, 'nombre')}
                                    </span>
                                    <span className="text-[11px] opacity-50 italic truncate" style={{ textShadow: '1px 1px 2px rgba(0,0,0,1)' }}>
                                        {getTxt(t, 'descripcion')}
                                    </span>
                                </div>
                                <span className="text-3xl font-mono font-black" 
                                      style={{ color: acento, textShadow: `0 0 8px ${acento}88` }}>
                                    {t.moneda}{t.precio_promocion || t.precio_rack}
                                </span>
                            </div>
                        ))}
                    </main>

                    <aside className="w-1/3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col overflow-hidden relative shadow-2xl text-center">
                        <div className="mb-4 border-b border-white/10 pb-2">
                            <span className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: acento }}>Avisos</span>
                        </div>
                        <div className="flex-1 relative overflow-hidden">
                            <div className="animate-marquee-vertical flex flex-col gap-10 items-center w-full">
                                {[...avisosRaw, ...avisosRaw].map((aviso, i) => (
                                    <span key={i} className="text-lg font-light tracking-wide uppercase leading-snug">
                                        {getTxt(aviso, 'texto')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>

                <footer className="flex flex-col gap-3 bg-black/60 p-4 rounded-2xl border border-white/10">
                    <div className="text-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] block" style={{ color: acento }}>Tipo de Cambio</span>
                    </div>
                    <div className="flex justify-center gap-6">
                        {datos?.divisas.map((d, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-lg border border-white/5">
                                <span className="text-xs font-bold opacity-40 uppercase">{d.codigo}</span>
                                <span className="text-xl font-mono font-bold">{d.simbolo || '$'} {d.tipo_cambio}</span>
                            </div>
                        ))}
                    </div>
                    {textoLegal && <p className="text-center text-[8px] opacity-40 uppercase tracking-[0.2em] mt-2">{textoLegal}</p>}
                </footer>
            </div>
            <style>{`
                .animate-marquee-vertical { animation: marqueeVertical 25s linear infinite; }
                @keyframes marqueeVertical { 0% { transform: translateY(0%); } 100% { transform: translateY(-50%); } }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}