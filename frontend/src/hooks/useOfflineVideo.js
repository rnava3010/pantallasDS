import { useState, useEffect } from 'react';
import logger from '../utils/logger'; // <--- Importamos tu Logger

export const useOfflineVideo = (mediaList) => {
    const [videoBlobUrl, setVideoBlobUrl] = useState(null);

    const esVideo = (url) => {
        if (!url) return false;
        return url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm');
    };

    useEffect(() => {
        let isMounted = true;

        const cachearVideo = async () => {
            if (!mediaList || mediaList.length === 0) return;
            
            const urlVideo = mediaList.find(url => esVideo(url));
            if (!urlVideo) {
                // Opcional: Loguear si no hay video para saber por qué no descarga nada
                // logger.log("[useOfflineVideo] No se detectaron videos en la lista.");
                return;
            }

            try {
                const cacheName = 'ds-video-cache-v1';
                const cache = await caches.open(cacheName);
                let response = await cache.match(urlVideo);

                if (!response) {
                    if (navigator.onLine) {
                        logger.log(`📥 [Offline] Iniciando descarga de video: ${urlVideo}`);
                        try {
                            await cache.add(urlVideo);
                            response = await cache.match(urlVideo);
                            logger.log(`✅ [Offline] Video descargado y guardado en disco exitosamente.`);
                        } catch (err) {
                            logger.warn(`⚠️ [Offline] Falló la descarga del video:`, err);
                        }
                    } else {
                        logger.warn(`⚠️ [Offline] No hay internet y el video no está en caché.`);
                    }
                } else {
                    logger.log(`💿 [Offline] Video recuperado de caché local (Listo).`);
                }

                if (response && isMounted) {
                    const blob = await response.blob();
                    const localUrl = URL.createObjectURL(blob);
                    setVideoBlobUrl(localUrl);
                }
            } catch (error) {
                logger.error("🔥 [Offline] Error crítico en el sistema de caché:", error);
            }
        };

        cachearVideo();

        return () => { isMounted = false; };
    }, [mediaList]); 

    return { videoBlobUrl, esVideo };
};