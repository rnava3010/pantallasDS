import React from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutTarifasHorizontalGrid({ tarifas, banner, config, galeria }) {
    const { colores, logo } = config;
    
    // Imagen de fondo aleatoria (toma la primera de la galería si existe)
    const bgImage = galeria && galeria.length > 0 ? galeria[0] : null;

    return (
        <div className="w-full h-full relative overflow-hidden flex flex-col p-10" style={{ backgroundColor: colores.fondo }}>
            
            {/* 1. FONDO DE AMBIENTE */}
            {bgImage && (
                <div className="absolute inset-0 z-0 opacity-20">
                    <MediaRenderer url={bgImage} className="w-full h-full object-cover grayscale" />
                </div>
            )}
            
            {/* 2. ENCABEZADO */}
            <div className="relative z-10 flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tight uppercase" style={{ color: colores.texto_evento }}>
                        TARIFAS
                    </h1>
                    <p className="text-xl opacity-60 mt-2 uppercase tracking-widest" style={{ color: colores.texto_evento }}>
                        Room Rates
                    </p>
                </div>
                {logo && <img src={logo} className="h-24 object-contain drop-shadow-lg" alt="Logo" />}
            </div>

            {/* 3. GRID DE TARJETAS (HABITACIONES) */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-1 content-start overflow-y-auto pb-20">
                {tarifas.map((item, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                        
                        {/* FOTO Y NOMBRE DE HABITACIÓN */}
                        <div className="flex items-center gap-4 mb-6 w-full border-b border-white/10 pb-4">
                            {/* Si viene imagen de fondo, la usamos como avatar, si no, un icono default */}
                            <img 
                                src={item.icono_url || config.imagen_default || '/logos/1default_logo.png'} 
                                className="w-20 h-20 rounded-2xl shadow-md object-cover" 
                                alt={item.moneda} 
                            />
                            <div className="text-left flex-1">
                                <h2 className="text-2xl font-black leading-tight" style={{ color: colores.texto_evento }}>
                                    {item.moneda} {/* Nombre de la Habitación */}
                                </h2>
                                <span className="text-xs opacity-50 uppercase tracking-wider">
                                    {item.descripcion || 'Por noche / Per night'}
                                </span>
                            </div>
                        </div>

                        {/* PRECIOS (RACK vs PROMO) */}
                        <div className="w-full flex justify-between gap-4 text-center">
                            
                            {/* PRECIO RACK (Referencia) */}
                            <div className="flex-1 bg-black/20 rounded-xl p-3 flex flex-col justify-center">
                                <span className="block text-[10px] uppercase tracking-widest opacity-60 mb-1" style={{ color: colores.acento }}>
                                    Tarifa Rack
                                </span>
                                <span className="block text-2xl font-mono font-bold text-white line-through opacity-50">
                                    ${item.compra}
                                </span>
                            </div>

                            {/* PRECIO PROMO (Destacado) */}
                            <div className="flex-1 bg-white/10 rounded-xl p-3 border border-white/5 flex flex-col justify-center">
                                <span className="block text-[10px] uppercase tracking-widest opacity-80 mb-1" style={{ color: colores.acento }}>
                                    Promoción
                                </span>
                                <span className="block text-4xl font-mono font-black text-white">
                                    ${item.venta}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 4. CINTILLO / BANNER INFERIOR */}
            {banner && (
                <div className="absolute bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl py-4 z-50 border-t border-white/10">
                   <div className="text-2xl font-bold text-center animate-pulse px-4 truncate" style={{ color: colores.acento }}>
                       {banner}
                   </div>
                </div>
            )}
        </div>
    );
}