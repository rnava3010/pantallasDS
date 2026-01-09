import React from 'react';

export default function PlayerSalon({ data, config }) {
    // Si no hay datos (data es null), mostramos cargando o estado default
    if (!data) return <div className="text-white">Cargando información...</div>;

    return (
        <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden font-sans">
            
            {/* 1. ENCABEZADO (Logo y Hora) */}
            <header className="h-24 bg-zinc-900 flex items-center justify-between px-10 border-b border-zinc-700">
                <div className="flex items-center gap-4">
                    {/* Si hay logo en la config, lo mostramos */}
                    {config.logo ? (
                        <img src={config.logo} alt="Logo" className="h-16 object-contain" />
                    ) : (
                        <div className="text-2xl font-bold text-gray-400">LOGICIEL DS</div>
                    )}
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold text-yellow-500">{data.nombre_salon}</h2>
                    <p className="text-gray-400 text-sm">{config.nombre_interno}</p>
                </div>
            </header>

            {/* 2. CONTENIDO PRINCIPAL (Evento) */}
            <main className="flex-1 flex flex-col items-center justify-center p-10 text-center relative z-10">
                {/* Fondo decorativo sutil */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black z-0"></div>

                <div className="z-10 animate-fade-in-up">
                    <h3 className="text-2xl text-blue-400 mb-4 tracking-widest uppercase">Evento Actual</h3>
                    
                    {/* TÍTULO DEL EVENTO GIGANTE */}
                    <h1 className="text-7xl md:text-8xl font-extrabold text-white mb-8 leading-tight drop-shadow-2xl">
                        {data.titulo}
                    </h1>

                    {/* CLIENTE */}
                    {data.cliente && (
                        <div className="mb-10">
                            <span className="bg-white text-black px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                                {data.cliente}
                            </span>
                        </div>
                    )}

                    {/* HORARIO */}
                    <div className="inline-block border-2 border-yellow-500/50 bg-black/50 backdrop-blur-md px-10 py-6 rounded-xl">
                        <p className="text-4xl text-yellow-400 font-mono font-bold">
                            ⏰ {data.horario}
                        </p>
                    </div>

                    {/* MENSAJE EXTRA */}
                    {data.mensaje && (
                        <p className="mt-12 text-2xl text-gray-300 italic max-w-4xl mx-auto">
                            "{data.mensaje}"
                        </p>
                    )}
                </div>
            </main>

            {/* 3. PIE DE PÁGINA */}
            <footer className="h-16 bg-zinc-900 flex items-center justify-center border-t border-zinc-800">
                <p className="text-gray-500 text-sm">Bienvenido a {config.nombre_interno} | Powered by Logiciel</p>
            </footer>
        </div>
    );
}