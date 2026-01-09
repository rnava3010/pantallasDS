import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Importaremos las vistas después, por ahora dejamos placeholders
const VistaPantalla = React.lazy(() => import('./views/VistaPantalla'))
const VistaAdmin = React.lazy(() => import('./views/VistaAdmin'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ruta para las Pantallas (Player) */}
        {/* Ejemplo: tudominio.com/pantalla/1 */}
        <Route path="/pantalla/:id" element={
          <React.Suspense fallback={<div className="text-white">Cargando Player...</div>}>
            <VistaPantalla />
          </React.Suspense>
        } />

        {/* Ruta para el Admin (CMS) */}
        <Route path="/admin/*" element={
          <React.Suspense fallback={<div className="text-white">Cargando Admin...</div>}>
            <VistaAdmin />
          </React.Suspense>
        } />

        {/* Home por defecto (Redirige al Admin o muestra 404) */}
        <Route path="/" element={<div className="p-10 text-2xl">Bienvenido a Digital Signage</div>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)