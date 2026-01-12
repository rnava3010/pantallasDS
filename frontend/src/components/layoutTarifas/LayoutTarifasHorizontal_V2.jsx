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
    const ITEMS_POR_PAGINA = 5;

    useEffect(() => {
        const int = setInterval(() => setIdiomaIndex(prev => (prev + 1) % idiomas.length), (config?.tiempo_rotacion_idioma || 20) * 1000);
        return () => clearInterval(int);
    }, [idiomas]);

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
            {/* FONDO: GALERÍA A PANTALLA COMPLETA */}
            <div className="absolute inset-0 z-0">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            </div>

            {/* CONTENIDO SUPERPUESTO */}
            <div className="relative z-10 h-full flex flex-col p-8 justify-between text-white">
                <header className="flex justify-between items-center bg-black/40 p-6 rounded-3xl border border-white/10">
                    <img src={config.logo} className="h-14" alt="logo" />
                    <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ color: acento }}>{dict.titulo_largo}</h1>
                    <div className="text-right leading-none">
                        <div className="text-3xl font-mono font-bold">{horaActual?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        <div className="text-[10px] opacity-60 uppercase">{horaActual?.toLocaleDateString()}</div>
                    </div>
                </header>

                <main className="grid grid-cols-1 gap-3 max-w-5xl mx-auto w-full">
                    {tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA).map((t, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/5 animate-fade-in-up">
                            <span className="text-2xl font-bold uppercase">{getTxt(t, 'nombre')}</span>
                            <span className="text-4xl font-mono font-black" style={{ color: acento }}>{t.moneda}{t.precio_promocion || t.precio_rack}</span>
                        </div>
                    ))}
                </main>

                <footer className="flex flex-col gap-4">
                    <div className="flex justify-center gap-4">
                        {datos?.divisas.map((d, i) => (
                            <div key={i} className="bg-black/60 px-4 py-2 rounded-xl border border-white/10 font-mono">
                                <span className="text-xs opacity-40 mr-2">{d.codigo}</span>{d.tipo_cambio}
                            </div>
                        ))}
                    </div>
                    {textoLegal && <p className="text-center text-[10px] opacity-50 uppercase tracking-[0.3em]">{textoLegal}</p>}
                </footer>
            </div>
        </div>
    );
}