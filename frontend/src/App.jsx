import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useMantenimiento } from './hooks/useMantenimiento';

const VistaPantalla = React.lazy(() => import('./views/VistaPantalla'));
const VistaAdmin = React.lazy(() => import('./views/VistaAdmin'));

function App() {
  useMantenimiento(3);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pantalla/:id" element={
            <Suspense fallback={<div className="bg-black text-white h-screen flex items-center justify-center">Cargando...</div>}>
              <VistaPantalla />
            </Suspense>
        } />

        <Route path="/admin/*" element={
            <Suspense fallback={<div>Cargando Admin...</div>}>
              <VistaAdmin />
            </Suspense>
        } />
        
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;