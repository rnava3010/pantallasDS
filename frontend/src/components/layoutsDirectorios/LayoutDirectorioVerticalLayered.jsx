import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';

export default function LayoutDirectorioVerticalLayered({ 
    config, datos, horaActual, isOnline, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    if (!config || !config.colores || !horaActual) return null;

    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    const eventos = datos?.eventos || [];
    const visibles = eventos.slice(pagina * 6, (pagina + 1) * 6);

    useEffect(() => {
        const totalPaginas = Math.ceil(eventos.length / 6);
        if (totalPaginas > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 12000);
            return () => clearInterval(int);
        }
    }, [eventos.length]);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden p-4 relative" style={{ backgroundColor: fondo }}>
            
            {/* Background Decorativo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

            {/* VIDEO TOP (40%) */}
            <div className="h-[35%] w-full relative rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl mb-6">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                
                <div className="absolute top-8 left-8">
                    <img src={config.logo} alt="Logo" className="h-10 object-contain drop-shadow-lg" />
                </div>
                
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end text-white">
                    <div>
                        <span className="text-6xl font-black block leading-none">{horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-sm font-bold opacity-60 uppercase tracking-[0.3em]">{horaActual?.toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl block">{getIconoClima(clima?.codigo)}</span>
                        <span className="text-2xl font-bold">{clima?.tempC}°C</span>
                    </div>
                </div>
            </div>

            {/* EVENTOS (65%) - Estilo Cards Flotantes */}
            <div className="flex-1 flex flex-col gap-3 px-2">
                <div className="flex justify-between items-center mb-2 px-4">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: acento }}>Agenda del Día</h2>
                    <div className="h-1 flex-1 mx-6 bg-white/10 rounded-full"></div>
                </div>

                {visibles.map((e, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 shadow-lg group hover:bg-white/10 transition-all">
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-mono font-black text-lg bg-black/40 border border-white/10" style={{ color: acento }}>
                            {new Date(e.fecha_inicio).getHours()}h
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-black truncate" style={{ color: texto_evento }}>{e.nombre_evento}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase opacity-50">{e.nombre_salon}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span className="text-[10px] font-mono opacity-40">{new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                        <DirectionArrow direction={e.direccion_reloj} color={acento} size={24} animate />
                    </div>
                ))}
            </div>

            <footer className="h-12 flex items-center justify-center">
                <span className="text-[10px] font-black tracking-[0.8em] opacity-20 uppercase">Bienvenidos</span>
            </footer>
        </div>
    );
}