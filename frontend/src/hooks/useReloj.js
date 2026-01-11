import { useState, useEffect } from 'react';

export const useReloj = (timeOffset = 0) = {
    const [hora, setHora] = useState(new Date(Date.now() + timeOffset));

    useEffect(() = {
        const timer = setInterval(() = {
            setHora(new Date(Date.now() + timeOffset));
        }, 1000);
        return () = clearInterval(timer);
    }, [timeOffset]);

    return hora;
};