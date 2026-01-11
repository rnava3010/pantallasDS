import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import DirectionArrow from '../DirectionArrow';
// Importamos el diccionario para textos fijos si fuera necesario, 
// aunque en este layout casi todo viene del evento dinámico.
import { TEXTOS_SALONES } from '../../utils/diccionario'; 

export default function LayoutCine({ 
    eventoActual, itemActual, videoBlobUrl, config, texto_evento, acento, fondo, textoFechas 
}) {
    // Estado para el ciclo de idiomas
    const [langIndex, setLangIndex] = useState(0);

    // Configuración de idiomas (mismo patrón que los anteriores)
    const idiomasActivos = config?.idiomas_activos || ['es'];
    const idiomaActual = idiomasActivos[langIndex];
    const TIEMPO_ROTACION_IDIOMA = (config?.tiempo_rotacion || 20) * 1000;

    // --- EFECTO: Rotación de Idiomas ---
    useEffect(() => {
        if (idiomasActivos.length > 1) {
            const int = setInterval(() => {
                setLangIndex(prev => (prev + 1) % idiomasActivos.length);
            }, TIEMPO_ROTACION_IDIOMA);
            return () => clearInterval(int);
        }
    }, [idiomasActivos.length, TIEMPO_ROTACION_IDIOMA]);

    // --- TRADUCCIÓN DE DATOS ---
    // 1. Título del Evento
    const titulo = (idiomaActual === 'en' && eventoActual.titulo_en) ? eventoActual.titulo_en : 
                   (idiomaActual === 'fr' && eventoActual.titulo_fr) ? eventoActual.titulo_fr : eventoActual.titulo;

    // 2. Cliente (si existe traducción en BD, sino usa el default)
    const cliente = (idiomaActual === 'en' && eventoActual.cliente_en) ? eventoActual.cliente_en : 
                    (idiomaActual === 'fr' && eventoActual.cliente_fr) ? eventoActual.cliente_fr : eventoActual.cliente;

    // 3. Mensaje extra
    const mensaje = (idiomaActual === 'en' && eventoActual.mensaje_en) ? eventoActual.mensaje_en : 
                    (idiomaActual === 'fr' && eventoActual.mensaje_fr) ? eventoActual.mensaje_fr : eventoActual.mensaje;

    // 4. Fecha Localizada (Ignoramos 'textoFechas' estático si tenemos la fecha real para formatearla)
    // Si eventoActual tiene fecha_inicio, la formateamos. Si no, usamos el prop textoFechas.
    const fechaFormateada = eventoActual.fecha_inicio 
        ? new Date(eventoActual.fecha_inicio).toLocaleDateString(
            idiomaActual === 'en' ? 'en-US' : (idiomaActual === 'fr' ? 'fr-FR' : 'es-ES'), 
            { weekday: 'long', day: 'numeric', month: 'long' }
          )
        : textoFechas;

    return (
        <div className="w-full h-full rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10 transition-all duration-700" style={{ backgroundColor: fondo }}>
            
            {/* FONDO MULTIMEDIA */}
            <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="object-cover z-0 opacity-90 w-full h-full"/>
            
            {/* Placeholder si no hay media */}
            {!itemActual && (
                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                    <img src={config?.logo} className="w-1/3 opacity-10 grayscale animate-pulse" alt="Logo" />
                </div>
            )}
            
            {/* GRADIENTE DE LECTURA */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 z-10"></div>
            
            {/* CONTENIDO PRINCIPAL (Bottom Left) */}
            <div className="absolute bottom-10 left-10 z-20 max-w-5xl p-10">
                
                {/* Título con animación al cambiar idioma */}
                <h1 className="text-7xl lg:text-9xl font-black mb-6 leading-none drop-shadow-2xl animate-fade-in-up" 
                    key={`tit-${idiomaActual}`} // Forzar re-render para animación
                    style={{ color: texto_evento }}>
                    {titulo}
                </h1>
                
                {/* Badge de Cliente */}
                {cliente && (
                    <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <span className="inline-block px-8 py-3 rounded-full text-2xl font-bold uppercase tracking-wider shadow-lg transform hover:scale-105 transition-transform" 
                              style={{ backgroundColor: acento, color: fondo === '#000000' ? '#000000' : '#FFFFFF' }}>
                            {cliente}
                        </span>
                    </div>
                )}
                
                <div className="flex flex-col items-start gap-2" style={{ color: texto_evento }}>
                     {/* FECHA LOCALIZADA */}
                     <span className="text-2xl font-bold uppercase opacity-80 ml-4 tracking-widest animate-fade-in-up" key={`date-${idiomaActual}`}>
                        {fechaFormateada}
                     </span>
                     
                     <div className="flex items-center gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <span className="text-4xl font-mono font-bold pl-4 border-l-8" style={{ borderColor: acento }}>
                            {eventoActual.horario} {/* El horario suele ser números (10:00 - 12:00), no necesita traducción */}
                        </span>
                     </div>
                </div>
                
                {/* Mensaje Opcional */}
                {mensaje && (
                    <p className="mt-8 text-3xl font-serif italic max-w-3xl drop-shadow-md opacity-90 animate-fade-in-up border-l-2 border-white/30 pl-6 py-2" 
                       key={`msg-${idiomaActual}`}
                       style={{ color: texto_evento, animationDelay: '0.3s' }}>
                        "{mensaje}"
                    </p>
                )}
            </div>

            {/* FLECHA DE DIRECCIÓN (Bottom Right) */}
            {eventoActual.direccion && (
                <div className="absolute bottom-10 right-10 z-30 bg-white/10 p-6 rounded-full border border-white/20 backdrop-blur-md shadow-2xl animate-fade-in-up hover:bg-white/20 transition-colors">
                    <DirectionArrow direccion={eventoActual.direccion} size="w-32 h-32" color={acento} />
                </div>
            )}

            <style>{`
                .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(40px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
}