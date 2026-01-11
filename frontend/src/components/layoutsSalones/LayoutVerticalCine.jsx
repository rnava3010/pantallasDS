import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
import { TEXTOS_SALONES } from '../../utils/diccionario'; // <--- IMPORTACIÓN

export default function LayoutVerticalCine({ 
    eventoActual, itemActual, videoBlobUrl, config, shinyStyle, acento, fondo, texto_evento, textoFechas 
}) {
    // Estado para ciclo de idiomas
    const [langIndex, setLangIndex] = useState(0);

    // Configuración de idiomas
    const idiomasActivos = config?.idiomas_activos || ['es'];
    const idiomaActual = idiomasActivos[langIndex];
    const TIEMPO_ROTACION_IDIOMA = (config?.tiempo_rotacion || 20) * 1000;

    // Diccionario para etiquetas
    const t = TEXTOS_SALONES[idiomaActual] || TEXTOS_SALONES['es'];
    const labelHorario = t.hora || (idiomaActual === 'en' ? 'Time' : (idiomaActual === 'fr' ? 'Horaire' : 'Horario'));

    // --- EFECTO: Rotación de Idiomas ---
    useEffect(() => {
        if (idiomasActivos.length > 1) {
            const int = setInterval(() => {
                setLangIndex(prev => (prev + 1) % idiomasActivos.length);
            }, TIEMPO_ROTACION_IDIOMA);
            return () => clearInterval(int);
        }
    }, [idiomasActivos.length, TIEMPO_ROTACION_IDIOMA]);

    // --- TRADUCCIÓN DE DATOS DINÁMICOS ---
    const titulo = (idiomaActual === 'en' && eventoActual.titulo_en) ? eventoActual.titulo_en : 
                   (idiomaActual === 'fr' && eventoActual.titulo_fr) ? eventoActual.titulo_fr : eventoActual.titulo;

    const cliente = (idiomaActual === 'en' && eventoActual.cliente_en) ? eventoActual.cliente_en : 
                    (idiomaActual === 'fr' && eventoActual.cliente_fr) ? eventoActual.cliente_fr : eventoActual.cliente;

    const mensaje = (idiomaActual === 'en' && eventoActual.mensaje_en) ? eventoActual.mensaje_en : 
                    (idiomaActual === 'fr' && eventoActual.mensaje_fr) ? eventoActual.mensaje_fr : eventoActual.mensaje;

    // Fecha Localizada
    const fechaFormateada = eventoActual.fecha_inicio 
        ? new Date(eventoActual.fecha_inicio).toLocaleDateString(
            idiomaActual === 'en' ? 'en-US' : (idiomaActual === 'fr' ? 'fr-FR' : 'es-ES'), 
            { weekday: 'short', day: 'numeric', month: 'long' }
          )
        : textoFechas;

    return (
        <div className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/10 transition-all duration-500" style={{ backgroundColor: fondo }}>
            
            {/* 1. IMAGEN DE FONDO */}
            <div className="absolute inset-0 w-full h-full z-0">
                 <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="w-full h-full object-cover"/>
            </div>

            {!itemActual && (
                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center z-0">
                    <img src={config?.logo} className="w-2/3 opacity-10 grayscale animate-pulse" alt="Logo" />
                </div>
            )}
            
            {/* 2. DEGRADADO */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10 pointer-events-none"></div>
            
            {/* 3. INFO */}
            <div className="absolute bottom-0 left-0 w-full z-20 p-8 pb-12 flex flex-col items-center text-center">
                
                {/* TÍTULO TRADUCIDO */}
                <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight drop-shadow-2xl w-full animate-fade-in-up" 
                    key={`tit-${idiomaActual}`}
                    style={shinyStyle}>
                    {titulo}
                </h1>
                
                {/* CLIENTE TRADUCIDO */}
                {cliente && (
                    <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <span className="inline-block px-6 py-2 rounded-full text-lg font-bold uppercase tracking-wider shadow-lg backdrop-blur-md bg-black/40 border border-white/20 transition-all duration-300" 
                              style={{ color: acento, borderColor: `${acento}50` }}>
                            {cliente}
                        </span>
                    </div>
                )}
                
                <div className="flex flex-col items-center gap-1 mb-6 animate-fade-in-up" style={{ color: texto_evento, animationDelay: '0.2s' }}>
                     {/* ETIQUETA HORARIO TRADUCIDA */}
                     <span className="text-sm uppercase tracking-widest opacity-80 transition-all duration-300">
                        {labelHorario}
                     </span>
                     
                     {/* FECHA LOCALIZADA */}
                     <span className="text-sm font-bold uppercase opacity-90 transition-all duration-300" key={`date-${idiomaActual}`}>
                        {fechaFormateada}
                     </span>
                     
                     <span className="text-3xl font-mono font-bold border-b-2 pb-1" style={{ borderColor: acento }}>
                        {eventoActual.horario}
                     </span>
                </div>
                
                {/* MENSAJE TRADUCIDO */}
                {mensaje && (
                    <p className="text-lg font-serif italic max-w-sm drop-shadow-md opacity-90 mb-4 animate-fade-in-up" 
                       key={`msg-${idiomaActual}`}
                       style={{ color: texto_evento, animationDelay: '0.3s' }}>
                        "{mensaje}"
                    </p>
                )}

                {/* Flecha Flotante */}
                {eventoActual.direccion && (
                    <div className="absolute bottom-6 right-6 z-30 animate-bounce">
                        <div className="bg-white/10 p-3 rounded-full border border-white/20 backdrop-blur-md shadow-2xl">
                            <DirectionArrow direccion={eventoActual.direccion} size="w-12 h-12" color={acento} />
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(15px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
}