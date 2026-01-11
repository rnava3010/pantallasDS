import React from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutTarifasVerticalGlass({ tarifas, banner, config, galeria }) {
    const { colores, logo } = config;
    const bgMedia = galeria && galeria.length > 0 ? galeria[0] : null;

    return (
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            {/* Fondo Full */}
            <div className="absolute inset-0 z-0">
                <MediaRenderer url={bgMedia} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* Tarjeta de Cristal Central */}
            <div className="relative z-10 w-[90%] bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/20 shadow-2xl p-8 flex flex-col items-center">
                
                {logo && <img src={logo} className="h-24 object-contain mb-8 drop-shadow-md" alt="Logo" />}
                
                <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-widest">Tipo de Cambio</h1>
                <div className="h-1 w-20 rounded-full mb-10" style={{ backgroundColor: colores.acento }}></div>

                <div className="w-full flex flex-col gap-6 mb-8">
                     {/* Encabezados */}
                     <div className="flex justify-between px-6 text-xs uppercase font-bold tracking-widest text-white/60">
                        <span>Divisa</span>
                        <div className="flex gap-8">
                            <span className="w-20 text-center">Compra</span>
                            <span className="w-20 text-center">Venta</span>
                        </div>
                     </div>

                    {tarifas.map((divisa, idx) => (
                        <div key={idx} className="bg-white/10 rounded-2xl p-4 flex items-center justify-between border border-white/10 shadow-lg">
                            <div className="flex items-center gap-3">
                                <img src={divisa.icono_url} className="w-12 h-12 rounded-full border border-white/20" alt="flag" />
                                <span className="text-2xl font-bold text-white">{divisa.moneda}</span>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center w-24 bg-black/20 rounded-lg py-2">
                                    <span className="text-2xl font-mono font-bold text-white/80">{divisa.compra}</span>
                                </div>
                                <div className="flex flex-col items-center w-24 bg-white/10 rounded-lg py-2 border border-white/20">
                                    <span className="text-3xl font-mono font-bold" style={{ color: colores.acento }}>{divisa.venta}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {banner && (
                    <div className="mt-4 p-4 bg-black/30 rounded-xl w-full text-center">
                        <p className="text-white italic opacity-90 text-sm">{banner}</p>
                    </div>
                )}
            </div>
        </div>
    );
}