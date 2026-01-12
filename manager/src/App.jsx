import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
// Importa otras páginas aquí cuando las crees

function App() {
  return (
    <Routes>
      {/* Redirigir la raíz del manager al Dashboard */}
      <Route path="/" element={<Dashboard />} />
      
      {/* Ejemplo de otras rutas que crearemos */}
      <Route path="/pantallas" element={<div>Gestión de Pantallas</div>} />
      
      {/* Capturar rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;