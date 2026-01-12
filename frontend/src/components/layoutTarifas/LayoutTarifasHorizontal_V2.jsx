import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { TEXTOS_TARIFAS } from '../../utils/diccionario';

const FLAGS_EMOJI = { USD: '🇺🇸', EUR: '🇪🇺', CAD: '🇨🇦', JPY: '🇯🇵', MXN: '🇲🇽', GBP: '🇬🇧' };

export default function LayoutTarifasHorizontal2({ config, datos, horaActual, itemActual, videoBlobUrl }) {
    const [pagina, setPagina] = useState(0);
    const [idiomaIndex, setIdiomaIndex] = useState(0);
    const { fondo, texto_evento, acento } = config.colores;
    
    const idiomas = Array.isArray(config?.idiomas_activos) ? config.idiomas_activos : ['es'];
    const idiomaActual = idiomas[idiomaIndex];
    const dict = TEXTOS_TARIFAS[idiomaActual] || TEXTOS_TARIFAS['es'];
    const pieTarifasObj = config?.pieTarifas || {};
    const textoLegal = pieTarifasObj[idiomaActual] || pieTarifasObj['es'] || "";

    const tarifas = datos?.tarifas || [];
    const divisas = datos?.divisas || [];
    const avisosRaw = datos?.avisos || [];
    const ITEMS_POR_PAGINA = 4;

    useEffect(() => {
        if (idiomas.length > 1) {
            const int = setInterval(() => setIdiomaIndex(prev => (prev + 1) % idiomas.length), (config?.tiempo_rotacion_idioma || 20) * 1000);
            return () => clearInterval(int);
        }
    }, [idiomas, config]);

    useEffect(() => {
        const total = Math.ceil(tarifas.length / ITEMS_POR_PAGINA);
        if (total > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % total), 10000);
            return () => clearInterval(int);
        }
    }, [tarifas.length]);

    const getTxt = (obj, campoBase) => {
        if (idiomaActual === 'es') return obj[campoBase] || "";
        return obj[`${campoBase}_${idiomaActual}`] || obj[campoBase] || "";
    };

    return (
        <div className="h-screen w-screen overflow-hidden flex" style={{ backgroundColor: fondo }}>
            {/* IZQUIERDA: MEDIA (40% del ancho) */}
            <div className="w-[40%] h-full relative border-r border-white/10 shadow-2xl">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            </div>

            {/* DERECHA: TARIFAS Y DATOS (60% del ancho) */}
            <div className="flex-1 flex flex-col p-10 justify-between">
                <header className="flex justify-between items-center border-b border-white/10 pb-6">
                    <img src={config.logo} alt="Logo" className="h-16 object-contain" />
                    <div className="text-right">
                        <h1 className="text-3xl font-black uppercase" style={{ color: acento }}>{dict.titulo_largo}</h1>
                        <span className="text-xl font-mono text-white opacity-60 uppercase">{horaActual?.toLocaleTimeString()}</span>
                    </div>
                </header>

                <main className="flex-1 flex flex-col justify-center gap-4 py-8">
                    {tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA).map((t, i) => (
                        <div key={i} className="flex justify-between items-center border-l-4 p-5 bg-white/5 animate-fade-in-up" style={{ borderColor: acento }}>
                            <div>
                                <h2 className="text-2xl font-bold uppercase text-white">{getTxt(t, 'nombre')}</h2>
                                <p className="text-sm opacity-40 italic text-white">{getTxt(t, 'descripcion')}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-mono font-black" style={{ color: acento }}>{t.moneda}{t.precio_promocion || t.precio_rack}</span>
                            </div>
                        </div>
                    ))}
                </main>

                <footer className="space-y-4">
                    <div className="flex justify-center gap-6">
                        {divisas.map((d, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10">
                                <span className="text-xs font-bold text-white/40">{d.codigo}</span>
                                <span className="text-xl font-mono text-white font-bold">{d.tipo_cambio}</span>
                            </div>
                        ))}
                    </div>
                    <div className="h-10 bg-black/60 rounded-full flex items-center overflow-hidden">
                        <div className="animate-marquee-horizontal whitespace-nowrap text-white text-sm uppercase tracking-widest">
                            {avisosRaw.map((a, i) => <span key={i} className="mx-10">{getTxt(a, 'texto')}</span>)}
                        </div>
                    </div>
                </footer>
            </div>
            <style>{`.animate-marquee-horizontal { animation: marqueeH 30s linear infinite; } @keyframes marqueeH { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
        </div>
    );
}