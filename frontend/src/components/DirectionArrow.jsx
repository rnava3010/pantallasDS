import React from 'react';

const getRotation = (clockPosition) => {
    if (!clockPosition) return 0;
    return (clockPosition / 12) * 360;
};

export default function DirectionArrow({ direccion, size = "w-24 h-24", color = "text-yellow-500" }) {
    
    if (!direccion) return null;

    const rotation = getRotation(direccion);

    return (
        <div className={`flex flex-col items-center justify-center ${color} ${size}`}>
            {/* Contenedor que rota según la hora del reloj */}
            <div 
                style={{ transform: `rotate(${rotation}deg)` }} 
                className="transition-transform duration-700 ease-in-out p-4"
            >
                {/* SVG de Flecha animada (Pulse + Bounce suave) */}
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-full h-full animate-pulse drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]"
                >
                    <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                </svg>
            </div>
            
            {/* Texto opcional de ayuda (ej: "A la derecha") */}
            {/* <span className="text-sm font-bold mt-2 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
            </span> */}
        </div>
    );
}