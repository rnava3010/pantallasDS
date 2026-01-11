import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePantalla } from '../hooks/usePantalla';
import { useReloj } from '../hooks/useReloj';
import { useCarrusel } from '../hooks/useCarrusel';
import { useOfflineVideo } from '../hooks/useOfflineVideo';
import { getIconoClima } from '../utils/weatherUtils';

// Layouts
import LayoutDirectorioHorizontal from './layoutsDirectorios/LayoutDirectorioHorizontal';
import LayoutDirectorioVertical from './layoutsDirectorios/LayoutDirectorioVertical';

export default function PlayerDirectorio() {
    const { id } = useParams();
    const { config, eventoActual: data, loading, isOnline, timeOffset, clima } = usePantalla(id);
    const horaActual = useReloj(timeOffset);
    const [paginaActual, setPaginaActual] = useState(0);

    const { fondo = '#000000', texto_reloj = '#FFFFFF', acento = '#EAB308' } = config?.colores || {};
    const isVertical = config?.orientacion === 1;

    // Extracción de datos
    let eventos = data?.eventos || [];
    let noticias = data?.noticias || [];
    const ITEMS_POR_PAGINA = isVertical ? 6 : 4;
    const totalPaginas = Math.ceil(eventos.length / ITEMS_POR_PAGINA);

    // Carrusel Principal (Abajo)
    const { itemActual } = useCarrusel(config?.screensaver || [], 8000);
    const { videoBlobUrl } = useOfflineVideo(config?.screensaver || []);

    useEffect(() => {
        if (totalPaginas > 1) {
            const interval = setInterval(() => setPaginaActual(p => (p + 1) % totalPaginas), 12000);
            return () => clearInterval(interval);
        }
    }, [totalPaginas]);

    const eventosVisibles = eventos.slice(paginaActual * ITEMS_POR_PAGINA, (paginaActual + 1) * ITEMS_POR_PAGINA);

    if (loading && !config) return <div className="bg-black h-screen animate-pulse" />;

    const layoutProps = { eventosVisibles, paginaActual, totalPaginas, config, noticias, itemActual, videoBlobUrl, FilaGaleria };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ backgroundColor: fondo }}>
            <header className="h-24 flex justify-between items-center px-10 shrink-0">
                {config?.logo && <img src={config.logo} className="h-16 object-contain" />}
                <div className="px-8 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                    <h1 className="text-2xl font-black tracking-widest uppercase" style={{ color: acento }}>DIRECTORIO</h1>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-mono font-bold" style={{ color: texto_reloj }}>{horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-xs uppercase opacity-60" style={{ color: texto_reloj }}>{horaActual.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                </div>
            </header>

            <main className="flex-1 px-10 py-4 min-h-0 flex flex-col">
                {isVertical ? (
                    <LayoutDirectorioVertical {...layoutProps} />
                ) : (
                    <LayoutDirectorioHorizontal {...layoutProps} />
                )}
            </main>

            <footer className="h-14 border-t border-white/10 px-10 flex justify-between items-center shrink-0">
                <span className="text-[10px] opacity-40 uppercase">Powered by narabyte.xyz</span>
                <div className="flex items-center gap-2" style={{ color: texto_reloj }}>
                    <span className="text-3xl">{getIconoClima(clima.codigo)}</span>
                    <span className="font-bold text-xl">{clima.tempC}°C</span>
                </div>
            </footer>
        </div>
    );
}

// Helper Mini Galería (Mismo para ambos)
const FilaGaleria = ({ imagenes, isVertical }) => {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        if (imagenes?.length > 1) {
            const t = setInterval(() => setIdx(p => (p + 1) % imagenes.length), 4000);
            return () => clearInterval(t);
        }
    }, [imagenes]);
    if (!imagenes?.length) return null;
    return (
        <div className={`${isVertical ? 'h-16 w-24' : 'h-24 w-36'} rounded-xl overflow-hidden bg-gray-800 shrink-0`}>
            <img src={imagenes[idx]} className="w-full h-full object-cover animate-fade-in" key={idx} />
        </div>
    );
};