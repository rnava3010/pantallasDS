import { useState, useEffect } from 'react';

export const useCarrusel = (items, intervalo = 8000) => {
    const [indice, setIndice] = useState(0);

    // Reiniciar índice si cambian los items
    useEffect(() => { setIndice(0); }, [items]);

    useEffect(() => {
        if (!items || items.length <= 1) return;

        const timer = setInterval(() => {
            setIndice((prev) => (prev + 1) % items.length);
        }, intervalo);

        return () => clearInterval(timer);
    }, [items, intervalo]);

    return { 
        indice, 
        itemActual: items && items.length > 0 ? items[indice] : null 
    };
};