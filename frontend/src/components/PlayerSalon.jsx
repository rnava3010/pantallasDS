import React, { useState, useEffect } from 'react';
import { usePantalla } from '../hooks/usePantalla'; 
import { useParams } from 'react-router-dom';
import { log } from '../utils/logger'; // <--- IMPORTANTE: El logger que creamos

export default function PlayerSalon() {
    const { id } = useParams();
    
    // 1. OBTENEMOS TODO DEL HOOK
    const { eventoActual, config, loading, isOnline, timeOffset } = usePantalla(id);

    // 2. ESTADOS LOCALES
    const [horaActual, setHoraActual] = useState(new Date(Date.now() + (timeOffset || 0)));
    const [indiceImagen, setIndiceImagen] = useState(0);

    // 3. EFECTO: RELOJ SINCRONIZADO
    useEffect(() => {
        const timer = setInterval(() => {
            const horaServidor = new Date(Date.now() + (timeOffset || 0));
            setHoraActual(horaServidor);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeOffset]);

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

    // --- LÓGICA DE IMÁGENES (UNIFICADA PARA QUE EL SLIDESHOW FUNCIONE SIEMPRE) ---
    
    // Definimos qué lista de fotos "manda" en este momento:
    // A) Si hay Evento Y tiene fotos -> Fotos del Evento
    // B) Si NO hay Evento (o el evento no tiene fotos) -> Fotos del Screensaver (BD)
    const fotosActivas = (eventoActual?.imagenes?.length > 0) 
        ? eventoActual.imagenes 
        : (config?.screensaver || []);

    // Reiniciar índice si cambia la "fuente" de las fotos (de evento a screensaver o viceversa)
    useEffect(() => {
        setIndiceImagen(0);
    }, [!!eventoActual]); // Se dispara cuando pasamos de "Sin Evento" a "Con Evento"

    // Rotación automática (Slideshow)
    useEffect(() => {
        if (fotosActivas.length > 1) {
            const intervalo = setInterval(() => {
                setIndiceImagen((prev) => (prev + 1) % fotosActivas.length);
            }, 8000); // 8 segundos por foto
            return () => clearInterval(intervalo);
        }
    }, [fotosActivas, eventoActual]);


    // --- 🔍 DIAGNÓSTICO DE LOGS (SOLO PARA VER EN CONSOLA) ---
    useEffect(() => {
        if (!loading && config) {
            log("--- 📊 DIAGNÓSTICO PLAYER SALON ---");
            log("1. Estado Online:", isOnline ? "SI" : "NO");
            log("2. ¿Hay Evento Activo?:", eventoActual ? "SÍ" : "NO");
            if (eventoActual) {
                log("   > Título:", eventoActual.titulo);
                log("   > Fotos Evento:", eventoActual.imagenes);
            }
            log("3. Fotos Screensaver (BD):", config.screensaver);
            log("4. FOTOS ACTIVAS AHORA:", fotosActivas);
            log("-------------------------------------");
        }
    }, [config, eventoActual, loading, isOnline, fotosActivas]);


    // --- RENDERIZADO ---

    // Pantalla de carga inicial
    if (loading && !config) {
        return <div className="bg-black h-screen flex items-center justify-center text-white animate-pulse">Iniciando Narabyte DS...</div>;
    }

    // Imagen visual actual (sea de boda o de hotel)
    const imagenVisual = fotosActivas.length > 0 ? fotosActivas[indiceImagen] : null;

    return (
        <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden font-sans relative">
            
            {/* Indicador Offline */}
            <div 
                className={`absolute bottom-2 right-2 z-50 w-3 h-3 rounded-full shadow-lg border border-black/50 transition-colors duration-500 ${isOnline ? 'bg-green-500/30' : 'bg-red-600 animate-pulse'}`}
                title={isOnline ? "Conectado" : "Modo Offline"}
            ></div>

            {/* --- HEADER (Siempre visible) --- */}
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

            {/* === ESCENARIO 1: MODO SCREENSAVER (Sin Evento) === */}
            {!eventoActual && (
                <div className="flex-1 relative w-full h-full bg-black">
                    {/* Imagen de Fondo Full Screen */}
                    {imagenVisual && (
                        <img 
                            key={indiceImagen} 
                            src={imagenVisual} 
                            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                            alt="Galería Hotel"
                        />
                    )}
                    
                    {/* Gradiente si no hay imagen o sobre la imagen */}
                    <div className={`absolute inset-0 ${imagenVisual ? 'bg-black/30' : 'bg-gradient-to-br from-gray-900 to-black'}`}></div>

                    {/* Texto de Bienvenida */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center drop-shadow-2xl animate-fade-in-up">
                        <h1 className="text-7xl font-light tracking-[0.2em] uppercase mb-4 text-white">Bienvenidos</h1>
                        <h2 className="text-5xl text-yellow-400 font-serif italic">{config?.nombre_interno || "Narabyte DS"}</h2>
                    </div>
                </div>
            )}

            {/* === ESCENARIO 2: MODO EVENTO ACTIVO === */}
            {eventoActual && (
                <main className={`flex-1 w-full relative z-10 ${eventoActual.imagenes?.length > 0 ? 'grid grid-cols-2' : 'flex items-center justify-center'}`}>
                    
                    {/* Columna Izquierda: FOTO DEL EVENTO */}
                    {eventoActual.imagenes?.length > 0 && (
                        <div className="relative h-full w-full overflow-hidden border-r border-zinc-800 bg-black">
                            {imagenVisual && (
                                <img 
                                    key={indiceImagen} 
                                    src={imagenVisual} 
                                    alt="Evento Slide" 
                                    className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>

                            {/* Puntitos indicadores */}
                            {eventoActual.imagenes.length > 1 && (
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                                    {eventoActual.imagenes.map((_, idx) => (
                                        <div key={idx} className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === indiceImagen ? 'bg-white w-6' : 'bg-white/40'}`} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Columna Derecha / Central: INFORMACIÓN */}
                    <div className={`flex flex-col items-center justify-center p-10 text-center z-10 ${eventoActual.imagenes?.length > 0 ? 'bg-zinc-900/50 backdrop-blur-sm' : 'max-w-6xl'}`}>
                        <div className="animate-fade-in-up w-full">
                            
                            {/* Nombre del Salón */}
                            <div className="mb-6">
                                <span className="bg-zinc-800 text-gray-300 px-4 py-1 rounded text-sm uppercase tracking-[0.3em] shadow-lg">
                                    {eventoActual.nombre_salon || config.nombre_interno}
                                </span>
                            </div>

                            {/* Título del Evento */}
                            <h1 className={`font-black text-white mb-8 leading-tight drop-shadow-2xl ${eventoActual.imagenes?.length > 0 ? 'text-5xl lg:text-7xl' : 'text-6xl md:text-8xl'}`}>
                                {eventoActual.titulo}
                            </h1>

                            {/* Cliente */}
                            {eventoActual.cliente && (
                                <div className="mb-12">
                                    <span className="inline-block border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 px-8 py-3 rounded-full text-xl lg:text-2xl font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                        {eventoActual.cliente}
                                    </span>
                                </div>
                            )}

                            {/* Horario */}
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-zinc-400 text-xl font-light">
                                <span>Horario del evento:</span>
                                <span className="text-white font-mono font-bold text-2xl bg-black/40 px-4 py-1 rounded border border-zinc-700">
                                    {eventoActual.horario}
                                </span>
                            </div>

                            {/* Mensaje Personalizado */}
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
            )}

            {/* FOOTER */}
            <footer className="h-12 bg-black flex items-center justify-center border-t border-zinc-900 z-20">
                <p className="text-zinc-600 text-xs tracking-widest">NARABYTE DS SYSTEM</p>
            </footer>
        </div>
    );
}