import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { TEXTOS_TARIFAS } from '../../utils/diccionario';

export default function LayoutTarifasVertical2({ config, datos, horaActual, itemActual, videoBlobUrl }) {
    const [idiomaIndex, setIdiomaIndex] = useState(0);
    const { fondo, acento } = config.colores;
    
    const idiomas = Array.isArray(config?.idiomas_activos) ? config.idiomas_activos : ['es'];
    const idiomaActual = idiomas[idiomaIndex];
    const dict = TEXTOS_TARIFAS[idiomaActual] || TEXTOS_TARIFAS['es'];

    useEffect(() => {
        if (idiomas.length > 1) {
            const int = setInterval(() => setIdiomaIndex(prev => (prev + 1) % idiomas.length), (config?.tiempo_rotacion_idioma || 20) * 1000);
            return () => clearInterval(int);
        }
    }, [idiomas, config]);

    return (
        <div className="h-screen w-screen p-8 flex flex-col gap-8" style={{ backgroundColor: fondo }}>
            {/* VIDEO CIRCULAR O MUY REDONDEADO ARRIBA */}
            <div className="h-[30vh] w-full rounded-[3rem] overflow-hidden border-4 border-white/5 shadow-2xl">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover" />
            </div>

            <header className="text-center space-y-2">
                <img src={config.logo} alt="Logo" className="h-12 mx-auto mb-4" />
                <h1 className="text-3xl font-black uppercase tracking-widest text-white">{dict.titulo_largo}</h1>
                <div className="h-1 w-24 mx-auto rounded-full" style={{ backgroundColor: acento }}></div>
            </header>

            <main className="flex-1 grid grid-cols-1 gap-4">
                {datos?.tarifas.slice(0, 4).map((t, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-sm rounded-[2rem] p-6 flex justify-between items-center border border-white/10 shadow-lg">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-white uppercase">{t.nombre}</h2>
                            <p className="text-xs text-white/40 italic">{t.descripcion}</p>
                        </div>
                        <div className="bg-black/20 p-4 rounded-3xl text-right">
                            <span className="block text-[10px] text-white/30 uppercase font-bold tracking-tighter">Desde</span>
                            <span className="text-3xl font-mono font-black" style={{ color: acento }}>{t.moneda}{t.precio_rack}</span>
                        </div>
                    </div>
                ))}
            </main>

            <footer className="text-center space-y-4">
                <div className="text-4xl font-mono font-black text-white">{horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="flex justify-center gap-3">
                    {datos?.divisas.map((d, i) => (
                        <div key={i} className="text-xs font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full">{d.codigo}: {d.tipo_cambio}</div>
                    ))}
                </div>
            </footer>
        </div>
    );
}