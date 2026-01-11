import React, { useState, useEffect } from 'react';
import MediaRenderer from '../MediaRenderer'; // Asegúrate de tener este componente

export default function LayoutTarifasHorizontal({ config, datos }) {
    // --- ESTADOS ---
    const [indiceHabitacion, setIndiceHabitacion] = useState(0);
    const [indiceIdioma, setIndiceIdioma] = useState(0);
    const [hora, setHora] = useState(new Date());

    // --- DATOS ---
    const { habitaciones = [], avisos = [], galeria = [], divisas = [] } = datos || {};
    const { colores, logo, idiomas_activos, tiempo_rotacion, zona_horaria } = config;
    
    const idiomaActual = idiomas_activos[indiceIdioma] || 'es';
    const TIEMPO_ROTACION = (tiempo_rotacion || 15) * 1000;

    // --- EFECTOS ---
    
    // 1. Reloj
    useEffect(() => {
        const timer = setInterval(() => setHora(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. Rotación de Idioma
    useEffect(() => {
        if (idiomas_activos.length > 1) {
            const timer = setInterval(() => {
                setIndiceIdioma(prev => (prev + 1) % idiomas_activos.length);
            }, TIEMPO_ROTACION);
            return () => clearInterval(timer);
        }
    }, [idiomas_activos, TIEMPO_ROTACION]);

    // 3. Carrusel de Habitaciones (Muestra 3 por página)
    const ITEMS_POR_VISTA = 3;
    useEffect(() => {
        const totalPaginas = Math.ceil(habitaciones.length / ITEMS_POR_VISTA);
        if (totalPaginas > 1) {
            const timer = setInterval(() => {
                setIndiceHabitacion(prev => (prev + 1) % totalPaginas);
            }, 10000); // 10 segundos por grupo de habitaciones
            return () => clearInterval(timer);
        }
    }, [habitaciones.length]);

    // --- RENDER ---
    
    // Calcular habitaciones visibles
    const inicio = indiceHabitacion * ITEMS_POR_VISTA;
    const habitacionesVisibles = habitaciones.slice(inicio, inicio + ITEMS_POR_VISTA);

    // Textos traducibles simples
    const textos = {
        es: { titulo: "TARIFAS", rack: "Tarifa Rack", promo: "Tarifa Promo", cambio: "TIPO DE CAMBIO" },
        en: { titulo: "RATES", rack: "Rack Rate", promo: "Special Rate", cambio: "EXCHANGE RATE" },
        fr: { titulo: "TARIFS", rack: "Tarif Rack", promo: "Tarif Spécial", cambio: "TAUX DE CHANGE" }
    };
    const t = textos[idiomaActual] || textos['es'];

    // Obtener texto del aviso actual
    const avisoActual = avisos.length > 0 ? avisos[0] : null; // Podrías rotar esto también si quisieras
    const textoAviso = avisoActual ? (avisoActual[`texto_${idiomaActual}`] || avisoActual.texto) : "";

    return (
        <div className="w-screen h-screen flex flex-col overflow-hidden font-sans" 
             style={{ backgroundColor: colores.fondo, color: colores.texto }}>
            
            {/* ================= HEADER ================= */}
            <header className="h-[15%] flex justify-between items-center px-10 py-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
                {/* Logo */}
                <div className="w-1/4 h-full flex items-center">
                    {logo && <img src={logo} alt="Logo" className="h-full object-contain max-w-[200px]" />}
                </div>

                {/* Título */}
                <div className="w-2/4 text-center">
                    <h1 className="text-5xl font-black tracking-widest uppercase" style={{ color: colores.acento }}>
                        {t.titulo}
                    </h1>
                </div>

                {/* Reloj y Fecha */}
                <div className="w-1/4 text-right flex flex-col justify-center">
                    <div className="text-5xl font-mono font-bold leading-none">
                        {hora.toLocaleTimeString('es-MX', { hour: '2-digit', minute:'2-digit', timeZone: zona_horaria })}
                    </div>
                    <div className="text-sm uppercase tracking-wider opacity-80 mt-1">
                        {hora.toLocaleDateString(idiomaActual === 'en' ? 'en-US' : 'es-ES', { 
                            weekday: 'long', day: 'numeric', month: 'long', timeZone: zona_horaria 
                        })}
                    </div>
                </div>
            </header>

            {/* ================= MIDDLE (TARIFAS) ================= */}
            <main className="h-[55%] flex items-center justify-center px-10 relative">
                <div className="w-full grid grid-cols-3 gap-8">
                    {habitacionesVisibles.map((hab, idx) => {
                        const nombre = idiomaActual === 'en' ? (hab.nombre_habitacion_en || hab.nombre_habitacion) : hab.nombre_habitacion;
                        const desc = idiomaActual === 'en' ? (hab.descripcion_en || hab.descripcion) : hab.descripcion;
                        
                        return (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl transform transition-all duration-500 hover:scale-105">
                                {/* Imagen Habitación */}
                                <div className="h-40 bg-gray-800 relative">
                                    {hab.url_imagen_fondo ? (
                                        <img src={`/habitaciones/${hab.url_imagen_fondo}`} alt={nombre} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                            <span className="text-4xl opacity-20">🛏️</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                    <div className="absolute bottom-3 left-4">
                                        <h2 className="text-xl font-bold text-white leading-tight shadow-black drop-shadow-md">{nombre}</h2>
                                    </div>
                                </div>

                                {/* Precios */}
                                <div className="flex-1 p-4 flex flex-col justify-center items-center text-center gap-2">
                                    {hab.precio_promocion ? (
                                        <>
                                            <div className="opacity-60 text-sm line-through decoration-red-500 decoration-2">
                                                {t.rack}: ${hab.precio_rack} {hab.moneda}
                                            </div>
                                            <div className="text-4xl font-black" style={{ color: colores.acento }}>
                                                ${hab.precio_promocion}
                                                <span className="text-xs ml-1 align-top opacity-70">{hab.moneda}</span>
                                            </div>
                                            <div className="text-xs uppercase tracking-widest bg-white/10 px-2 py-1 rounded">
                                                {t.promo}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-4xl font-black">
                                            ${hab.precio_rack}
                                            <span className="text-xs ml-1 align-top opacity-70">{hab.moneda}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* ================= MIDDLE-BOTTOM (DIVISAS) ================= */}
            <div className="h-[10%] bg-black/30 border-y border-white/10 flex items-center justify-center gap-16 backdrop-blur-md">
                <span className="text-sm font-bold uppercase tracking-widest opacity-50 mr-4 border-r border-white/20 pr-4 h-8 flex items-center">
                    {t.cambio}
                </span>
                {divisas.map((div, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-2xl">{div.bandera || '💵'}</span>
                        <div className="flex flex-col leading-none">
                            <span className="text-xs font-bold opacity-60">{div.codigo}</span>
                            <span className="text-2xl font-mono font-bold">{div.tipo_cambio}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ================= FOOTER (GALERÍA + AVISOS) ================= */}
            <footer className="h-[20%] flex bg-gray-900">
                
                {/* Izquierda: Galería Multimedia */}
                <div className="w-2/3 h-full relative overflow-hidden bg-black">
                    {/* Aquí deberías integrar tu lógica de rotación de galería */}
                    {galeria.length > 0 && (
                        <MediaRenderer 
                            url={galeria[0].url_archivo} // Ojo: Aquí solo puse el primero fijo, necesitas tu lógica de rotación
                            className="w-full h-full object-cover opacity-80" 
                        />
                    )}
                    <div className="absolute top-2 left-2 bg-black/50 px-3 py-1 rounded text-xs uppercase tracking-widest">
                        Galería
                    </div>
                </div>

                {/* Derecha: Banner de Avisos */}
                <div className="w-1/3 h-full bg-blue-900/20 flex items-center justify-center p-6 relative overflow-hidden" 
                     style={{ backgroundColor: `${colores.acento}15` }}> {/* 15 es opacidad hex */}
                    
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: colores.acento }}></div>
                    
                    <div className="text-center">
                         {/* Efecto Marquee simple o fade */}
                         <p className="text-xl font-light italic leading-relaxed animate-pulse">
                            "{textoAviso || "Bienvenidos"}"
                         </p>
                    </div>
                </div>

            </footer>
        </div>
    );
}