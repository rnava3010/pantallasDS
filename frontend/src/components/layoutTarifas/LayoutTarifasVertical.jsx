import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';
import { getIconoClima } from '../../utils/weatherUtils';
import { TEXTOS_TARIFAS } from '../../utils/diccionario'; // <--- IMPORTACIÓN

export default function LayoutTarifasVertical({ 
    config, datos, horaActual, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    const [langIndex, setLangIndex] = useState(0);
    const { fondo, acento } = config.colores;
    
    // Configuración de Idiomas
    const idiomasActivos = config.idiomas_activos || ['es'];
    const idiomaActual = idiomasActivos[langIndex]; 
    
    // Selección del texto según el idioma actual
    const t = TEXTOS_TARIFAS[idiomaActual] || TEXTOS_TARIFAS['es']; 

    const tarifas = datos?.tarifas || [];
    const divisas = datos?.divisas || []; 
    const bannerObj = datos?.banner || { es: "Bienvenidos", en: "Welcome" };
    const bannerTexto = bannerObj[idiomaActual] || bannerObj['es'];

    const ITEMS_POR_PAGINA = 6; 
    const TIEMPO_ROTACION_PAGINA = 10000;
    const TIEMPO_ROTACION_IDIOMA = (config.tiempo_rotacion || 20) * 1000;

    // ... (El resto de tus useEffects para paginación y rotación siguen igual) ...
    useEffect(() => {
        const total = Math.ceil(tarifas.length / ITEMS_POR_PAGINA);
        if (total > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % total), TIEMPO_ROTACION_PAGINA);
            return () => clearInterval(int);
        }
    }, [tarifas.length]);

    useEffect(() => {
        if (idiomasActivos.length > 1) {
            const int = setInterval(() => {
                setLangIndex(prev => (prev + 1) % idiomasActivos.length);
            }, TIEMPO_ROTACION_IDIOMA);
            return () => clearInterval(int);
        }
    }, [idiomasActivos.length, TIEMPO_ROTACION_IDIOMA]);

    const visibles = tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden p-6 transition-all duration-500" style={{ backgroundColor: fondo }}>
            
            {/* HEADER */}
            <header className="h-24 flex items-center justify-between mb-4 px-4 bg-black/20 rounded-[2rem] border border-white/5 shadow-lg">
                <div className="w-1/4 flex justify-start">
                    <img src={config.logo} alt="Logo" className="h-16 object-contain animate-float" />
                </div>
                <div className="w-2/4 text-center">
                    {/* TÍTULO DESDE DICCIONARIO */}
                    <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-white animate-fade-in-up" key={idiomaActual} style={{ textShadow: `0 0 20px ${acento}` }}>
                        {t.titulo}
                    </h1>
                </div>
                <div className="w-1/4 flex flex-col items-end justify-center">
                    <span className="text-2xl font-mono font-black leading-none text-white">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/60 mt-1">
                        {horaActual?.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : 'es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </header>

            {/* MAIN */}
            <main className="flex-1 flex flex-col gap-3 bg-black/20 rounded-[2.5rem] p-6 border border-white/5 shadow-inner relative mb-4">
                <div className="flex justify-between items-center mb-1 px-4 text-[10px] font-black uppercase tracking-widest opacity-40 text-white">
                    {/* ENCABEZADOS DESDE DICCIONARIO */}
                    <span>{t.header_hab}</span>
                    <span>{t.header_tarifa}</span>
                </div>
                
                {visibles.map((item, i) => {
                    const nombre = (idiomaActual === 'en' ? item.nombre_en : item.nombre_es) || item.nombre_es;
                    const descripcion = (idiomaActual === 'en' ? item.descripcion_en : item.descripcion_es) || "";
                    const precioPromoRaw = item.precio || item.precio_promocion;
                    const precioRackRaw = item.precio_rack;
                    const precioPrincipal = precioPromoRaw ? precioPromoRaw : precioRackRaw;
                    const hayDescuento = precioPromoRaw && precioRackRaw && (parseFloat(precioPromoRaw) < parseFloat(precioRackRaw));
                    const precioTachado = hayDescuento ? precioRackRaw : null;
                    const moneda = item.moneda || 'MXN';

                    return (
                        <div key={i} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0 animate-fade-in-up">
                            <div className="flex flex-col gap-0.5 max-w-[65%]">
                                <span className="text-lg font-bold text-white uppercase truncate transition-all duration-300">{nombre}</span>
                                {descripcion && <span className="text-[10px] text-white/60 font-light italic leading-tight block truncate transition-all duration-300">{descripcion}</span>}
                            </div>
                            <div className="text-right flex flex-col items-end justify-center">
                                <span className="text-xl font-black" style={{ color: acento }}>
                                    <span className="text-xs align-top opacity-60 mr-1">{moneda}</span>
                                    {Number(precioPrincipal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </span>
                                {precioTachado && (
                                    <span className="text-[9px] text-white/40 line-through decoration-white/40">
                                        {t.reg} ${Number(precioTachado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* TIPO DE CAMBIO */}
            {divisas.length > 0 && (
                <div className="mb-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 px-6 py-3 flex items-center justify-around shadow-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mr-4 transition-all">
                        {t.cambio}
                    </span>
                    <div className="flex items-center gap-8">
                        {divisas.map((d, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className="text-2xl">{d.bandera}</span>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest leading-none">{d.codigo}</span>
                                    <span className="text-lg font-mono font-black text-white leading-none">${d.tipo_cambio}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* GALERÍA Y FOOTER */}
            <div className="h-[22%] mb-4 relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                <MediaRenderer url={itemActual} blobUrl={videoBlobUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {clima && (
                    <div className="absolute bottom-4 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
                        <span className="text-3xl drop-shadow-lg filter grayscale-0">{getIconoClima(clima.weathercode)}</span>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white leading-none">{clima.temperature}°</span>
                            <span className="text-[9px] uppercase tracking-widest text-white/70">{t.clima}</span>
                        </div>
                    </div>
                )}
            </div>

            <footer className="h-10 flex items-center bg-black/40 rounded-full border border-white/10 px-6 overflow-hidden relative">
                <div key={bannerTexto} className="animate-marquee-reverse whitespace-nowrap absolute w-full flex items-center">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/90">
                        {bannerTexto} <span className="mx-8 opacity-30">•</span> {bannerTexto} <span className="mx-8 opacity-30">•</span> {bannerTexto}
                    </span>
                </div>
            </footer>
             {/* ... (Tus estilos) ... */}
            <style>{`
                .animate-marquee-reverse { animation: marqueeReverse 25s linear infinite; }
                @keyframes marqueeReverse { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}