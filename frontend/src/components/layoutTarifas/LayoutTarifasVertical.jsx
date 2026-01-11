import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutTarifasVertical({ 
    config, datos, horaActual, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    
    const tarifas = datos?.tarifas || [];
    const banner = datos?.banner || "Bienvenidos";
    const ITEMS_POR_PAGINA = 8;

    useEffect(() => {
        const total = Math.ceil(tarifas.length / ITEMS_POR_PAGINA);
        if (total > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % total), 10000);
            return () => clearInterval(int);
        }
    }, [tarifas.length]);

    const visibles = tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden p-6" style={{ backgroundColor: fondo }}>
            
            <header className="h-24 flex flex-col items-center justify-center mb-6">
                <img src={config.logo} alt="Logo" className="h-12 object-contain mb-2" />
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            </header>

            <main className="flex-1 flex flex-col gap-4 bg-black/20 rounded-[3rem] p-8 border border-white/5 shadow-inner">
                <div className="flex justify-between items-center mb-4 px-4 text-[10px] font-black uppercase tracking-widest opacity-40 text-white">
                    <span>Categoría</span>
                    <span>Tarifa Diaria</span>
                </div>
                {visibles.map((t, i) => (
                    <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 animate-fade-in-up">
                        <span className="text-xl font-bold text-white uppercase">{t.nombre}</span>
                        <div className="text-right">
                            <span className="text-2xl font-black" style={{ color: acento }}>{t.moneda}{t.precio}</span>
                        </div>
                    </div>
                ))}
            </main>

            <div className="h-[30%] my-6 relative rounded-[3rem] overflow-hidden border border-white/10">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-0 right-0 text-center">
                    <span className="text-4xl font-mono font-black text-white">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            <footer className="h-12 flex items-center bg-black/40 rounded-full border border-white/10 px-6 overflow-hidden">
                <div className="animate-marquee-horizontal whitespace-nowrap w-full">
                    <span className="text-sm font-bold uppercase tracking-widest text-white">{banner}</span>
                </div>
            </footer>
        </div>
    );
}