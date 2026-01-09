import React from 'react';
import { useParams } from 'react-router-dom';
import { usePantalla } from '../hooks/usePantalla';

// Componentes (Los crearemos en el siguiente paso)
import PlayerSalon from '../components/PlayerSalon';
import PlayerDirectorio from '../components/PlayerDirectorio';
import PlayerTarifas from '../components/PlayerTarifas';

const VistaPantalla = () => {
    const { id } = useParams(); // Obtiene el ID de la URL
    const { info, isLoading, isError } = usePantalla(id);

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-black text-4xl text-gray-500 animate-pulse">Cargando Sistema...</div>;
    
    if (isError) return <div className="flex h-screen items-center justify-center bg-red-900 text-white text-2xl">⚠️ Sin Conexión / Error de Servidor</div>;

    if (!info || !info.config) return <div className="text-white">Pantalla no configurada</div>;

    const { config, data } = info;

    // --- RENDERIZADO CONDICIONAL SEGÚN TIPO ---
    return (
        <div className={`w-screen h-screen overflow-hidden ${config.tema_color === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
            
            {/* Si es una pantalla de SALÓN */}
            {config.tipo_pantalla === 'SALON' && (
                <PlayerSalon data={data} config={config} />
            )}

            {/* Si es DIRECTORIO */}
            {config.tipo_pantalla === 'DIRECTORIO' && (
                <PlayerDirectorio eventos={data} config={config} />
            )}

             {/* Si es TARIFAS */}
             {config.tipo_pantalla === 'TARIFAS' && (
                <PlayerTarifas tarifas={data} config={config} />
            )}

            {/* Debug (Quitar en producción) */}
            {/* <div className="fixed bottom-0 right-0 bg-gray-800 text-xs p-1 opacity-50">
                ID: {config.nombre_interno} | Tipo: {config.tipo_pantalla}
            </div> */}
        </div>
    );
};

export default VistaPantalla;