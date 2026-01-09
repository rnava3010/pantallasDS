import React, { useState, useEffect } from 'react';
import { usePantalla } from '../hooks/usePantalla'; 
import { useParams } from 'react-router-dom';

export default function PlayerSalon() {
    const { id } = useParams();
    
    // 1. OBTENEMOS TODO DEL HOOK INTELIGENTE
    // eventoActual: Es el evento que toca AHORA (calculado por la agenda)
    // timeOffset: La diferencia de hora con el servidor
    const { eventoActual, config, loading, isOnline, timeOffset } = usePantalla(id);

    // 2. ESTADOS LOCALES
    // Inicializamos la hora sumando el ajuste del servidor
    const [horaActual, setHoraActual] = useState(new Date(Date.now() + (timeOffset || 0)));
    const [indiceImagen, setIndiceImagen] = useState(0);

    // 3. EFECTO: RELOJ SINCRONIZADO
    useEffect(() => {
        const timer = setInterval(() => {
            // Cada segundo calculamos la hora real del servidor
            const horaServidor = new Date(Date.now() + (timeOffset || 0));
            setHoraActual(horaServidor);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeOffset]); // Si cambia el ajuste, se recalcula

    // 4. EFECTO: FAVICON DINÁMICO
    useEffect(() => {
        if (config?.favicon) {
            let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'icon';
            link.href = config.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [config?.favicon]);

    // 5. EFECTO: SLIDESHOW (Rotación de imágenes)
    useEffect(() => {
        // Reiniciamos índice si cambia el evento
        setIndiceImagen(0);
    }, [eventoActual]);

    useEffect(() => {
        const totalImagenes = eventoActual?.imagenes?.length || 0;
        if (totalImagenes > 1) {
            const intervalo = setInterval(() => {
                setIndiceImagen((prev) => (prev + 1) % totalImagenes);
            }, 8000); // 8 segundos por foto
            return () => clearInterval(intervalo);
        }
    }, [eventoActual]); // Depende del evento actual

    // --- PANTALLA DE CARGA ---
    // Solo si está cargando Y no tenemos configuración (ni cacheada)
    if (loading && !config) {
        return <div className="bg-black h-screen flex items-center justify-center text-white animate-pulse">Iniciando Narabyte DS...</div>;
    }

    // --- MODO SCREENSAVER / GALERÍA ---
    // Si ya cargó, pero NO hay evento activo en este momento
    if (!eventoActual) {
        return (
            <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden relative font-sans">
                {/* Indicador Offline */}
                <div 
                    className={`absolute bottom-2 right-2 z-50 w-3 h-3 rounded-full shadow-lg border border-black/50 transition-colors duration-500 ${isOnline ? 'bg-green-500/30' : 'bg-red-600 animate-pulse'}`}
                    title={isOnline ? "Conectado" : "Modo Offline"}
                ></div>

                {/* Header Simplificado */}
                <header className="h-24 flex items-center justify-between px-8 absolute top-0 w-full z-20">
                    {config?.logo && <img src={config.logo} alt="Logo" className="h-16 object-contain drop-shadow-md" onError={(e) => e.target.style.display = 'none'} />}
                    <div className="text-right">
                         <span className="text-4xl font-mono font-bold text-white drop-shadow-md">
                            {horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </header>

                {/* Contenido Galería Default */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0"></div>
                    {/* Aquí puedes poner una imagen de fondo genérica del hotel si quisieras */}
                    
                    <div className="z-10 text-center animate-fade-in-up">
                        <h1 className="text-6xl font-light tracking-[0.2em] uppercase mb-6 text-gray-300">Bienvenidos</h1>
                        <h2 className="text-4xl text-yellow-500 font-serif italic">{config?.nombre_interno || "Narabyte DS"}</h2>
                    </div>
                </div>
            </div>
        );
    }

    // --- MODO EVENTO ACTIVO ---
    const tieneImagenes = eventoActual.imagenes && eventoActual.imagenes.length > 0;
    const imagenActual = tieneImagenes ? eventoActual.imagenes[indiceImagen] : null;

    return (
        <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden font-sans selection:bg-yellow-500 selection:text-black relative">
            
            {/* Indicador Offline */}
            <div 
                className={`absolute bottom-2 right-2 z-50 w-3 h-3 rounded-full shadow-lg border border-black/50 transition-colors duration-500 ${isOnline ? 'bg-green-500/30' : 'bg-red-600 animate-pulse'}`}
                title={isOnline ? "Conectado" : "Modo Offline"}
            ></div>
            
            {/* --- HEADER --- */}
            <header className="h-24 bg-zinc-900/90 backdrop-blur flex items-center justify-between px-8 border-b border-zinc-700 shadow-lg relative z-20">
                <div className="flex items-center">
                    {config?.logo && <img src={config.logo} alt="Logo" className="h-16 w-auto object-contain drop-shadow-md" onError={(e) => e.target.style.display = 'none'} />}
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className="text-4xl font-mono font-bold text-white leading-none">
                        {horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm text-yellow-500 font-medium uppercase tracking-widest">
                        {horaActual.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* --- MAIN --- */}
            <main className={`flex-1 w-full relative z-10 ${tieneImagenes ? 'grid grid-cols-2' : 'flex items-center justify-center'}`}>
                
                {/* FONDO GENERAL (Visible si no hay fotos) */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-blue-900/30 z-0 pointer-events-none"></div>

                {/* --- IZQUIERDA: SLIDESHOW --- */}
                {tieneImagenes && (
                    <div className="relative h-full w-full overflow-hidden border-r border-zinc-800 bg-black">
                        {/* Key = indiceImagen fuerza el re-render para la animación fade-in */}
                        <img 
                            key={indiceImagen} 
                            src={imagenActual} 
                            alt="Evento Slide" 
                            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                        
                        {/* Indicadores de puntitos */}
                        {eventoActual.imagenes.length > 1 && (
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                                {eventoActual.imagenes.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === indiceImagen ? 'bg-white w-6' : 'bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- DERECHA: INFO --- */}
                <div className={`flex flex-col items-center justify-center p-10 text-center z-10 ${tieneImagenes ? 'bg-zinc-900/50 backdrop-blur-sm' : 'max-w-6xl'}`}>
                    <div className="animate-fade-in-up w-full">
                        <div className="mb-6">
                            <span className="bg-zinc-800 text-gray-300 px-4 py-1 rounded text-sm uppercase tracking-[0.3em] shadow-lg">
                                {eventoActual.nombre_salon || config.nombre_interno}
                            </span>
                        </div>

                        <h1 className={`font-black text-white mb-8 leading-tight drop-shadow-2xl ${tieneImagenes ? 'text-5xl lg:text-7xl' : 'text-6xl md:text-8xl'}`}>
                            {eventoActual.titulo}
                        </h1>

                        {eventoActual.cliente && (
                            <div className="mb-12">
                                <span className="inline-block border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 px-8 py-3 rounded-full text-xl lg:text-2xl font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                    {eventoActual.cliente}
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-zinc-400 text-xl font-light">
                            <span>Horario del evento:</span>
                            <span className="text-white font-mono font-bold text-2xl bg-black/40 px-4 py-1 rounded border border-zinc-700">
                                {eventoActual.horario}
                            </span>
                        </div>

                        {eventoActual.mensaje && (
                            <div className="mt-16 border-t border-zinc-700/50 pt-8 w-3/4 mx-auto">
                                <p className="text-2xl text-gray-300 font-serif italic">
                                    "{eventoActual.mensaje}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="h-12 bg-black flex items-center justify-center border-t border-zinc-900 z-20">
                <p className="text-zinc-600 text-xs tracking-widest">NARABYTE DS SYSTEM</p>
            </footer>
        </div>
    );
}