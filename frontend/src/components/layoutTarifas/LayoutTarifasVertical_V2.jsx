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
    }, [idiomas]);

    return (
        <div className="h-screen w-screen p-6 flex flex-col justify-between overflow-hidden text-white" style={{ backgroundColor: fondo }}>
            {/* LOGO Y HORA */}
            <header className="flex justify-between items-center bg-black/20 p-5 rounded-3xl border border-white/5">
                <img src={config.logo} alt="Logo" className="h-10" />
                <div className="text-right">
                    <div className="text-2xl font-mono font-black">{horaActual?.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                    <div className="text-[9px] opacity-40 uppercase tracking-widest">{horaActual?.toLocaleDateString()}</div>
                </div>
            </header>

            {/* VIDEO MEDIANO */}
            <div className="h-[25vh] w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl my-4">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover" />
            </div>

            <h1 className="text-center text-xl font-black uppercase tracking-widest mb-4" style={{ color: acento }}>{dict.titulo_largo}</h1>

            {/* TARIFAS */}
            <main className="flex-1 flex flex-col gap-3">
                {datos?.tarifas.slice(0, 5).map((t, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                        <div className="max-w-[60%]">
                            <div className="text-lg font-bold uppercase truncate">{t.nombre}</div>
                            <div className="text-[10px] opacity-40 italic truncate">{t.descripcion}</div>
                        </div>
                        <div className="text-2xl font-mono font-black" style={{ color: acento }}>{t.moneda}{t.precio_rack}</div>
                    </div>
                ))}
            </main>

            {/* DIVISAS Y MENSAJE FIJO */}
            <footer className="mt-4 flex flex-col gap-4">
                <div className="flex justify-center gap-2 flex-wrap">
                    {datos?.divisas.map((d, i) => (
                        <div key={i} className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                            <span className="opacity-30 mr-1">{d.codigo}</span> <b>{d.tipo_cambio}</b>
                        </div>
                    ))}
                </div>
                {textoLegal && (
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <p className="text-center text-[9px] opacity-40 uppercase tracking-[0.2em] leading-relaxed">{textoLegal}</p>
                    </div>
                )}
            </footer>
        </div>
    );
}