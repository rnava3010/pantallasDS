import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { TEXTOS_TARIFAS } from '../../utils/diccionario';

export default function LayoutTarifasVertical2({ config, datos, horaActual, itemActual, videoBlobUrl }) {
    const [idiomaIndex, setIdiomaIndex] = useState(0);
    const [pagina, setPagina] = useState(0);
    const { acento } = config.colores;
    
    const idiomas = Array.isArray(config?.idiomas_activos) ? config.idiomas_activos : ['es'];
    const idiomaActual = idiomas[idiomaIndex];
    const dict = TEXTOS_TARIFAS[idiomaActual] || TEXTOS_TARIFAS['es'];
    const pieTarifasObj = config?.pieTarifas || {};
    const textoLegal = pieTarifasObj[idiomaActual] || pieTarifasObj['es'] || "";

    const tarifas = datos?.tarifas || [];
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
            {/* ✅ GALERÍA DE FONDO VERTICAL */}
            <div className="absolute inset-0 z-0">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"></div>
            </div>

            <div className="relative z-10 h-full flex flex-col p-8 justify-between text-white">
                {/* HEADER */}
                <header className="flex justify-between items-center bg-black/60 p-6 rounded-[2.5rem] border border-white/10 shadow-2xl shrink-0">
                    <img src={config.logo} alt="Logo" className="h-12 object-contain" />
                    <div className="text-right leading-none gap-1 flex flex-col items-end">
                        <div className="text-3xl font-mono font-black">{horaActual?.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                        <div className="text-[10px] opacity-60 uppercase font-bold tracking-widest">{horaActual?.toLocaleDateString()}</div>
                    </div>
                </header>

                {/* TÍTULO */}
                <h1 className="text-center text-2xl font-black uppercase tracking-[0.3em] my-4 shrink-0" style={{ color: acento, textShadow: `0 0 15px ${acento}60` }}>
                    {dict.titulo_largo}
                </h1>

                {/* TARIFAS (CENTRO) */}
                <main className="flex-1 flex flex-col gap-4 justify-center py-4">
                    {visibles = tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA)}
                    {visibles.map((t, i) => (
                        <div key={i} className="bg-black/60 backdrop-blur-md p-6 rounded-[2rem] flex justify-between items-center border border-white/10 shadow-xl animate-fade-in-up">
                            <div className="max-w-[65%]">
                                <div className="text-xl font-bold uppercase truncate">{getTxt(t, 'nombre')}</div>
                                <div className="text-[11px] opacity-40 italic truncate">{getTxt(t, 'descripcion')}</div>
                            </div>
                            <div className="text-3xl font-mono font-black" style={{ color: acento }}>{t.moneda}{t.precio_rack}</div>
                        </div>
                    ))}
                </main>

                {/* FOOTER: DIVISAS Y AVISOS */}
                <footer className="flex flex-col gap-5 shrink-0">
                    {/* TIPO DE CAMBIO */}
                    <div className="bg-black/60 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 shadow-xl">
                        <div className="text-center mb-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50" style={{ color: acento }}>Tipo de Cambio</span>
                        </div>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {datos?.divisas.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                    <span className="text-[10px] font-bold opacity-30 uppercase">{d.codigo}</span>
                                    <span className="text-xl font-mono font-bold">{d.tipo_cambio}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MARQUESINA HORIZONTAL DE AVISOS */}
                    <div className="h-12 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex items-center overflow-hidden">
                        <div className="animate-marquee-horizontal whitespace-nowrap">
                            {datos?.avisos.map((aviso, i) => (
                                <span key={i} className="text-sm font-medium tracking-widest text-white uppercase mx-16">
                                    {getTxt(aviso, 'texto')}
                                </span>
                            ))}
                        </div>
                    </div>

                    {textoLegal && (
                        <div className="px-4">
                            <p className="text-center text-[9px] opacity-40 uppercase tracking-[0.2em] leading-relaxed">
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
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}