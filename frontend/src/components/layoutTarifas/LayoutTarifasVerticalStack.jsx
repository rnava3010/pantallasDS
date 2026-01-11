import React from 'react';

export default function LayoutTarifasVerticalStack({ tarifas, banner, config, galeria }) {
    const { colores, logo } = config;

    return (
        <div className="w-full h-full flex flex-col p-8" style={{ backgroundColor: colores.fondo }}>
            {/* Header */}
            <div className="flex justify-between items-end mb-8 border-b-4 pb-4" style={{ borderColor: colores.acento }}>
                <div className="flex flex-col">
                    <span className="text-6xl font-black leading-none" style={{ color: colores.texto_evento }}>MONEY</span>
                    <span className="text-4xl font-light tracking-widest opacity-80" style={{ color: colores.texto_evento }}>EXCHANGE</span>
                </div>
                {logo && <img src={logo} className="h-20 object-contain mb-2" alt="Logo" />}
            </div>

            {/* Stack de Bloques */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {tarifas.map((divisa, idx) => (
                    <div key={idx} className="flex-1 bg-white/5 rounded-3xl border border-white/10 flex flex-col justify-center p-6 relative overflow-hidden group">
                        {/* Background Flag Watermark */}
                        <img src={divisa.icono_url} className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 rounded-full grayscale group-hover:grayscale-0 transition-all duration-700" alt="wm" />
                        
                        <div className="relative z-10 flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <img src={divisa.icono_url} className="w-16 h-16 rounded-full shadow-lg" alt="flag" />
                                <span className="text-5xl font-black" style={{ color: colores.texto_evento }}>{divisa.moneda}</span>
                            </div>
                        </div>

                        <div className="relative z-10 flex gap-4">
                            <div className="flex-1">
                                <span className="block text-sm uppercase opacity-50 mb-1" style={{ color: colores.texto_evento }}>Compra / Buy</span>
                                <div className="text-5xl font-mono font-bold opacity-70" style={{ color: colores.texto_evento }}>${divisa.compra}</div>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div className="flex-1 text-right">
                                <span className="block text-sm uppercase opacity-50 mb-1" style={{ color: colores.texto_evento }}>Venta / Sell</span>
                                <div className="text-6xl font-mono font-black" style={{ color: colores.acento }}>${divisa.venta}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             
             {/* Banner Footer */}
             <div className="mt-8">
                 <div className="bg-white/10 rounded-full py-3 px-6 text-center text-xl font-bold animate-pulse" style={{ color: colores.acento }}>
                    {banner || 'Consulte comisiones en caja / Check fees at counter'}
                 </div>
             </div>
        </div>
    );
}