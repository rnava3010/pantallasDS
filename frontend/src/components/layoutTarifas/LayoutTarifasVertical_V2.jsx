import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { TEXTOS_TARIFAS } from '../../utils/diccionario';

export default function LayoutTarifasVertical2({ config, datos, horaActual, itemActual, videoBlobUrl }) {
    const [pagina, setPagina] = useState(0);
    const [idiomaIndex, setIdiomaIndex] = useState(0);
    const { acento } = config.colores;
    
    const idiomas = Array.isArray(config?.idiomas_activos) ? config.idiomas_activos : ['es'];
    const idiomaActual = idiomas[idiomaIndex];
    const dict = TEXTOS_TARIFAS[idiomaActual] || TEXTOS_TARIFAS['es'];
    const pieTarifasObj = config?.pieTarifas || {};
    const textoLegal = pieTarifasObj[idiomaActual] || pieTarifasObj['es'] || "";

    const tarifas = datos?.tarifas || [];
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
        <div className="h-screen w-screen overflow-hidden relative bg-black">
            <div className="absolute inset-0 z-0">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"></div>
            </div>

            <div className="relative z-10 h-full flex flex-col p-8 justify-between text-white">
                <header className="flex justify-between items-center bg-black/75 p-6 rounded-[2.5rem] border border-white/20 shadow-2xl shrink-0">
                    <img src={config.logo} alt="Logo" className="h-12 object-contain" />
                    <h1 className="text-xl font-black uppercase tracking-widest text-center px-4" 
                        style={{ color: acento, textShadow: `0 0 10px ${acento}CC, 0 2px 4px rgba(0,0,0,1)` }}>
                        {dict.titulo_largo}
                    </h1>
                    <div className="text-right leading-none gap-1 flex flex-col items-end">
                        <div className="text-3xl font-mono font-black" style={{ textShadow: '0 2px 4px rgba(0,0,0,1)' }}>
                            {horaActual?.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </div>
                        {/* ✅ Fecha larga restaurada */}
                        <div className="text-[10px] opacity-90 uppercase font-bold tracking-widest" style={{ textShadow: '0 1px 2px rgba(0,0,0,1)' }}>
                            {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col gap-4 justify-center py-4">
                    {visibles.map((t, i) => (
                        <div key={i} className="bg-black/75 backdrop-blur-md p-6 rounded-[2rem] flex justify-between items-center border border-white/10 shadow-2xl animate-fade-in-up">
                            <div className="max-w-[65%]">
                                <div className="text-2xl font-bold uppercase truncate" style={{ textShadow: '2px 2px 4px rgba(0,0,0,1)' }}>
                                    {getTxt(t, 'nombre')}
                                </div>
                                <div className="text-sm opacity-60 italic truncate mt-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,1)' }}>
                                    {getTxt(t, 'descripcion')}
                                </div>
                            </div>
                            <div className="text-4xl font-mono font-black" 
                                 style={{ color: acento, textShadow: `0 0 15px ${acento}AA, 2px 2px 4px rgba(0,0,0,1)` }}>
                                {t.moneda}{t.precio_promocion || t.precio_rack}
                            </div>
                        </div>
                    ))}
                </main>

                <footer className="flex flex-col gap-5 shrink-0">
                    <div className="bg-black/75 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/20 shadow-2xl">
                        <div className="text-center mb-3">
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-70" style={{ color: acento }}>Tipo de Cambio</span>
                        </div>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {datos?.divisas.map((d, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/10 px-5 py-2.5 rounded-2xl border border-white/10 shadow-lg">
                                    <span className="text-[10px] font-bold opacity-50 uppercase">{d.codigo}</span>
                                    <span className="text-2xl font-mono font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                        {d.simbolo || '$'}{d.tipo_cambio}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ✅ MARQUESINA HORIZONTAL RE-ACTIVADA */}
                    <div className="h-14 bg-black/75 backdrop-blur-md rounded-2xl border border-white/20 flex items-center overflow-hidden shadow-2xl">
                        <div className="animate-marquee-horizontal whitespace-nowrap">
                            {datos?.avisos.map((aviso, i) => (
                                <span key={i} className="text-lg font-black tracking-widest text-white uppercase mx-16" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                                    {getTxt(aviso, 'texto')}
                                </span>
                            ))}
                        </div>
                    </div>

                    {textoLegal && (
                        <div className="px-4">
                            <p className="text-center text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,1)' }}>
                                {textoLegal}
                            </p>
                        </div>
                    )}
                </footer>
            </div>

            <style>{`
                .animate-marquee-horizontal { display: inline-block; animation: marqueeH 40s linear infinite; }
                @keyframes marqueeH { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}