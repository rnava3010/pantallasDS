import React, { useState, useEffect } from 'react';
import { usePantalla } from '../hooks/usePantalla';
import { useParams } from 'react-router-dom';
import { log } from '../utils/logger';

export default function PlayerSalon() {
    const { id } = useParams();
    const { eventoActual, config, loading, isOnline, timeOffset } = usePantalla(id);

    const [horaActual, setHoraActual] = useState(new Date(Date.now() + (timeOffset || 0)));
    const [indiceImagen, setIndiceImagen] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setHoraActual(new Date(Date.now() + (timeOffset || 0)));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeOffset]);

    useEffect(() => {
        if (config?.favicon) {
            let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/x-icon'; link.rel = 'icon'; link.href = config.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [config?.favicon]);

    const fotosActivas = (eventoActual?.imagenes?.length > 0) ? eventoActual.imagenes : (config?.screensaver || []);

    useEffect(() => { setIndiceImagen(0); }, [!!eventoActual]);

    useEffect(() => {
        if (fotosActivas.length > 1) {
            const intervalo = setInterval(() => {
                setIndiceImagen((prev) => (prev + 1) % fotosActivas.length);
            }, 8000); // Tiempo de rotación
            return () => clearInterval(intervalo);
        }
    }, [fotosActivas, eventoActual]);

    // --- RENDERIZADO ---
    if (loading && !config) return <div className="bg-black h-screen flex items-center justify-center text-white animate-pulse">Iniciando Narabyte DS...</div>;

    const imagenVisual = fotosActivas.length > 0 ? fotosActivas[indiceImagen] : null;
    const nombreSalon = eventoActual?.nombre_salon || config?.nombre_interno || "Sala de Eventos";

    return (
        // Usamos bg-black puro como base para que las franjas de las imágenes verticales se fusionen
        <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden font-sans relative">

            {/* Indicador Offline Discreto */}
            <div className={`absolute bottom-20 right-4 z-50 w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500 ${isOnline ? 'bg-green-500/30 text-green-500' : 'bg-red-600 text-red-600 animate-pulse'}`}></div>

            {/* --- HEADER --- */}
            <header className="h-28 flex items-center justify-between px-10 relative z-20 bg-gradient-to-b from-black/80 to-transparent">
                {/* 1. Logo */}
                <div className="w-1/4 flex justify-start">
                    {config?.logo && <img src={config.logo} alt="Logo" className="h-20 w-auto object-contain drop-shadow-xl" />}
                </div>

                {/* 2. NOMBRE DEL SALÓN (Centro) */}
                <div className="flex-1 flex justify-center">
                    <div className="px-8 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 tracking-widest uppercase">
                            {nombreSalon}
                        </h1>
                    </div>
                </div>

                {/* 3. Reloj */}
                <div className="w-1/4 flex flex-col items-end">
                    <span className="text-5xl font-mono font-bold text-white drop-shadow-lg tracking-tighter">
                        {horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm text-gray-400 font-medium uppercase tracking-widest mt-1">
                        {horaActual.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>


            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="flex-1 p-8 pt-2 relative z-10 w-full h-full">
                
                {/* MODO SCREENSAVER (Solo imagen limpia) */}
                {!eventoActual && (
                    <div className="w-full h-full rounded-[3rem] overflow-hidden relative bg-black border border-zinc-800/50 shadow-2xl">
                         {imagenVisual ? (
                            <img
                                key={indiceImagen}
                                src={imagenVisual}
                                // CAMBIO CLAVE: object-contain asegura que NUNCA se deforme ni recorte
                                className="absolute inset-0 w-full h-full object-contain animate-fade-in"
                                alt="Screensaver"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-600">Sin imágenes configuradas</div>
                        )}
                        {/* YA NO HAY TEXTO ENCIMA DE LA IMAGEN */}
                    </div>
                )}


                {/* MODO EVENTO (Dos Tarjetas) */}
                {eventoActual && (
                    <div className="flex w-full h-full gap-8">
                        
                        {/* TARJETA IMAGEN (Izquierda) */}
                        <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-800/50 bg-black">
                            {imagenVisual && (
                                <>
                                    <img
                                        key={indiceImagen}
                                        src={imagenVisual}
                                        alt="Evento"
                                        // CAMBIO CLAVE: object-contain aquí también
                                        className="absolute inset-0 w-full h-full object-contain animate-fade-in"
                                    />
                                    {/* Indicadores de fotos */}
                                    {eventoActual.imagenes.length > 1 && (
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                            {eventoActual.imagenes.map((_, idx) => (
                                                <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${idx === indiceImagen ? 'bg-yellow-500 w-6' : 'bg-white/30 w-1.5'}`} />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* TARJETA INFORMACIÓN (Derecha) */}
                        <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 bg-zinc-900/80 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center">
                            <div className="animate-fade-in-up w-full">
                                {/* Título */}
                                <h1 className="text-5xl lg:text-7xl font-black text-white mb-10 leading-tight drop-shadow-2xl">
                                    {eventoActual.titulo}
                                </h1>
                                {/* Cliente */}
                                {eventoActual.cliente && (
                                    <div className="mb-14">
                                        <span className="inline-block px-8 py-3 rounded-full border border-yellow-500/50 bg-yellow-500/10 text-yellow-300 text-xl font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                                            {eventoActual.cliente}
                                        </span>
                                    </div>
                                )}
                                {/* Horario */}
                                <div className="flex flex-col items-center gap-2 mb-10">
                                    <span className="text-zinc-400 text-base uppercase tracking-widest">Horario</span>
                                    <span className="text-3xl font-mono font-bold text-white border-b border-zinc-700 pb-1">
                                        {eventoActual.horario}
                                    </span>
                                </div>
                                {/* Mensaje */}
                                {eventoActual.mensaje && (
                                    <div className="w-4/5 mx-auto bg-white/5 p-6 rounded-2xl border border-white/5">
                                        <p className="text-xl text-gray-300 font-serif italic leading-relaxed">
                                            "{eventoActual.mensaje}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- NUEVO FOOTER ESTRATÉGICO --- */}
            <footer className="h-20 bg-black relative z-20 grid grid-cols-3 items-center px-10 border-t border-zinc-900">
                
                {/* 1. Izquierda: Powered by */}
                <div className="flex justify-start opacity-50 hover:opacity-100 transition-opacity">
                    <p className="text-[11px] tracking-[0.2em] text-zinc-500 uppercase font-medium">
                        Powered by <span className="text-yellow-600 font-bold">narabyte.xyz</span>
                    </p>
                </div>

                {/* 2. Centro: BIENVENIDOS (Solo en screensaver) */}
                <div className="flex justify-center">
                    {!eventoActual && (
                        <h2 className="text-4xl font-light tracking-[0.3em] uppercase text-white drop-shadow-lg animate-fade-in-up font-sans">
                            BIENVENIDOS
                        </h2>
                    )}
                </div>

                {/* 3. Derecha: Espacio vacío para balancear */}
                <div className="flex justify-end"></div>
            </footer>
        </div>
    );
}