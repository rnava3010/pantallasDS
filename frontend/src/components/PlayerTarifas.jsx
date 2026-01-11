import React from 'react';

// --- 1. IMPORTAMOS LOS LAYOUTS CLÁSICOS (Los que ya tenías) ---
import LayoutTarifasHorizontal from './layoutTarifas/LayoutTarifasHorizontal';
import LayoutTarifasVertical from './layoutTarifas/LayoutTarifasVertical';

// --- 2. IMPORTAMOS LOS NUEVOS LAYOUTS (Grid, Split, Glass, Stack) ---
// Asegúrate de haber creado estos archivos en la carpeta layoutTarifas
import LayoutTarifasHorizontalGrid from './layoutTarifas/LayoutTarifasHorizontalGrid';
import LayoutTarifasHorizontalSplit from './layoutTarifas/LayoutTarifasHorizontalSplit';
import LayoutTarifasVerticalGlass from './layoutTarifas/LayoutTarifasVerticalGlass';
import LayoutTarifasVerticalStack from './layoutTarifas/LayoutTarifasVerticalStack';

export default function PlayerTarifas({ datos, config }) {
    // --- VALIDACIÓN DE CARGA ---
    // Si aún no llegan los datos del backend, mostramos pantalla de espera
    if (!datos || (!datos.habitaciones && !datos.tarifas)) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black text-white">
                <div className="flex flex-col items-center animate-pulse">
                    {config?.logo && <img src={config.logo} className="h-20 mb-6 opacity-50" alt="Logo" />}
                    <span className="text-2xl font-light tracking-widest uppercase">Cargando Tarifas...</span>
                </div>
            </div>
        );
    }

    // --- DESESTRUCTURACIÓN DE DATOS ---
    /* El Backend ahora envía:
       - habitaciones: Array de cuartos (tbl_tarifas)
       - divisas: Array de monedas (tbl_divisas)
       - banner: Texto del cintillo (tbl_avisos)
       - galeria: Imágenes de fondo
    */
    const { habitaciones, divisas, banner, galeria } = datos;
    const layoutMode = config.layoutTarifas || 0; // Leemos la configuración de la BD

    // --- PREPARACIÓN DE PROPS ---
    /* Empaquetamos todo en un solo objeto para pasarlo a cualquier layout.
       NOTA CLAVE: Pasamos 'habitaciones' en la prop 'tarifas' porque 
       tus componentes viejos esperan recibir algo llamado 'tarifas'.
    */
    const commonProps = {
        tarifas: habitaciones || datos.tarifas || [], // Compatibilidad total
        divisas: divisas || [],
        banner: banner || "",
        galeria: galeria || [],
        config: config
    };

    // --- SELECCIÓN DE DISEÑO ---
    const renderLayout = () => {
        switch (layoutMode) {
            // === HORIZONTALES ===
            case 0: 
                return <LayoutTarifasHorizontal {...commonProps} />;
            case 1: 
                // Grid: Ideal para muchas habitaciones o estilo moderno
                return <LayoutTarifasHorizontalGrid {...commonProps} />;
            case 2: 
                // Split: Mitad Foto / Mitad Precios
                return <LayoutTarifasHorizontalSplit {...commonProps} />;
            
            // === VERTICALES ===
            case 5: 
                return <LayoutTarifasVertical {...commonProps} />;
            case 6: 
                // Glass: Tarjeta flotante sobre video de fondo
                return <LayoutTarifasVerticalGlass {...commonProps} />;
            case 7: 
                // Stack: Bloques grandes apilados
                return <LayoutTarifasVerticalStack {...commonProps} />;

            // === DEFAULT ===
            default: 
                return <LayoutTarifasHorizontal {...commonProps} />;
        }
    };

    return (
        <div className="w-full h-full bg-black text-white overflow-hidden">
            {renderLayout()}
        </div>
    );
}