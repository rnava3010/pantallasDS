import React, { useState, useEffect } from 'react';

export default function PlayerSalon({ data, config }) {
    const [horaActual, setHoraActual] = useState(new Date());
    
    // ESTADO PARA EL CARRUSEL
    const [indiceImagen, setIndiceImagen] = useState(0);
    const [animacionFade, setAnimacionFade] = useState(true); // Para reiniciar la animación CSS

    // 1. Reloj
    useEffect(() => {
        const timer = setInterval(() => setHoraActual(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. Favicon
    useEffect(() => {
        if (config?.favicon) {
            let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'icon';
            link.href = config.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [config?.favicon]);

    // 3. LÓGICA DEL SLIDESHOW (Solo si hay más de 1 imagen)
    useEffect(() => {
        if (data?.imagenes && data.imagenes.length > 1) {
            const intervalo = setInterval(() => {
                // Truco visual: Quitamos la clase 'fade-in', esperamos un poco y la ponemos, o cambiamos el índice
                setIndiceImagen((prevIndex) => (prevIndex + 1) % data.imagenes.length);
            }, 8000); // Cambia cada 8 segundos

            return () => clearInterval(intervalo);
        }
    }, [data?.imagenes]);

    if (!data) return <div className="text-white text-center mt-20">Cargando...</div>;

    // Determinamos si hay imágenes para mostrar split screen
    const tieneImagenes = data.imagenes && data.imagenes.length > 0;
    const imagenActual = tieneImagenes ? data.imagenes[indiceImagen] : null;

    return (
        <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden font-sans selection:bg-yellow-500 selection:text-black">
            
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
                        {/* Iteramos sobre todas las imágenes pero solo mostramos la activa para hacer crossfade si quisieramos, 
                            pero por simplicidad renderizamos una sola con key para reiniciar animación */}
                        <img 
                            key={indiceImagen} // Al cambiar el key, React reinicia la animación fade-in
                            src={imagenActual} 
                            alt="Evento Slide" 
                            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                        
                        {/* Indicadores de puntitos (Opcional, se ve pro) */}
                        {data.imagenes.length > 1 && (
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                                {data.imagenes.map((_, idx) => (
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
                                {data.nombre_salon || config.nombre_interno}
                            </span>
                        </div>

                        <h1 className={`font-black text-white mb-8 leading-tight drop-shadow-2xl ${tieneImagenes ? 'text-5xl lg:text-7xl' : 'text-6xl md:text-8xl'}`}>
                            {data.titulo}
                        </h1>

                        {data.cliente && (
                            <div className="mb-12">
                                <span className="inline-block border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 px-8 py-3 rounded-full text-xl lg:text-2xl font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                    {data.cliente}
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-zinc-400 text-xl font-light">
                            <span>Horario del evento:</span>
                            <span className="text-white font-mono font-bold text-2xl bg-black/40 px-4 py-1 rounded border border-zinc-700">
                                {data.horario}
                            </span>
                        </div>

                        {data.mensaje && (
                            <div className="mt-16 border-t border-zinc-700/50 pt-8 w-3/4 mx-auto">
                                <p className="text-2xl text-gray-300 font-serif italic">
                                    "{data.mensaje}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="h-12 bg-black flex items-center justify-center border-t border-zinc-900 z-20">
                <p className="text-zinc-600 text-xs tracking-widest">DIGITAL SIGNAGE SYSTEM</p>
            </footer>
        </div>
    );
}