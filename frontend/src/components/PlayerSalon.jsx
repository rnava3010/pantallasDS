import React, { useState, useEffect } from 'react';

export default function PlayerSalon({ data, config }) {
    // Estado para el reloj
    const [horaActual, setHoraActual] = useState(new Date());

    // 1. EFECTO: Reloj en tiempo real (se actualiza cada segundo)
    useEffect(() => {
        const timer = setInterval(() => {
            setHoraActual(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. EFECTO: Cambiar Favicon dinámicamente
    useEffect(() => {
        if (config?.logo) {
            const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/png'; // O el formato que uses
            link.rel = 'icon';
            link.href = config.logo; // Usa la URL del logo de la BD
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [config]);

    if (!data) return <div className="text-white text-center mt-20">Cargando evento...</div>;

    return (
        <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden font-sans selection:bg-yellow-500 selection:text-black">
            
            {/* --- ENCABEZADO --- */}
            <header className="h-24 bg-zinc-900/90 backdrop-blur flex items-center justify-between px-8 border-b border-zinc-700 shadow-lg relative z-20">
                {/* LOGO (Izquierda) */}
                <div className="flex items-center">
                    {config.logo ? (
                        <img 
                            src={config.logo} 
                            alt="Logo Sucursal" 
                            className="h-16 w-auto object-contain drop-shadow-md" 
                        />
                    ) : (
                        // Fallback por si no hay imagen (o la ruta está mal)
                        <h2 className="text-2xl font-bold text-gray-500 tracking-tighter">SIN LOGO</h2>
                    )}
                </div>

                {/* RELOJ Y FECHA (Derecha) */}
                <div className="text-right flex flex-col items-end">
                    <span className="text-4xl font-mono font-bold text-white leading-none">
                        {horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm text-yellow-500 font-medium uppercase tracking-widest">
                        {horaActual.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="flex-1 flex flex-col items-center justify-center p-10 text-center relative z-10">
                {/* Fondo sutil (Gradiente) */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-blue-900/30 z-0"></div>

                <div className="z-10 animate-fade-in-up max-w-6xl w-full">
                    
                    {/* Nombre del Salón (Pequeño arriba) */}
                    <div className="mb-6">
                        <span className="bg-zinc-800 text-gray-300 px-4 py-1 rounded text-sm uppercase tracking-[0.3em]">
                            {data.nombre_salon || config.nombre_interno}
                        </span>
                    </div>

                    {/* TÍTULO DEL EVENTO */}
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight drop-shadow-2xl">
                        {data.titulo}
                    </h1>

                    {/* CLIENTE */}
                    {data.cliente && (
                        <div className="mb-12">
                            <span className="inline-block border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 px-8 py-3 rounded-full text-2xl font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                {data.cliente}
                            </span>
                        </div>
                    )}

                    {/* DURACIÓN DEL EVENTO */}
                    <div className="flex items-center justify-center gap-4 text-zinc-400 text-xl font-light">
                        <span>Horario del evento:</span>
                        <span className="text-white font-mono font-bold text-2xl">{data.horario}</span>
                    </div>

                    {/* MENSAJE EXTRA */}
                    {data.mensaje && (
                        <p className="mt-16 text-3xl text-gray-300 font-serif italic max-w-4xl mx-auto border-t border-zinc-800 pt-8">
                            "{data.mensaje}"
                        </p>
                    )}
                </div>
            </main>

            {/* --- PIE DE PÁGINA --- */}
            <footer className="h-12 bg-black flex items-center justify-center border-t border-zinc-900 z-20">
                <p className="text-zinc-600 text-xs tracking-widest">
                    DIGITAL SIGNAGE SYSTEM
                </p>
            </footer>
        </div>
    );
}