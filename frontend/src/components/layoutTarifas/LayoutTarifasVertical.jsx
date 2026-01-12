import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { TEXTOS_TARIFAS } from '../../utils/diccionario';

const FLAGS_EMOJI = {
    USD: '🇺🇸', EUR: '🇪🇺', CAD: '🇨🇦', JPY: '🇯🇵', MXN: '🇲🇽', GBP: '🇬🇧'
};

export default function LayoutTarifasVertical({ 
    config, datos, horaActual, clima, itemActual, videoBlobUrl 
}) {
    // --- ESTADOS DE ROTACIÓN ---
    const [pagina, setPagina] = useState(0);
    const [idiomaIndex, setIdiomaIndex] = useState(0);

    // --- CONFIGURACIÓN ---
    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    
    // Idiomas disponibles
    const idiomas = Array.isArray(config?.idiomas_activos) && config.idiomas_activos.length > 0 
                    ? config.idiomas_activos 
                    : ['es'];
    const tiempoRotacion = (config?.tiempo_rotacion_idioma || 20) * 1000;
    
    // Idioma actual
    const idiomaActual = idiomas[idiomaIndex];
    // Diccionario estático
    const dict = TEXTOS_TARIFAS[idiomaActual] || TEXTOS_TARIFAS['es'];
    
    // Texto legal dinámico
    const pieTarifasObj = config?.pieTarifas || {};
    const textoLegal = pieTarifasObj[idiomaActual] || pieTarifasObj['es'] || "";

    // --- DATOS ---
    const tarifas = datos?.tarifas || [];
    const divisas = datos?.divisas || []; 
    const avisosRaw = datos?.avisos || [{ texto: "Bienvenidos", texto_en: "Welcome" }];
    
    // En vertical caben más items cómodamente (o menos si son muy altos), probemos con 5
    const ITEMS_POR_PAGINA = 5;

    // --- 1. ROTACIÓN DE IDIOMA ---
    useEffect(() => {
        if (idiomas.length > 1) {
            const interval = setInterval(() => {
                setIdiomaIndex(prev => (prev + 1) % idiomas.length);
            }, tiempoRotacion);
            return () => clearInterval(interval);
        }
    }, [idiomas, tiempoRotacion]);

    // --- 2. ROTACIÓN DE PÁGINAS ---
    useEffect(() => {
        if (tarifas.length === 0) return;
        const total = Math.ceil(tarifas.length / ITEMS_POR_PAGINA);
        if (total > 1) {
            setPagina(0); 
            const int = setInterval(() => setPagina(p => (p + 1) % total), 10000);
            return () => clearInterval(int);
        }
    }, [tarifas.length, idiomaIndex]);

    const getTxt = (obj, campoBase) => {
        if (!obj) return "";
        if (idiomaActual === 'es') return obj[campoBase] || ""; 
        const campoTraducido = `${campoBase}_${idiomaActual}`;
        return obj[campoTraducido] || obj[campoBase] || ""; 
    };

    const visibles = tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    return (
        // Grid Vertical: Header (auto) -> Tarifas (1fr) -> Divisas (auto) -> Footer (auto)
        <div className="h-screen w-screen overflow-hidden p-6 grid grid-rows-[auto_1fr_auto_auto] gap-6" style={{ backgroundColor: fondo }}>
            
            {/* 1. HEADER (Centrado en vertical) */}
            <header className="flex flex-col items-center bg-black/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-xl z-20 gap-4">
                <img src={config.logo} alt="Logo" className="h-24 object-contain animate-logo-float" />
                
                <h1 className="text-4xl font-black uppercase tracking-tighter text-center" style={{ color: acento, textShadow: `0 0 20px ${acento}80, 0 0 40px ${acento}40` }}>
                    {dict.titulo_largo}
                </h1>
                
                <div className="text-center">
                    <span className="text-6xl font-mono font-black block leading-none text-white mb-2">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xl opacity-80 text-white font-light uppercase tracking-widest block">
                        {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* 2. ZONA DE TARIFAS */}
            <main className="flex flex-col justify-start gap-4 overflow-hidden relative">
                {visibles.map((t, i) => {
                    const tienePromo = t.precio_promocion && parseFloat(t.precio_promocion) > 0;
                    const precioMostrar = tienePromo ? t.precio_promocion : t.precio_rack;
                    const monedaSymbol = t.moneda || '$';
                    const nombreHabitacion = getTxt(t, 'nombre');
                    const descripcionHab = getTxt(t, 'descripcion');

                    return (
                        <div key={i} className="flex flex-col p-5 bg-white/5 rounded-3xl border border-white/5 animate-fade-in-up shadow-lg gap-2">
                            {/* Fila superior: Nombre */}
                            <div className="flex justify-between items-start">
                                <span className="text-3xl font-black uppercase leading-tight" style={{ color: texto_evento }}>
                                    {nombreHabitacion}
                                </span>
                            </div>

                            {/* Fila media: Descripción */}
                            {descripcionHab && (
                                <span className="text-sm opacity-60 text-white italic truncate">
                                    {descripcionHab}
                                </span>
                            )}
                            
                            {/* Fila inferior: Precios (Alineado a la derecha para impacto) */}
                            <div className="flex flex-col items-end mt-1 border-t border-white/10 pt-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold opacity-40 text-white">{monedaSymbol}</span>
                                    <span className="text-6xl font-mono font-black" style={{ color: acento }}>{precioMostrar}</span>
                                </div>
                                {tienePromo && (
                                    <span className="text-sm font-bold text-white/40">
                                        {dict.reg} {monedaSymbol} {t.precio_rack}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* TEXTO LEGAL (Al final de la lista de tarifas) */}
                {textoLegal && (
                    <div className="mt-auto pt-4 text-center animate-fade-in-up">
                        <span className="text-xs text-white/40 uppercase tracking-widest font-light">
                            {textoLegal}
                        </span>
                    </div>
                )}
            </main>

            {/* 3. DIVISAS (Grid 2 columnas para que se vea grande en vertical) */}
            {divisas.length > 0 && (
                <div className="z-10 py-2"> 
                    <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                        {divisas.map((divisa, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 shadow-lg justify-center">
                                <img 
                                    src={divisa.imagen_url} 
                                    alt={divisa.codigo}
                                    className="w-10 h-10 object-contain drop-shadow-md rounded-full bg-white/10"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                />
                                <span className="hidden text-3xl select-none">{FLAGS_EMOJI[divisa.codigo] || '🌐'}</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-[-2px]">{divisa.codigo}</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xs text-white/70">{divisa.simbolo}</span>
                                        <span className="text-xl font-mono font-bold text-white">{divisa.tipo_cambio}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. FOOTER (Video arriba, Texto abajo) */}
            <footer className="h-[400px] flex flex-col gap-4 z-20">
                {/* Video/Imagen Promocional (Ocupa la mayoría del espacio) */}
                <div className="flex-1 relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                    <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                
                {/* Banner de Avisos (Más compacto en altura) */}
                <div className="h-24 bg-black/40 backdrop-blur-md rounded-[1.5rem] border border-white/10 p-2 flex flex-col items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div key={idiomaActual} className="animate-marquee-vertical flex flex-col gap-8 items-center text-center w-full px-4">
                            {[...avisosRaw, ...avisosRaw].map((aviso, i) => (
                                <span key={i} className="text-xl font-light tracking-widest text-white uppercase leading-tight">
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