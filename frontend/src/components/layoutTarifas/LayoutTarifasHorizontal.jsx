import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer';

export default function LayoutTarifasHorizontal({ 
    config, datos, horaActual, clima, itemActual, videoBlobUrl 
}) {
    const [pagina, setPagina] = useState(0);
    const { fondo, texto_reloj, texto_evento, acento } = config.colores;
    
    const tarifas = datos?.tarifas || [];
    const divisas = datos?.divisas || []; 
    const banner = datos?.banner || "Bienvenidos - Consulte nuestras promociones";
    const ITEMS_POR_PAGINA = 4;

    // --- LOGS DE DEPURACIÓN AL INICIO ---
    useEffect(() => {
        console.log("🔍 DEBUG TARIFAS - Datos recibidos:", datos);
        console.log("💰 DEBUG DIVISAS - Array:", divisas);
        if (divisas.length > 0) {
            divisas.forEach(d => {
                console.log(`   ➡️ Divisa: ${d.codigo}, Archivo esperado: ${d.codigo?.toLowerCase()}.png`);
            });
        }
    }, [datos]);

    useEffect(() => {
        if (tarifas.length === 0) return;
        const total = Math.ceil(tarifas.length / ITEMS_POR_PAGINA);
        if (total > 1) {
            const int = setInterval(() => setPagina(p => (p + 1) % total), 10000);
            return () => clearInterval(int);
        }
    }, [tarifas.length]);

    const visibles = tarifas.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA);

    // ✅ HELPER CON LOGS: Construye la URL y avisa si la genera mal
    const getBanderaSrc = (codigo) => {
        if (!codigo) return "";
        
        // 1. Convertimos a minúsculas para coincidir con el archivo físico
        const nombreArchivo = codigo.toLowerCase(); 
        
        // 2. Construimos la URL absoluta al backend
        const url = `https://ds.logicielmx.cloud/banderas/${nombreArchivo}.png`;
        
        return url;
    };

    return (
        <div className="h-screen w-screen overflow-hidden p-6 grid grid-rows-[auto_1fr_auto_auto] gap-4" style={{ backgroundColor: fondo }}>
            
            {/* HEADER */}
            <header className="flex justify-between items-center bg-black/40 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/10 shadow-xl z-20">
                <img src={config.logo} alt="Logo" className="h-14 object-contain animate-logo-float" />
                <h1 
                    className="text-3xl font-black uppercase tracking-tighter" 
                    style={{ color: acento, textShadow: `0 0 20px ${acento}80, 0 0 40px ${acento}40` }}
                >
                    Tarifas Vigentes
                </h1>
                <div className="text-right flex flex-col justify-center">
                    <span className="text-4xl font-mono font-black block leading-none text-white">
                        {horaActual?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm opacity-80 text-white font-light uppercase tracking-widest mt-1">
                        {horaActual?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* TARIFAS */}
            <main className="flex flex-col justify-center gap-3 overflow-hidden">
                {visibles.map((t, i) => {
                    const tienePromo = t.precio_promocion && parseFloat(t.precio_promocion) > 0;
                    const precioMostrar = tienePromo ? t.precio_promocion : t.precio_rack;
                    const monedaSymbol = t.moneda || '$';

                    return (
                        <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 animate-fade-in-up shadow-lg">
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-2xl font-black uppercase truncate" style={{ color: texto_evento }}>{t.nombre}</span>
                                {t.descripcion && <span className="text-xs opacity-60 text-white italic mt-1 truncate">{t.descripcion}</span>}
                            </div>
                            <div className="flex flex-col items-end justify-center min-w-[160px]">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-bold opacity-40 text-white">{monedaSymbol}</span>
                                    <span className="text-4xl font-mono font-black" style={{ color: acento }}>{precioMostrar}</span>
                                </div>
                                {tienePromo && (
                                    <span className="text-xs font-bold text-white/40">Reg. {monedaSymbol} {t.precio_rack}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* ✅ DIVISAS CON IMÁGENES Y LOGS DE ERROR */}
            <div className="flex justify-center items-center py-2 z-10 min-h-[80px]"> 
                {divisas.length > 0 && (
                    <div className="flex gap-4 animate-fade-in-up">
                        {divisas.map((divisa, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-black/60 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 shadow-lg transition-transform hover:scale-105">
                                
                                <img 
                                    src={getBanderaSrc(divisa.codigo)} 
                                    alt={divisa.codigo}
                                    className="w-12 h-12 object-contain drop-shadow-md rounded-full bg-white/10"
                                    onLoad={() => console.log(`✅ Imagen cargada OK: ${divisa.codigo}`)}
                                    onError={(e) => {
                                        console.error(`❌ ERROR cargando imagen para ${divisa.codigo}. URL intentada: ${e.target.src}`);
                                        e.target.style.display = 'none'; 
                                        e.target.nextSibling.style.display = 'block'; // Muestra el emoji
                                    }}
                                />
                                
                                {/* Emoji de respaldo (Solo se ve si falla la imagen) */}
                                <span className="hidden text-3xl">🌐</span>

                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-[-2px]">
                                        {divisa.codigo}
                                    </span>
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
                <div className="bg-black/40 backdrop-blur-md rounded-[1.5rem] border border-white/10 p-4 flex items-center justify-center overflow-hidden">
                    <div className="animate-marquee-horizontal whitespace-nowrap">
                        <span className="text-2xl font-light tracking-widest text-white uppercase">{banner}</span>
                    </div>
                </div>
            </footer>

            <style>{`
                .animate-marquee-horizontal { animation: marquee 20s linear infinite; }
                @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-logo-float { animation: floatLogo 6s ease-in-out infinite; }
                @keyframes floatLogo { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
            `}</style>
        </div>
    );
}