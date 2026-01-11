import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { getIconoClima } from '../../utils/weatherUtils';
// Asegúrate de tener este diccionario creado o defínelo aquí mismo si prefieres
import { TEXTOS_TARIFAS } from '../../utils/diccionario'; 

export default function LayoutTarifasHorizontal({ 
    config, datos, horaActual, clima, itemActual, videoBlobUrl 
}) {
    // --- ESTADOS ---
    const [pagina, setPagina] = useState(0);
    const [langIndex, setLangIndex] = useState(0); 

    // --- CONFIGURACIÓN ---
    const { fondo, texto_evento, acento } = config.colores || { fondo: '#000', texto_evento: '#fff', acento: '#EAB308' };
    
    // Idiomas
    const idiomasActivos = config.idiomas_activos || ['es'];
    const idiomaActual = idiomasActivos[langIndex];
    // Fallback por si no existe el diccionario externo
    const t = TEXTOS_TARIFAS?.[idiomaActual] || TEXTOS_TARIFAS?.['es'] || { 
        titulo_largo: "TARIFAS DE HABITACIÓN", 
        precio_regular: "Regular", 
        clima: "CLIMA ACTUAL" 
    };

    // Datos del Backend
    const tarifas = datos?.tarifas || [];    // Habitaciones
    const divisas = datos?.divisas || [];    // Monedas (USD, EUR)
    const bannerObj = datos?.banner || { es: "", en: "" };
    
    // Si bannerObj es string (versión vieja), lo usamos directo. Si es objeto, rotamos.
    const bannerTexto = typeof bannerObj === 'string' ? bannerObj : (bannerObj[idiomaActual] || bannerObj['es']);

    // Constantes de Animación
    const ITEMS_POR_PAGINA = 5;
    const TIEMPO_ROTACION_IDIOMA = (config.tiempo_rotacion || 20) * 1000;

    // --- EFECTO: PAGINACIÓN DE HABITACIONES ---
    useEffect(() => {
        const total = Math.ceil(tarifas.length / ITEMS_POR_PAGINA);
        if (total > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % total), 10000); // 10s por página
            return () => clearInterval(int);
        }
    }, [tarifas.length]);

    // --- EFECTO: ROTACIÓN DE IDIOMA ---
    useEffect(() => {
        if (idiomasActivos.length > 1) {
            const int = setInterval(() => {
                setLangIndex(prev => (prev + 1) % idiomasActivos.length);
            }, TIEMPO_ROTACION_IDIOMA);
            return () => clearInterval(int);
        }
    }, [idiomasActivos.length, TIEMPO_ROTACION_IDIOMA]);

    // Slice de datos para la página actual
    const visibles = tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden p-10 transition-all duration-500" style={{ backgroundColor: fondo }}>
            
            {/* ============================================== */}
            {/* 1. HEADER (Logo, Título, Reloj)                */}
            {/* ============================================== */}
            <header className="flex justify-between items-center mb-6 bg-black/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl shrink-0">
                {/* Logo Flotante */}
                <img src={config.logo} alt="Logo" className="h-20 object-contain animate-float drop-shadow-lg" />
                
                {/* Título Principal */}
                <h1 className="text-5xl font-black uppercase tracking-tighter animate-fade-in-up" 
                    key={`tit-${idiomaActual}`} 
                    style={{ color: acento, textShadow: '0 0 30px rgba(0,0,0,0.6)' }}>
                    {t.titulo_largo} 
                </h1>
                
                {/* Reloj Digital */}
                <div className="text-right flex flex-col items-end">
                    <span className="text-6xl font-mono font-black block leading-none text-white tracking-tight">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm font-bold uppercase tracking-widest text-white/60 mt-2">
                        {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* ============================================== */}
            {/* 2. MAIN (Lista de Habitaciones)                */}
            {/* ============================================== */}
            <main className="flex-1 flex flex-col gap-4 px-2 overflow-hidden">
                {visibles.map((item, i) => {
                    // Traducción de campos
                    const nombre = (idiomaActual === 'en' ? item.nombre_en : item.nombre_es) || item.nombre_es || item.nombre_habitacion;
                    const descripcion = (idiomaActual === 'en' ? item.descripcion_en : item.descripcion_es) || item.descripcion || "";
                    const moneda = item.moneda || 'MXN';
                    
                    // Precios
                    const precioPromoRaw = item.precio || item.precio_promocion || item.venta; // Soportamos varios alias
                    const precioRackRaw = item.precio_rack || item.compra;
                    
                    // Lógica de visualización
                    const precioFinal = precioPromoRaw ? precioPromoRaw : precioRackRaw;
                    const tieneDescuento = precioPromoRaw && precioRackRaw && (parseFloat(precioPromoRaw) < parseFloat(precioRackRaw));

                    return (
                        <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5 animate-fade-in-up hover:bg-white/10 transition-all duration-300 shadow-lg">
                            {/* Info Habitación */}
                            <div className="flex flex-col gap-1">
                                <span className="text-4xl font-black uppercase tracking-tight text-white/90" style={{ color: texto_evento }}>
                                    {nombre}
                                </span>
                                {descripcion && (
                                    <span className="text-base text-white/50 italic font-light">
                                        {descripcion}
                                    </span>
                                )}
                            </div>
                            
                            {/* Precios */}
                            <div className="flex flex-col items-end justify-center">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold opacity-40 text-white">{moneda}</span>
                                    <span className="text-6xl font-mono font-black tracking-tighter" style={{ color: acento }}>
                                        {precioFinal}
                                    </span>
                                </div>
                                {tieneDescuento && (
                                    <span className="text-sm text-white/40 line-through decoration-white/40 uppercase tracking-wide mt-1">
                                        {t.precio_regular} {moneda} {precioRackRaw}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* ============================================== */}
            {/* 3. FOOTER (Video, Clima, Banner, Divisas)      */}
            {/* ============================================== */}
            <footer className="h-56 mt-6 grid grid-cols-[1fr_300px] gap-6 shrink-0">
                
                {/* A. Área Multimedia: Video Promocional + Widget Clima */}
                <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group bg-black">
                    <MediaRenderer 
                        url={itemActual} 
                        blobUrl={videoBlobUrl} 
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
                    />
                    {/* Degradado para legibilidad */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    
                    {/* Widget Clima */}
                    {clima && (
                        <div className="absolute bottom-6 left-8 flex items-center gap-5 animate-fade-in-up">
                            <span className="text-6xl drop-shadow-xl filter grayscale-0">
                                {getIconoClima(clima.weathercode)}
                            </span>
                            <div>
                                <span className="text-5xl font-black text-white leading-none block drop-shadow-md">
                                    {Math.round(clima.temperature)}°
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-bold ml-1">
                                    {t.clima}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* B. Barra Lateral: Banner Scroll + Divisas Compactas */}
                <div className="flex flex-col gap-4 h-full">
                    
                    {/* Banner Marquesina */}
                    <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 flex items-center justify-center overflow-hidden relative shadow-lg">
                         <div key={bannerTexto} className="animate-marquee-vertical absolute inset-x-4 text-center flex flex-col items-center justify-center min-h-full">
                            <span className="text-lg md:text-xl font-medium tracking-wider text-white uppercase leading-relaxed text-center px-4">
                                {bannerTexto}
                            </span>
                        </div>
                    </div>

                    {/* Mini-Tabla de Divisas */}
                    <div className="h-24 bg-black/40 backdrop-blur-md rounded-[2rem] border border-white/10 flex items-center justify-evenly px-2 shadow-lg">
                        {divisas.length > 0 ? divisas.map((d, idx) => (
                            <div key={idx} className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xl opacity-90">{d.icono_url || d.bandera || '💵'}</span>
                                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest text-white">{d.codigo}</span>
                                </div>
                                <span className="text-xl font-mono font-black text-white tracking-tight">
                                    <span className="text-[10px] opacity-40 mr-0.5">$</span>
                                    {d.venta || d.tipo_cambio}
                                </span>
                            </div>
                        )) : (
                            <span className="text-white/30 text-[10px] uppercase tracking-widest">NO DATA</span>
                        )}
                    </div>
                </div>
            </footer>

            {/* ESTILOS CSS INLINE */}
            <style>{`
                .animate-marquee-vertical { 
                    animation: marqueeVertical 15s linear infinite; 
                }
                @keyframes marqueeVertical { 
                    0% { transform: translateY(100%); opacity: 0; } 
                    5% { opacity: 1; } 
                    95% { opacity: 1; } 
                    100% { transform: translateY(-100%); opacity: 0; } 
                }
                .animate-fade-in-up { 
                    animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; 
                }
                .animate-float {
                    animation: floatLogo 6s ease-in-out infinite;
                }
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(30px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                @keyframes floatLogo {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `}</style>
        </div>
    );
}