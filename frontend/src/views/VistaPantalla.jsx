import React from 'react';
import { useParams } from 'react-router-dom';
import { usePantalla } from '../hooks/usePantalla'; // Asegúrate de la ruta correcta
import PlayerSalon from '../components/PlayerSalon';
// import PlayerDirectorio from '../components/PlayerDirectorio'; // Si lo tienes

export default function VistaPantalla() {
    const { id } = useParams();
    
    // IMPORTANTE: El hook nuevo devuelve 'config', 'loading' y 'isOnline'.
    // Ya no devuelve 'data' genérico aquí, porque cada Player gestiona sus datos.
    const { config, loading, isOnline } = usePantalla(id);

    // 1. Cargando
    if (loading && !config) {
        return (
            <div className="h-screen w-screen bg-black flex items-center justify-center text-white">
                <div className="animate-pulse">Conectando con Narabyte DS...</div>
            </div>
        );
    }

    // 2. Si falló la carga y no hay configuración (ID incorrecto o error fatal)
    if (!config) {
        return (
            <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Pantalla no configurada</h1>
                <p className="text-gray-400">ID de Terminal: {id}</p>
                {!isOnline && <p className="text-yellow-500 mt-2 text-sm">(Sin conexión a internet)</p>}
            </div>
        );
    }

    // 3. Renderizar el Player correcto según el tipo
    // Nota: No pasamos props de datos porque PlayerSalon ya usa el hook internamente
    switch (config.tipo_pantalla) {
        case 'SALON':
            return <PlayerSalon />;
            
        case 'DIRECTORIO':
            // return <PlayerDirectorio />; // Descomenta cuando tengas este componente
            return <div className="text-white">Componente Directorio en construcción</div>;

        default:
            return (
                <div className="h-screen w-screen bg-black flex items-center justify-center text-white">
                    Tipo de pantalla desconocido: {config.tipo_pantalla}
                </div>
            );
    }
}