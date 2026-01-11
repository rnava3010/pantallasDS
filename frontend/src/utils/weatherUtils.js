// frontend/src/utils/weatherUtils.js

export const getIconoClima = (codigo) => {
    if (codigo === 0) return "☀️";
    if (codigo >= 1 && codigo <= 3) return "⛅";
    if (codigo >= 45 && codigo <= 48) return "🌫️";
    if (codigo >= 51 && codigo <= 67) return "🌧️";
    if (codigo >= 71 && codigo <= 77) return "❄️";
    if (codigo >= 80 && codigo <= 99) return "⚡";
    return "🌥️";
};