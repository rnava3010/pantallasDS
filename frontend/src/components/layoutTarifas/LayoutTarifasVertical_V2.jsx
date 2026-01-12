import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { TEXTOS_TARIFAS } from '../../utils/diccionario';

export default function LayoutTarifasVertical2({ config, datos, horaActual, itemActual, videoBlobUrl }) {
    const [idiomaIndex, setIdiomaIndex] = useState(0);
    const { fondo, acento } = config.colores;
    
    const idiomas = Array.isArray(config?.idiomas_activos) ? config.idiomas_activos : ['es'];
    const idiomaActual = idiomas[idiomaIndex];
    const dict = TEXTOS_TARIFAS[idiomaActual] || TEXTOS_TARIFAS['es'];
    const pieTarifasObj = config?.pieTarifas || {};
    const textoLegal = pieTarifasObj[idiomaActual] || pieTarifasObj['es'] || "";

    useEffect(() => {
        const int = setInterval(() => setIdiomaIndex(prev => (prev + 1) % idiomas.length), (config?.tiempo_rotacion_idioma || 20) * 1000);
        return () => clearInterval(int);
    }, [idiomas, config]);

    return (
        <div className="h-screen w-screen p-6 flex flex-col justify-between overflow-hidden text-white relative" style={{ backgroundColor: fondo }}>
            
            {/* 1. HEADER: Logo y Reloj */}
            <header className="flex justify-between items-center bg-black/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 shrink-0 shadow-xl">
                <img src={config.logo} alt="Logo" className="h-12 object-contain" />
                <div className="text-right leading-none">
                    <div className="text-3xl font-mono font-black">{horaActual?.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                    <div className="text-[10px] opacity-50 uppercase tracking-[0.2em] mt-1">{horaActual?.toLocaleDateString()}</div>
                </div>
            </header>

            {/* 2. VIDEO CENTRAL */}
            <div className="h-[25vh] w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl my-4 shrink-0 relative">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            <h1 className="text-center text-xl font-black uppercase tracking-[0.3em] mb-4 shrink-0" style={{ color: acento, textShadow: `0 0 10px ${acento}40` }}>
                {dict.titulo_largo}
            </h1>

            {/* 3. LISTADO DE TARIFAS */}
            <main className="flex-1 flex flex-col gap-3 overflow-hidden justify-center py-2">
                {datos?.tarifas.slice(0, 5).map((t, i) => (
                    <div key={i} className="bg-white/5 p-5 rounded-[1.5rem] flex justify-between items-center border border-white/5 shadow-lg animate-fade-in-up">
                        <div className="max-w-[60%]">
                            <div className="text-lg font-bold uppercase truncate">{t.nombre}</div>
                            <div className="text-[11px] opacity-40 italic truncate">{t.descripcion}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-mono font-black" style={{ color: acento }}>{t.moneda}{t.precio_rack}</div>
                        </div>
                    </div>
                ))}
            </main>

            {/* 4. TIPO DE CAMBIO Y PIE LEGAL */}
            <footer className="mt-4 flex flex-col gap-4 shrink-0">
                <div className="bg-black/40 backdrop-blur-md p-4 rounded-[2rem] border border-white/10 shadow-xl">
                    <div className="text-center mb-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Tipo de Cambio</span>
                    </div>
                    <div className="flex justify-center gap-4 flex-wrap">
                        {datos?.divisas.map((d, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                <span className="text-[10px] font-bold opacity-30">{d.codigo}</span>
                                <span className="text-lg font-mono font-bold">{d.tipo_cambio}</span>
                            </div>
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
    );
}