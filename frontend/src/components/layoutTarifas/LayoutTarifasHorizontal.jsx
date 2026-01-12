import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { TEXTOS_TARIFAS } from '../../utils/diccionario'; // Asegúrate de que la ruta sea correcta

const FLAGS_EMOJI = {
    USD: '🇺🇸', EUR: '🇪🇺', CAD: '🇨🇦', JPY: '🇯🇵', MXN: '🇲🇽', GBP: '🇬🇧'
};

export default function LayoutTarifasHorizontal({ 
    config, datos, horaActual, clima, itemActual, videoBlobUrl 
}) {
    // --- ESTADOS DE ROTACIÓN ---
    const [pagina, setPagina] = useState(0);
    const [idiomaIndex, setIdiomaIndex] = useState(0);

    // --- CONFIGURACIÓN ---
    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    // Idiomas disponibles (ej: ["es", "en"]) y duración (ej: 20 seg)
    const idiomas = Array.isArray(config?.idiomas_activos) && config.idiomas_activos.length > 0 
                    ? config.idiomas_activos 
                    : ['es'];
    const tiempoRotacion = (config?.tiempo_rotacion_idioma || 20) * 1000;
    
    // Idioma actual (string: 'es' o 'en')
    const idiomaActual = idiomas[idiomaIndex];
    // Diccionario estático para headers
    const dict = TEXTOS_TARIFAS[idiomaActual] || TEXTOS_TARIFAS['es'];

    // --- DATOS ---
    const tarifas = datos?.tarifas || [];
    const divisas = datos?.divisas || []; 
    const avisosRaw = datos?.avisos || [{ texto: "Bienvenidos", texto_en: "Welcome" }];
    const ITEMS_POR_PAGINA = 4;

    // --- 1. ROTACIÓN DE IDIOMA ---
    useEffect(() => {
        if (idiomas.length > 1) {
            const interval = setInterval(() => {
                setIdiomaIndex(prev => (prev + 1) % idiomas.length);
            }, tiempoRotacion);
            return () => clearInterval(interval);
        }
    }, [idiomas, tiempoRotacion]);

    // --- 2. ROTACIÓN DE PÁGINAS (Tarifas) ---
    useEffect(() => {
        if (tarifas.length === 0) return;
        const total = Math.ceil(tarifas.length / ITEMS_POR_PAGINA);
        if (total > 1) {
            // Reiniciamos a pág 0 cuando cambia el idioma para que se vea ordenado
            setPagina(0); 
            const int = setInterval(() => setPagina(p => (p + 1) % total), 10000); // 10s por página de tarifas
            return () => clearInterval(int);
        }
    }, [tarifas.length, idiomaIndex]); // Dependencia idiomaIndex para resetear

    // --- HELPER PARA OBTENER TEXTO DINÁMICO ---
    // Ej: getTxt(tarifa, 'nombre') -> busca tarifa.nombre si es 'es', tarifa.nombre_en si es 'en'
    const getTxt = (obj, campoBase) => {
        if (!obj) return "";
        if (idiomaActual === 'es') return obj[campoBase] || ""; // Español es el default
        // Para otros idiomas buscamos campo_en, campo_fr, etc.
        const campoTraducido = `${campoBase}_${idiomaActual}`;
        return obj[campoTraducido] || obj[campoBase] || ""; // Fallback a español si no hay traducción
    };

    const visibles = tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    return (
        <div className="h-screen w-screen overflow-hidden p-6 grid grid-rows-[auto_1fr_auto_auto] gap-4" style={{ backgroundColor: fondo }}>
            
            {/* HEADER */}
            <header className="flex justify-between items-center bg-black/40 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/10 shadow-xl z-20">
                <img src={config.logo} alt="Logo" className="h-14 object-contain animate-logo-float" />
                
                {/* Título Traducido (Diccionario) */}
                <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ color: acento, textShadow: `0 0 20px ${acento}80, 0 0 40px ${acento}40` }}>
                    {dict.titulo_largo}
                </h1>
                
                <div className="text-right flex flex-col justify-center">
                    <span className="text-4xl font-mono font-black block leading-none text-white">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm opacity-80 text-white font-light uppercase tracking-widest mt-1">
                        {/* Fecha en el idioma actual */}
                        {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* TARIFAS */}
            <main className="flex flex-col justify-center gap-3 overflow-hidden">
                {visibles.map((t, i) => {
                    const tienePromo = t.precio_promocion && parseFloat(t.precio_promocion) > 0;
                    const precioMostrar = tienePromo ? t.precio_promocion : t.precio_rack;
                    const monedaSymbol = t.moneda || '$';

                    // Textos dinámicos de la BD
                    const nombreHabitacion = getTxt(t, 'nombre'); // nombre o nombre_en
                    const descripcionHab = getTxt(t, 'descripcion'); // descripcion o descripcion_en

                    return (
                        <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 animate-fade-in-up shadow-lg">
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-2xl font-black uppercase truncate" style={{ color: texto_evento }}>
                                    {nombreHabitacion}
                                </span>
                                {descripcionHab && (
                                    <span className="text-xs opacity-60 text-white italic mt-1 truncate">
                                        {descripcionHab}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col items-end justify-center min-w-[160px]">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-bold opacity-40 text-white">{monedaSymbol}</span>
                                    <span className="text-4xl font-mono font-black" style={{ color: acento }}>{precioMostrar}</span>
                                </div>
                                {tienePromo && (
                                    <span className="text-xs font-bold text-white/40">
                                        {dict.reg} {monedaSymbol} {t.precio_rack}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* DIVISAS */}
            <div className="flex justify-center items-center py-2 z-10 min-h-[80px]"> 
                {divisas.length > 0 && (
                    <div className="flex gap-4 animate-fade-in-up">
                        {divisas.map((divisa, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-black/60 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 shadow-lg hover:scale-105 transition-transform">
                                <img 
                                    src={divisa.imagen_url} 
                                    alt={divisa.codigo}
                                    className="w-12 h-12 object-contain drop-shadow-md rounded-full bg-white/10"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                />
                                <span className="hidden text-4xl select-none filter drop-shadow-md">{FLAGS_EMOJI[divisa.codigo] || '🌐'}</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-[-2px]">{divisa.codigo}</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xs text-white/70">{divisa.simbolo}</span>
                                        <span className="text-2xl font-mono font-bold text-white">{divisa.tipo_cambio}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <footer className="h-48 grid grid-cols-2 gap-6 z-20">
                <div className="relative rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                
                <div className="bg-black/40 backdrop-blur-md rounded-[1.5rem] border border-white/10 p-6 flex flex-col items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {/* Clave para reiniciar animación: cambiamos la 'key' cuando cambia el idioma */}
                        <div key={idiomaActual} className="animate-marquee-vertical flex flex-col gap-10 items-center text-center w-full px-4">
                            {[...avisosRaw, ...avisosRaw].map((aviso, i) => (
                                <span key={i} className="text-2xl font-light tracking-widest text-white uppercase leading-tight">
                                    {/* Obtenemos el texto del aviso según idioma */}
                                    {getTxt(aviso, 'texto')}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                .animate-marquee-vertical { animation: marqueeVertical 15s linear infinite; }
                @keyframes marqueeVertical {
                    0% { transform: translateY(0%); } 
                    100% { transform: translateY(-50%); }
                }

                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-logo-float { animation: floatLogo 6s ease-in-out infinite; }
                @keyframes floatLogo { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
            `}</style>
        </div>
    );
}