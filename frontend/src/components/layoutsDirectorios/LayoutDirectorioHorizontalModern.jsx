import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { getIconoClima } from '../../utils/weatherUtils';

export default function LayoutDirectorioHorizontalModern({ 
    config, datos, horaActual, isOnline, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    
    // Protección de carga
    if (!config || !config.colores || !datos || !horaActual) return null;

    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    const eventos = datos?.eventos || [];
    const noticias = datos?.noticias || [];
    
    // Mostramos 3 eventos por página para este diseño cinematográfico
    const visibles = eventos.slice(pagina * 3, (pagina + 1) * 3);

    useEffect(() => {
        const totalPaginas = Math.ceil(eventos.length / 3);
        if (totalPaginas > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 10000);
            return () => clearInterval(int);
        }
    }, [eventos.length]);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden p-8" style={{ backgroundColor: fondo }}>
            
            {/* 🟢 HEADER REORGANIZADO: Logo | Título | Hora y Fecha */}
            <header className="flex justify-between items-center mb-8 bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                {/* Logo a la izquierda */}
                <div className="w-1/4">
                    <img src={config.logo} alt="Logo" className="h-16 object-contain" />
                </div>

                {/* Título centrado */}
                <div className="flex-1 text-center">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase" style={{ color: acento }}>
                        Directorio de Eventos
                    </h1>
                </div>

                {/* Hora y Fecha a la derecha */}
                <div className="w-1/4 text-right">
                    <span className="text-5xl font-mono font-black block leading-none" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="text-sm font-bold uppercase tracking-widest mt-1 opacity-60" style={{ color: texto_reloj }}>
                        {horaActual?.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                </div>
            </header>

            {/* 🔵 CUERPO: Tarjetas Cinematográficas */}
            <main className="flex-1 grid grid-cols-3 gap-8 mb-8">
                {visibles.map((e, i) => (
                    <div key={i} className="relative rounded-[3rem] overflow-hidden border-2 border-white/5 bg-white/5 flex flex-col animate-fade-in-up shadow-2xl">
                        <div className="h-1/2 relative">
                            <img src={e.imagenes?.[0] || config.imagen_default} className="absolute inset-0 w-full h-full object-cover" alt="img" />
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                                <span className="text-xl font-mono font-bold" style={{ color: acento }}>
                                    {new Date(e.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 p-8 flex flex-col justify-between">
                            <div>
                                <h2 className="text-3xl font-black mb-2 leading-tight" style={{ color: texto_evento }}>{e.nombre_evento}</h2>
                                <p className="text-lg opacity-60 uppercase font-bold tracking-widest" style={{ color: texto_reloj }}>{e.cliente_nombre}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold bg-white/10 px-6 py-2 rounded-full border border-white/10" style={{ color: texto_reloj }}>{e.nombre_salon}</span>
                                <DirectionArrow direction={e.direccion_reloj} color={acento} size={40} animate />
                            </div>
                        </div>
                    </div>
                ))}
            </main>

            {/* 🔴 FOOTER CON NOTICIAS DE DERECHA A IZQUIERDA */}
            <footer className="h-24 flex flex-col justify-between">
                {/* Fila superior del footer: Clima y Bienvenidos */}
                <div className="flex items-center justify-between px-4 mb-2">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">{getIconoClima(clima?.codigo)}</span>
                        <span className="text-2xl font-bold" style={{ color: texto_reloj }}>{clima?.tempC}°C</span>
                    </div>
                    <span className="text-2xl font-light tracking-[0.8em] opacity-40" style={{ color: texto_evento }}>BIENVENIDOS</span>
                    <span className="text-[10px] opacity-30 uppercase tracking-widest">Powered by narabyte.xyz</span>
                </div>

                {/* Cinta de noticias (Marquee Horizontal) */}
                <div className="h-12 bg-white/5 rounded-full border border-white/10 flex items-center overflow-hidden">
                    <div className="flex whitespace-nowrap animate-marquee-horizontal">
                        {[...noticias, ...noticias].map((n, i) => (
                            <span key={i} className="text-lg font-bold mx-12 flex items-center gap-4" style={{ color: texto_reloj }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: acento }} />
                                {n.titulo}: <span className="font-normal opacity-70">{n.descripcion}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes marquee-horizontal { 
                    0% { transform: translateX(0); } 
                    100% { transform: translateX(-50%); } 
                }
                .animate-marquee-horizontal { 
                    animation: marquee-horizontal 40s linear infinite; 
                }
            `}</style>
        </div>
    );
}