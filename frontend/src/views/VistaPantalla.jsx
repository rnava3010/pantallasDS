import React from 'react';
import { useParams } from 'react-router-dom';
import { usePantalla } from '../hooks/usePantalla'; 
import PlayerSalon from '../components/PlayerSalon';
import PlayerDirectorio from '../components/PlayerDirectorio';
import PlayerTarifas from '../components/PlayerTarifas'; // ✅ 1. Importar el componente de tarifas

export default function VistaPantalla() {
    const { id } = useParams();
    const { config, loading, isOnline } = usePantalla(id);

    if (loading && !config) {
        return (
            <div className="h-screen w-screen bg-black flex items-center justify-center text-white">
                <div className="animate-pulse">Conectando con Narabyte DS...</div>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Pantalla no configurada</h1>
                <p className="text-gray-400">ID de Terminal: {id}</p>
                {!isOnline && <p className="text-yellow-500 mt-2 text-sm">(Sin conexión a internet)</p>}
            </div>
        );
    }

    // ✅ 2. Agregar 'TARIFAS' al switch
    switch (config.tipo_pantalla) {
        case 'SALON':
            return <PlayerSalon />;
            
        case 'DIRECTORIO':
            return <PlayerDirectorio />;

        case 'TARIFAS':
            return <PlayerTarifas />; // ✅ Ahora reconocerá el tipo desde la BD

        default:
            return (
                <div className="h-screen w-screen bg-black flex items-center justify-center text-white">
                    Tipo de pantalla desconocido: {config.tipo_pantalla}
                </div>
            );
    }
}