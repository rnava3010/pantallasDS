// frontend/src/utils/logger.js

const isDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true';

const log = (mensaje, datos = '') => {
    if (isDebug) {
        console.log(`%c[Narabyte Debug] ${mensaje}`, 'color: #eab308; font-weight: bold;', datos);
    }
};

const warn = (mensaje, datos = '') => {
    if (isDebug) {
        console.warn(`%c[Narabyte Warn] ${mensaje}`, 'color: #f97316; font-weight: bold;', datos);
    }
};

const error = (mensaje, errorDatos = '') => {
    console.error(`%c[Narabyte Error] ${mensaje}`, 'color: #ef4444; font-weight: bold;', errorDatos);
};

export default { log, warn, error };