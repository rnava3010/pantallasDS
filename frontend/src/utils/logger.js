// frontend/src/utils/logger.js

const isDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true';

export const log = (mensaje, datos = '') => {
    if (isDebug) {
        // Usamos colores para que resalte en la consola
        console.log(`%c[Narabyte Debug] ${mensaje}`, 'color: #eab308; font-weight: bold;', datos);
    }
};

export const logError = (mensaje, error) => {
    // Los errores SIEMPRE los mostramos, aunque el debug esté apagado (es más seguro)
    console.error(`%c[Narabyte Error] ${mensaje}`, 'color: #ef4444; font-weight: bold;', error);
};