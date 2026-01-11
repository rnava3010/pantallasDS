import React from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutTarifasHorizontalGrid({ tarifas, banner, config, galeria }) {
    const { colores, logo } = config;
    // Imagen de fondo aleatoria del screensaver para dar ambiente
    const bgImage = galeria && galeria.length > 0 ? galeria[0] : null;

    return (
        <div className="w-full h-full relative overflow-hidden flex flex-col p-10" style={{ backgroundColor: colores.fondo }}>
            {/* Fondo sutil */}
            {bgImage && (
                <div className="absolute inset-0 z-0 opacity-20">
                    <MediaRenderer url={bgImage} className="w-full h-full object-cover grayscale" />
                </div>
            )}
            
            {/* Header */}
            <div className="relative z-10 flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tight" style={{ color: colores.texto_evento }}>TIPO DE CAMBIO</h1>
                    <p className="text-xl opacity-60 mt-2 uppercase tracking-widest" style={{ color: colores.texto_evento }}>Exchange Rate</p>
                </div>
                {logo && <img src={logo} className="h-20 object-contain drop-shadow-lg" alt="Logo" />}
            </div>

            {/* Grid de Tarjetas */}
            <div className="relative z-10 grid grid-cols-3 gap-8 flex-1 content-center">
                {tarifas.map((divisa, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                        {/* Bandera y Código */}
                        <div className="flex items-center gap-4 mb-6 w-full border-b border-white/10 pb-4">
                            <img src={divisa.icono_url || '/flags/default.png'} className="w-16 h-16 rounded-full shadow-md object-cover" alt={divisa.moneda} />
                            <div className="text-left">
                                <h2 className="text-3xl font-black" style={{ color: colores.texto_evento }}>{divisa.moneda}</h2>
                                <span className="text-sm opacity-50 uppercase">{divisa.descripcion || 'Divisa'}</span>
                            </div>
                        </div>

                        {/* Valores */}
                        <div className="w-full flex justify-between gap-4 text-center">
                            <div className="flex-1 bg-black/20 rounded-xl p-4">
                                <span className="block text-xs uppercase tracking-widest opacity-60 mb-1" style={{ color: colores.acento }}>Compra / Buy</span>
                                <span className="block text-4xl font-mono font-bold text-white">${divisa.compra}</span>
                            </div>
                            <div className="flex-1 bg-white/10 rounded-xl p-4 border border-white/5">
                                <span className="block text-xs uppercase tracking-widest opacity-60 mb-1" style={{ color: colores.acento }}>Venta / Sell</span>
                                <span className="block text-4xl font-mono font-bold text-white">${divisa.venta}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Banner Footer */}
            {banner && (
                <div className="absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur-md py-4 z-20 border-t border-white/10">
                   <div className="text-2xl font-bold text-center animate-pulse" style={{ color: colores.acento }}>
                       {banner}
                   </div>
                </div>
            )}
        </div>
    );
}