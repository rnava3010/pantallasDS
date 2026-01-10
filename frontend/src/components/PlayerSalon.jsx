import React, { useState, useEffect, useRef } from 'react';
import { usePantalla } from '../hooks/usePantalla';
import { useParams } from 'react-router-dom';

export default function PlayerSalon() {
    const { id } = useParams();
    const { eventoActual, config, loading, isOnline, timeOffset, clima } = usePantalla(id);

    const [horaActual, setHoraActual] = useState(new Date(Date.now() + (timeOffset || 0)));
    const [indiceImagen, setIndiceImagen] = useState(0);
    const [imagenError, setImagenError] = useState(false);
    
    // --- ESTADO PARA EL VIDEO EN CACHÉ (BLOB) ---
    const [videoBlobUrl, setVideoBlobUrl] = useState(null);
    const videoDescargadoRef = useRef(false); // Para evitar descargas dobles

    // --- HELPER: DETECTAR SI ES VIDEO ---
    const esVideo = (url) => {
        if (!url) return false;
        return url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm') || url.toLowerCase().endsWith('.mov');
    };

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

    // --- EFECTO 1: RELOJ ---
    useEffect(() => {
        const timer = setInterval(() => {
            setHoraActual(new Date(Date.now() + (timeOffset || 0)));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeOffset]);

    // --- EFECTO 2: FAVICON ---
    useEffect(() => {
        if (config?.favicon) {
            let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/x-icon'; link.rel = 'icon'; link.href = config.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [config?.favicon]);

    // --- LÓGICA DE FOTOS/VIDEOS ACTIVOS ---
    const fotosActivas = (eventoActual?.imagenes?.length > 0) ? eventoActual.imagenes : (config?.screensaver || []);

    // --- EFECTO 3: CACHÉ ROBUSTA DE VIDEO (BLOB) ---
    useEffect(() => {
        // Solo ejecutamos si hay screensaver, es video, y NO lo hemos descargado aún
        if (!eventoActual && config?.screensaver && config.screensaver.length > 0) {
            const urlVideo = config.screensaver[0]; // Asumimos el primero

            if (esVideo(urlVideo) && !videoDescargadoRef.current) {
                console.log("📥 Iniciando descarga completa del video para modo offline...");
                
                fetch(urlVideo)
                    .then(response => {
                        if (!response.ok) throw new Error("Error red");
                        return response.blob();
                    })
                    .then(blob => {
                        // Creamos una URL local que vive en memoria (RAM)
                        const localUrl = URL.createObjectURL(blob);
                        setVideoBlobUrl(localUrl);
                        videoDescargadoRef.current = true;
                        console.log("✅ Video descargado y cacheado en memoria (Blob)");
                    })
                    .catch(err => {
                        console.warn("⚠️ No se pudo descargar el video completo (usando streaming normal):", err);
                        // Si falla la descarga (ej. ya offline), no hacemos nada y dejamos que use la URL normal
                    });
            }
        }
    }, [config, eventoActual]); // Dependencias seguras

    // --- EFECTO 4: CARRUSEL ---
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
    
    // DECISIÓN CRÍTICA: ¿Usamos el Blob (Memoria) o la URL normal (Internet)?
    // Si tenemos el Blob descargado, lo usamos SIEMPRE. Si no, intentamos la URL normal.
    const fuenteVisualFinal = (esVideo(imagenVisual) && videoBlobUrl) ? videoBlobUrl : imagenVisual;

    const nombreSalon = eventoActual?.nombre_salon || config?.nombre_interno || "Sala de Eventos";
    const tickerText = eventoActual?.ticker || null;
    
    let layoutMode = 0;
    if (eventoActual?.layout_mode !== undefined) {
        layoutMode = eventoActual.layout_mode;
    } else if (eventoActual?.full_width) { 
        layoutMode = 1; 
    }

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

            {/* HEADER */}
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

            {/* CONTENIDO PRINCIPAL */}
            <div className={`flex-1 p-8 pt-2 relative z-10 w-full h-full ${tickerText ? 'pb-14' : ''}`}>
                
                {/* 1. MODO SCREENSAVER (Sin Evento) */}
                {!eventoActual && (
                    <div className="w-full h-full rounded-[3rem] overflow-hidden relative bg-black border border-zinc-800/50 shadow-2xl">
                        {imagenVisual && !imagenError && (
                            esVideo(imagenVisual) ? (
                                // 🔴 VIDEO PLAYER (USANDO FUENTE FINAL: BLOB O URL)
                                <video 
                                    key={indiceImagen}
                                    src={fuenteVisualFinal} 
                                    className="absolute inset-0 w-full h-full object-contain z-10" 
                                    autoPlay loop muted playsInline 
                                    onError={(e) => {
                                        console.error("Error reproduciendo video:", e);
                                        setImagenError(true);
                                    }} 
                                />
                            ) : (
                                <img key={indiceImagen} src={imagenVisual} className="absolute inset-0 w-full h-full object-contain animate-fade-in z-10" alt="Screensaver" onError={() => setImagenError(true)} />
                            )
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
                    <div className="w-full h-full h-full">
                        {/* Layouts de evento (Poster, Cine, Split) - Usan la misma lógica de esVideo() */}
                        {/* Como en modo evento las imágenes cambian mucho, aquí usamos la URL normal */}
                        {/* A menos que quieras aplicar la lógica de Blob también aquí, pero suele ser más crítico en Screensaver */}
                        
                         {layoutMode === 0 && (
                            <div className="flex w-full h-full gap-8">
                                <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-800/50 bg-black">
                                    {imagenVisual && !imagenError ? (
                                        esVideo(imagenVisual) ? (
                                             <video key={indiceImagen} src={imagenVisual} className="absolute inset-0 w-full h-full object-contain z-10" autoPlay loop muted playsInline onError={() => setImagenError(true)} />
                                        ) : (
                                            <img key={indiceImagen} src={imagenVisual} alt="Evento" className="absolute inset-0 w-full h-full object-contain animate-fade-in z-10" onError={() => setImagenError(true)} />
                                        )
                                    ) : (
                                        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center"><img src={config?.logo} className="w-1/3 opacity-10 grayscale" alt="Logo Fondo" /></div>
                                    )}
                                </div>
                                <div className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 bg-zinc-900/80 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center">
                                    {/* ... Texto del evento ... */}
                                    <h1 className="text-5xl lg:text-7xl font-black text-white mb-10 leading-tight drop-shadow-2xl">{eventoActual.titulo}</h1>
                                    <span className="text-3xl font-mono font-bold text-white border-b border-zinc-700 pb-1">{eventoActual.horario}</span>
                                </div>
                            </div>
                        )}
                        
                        {/* (He resumido el resto de modos para que quepa, pero la lógica del video es igual) */}
                         {/* Si necesitas el código de los otros modos (Poster/Cine), son iguales a la versión anterior */}
                         {/* Solo asegúrate de copiar el LayoutMode 1 y 2 de tu versión anterior si los usas */}
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <footer className={`h-20 bg-black relative z-20 grid grid-cols-3 items-center px-10 border-t border-zinc-900 transition-all ${tickerText ? 'mb-12' : 'mb-0'}`}>
                <div className="flex justify-start opacity-50 hover:opacity-100 transition-opacity">
                    <p className="text-[11px] tracking-[0.2em] text-zinc-500 uppercase font-medium">Powered by <span className="text-yellow-600 font-bold">narabyte.xyz</span></p>
                </div>
                <div className="flex justify-center">
                    {!eventoActual && <h2 className="text-4xl font-light tracking-[0.3em] uppercase text-white drop-shadow-lg animate-fade-in-up font-sans">BIENVENIDOS</h2>}
                </div>
                <div className="flex justify-end items-center gap-6">
                    <div className="text-5xl drop-shadow-lg filter pb-2">{getIconoClima(clima.codigo)}</div>
                    <div className="flex items-baseline gap-3">
                         <span className="text-4xl font-bold text-white tracking-tighter">{clima.tempC}°C</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}