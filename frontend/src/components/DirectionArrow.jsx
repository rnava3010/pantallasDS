import React from 'react';

const getRotation = (clockPosition) => {
    if (!clockPosition) return 0;
    return (clockPosition / 12) * 360;
};

export default function DirectionArrow({ direccion, size = "w-32 h-32", color = "text-yellow-500" }) {
    if (!direccion) return null;

    const rotation = getRotation(direccion);

    return (
        <div className={`flex flex-col items-center justify-center ${color} ${size}`}>
            <div 
                style={{ transform: `rotate(${rotation}deg)` }} 
                className="transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] p-2"
            >
                {/* Flecha Robusta */}
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
                >
                    <path d="M10.5 3.5a1.5 1.5 0 0 1 3 0V11h5.25a.75.75 0 0 1 .53 1.28l-7.25 7.25a.75.75 0 0 1-1.06 0l-7.25-7.25a.75.75 0 0 1 .53-1.28H10.5V3.5Z" />
                </svg>
            </div>
        </div>
    );
}