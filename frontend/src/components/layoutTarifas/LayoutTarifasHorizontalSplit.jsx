import React from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutTarifasHorizontalSplit({ tarifas, banner, config, galeria }) {
    const { colores, logo } = config;
    const currentImage = galeria && galeria.length > 0 ? galeria[0] : null;

    return (
        <div className="w-full h-full flex overflow-hidden bg-black">
            {/* IZQUIERDA: Imagen / Video Promocional */}
            <div className="w-[45%] h-full relative">
                 <MediaRenderer url={currentImage} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                 <div className="absolute top-10 left-10 p-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                    {logo && <img src={logo} className="h-24 object-contain" alt="Logo" />}
                 </div>
            </div>

            {/* DERECHA: Tabla de Cambio */}
            <div className="w-[55%] h-full flex flex-col p-12 justify-center relative" style={{ backgroundColor: colores.fondo }}>
                <h1 className="text-6xl font-black mb-12" style={{ color: colores.texto_evento }}>
                    EXCHANGE <span style={{ color: colores.acento }}>RATES</span>
                </h1>

                <div className="flex flex-col gap-6">
                    {/* Header Tabla */}
                    <div className="flex text-lg font-bold uppercase tracking-widest opacity-50 border-b border-white/20 pb-2 mb-2 px-4" style={{ color: colores.texto_evento }}>
                        <div className="w-1/3">Currency</div>
                        <div className="w-1/3 text-right">We Buy</div>
                        <div className="w-1/3 text-right">We Sell</div>
                    </div>

                    {/* Rows */}
                    {tarifas.map((divisa, idx) => (
                        <div key={idx} className="flex items-center bg-white/5 rounded-2xl p-6 border border-white/5 shadow-lg">
                            <div className="w-1/3 flex items-center gap-4">
                                <img src={divisa.icono_url} className="w-14 h-14 rounded-full object-cover shadow-sm" alt="flag"/>
                                <span className="text-3xl font-bold" style={{ color: colores.texto_evento }}>{divisa.moneda}</span>
                            </div>
                            <div className="w-1/3 text-right text-4xl font-mono font-bold opacity-80" style={{ color: colores.texto_evento }}>
                                {divisa.compra}
                            </div>
                            <div className="w-1/3 text-right text-5xl font-mono font-black" style={{ color: colores.acento }}>
                                {divisa.venta}
                            </div>
                        </div>
                    ))}
                </div>

                {banner && (
                    <div className="mt-auto pt-8 border-t border-white/10 opacity-70 italic text-xl text-center" style={{ color: colores.texto_evento }}>
                        "{banner}"
                    </div>
                )}
            </div>
        </div>
    );
}