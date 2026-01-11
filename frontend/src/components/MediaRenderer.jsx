import React from 'react';

export default function MediaRenderer({ url, blobUrl, onError, className = "object-contain" }) {
    
    // Función auxiliar simple para detectar tipo
    const esVideo = (src) => {
        if (!src) return false;
        return src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm');
    };

    if (!url) return null;

    if (esVideo(url)) {
        // Usamos el blobUrl (offline) si existe, sino la url normal
        const finalSrc = blobUrl || url;
        return (
            <video 
                src={finalSrc} 
                className={`absolute inset-0 w-full h-full ${className}`}
                autoPlay 
                loop 
                muted 
                playsInline 
                onError={onError}
            />
        );
    }

    return (
        <img 
            src={url} 
            className={`absolute inset-0 w-full h-full animate-fade-in ${className}`} 
            alt="Media" 
            onError={onError} 
        />
    );
}