import React from 'react';
// Layouts Existentes
import LayoutTarifasHorizontal from './layoutTarifas/LayoutTarifasHorizontal';
import LayoutTarifasVertical from './layoutTarifas/LayoutTarifasVertical';
// Nuevos Layouts
import LayoutTarifasHorizontalGrid from './layoutTarifas/LayoutTarifasHorizontalGrid';
import LayoutTarifasHorizontalSplit from './layoutTarifas/LayoutTarifasHorizontalSplit';
import LayoutTarifasVerticalGlass from './layoutTarifas/LayoutTarifasVerticalGlass';
import LayoutTarifasVerticalStack from './layoutTarifas/LayoutTarifasVerticalStack';

export default function PlayerTarifas({ datos, config }) {
    if (!datos || !datos.tarifas) return <div className="text-white text-center mt-20 text-2xl">Cargando Tasas...</div>;

    const { tarifas, banner, galeria } = datos;
    const layoutMode = config.layoutTarifas || 0;

    // --- RENDERIZADOR ---
    const renderLayout = () => {
        switch (layoutMode) {
            // --- HORIZONTALES ---
            case 0: return <LayoutTarifasHorizontal tarifas={tarifas} banner={banner} config={config} />;
            case 1: return <LayoutTarifasHorizontalGrid tarifas={tarifas} banner={banner} config={config} galeria={galeria} />;
            case 2: return <LayoutTarifasHorizontalSplit tarifas={tarifas} banner={banner} config={config} galeria={galeria} />;
            
            // --- VERTICALES ---
            case 5: return <LayoutTarifasVertical tarifas={tarifas} banner={banner} config={config} />;
            case 6: return <LayoutTarifasVerticalGlass tarifas={tarifas} banner={banner} config={config} galeria={galeria} />;
            case 7: return <LayoutTarifasVerticalStack tarifas={tarifas} banner={banner} config={config} galeria={galeria} />;

            // Default
            default: return <LayoutTarifasHorizontal tarifas={tarifas} banner={banner} config={config} />;
        }
    };

    return (
        <div className="w-full h-full bg-black">
            {renderLayout()}
        </div>
    );
}