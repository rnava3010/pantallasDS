import React, { useState, useEffect } from 'react';
import { usePantalla } from '../hooks/usePantalla';
import { useParams } from 'react-router-dom';

export default function PlayerSalon() {
    const { id } = useParams();
    const { eventoActual, config, loading, isOnline, timeOffset, clima } = usePantalla(id);

    const [horaActual, setHoraActual] = useState(new Date(Date.now() + (timeOffset || 0)));
    const [indiceImagen, setIndiceImagen] = useState(0);
    const [imagenError, setImagenError] = useState(false);

    // --- HELPER: ICONOS DE CLIMA ---
    const getIconoClima = (codigo) => {
        if (codigo === 0) return "☀️";
        if (codigo >= 1 && codigo <= 3) return "⛅";
        if (codigo >= 45 && codigo <= 48) return "🌫️";
        if (codigo >= 51 && codigo <= 67) return "🌧️";
        if (codigo >= 71 && codigo <= 77) return "❄️";
        if (codigo >= 80 && codigo <= 99) return "⚡";
        return "🌥️";
    };

    // --- EFECTOS ---
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

    useEffect(() => { 
        setIndiceImagen(0); 
        setImagenError(false); 
    }, [!!eventoActual]);

    useEffect(() => {
        if (fotosActivas.length > 1) {
            const intervalo = setInterval(() => {
                setIndiceImagen((prev) => {
                    setImagenError(false);
                    return (prev + 1) % fotosActivas.length;
                });
            }, 8000);
            return () => clearInterval(intervalo);
        }
    }, [fotosActivas, eventoActual]);


    // --- RENDERIZADO ---
    if (loading && !config) return <div className="bg-black h-screen flex items-center justify-center text-white animate-pulse">Iniciando Narabyte DS...</div>;

    const imagenVisual = fotosActivas.length > 0 ? fotosActivas[indiceImagen] : null;
    const nombreSalon = eventoActual?.nombre_salon || config?.nombre_interno || "Sala de Eventos";
    const tickerText = eventoActual?.ticker || null;

    return (
        <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden font-sans relative">

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                    white-space: nowrap;
                    display: inline-block;
                    padding-left: 100%;
                }
            `}</style>

            {/* Indicador Offline */}
            <div className={`absolute bottom-32 right-6 z-50 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-500 ${isOnline ? 'bg-green-500/40 text-green-500' : 'bg-red-600 text-red-600 animate-pulse'}`}></div>

            {/* --- HEADER --- */}
            <header className="h-28 flex items-center justify-between px-10 relative z-20 bg-gradient-to-b from-black/90 to-transparent">
                <div className="w-1/4 flex justify-start">
                    {config?.logo && <img src={config.logo} alt="Logo" className="h-20 w-auto object-contain drop-shadow-xl" />}
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="px-12 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 tracking-widest uppercase drop-shadow-sm whitespace-nowrap text-ellipsis overflow-hidden">
                            {nombreSalon}
                        </h1>
                    </div>
                </div>
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
            <div className={`flex-1 p-8 pt-2 relative z-10 w-full h-full ${tickerText ? 'pb-14' : ''}`}>
                
                {/* 1. MODO SCREENSAVER (Sin Evento) */}
                {!eventoActual && (
                    <div className="w-full h-full rounded-[3rem] overflow-hidden relative bg-black border border-zinc-800/50 shadow-2xl">
                        {imagenVisual && !imagenError && (
                            <img
                                key={indiceImagen}
                                src={imagenVisual}
                                className="absolute inset-0 w-full h-full object-contain animate-fade-in z-10"
                                alt="Screensaver"
                                onError={() => setImagenError(true)}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-950 to-black flex flex-col items-center justify-center z-0">
                             <div className="text-zinc-800 opacity-20 mb-4 scale-150">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                             </div>
                        </div>
                    </div>
                )}

                {/* 2. MODO EVENTO */}
                {eventoActual && (
                    // Aquí decidimos el layout: Si es full_width usamos un div contenedor único, si no, usamos flex gap-8
                    eventoActual.full_width ? (
                        /* === DISEÑO FULL WIDTH (IMAGEN COMPLETA) === */
                        <div className="w-full h-full rounded-[3rem] overflow-hidden relative shadow-2xl border border-zinc-800/50 bg-black">
                            {/* Imagen de Fondo Gigante */}
                            {imagenVisual && !imagenError ? (
                                <img 
                                    key={indiceImagen} 
                                    src={imagenVisual} 
                                    alt="Evento Full" 
                                    className="absolute inset-0 w-full h-full object-cover animate-fade-in z-0 opacity-90" // object-cover para llenar todo
                                    onError={() => setImagenError(true)} 
                                />
                            ) : (
                                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                                    <img src={config?.logo} className="w-1/3 opacity-10 grayscale" alt="Logo" />
                                </div>
                            )}

                            {/* Gradiente oscuro abajo para que el texto se lea */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 z-10"></div>

                            {/* Tarjeta de Información Flotante (Abajo a la izquierda) */}
                            <div className="absolute bottom-10 left-10 z-20 max-w-4xl p-10">
                                <h1 className="text-7xl lg:text-9xl font-black text-white mb-4 leading-none drop-shadow-2xl">
                                    {eventoActual.titulo}
                                </h1>
                                {eventoActual.cliente && (
                                    <div className="mb-6">
                                        <span className="inline-block px-6 py-2 rounded-full bg-yellow-500 text-black text-2xl font-bold uppercase tracking-wider shadow-lg">
                                            {eventoActual.cliente}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-4 text-zinc-300">
                                     <span className="text-3xl font-mono font-bold text-white border-l-4 border-yellow-500 pl-4">
                                        {eventoActual.horario}
                                    </span>
                                </div>
                                {eventoActual.mensaje && (
                                    <p className="mt-6 text-2xl text-gray-200 font-serif italic max-w-2xl drop-shadow-md">
                                        "{eventoActual.mensaje}"
                                    </p>
                                )}
                            </div>
                        </div>

                    ) : (
                        /* === DISEÑO SPLIT (PARTIDO A LA MITAD - EL ANTERIOR) === */
                        <div className="flex w-full h-full gap-8">
                            <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-800/50 bg-black">
                                {imagenVisual && !imagenError ? (
                                    <>
                                        <img key={indiceImagen} src={imagenVisual} alt="Evento" className="absolute inset-0 w-full h-full object-contain animate-fade-in z-10" onError={() => setImagenError(true)} />
                                        {eventoActual.imagenes.length > 1 && (
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                                {eventoActual.imagenes.map((_, idx) => (
                                                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${idx === indiceImagen ? 'bg-yellow-500 w-6' : 'bg-white/30 w-1.5'}`} />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                                        <img src={config?.logo} className="w-1/3 opacity-10 grayscale" alt="Logo Fondo" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 bg-zinc-900/80 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center">
                                <div className="animate-fade-in-up w-full">
                                    <h1 className="text-5xl lg:text-7xl font-black text-white mb-10 leading-tight drop-shadow-2xl">{eventoActual.titulo}</h1>
                                    {eventoActual.cliente && (
                                        <div className="mb-14">
                                            <span className="inline-block px-8 py-3 rounded-full border border-yellow-500/50 bg-yellow-500/10 text-yellow-300 text-xl font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                                                {eventoActual.cliente}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center gap-2 mb-10">
                                        <span className="text-zinc-400 text-base uppercase tracking-widest">Horario</span>
                                        <span className="text-3xl font-mono font-bold text-white border-b border-zinc-700 pb-1">{eventoActual.horario}</span>
                                    </div>
                                    {eventoActual.mensaje && (
                                        <div className="w-4/5 mx-auto bg-white/5 p-6 rounded-2xl border border-white/5">
                                            <p className="text-xl text-gray-300 font-serif italic leading-relaxed">"{eventoActual.mensaje}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* --- FOOTER --- */}
            <footer className={`h-20 bg-black relative z-20 grid grid-cols-3 items-center px-10 border-t border-zinc-900 transition-all ${tickerText ? 'mb-12' : 'mb-0'}`}>
                <div className="flex justify-start opacity-50 hover:opacity-100 transition-opacity">
                    <p className="text-[11px] tracking-[0.2em] text-zinc-500 uppercase font-medium">
                        Powered by <span className="text-yellow-600 font-bold">narabyte.xyz</span>
                    </p>
                </div>
                <div className="flex justify-center">
                    {!eventoActual && (
                        <h2 className="text-4xl font-light tracking-[0.3em] uppercase text-white drop-shadow-lg animate-fade-in-up font-sans">
                            BIENVENIDOS
                        </h2>
                    )}
                </div>
                <div className="flex justify-end items-center gap-6">
                    <div className="text-5xl drop-shadow-lg filter pb-2">
                        {getIconoClima(clima.codigo)}
                    </div>
                    <div className="flex items-baseline gap-3">
                        <div className="flex items-start">
                            <span className="text-4xl font-bold text-white tracking-tighter">{clima.tempC}</span>
                            <span className="text-lg text-yellow-500 font-bold mt-1 ml-0.5">°C</span>
                        </div>
                        <div className="h-6 w-px bg-zinc-700"></div>
                        <div className="flex items-start opacity-60">
                            <span className="text-2xl font-medium text-gray-300 tracking-tighter">{clima.tempF}</span>
                            <span className="text-xs text-gray-400 mt-1 ml-0.5">°F</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* --- TICKER --- */}
            {tickerText && (
                <div className="absolute bottom-0 left-0 w-full h-12 bg-yellow-500 z-50 overflow-hidden flex items-center shadow-[0_-5px_20px_rgba(0,0,0,0.5)] border-t border-yellow-300">
                    <div className="flex w-full">
                         <div className="bg-black text-yellow-500 px-6 h-12 flex items-center justify-center font-black uppercase tracking-widest text-sm relative z-20 shrink-0">
                            Aviso
                        </div>
                        <div className="flex-1 overflow-hidden relative flex items-center bg-yellow-500">
                             <div className="animate-marquee whitespace-nowrap text-black text-2xl font-bold uppercase tracking-wide">
                                {tickerText}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}