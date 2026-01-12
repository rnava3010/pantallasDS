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
        <div className="h-screen w-screen overflow-hidden relative bg-black">
            {/* FONDO: Galería con overlay más clarito */}
            <div className="absolute inset-0 z-0">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 h-full flex flex-col p-6 justify-between text-white">
                {/* HEADER */}
                <header className="flex justify-between items-center bg-black/60 p-4 rounded-2xl border border-white/10 shadow-2xl">
                    <img src={config.logo} className="h-12" alt="logo" />
                    <h1 className="text-2xl font-black uppercase" style={{ color: acento, textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                        {dict.titulo_largo}
                    </h1>
                    <div className="text-right font-mono">
                        <div className="text-2xl font-bold">{horaActual?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                </header>

                <div className="flex-1 flex gap-6 py-6 overflow-hidden">
                    {/* IZQUIERDA: TARIFAS */}
                    <main className="w-2/3 flex flex-col gap-3 justify-center">
                        {tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA).map((t, i) => (
                            <div key={i} className="flex justify-between items-center bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 animate-fade-in-up shadow-xl">
                                <span className="text-xl font-bold uppercase truncate pr-4">{getTxt(t, 'nombre')}</span>
                                <span className="text-3xl font-mono font-black" style={{ color: acento }}>{t.moneda}{t.precio_promocion || t.precio_rack}</span>
                            </div>
                        ))}
                    </main>

                    {/* DERECHA: AVISOS (Banner Vertical) */}
                    <aside className="w-1/3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col overflow-hidden relative shadow-2xl">
                        <div className="text-center mb-4 border-b border-white/10 pb-2">
                            <span className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: acento }}>Avisos</span>
                        </div>
                        <div className="flex-1 relative overflow-hidden">
                            <div className="animate-marquee-vertical flex flex-col gap-10 items-center text-center w-full">
                                {[...avisosRaw, ...avisosRaw].map((aviso, i) => (
                                    <span key={i} className="text-lg font-light tracking-wide uppercase leading-snug">
                                        {getTxt(aviso, 'texto')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>

                {/* FOOTER: Tipo de Cambio */}
                <footer className="flex flex-col gap-3 bg-black/60 p-4 rounded-2xl border border-white/10">
                    <div className="text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 block" style={{ color: acento }}>Tipo de Cambio</span>
                    </div>
                    <div className="flex justify-center gap-6">
                        {datos?.divisas.map((d, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-lg border border-white/5">
                                <span className="text-xs font-bold opacity-40">{d.codigo}</span>
                                <span className="text-xl font-mono font-bold">{d.tipo_cambio}</span>
                            </div>
                        ))}
                    </div>
                    {textoLegal && <p className="text-center text-[8px] opacity-40 uppercase tracking-[0.2em] mt-2">{textoLegal}</p>}
                </footer>
            </div>
            <style>{`
                .animate-marquee-vertical { animation: marqueeVertical 20s linear infinite; }
                @keyframes marqueeVertical { 0% { transform: translateY(0%); } 100% { transform: translateY(-50%); } }
            `}</style>
        </div>
    );
}